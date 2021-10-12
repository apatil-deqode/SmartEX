import {Database} from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import {Q} from '@nozbe/watermelondb';
import schema from './model/schema';
import {Feed, Image, DefectStop} from './model/models';
import {CacheManager} from '@helpers';
import {CheckDefect} from '@helpers';
import migrations from './model/migrations';
import {Stores} from '@state';
class DbHelper {
  constructor() {
    if (DbHelper.instance instanceof DbHelper) {
      return DbHelper.instance;
    }

    const adapter = new SQLiteAdapter({
      schema,
      migrations,
    });

    this.database = new Database({
      adapter,
      modelClasses: [Feed, Image, DefectStop],
      actionsEnabled: true,
    });

    DbHelper.instance = this;
  }

  //todo: fix it
  getAllDefects = async () => {
    const allDefects = await this.database
      .get('defects') // There is no such Model 'defects'. Should be fetching feeds and query for defects?
      .query(Q.experimentalSortBy('timestamp', Q.desc))
      .fetch();
    return allDefects.map((defect) => ({
      defect: defect.defect,
      timestamp: parseInt(defect.timestamp, 0),
      thumbnail: defect.thumbnail,
      score: defect.score,
      thresholds: defect.thresholds,
      frames: JSON.parse(defect.frames),
    }));
  };

  insertDefectStop = async (data) => {
    await this.database.action(async () => {
      await this.database.batch(
        this.database.get('defectStops').prepareCreate((defect) => {
          defect.timestamp = data.timestamp;
        }),
      );
    });
  };
  updateDefectStop = async (defectStop) => {
    await this.database.action(async () => {
      await defectStop.update((defect) => {
        defect.isUsed = true;
      });
    });
  };
  updateFeed = async (feedData) => {
    await this.database.action(async () => {
      await feedData.update((feed) => {
        feed.defectStop = true;
      });
    });
  };
  insertFeed = async (data) => {
    let transactions = [];
    const record = this.database.get('feeds').prepareCreate((feedObj) => {
      feedObj.timestamp = data.timestamp;
      feedObj.rotation = data.rotation;
      feedObj.rpm = data.rpm;
      feedObj.wasLastBatchDefective = data.wasLastBatchDefective;
    });
    transactions = [...this.insertImages(data.feed, record), record];
    await this.database.action(async () => {
      await this.database.batch(...transactions);
    });

    // this.removeRedundantFeed();
    this.deleteOutdatedFeed();
  };

  /**
   *
   * @param {*} image camera
   * @param {*} record
   * @returns
   */
  insertEmptyImageInBD = (image, record) => {
    return this.database.get('images').prepareCreate((imageObj) => {
      imageObj.index = image.index;
      imageObj.timestamp = image.timestamp;
      imageObj.score = image.score;
      imageObj.thresholds = image.thresholds;
      imageObj.thumbnail = image.thumbnail;
      imageObj.defect = null;
      imageObj.defectLevel = '';
      imageObj.frames = '[]';
      imageObj.feed.set(record);
    });
  };

  /**
   *
   * @param {*} image camera
   * @param {*} index
   * @param {*} record
   * @returns
   */
  insertImageInBD = (image, index, record) => {
    return this.database.get('images').prepareCreate((imageObj) => {
      imageObj.index = image.index;
      imageObj.timestamp = image.timestamp;
      imageObj.score = image.score;
      imageObj.thresholds = image.thresholds;
      imageObj.thumbnail = image.thumbnail;
      imageObj.defect = image.defect;
      imageObj.defectLevel = CheckDefect.defectTypes(
        image,
        Stores.getState().persisted.settings.cameraDefectSettings[index],
      );
      imageObj.frames = image.defect ? JSON.stringify(image.frames) : '[]';
      imageObj.feed.set(record);
    });
  };

  /**
   * Inserts images from a feed for each camera. If there is no defect, images will be an empty array. Only thumbnail will be saved
   * @param {*} feed
   * @param {*} record
   * @returns
   */
  insertImages = (feed, record) => {
    // image actually represents a camera
    return feed.map((image, index) =>
      image.isStoreCache === true
        ? this.insertImageInBD(image, index, record)
        : this.insertEmptyImageInBD(image, record),
    );
  };

  clearFeedsAndImages = async () => {
    await this.database.action(async () => {
      await this.database.get('feeds').query().destroyAllPermanently();
      await this.database.get('defectStops').query().destroyAllPermanently();
    });

    // Delete images from cache after deleting their entries from WatermelonDB to avoid referencing a path in memory that was already deleted
    CacheManager.clearDefectsCache();
    CacheManager.clearLiveFeedCache();
  };

  cameraImagesLimit = 400;
  /**
   * Removes older feeds, i.e those that contain camera images older than the cameraImagesLimit
   */
  deleteOutdatedFeed = async () => {
    // Fetch image records that are older than the camereImagesLimit. (Each batch has 8 cameras, i.e 8 image records. Num. batches = cameraImagesLimit / 8)
    const images = await this.database
      .get('images')
      .query(
        Q.experimentalSortBy('timestamp', Q.desc),
        Q.experimentalSkip(this.cameraImagesLimit),
        Q.experimentalTake(80),
      );

    /*
    console.log(
      'outdated images: ',
      images.map((image) => image.timestamp),
    ); */

    if (images.length > 0) {
      const transactions = [];
      let deletedFeedIds = [];
      let paths = [];

      for (const image of images) {
        if (!deletedFeedIds.includes(image.feed.id)) {
          deletedFeedIds.push(image.feed.id);
          const feed = await image.feed;
          const childs = await feed.images;

          for (const child of childs) {
            // Since cameras without defect have the frames array empty
            if (child.defect) {
              const frames = JSON.parse(child.frames);
              frames.forEach((f) => {
                paths.push(f.frame);
              });
            }
          }

          transactions.push(feed);
        }
      }

      // Remove cached images indicated by the paths
      CacheManager.clearGivenPaths(paths);

      // Removes feed and image entries in the DB
      await this.database.action(async () => {
        await Promise.all(
          transactions.map((transaction) => transaction.destroyPermanently()),
        ).catch();
      });
    }
  };

  /**
   * Deletes older feeds, according to the images WITH DEFECT that belong to it, if the number of camera images stored is greater than 70?
   */
  removeRedundantFeed = async () => {
    const images = await this.database
      .get('images')
      .query(
        Q.where('defect', Q.notEq(null)),
        Q.experimentalSortBy('timestamp', Q.desc),
        Q.experimentalTake(50),
        Q.experimentalSkip(70),
      );

    if (images.length > 0) {
      const transactions = [];
      let deletedFeedIds = [];
      let paths = [];

      for (const image of images) {
        if (!deletedFeedIds.includes(image.feed.id)) {
          deletedFeedIds.push(image.feed.id);
          const feed = await image.feed;
          const childs = await feed.images;

          for (const child of childs) {
            if (child.defect) {
              const frames = JSON.parse(child.frames);
              frames.forEach((f) => {
                paths.push(f.frame);
              });
            }
          }

          transactions.push(feed);
        }
      }

      // Remove images in the paths
      CacheManager.clearGivenPaths(paths);

      // Removes feed entries
      await this.database.action(async () => {
        await Promise.all(
          transactions.map((transaction) => transaction.destroyPermanently()),
        ).catch();
      });
    }
  };
}

const instance = new DbHelper();
export default instance;
