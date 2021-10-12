import {cameraTemplate} from 'Helpers/LiveFeedHelper';
import {take} from 'lodash/array';
import {Actions} from '../Actions/Actions';

/*
  livefeed = [
    {
      feed: [],
      rpm : Number
      rotation: Number
    }
  ]
 */

/**
 * liveFeed -> Stores most recent liveFeed
 * history -> Stores last 4 liveFeeds (excluding the most recent)
 */
const initialState = {
  liveFeed: null,
  history: [],
  defectedFamehistoryHistory: [],
  defectedFrames: null,
  cameraMissingCounter: 0,
};

const cameraMissingThreshold = 20;

const LiveFeedReducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.UPDATE_LIVE_FEED:
      //logic shouldn't be here but optimising app so need to reduce number of actions

      // Reanimate last from history  */
      let feed = [...action.feed];
      let isCameraMissing = false;
      for (let i = 0; i < 8; i++) {
        // feed[i] represents camera of index i.  If current camera has no feed
        if (!feed[i] || !feed[i].thumbnail) {
          // if counter < threshold, grabs the camera feed from the last feed
          if (
            state.cameraMissingCounter < cameraMissingThreshold &&
            state.liveFeed != null
          ) {
            feed[i] = state.liveFeed?.feed[i];
          } else {
            feed[i] = cameraTemplate(i);
          }
          isCameraMissing = true;
          // console.log(`Feed[${i}]: ${JSON.stringify(feed[i])}`);
        }
      }
      feed = feed.filter((n) => n !== undefined);
      // End of reanimate last from history

      const history = take(state.history, 3);
      if (state.liveFeed) {
        history.unshift(state.liveFeed);
      }

      return {
        ...state,
        liveFeed: {
          feed: feed,
          rotation: action.rotation,
          rpm: action.rpm,
        },
        history: history,
        cameraMissingCounter: isCameraMissing
          ? state.cameraMissingCounter > cameraMissingThreshold
            ? state.cameraMissingCounter
            : state.cameraMissingCounter + 1
          : 0,
      };

    case Actions.UPDATE_DEFECTED_FRAMES:
      //logic shouldn't be here but optimising app so need to reduce number of actions
      // Reanimate last from history  */
      let defectedFeeds = [...action.payload.feed];
      for (let i = 0; i < 8; i++) {
        if (!defectedFeeds[i] || !defectedFeeds[i].thumbnail) {
          defectedFeeds[i] = state.defectedFrames?.frames[i];
        }
      }

      defectedFeeds = defectedFeeds.filter((n) => n !== undefined);

      const defectedFamehistory = take(state.defectedFamehistoryHistory, 3);
      if (state.defectedFrames) {
        defectedFamehistory.unshift(state.defectedFrames);
      }
      return {
        ...state,
        defectedFrames: {
          frames: defectedFeeds,
        },
        defectedFamehistoryHistory: defectedFamehistory,
      };

    case Actions.EMPTY_LIVE_FEED:
      return {
        ...state,
        liveFeed: null,
        history: [],
      };

    default:
      return state;
  }
};

export default LiveFeedReducer;
