import {irTopFrame} from '@helpers';
import RNFetchBlob from 'rn-fetch-blob';

/*
    Cache Manager manages two folders
      - live feed
      - defects

    A Maximum of 40 live feeds are kept, recents inserted from start removed from end
*/

const {fs} = RNFetchBlob;
const DEFECT_DIR = fs.dirs.CacheDir + '/defects/';
const LIVE_FEED_DIR = fs.dirs.CacheDir + '/livefeed/';
const PREFIX = 'file://';
const liveFeedCachedPathsLimit = 40;
const defectCachedPathsLimit = 120;

class CacheManager {
  constructor() {
    if (CacheManager.instance instanceof CacheManager) {
      return CacheManager.instance;
    }
    this.liveFeedCachedPaths = [];
    this.defectCachedPaths = [];

    this.fetchCachedPaths(true);
    this.fetchCachedPaths(false);

    CacheManager.instance = this;
  }

  /**
   * Fetches the cached paths already in memory
   * @param {*} isLiveFeed
   * @returns
   */
  fetchCachedPaths = async (isLiveFeed) => {
    let cachedNames = [];
    const path = isLiveFeed ? LIVE_FEED_DIR : DEFECT_DIR;
    try {
      cachedNames = await fs.ls(path);
    } catch (e) {
      return;
    }

    cachedNames.forEach((name) => {
      if (isLiveFeed) {
        this.liveFeedCachedPaths.push(path + name);
      } else {
        this.defectCachedPaths.push(path + name);
      }
    });

    // For debugging
    /*
    if (isLiveFeed) {
      console.log('liveFeedCachedPaths:', this.liveFeedCachedPaths);
    } else {
      console.log('defectsCachedPaths: ', this.defectCachedPaths);
    } */
  };

  clearLiveFeedCache = async () => {
    let cachedNames = [];
    try {
      cachedNames = await fs.ls(LIVE_FEED_DIR);
    } catch (e) {
      return;
    }

    // console.log('cachedNames: ', cachedNames);

    cachedNames.forEach((name) => fs.unlink(LIVE_FEED_DIR + name).catch());
    this.liveFeedCachedPaths = [];
  };

  clearDefectsCache = async () => {
    let cachedNames = [];
    try {
      cachedNames = await fs.ls(DEFECT_DIR);
    } catch (e) {}

    // console.log('cachedNames: ', cachedNames);

    cachedNames.forEach((name) => fs.unlink(DEFECT_DIR + name).catch());
  };

  /**
   * If camera has defect, stores all the images, otherwise only stores 1
   * @param {*} cameraIndex
   * @param {*} isDefect
   * @param {*} frames
   * @param {*} timestamp
   */
  cacheCameraFrames = async (cameraIndex, isDefect, frames, timestamp) => {
    if (isDefect) {
      // If defect cache all frames
      for (const frame of frames) {
        if (this.defectCachedPaths.length > defectCachedPathsLimit) {
          const imagePath = this.defectCachedPaths.pop();
          fs.unlink(imagePath).catch();
        }

        const path = `${DEFECT_DIR}${timestamp}_${cameraIndex}_${frame.type}_${frame.pos}.jpg`;
        await fs.writeFile(path, frame.frame, 'base64');
        this.defectCachedPaths.unshift(path);
        frame.frame = PREFIX + path;
      }
    } else {
      // If not defect, cache only top frame?
      if (this.liveFeedCachedPaths.length >= liveFeedCachedPathsLimit) {
        const path = this.liveFeedCachedPaths.pop();
        fs.unlink(path).catch();
      }

      const frame = frames.find(irTopFrame) ?? frames[0];
      if (frame) {
        const path = `${LIVE_FEED_DIR}${timestamp}_${cameraIndex}_${frame.type}_${frame.pos}.jpg`;
        await fs.writeFile(path, frame.frame, 'base64');
        this.liveFeedCachedPaths.unshift(path);
        frame.frame = PREFIX + path;
      }
    }
  };

  clearGivenPaths = (paths) => {
    const imagePaths = paths.map((d) => d.substring(7));

    imagePaths.forEach((path) => fs.unlink(path).catch());
  };
}

const instance = new CacheManager();
export default instance;
