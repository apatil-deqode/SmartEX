import {Stores} from '@state';
import {ifDefect, irTopFrame, CacheManager, CheckDefect} from '@helpers';

const removeEmptyFrames = (frames) =>
  frames.filter((frame) => frame.frame && frame.thumbnail);

const hasFrames = (camera) => removeEmptyFrames(camera.frames).length > 0;

const deleteThumbnails = (frames) => {
  frames.forEach((frame) => delete frame.thumbnail);
};
const get2Decimal = (data) => {
  return data.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
};
// let previousFeedTime = Date.now();

/**
 * Returns liveFeed. Does not remove any camera frames I believe
 * @param {*} result
 * @param {*} isLiveFeed
 * @returns
 */
export const parseLiveFeed = async (result, isLiveFeed) => {
  const timestamp = Date.now();
  // console.log('parseLiveFeed frames: ', result.frames);

  // Filters only the camera frames that have a frame and a thumbnail
  let feed = result.frames.filter(hasFrames);

  // if (timestamp - previousFeedTime < 4000 || !feed.length) {
  //   return;
  // }
  if (!feed.length) {
    return;
  }
  // previousFeedTime = timestamp;

  const {
    persisted: {settings},
    home: {wasLastBatchDefective},
  } = Stores.getState();

  const horizontalThreshold = settings.horizontal.sensitivityThreshold;
  const verticalThreshold = settings.vertical.sensitivityThreshold;
  const punctualThreshold = settings.punctual.sensitivityThreshold;
  const oilThreshold = settings.oil.sensitivityThreshold;

  let horizontalScore = 0;
  let highestHorizontalScoreIdx = 0;
  let verticalScore = 0; // highest verticalScore
  let highestVerticalScoreIdx = 0;
  let punctualScore = 0;
  let highestPunctualScoreIdx = 0;
  let oilScore = 0;
  let highestOilScoreIdx = 0;

  let isDefectiveBatch = false;
  let countH = 0;
  let countV = 0;
  let countP = 0;
  let countO = 0;
  feed = await Promise.all(
    result.frames.map(async (camera, index) => {
      const defect = ifDefect(camera.defect);
      if (defect) {
        isDefectiveBatch = true;
      }
      const {
        verticalSwitchValue,
        horizontalSwitchValue,
        punctualSwitchValue,
        oilSwitchValue,
      } = settings.cameraDefectSettings[index];

      const imageDefect = defect ? defect : '';
      const typeOfDefect = imageDefect.toLowerCase();

      let isStoreCache = false; // This variable stores if a camera has a defect that should be tracked (switch is on)
      if (typeOfDefect.includes('horizontal') && horizontalSwitchValue) {
        countH = 1;
        isStoreCache = true;
      }
      if (typeOfDefect.includes('vertical') && verticalSwitchValue) {
        countV = 1;
        isStoreCache = true;
      }
      if (
        (typeOfDefect.includes('point') || typeOfDefect.includes('punctual')) &&
        punctualSwitchValue
      ) {
        countP = 1;
        isStoreCache = true;
      }
      if (typeOfDefect.includes('oil') && oilSwitchValue) {
        countO = 1;
        isStoreCache = true;
      }

      //  if (isLiveFeed === true) {
      await CacheManager.cacheCameraFrames(
        index,
        isStoreCache,
        camera.frames,
        timestamp,
      );
      // }

      const score = camera.score.map((s) => get2Decimal(s));
      const thresholds = camera.thresholds.map((t) => get2Decimal(t));

      // Only store 1 thumbnail for each camera
      const thumbnail = (camera.frames.find(irTopFrame) ?? camera.frames[0])
        .thumbnail;
      deleteThumbnails(camera.frames);

      if (camera.score[0] > horizontalScore && horizontalSwitchValue === true) {
        horizontalScore = camera.score[0];
        highestHorizontalScoreIdx = index;
      }

      if (camera.score[1] > verticalScore && verticalSwitchValue === true) {
        verticalScore = camera.score[1];
        highestVerticalScoreIdx = index;
      }

      if (camera.score[2] > punctualScore && punctualSwitchValue === true) {
        punctualScore = camera.score[2];
        highestPunctualScoreIdx = index;
      }

      if (camera.score[3] > oilScore && oilSwitchValue === true) {
        oilScore = camera.score[3];
        highestOilScoreIdx = index;
      }
      const parsed = {
        index: camera.index,
        defect,
        thumbnail,
        frames: camera.frames,
        timestamp: timestamp,
        score: '[' + score.join() + ']',
        thresholds: '[' + thresholds.join() + ']',
        isStoreCache: isStoreCache,
      };

      return parsed;
    }),
  );

  feed = feed.sort((a, b) => a.index - b.index);
  // let horizontalPointColor = CheckDefect.defectTypes(
  //   feed[highestHorizontalScoreIdx],
  //   Stores.getState().persisted.settings.cameraDefectSettings[
  //     highestHorizontalScoreIdx
  //   ],
  // );
  // let verticalPointColor = CheckDefect.defectTypes(
  //   feed[highestVerticalScoreIdx],
  //   Stores.getState().persisted.settings.cameraDefectSettings[
  //     highestVerticalScoreIdx
  //   ],
  // );

  // let punchtualPointColor = CheckDefect.defectTypes(
  //   feed[highestPunctualScoreIdx],
  //   Stores.getState().persisted.settings.cameraDefectSettings[
  //     highestPunctualScoreIdx
  //   ],
  // );

  // is defective batch if there is a defect AND isStoreCache = true, that is, switch is on
  const defectiveBatch = feed.filter(
    (Batch) => Batch.defect !== null && Batch.isStoreCache === true,
  );

  if (defectiveBatch.length === 0) {
    isDefectiveBatch = false;
  }
  return {
    feed,
    timestamp,
    isDefectiveBatch,
    wasLastBatchDefective,
    rotation: parseInt(result.frames[0]?.rotation, 0),
    rpm: parseInt(result.frames[0].rpm, 0),
    horizontalScore: {
      score: horizontalScore,
      aboveThreshold: countH > 0,
      // color: horizontalPointColor,
    },
    verticalScore: {
      score: verticalScore,
      aboveThreshold: countV > 0,
      // color: verticalPointColor,
    },
    punctualScore: {
      score: punctualScore,
      aboveThreshold: countP > 0,
      //  color: punchtualPointColor,
    },

    oilScore: {
      score: oilScore,
      aboveThreshold: countO > 0,
      //  color: punchtualPointColor,
    },
    countH: countH,
    countV: countV,
    countP: countP,
    countO: countO,
    count: countH + countV + countP + countO,
  };
};
