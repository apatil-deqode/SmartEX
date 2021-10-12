import {Actions} from '../Actions/Actions';

let initialState = {
  currentRollDefectCount: 0,
  lastDefectTimestamp: null,
  wasLastBatchDefective: true,
  horizontalScores: [],
  verticalScores: [],
  punctualScores: [],
  oilScores: [],
  isConnectionLost: false,
  currentRollDefectCountH: 0,
  currentRollDefectCountV: 0,
  currentRollDefectCountP: 0,
  currentRollDefectCountO: 0,
  isDisableHomeAction: false,
  fabricDetail: {
    isOpenDialog: false,
    fabricData: null,
  },
};
const Reducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.UPDATE_DEFECT_COUNT_AND_TIMESTAMP:
      return {
        ...state,
        currentRollDefectCount: state.currentRollDefectCount + action.count,
        currentRollDefectCountH: state.currentRollDefectCountH + action.countH,
        currentRollDefectCountV: state.currentRollDefectCountV + action.countV,
        currentRollDefectCountP: state.currentRollDefectCountP + action.countP,
        currentRollDefectCountO: state.currentRollDefectCountO + action.countO,
        lastDefectTimestamp: action.timestamp,
      };

    case Actions.SET_SELECTED_FABRIC:
      return {
        ...state,
        currentRollDefectCount: 0,
        currentRollDefectCountH: 0,
        currentRollDefectCountV: 0,
        currentRollDefectCountP: 0,
        currentRollDefectCountO: 0,
        lastDefectTimestamp: null,
        wasLastBatchDefective: true,
      };
    case Actions.UPDATE_LIVE_FEED:
      let horizontalScores = [...(state.horizontalScores || [])];
      let verticalScores = [...(state.verticalScores || [])];
      let _punctualScores = [...(state.punctualScores || [])];
      let _oilScores = [...(state.oilScores || [])];

      if (horizontalScores.length >= 30) {
        horizontalScores.shift();
      }
      if (verticalScores.length >= 30) {
        verticalScores.shift();
      }
      if (_punctualScores.length >= 30) {
        _punctualScores.shift();
      }
      if (_oilScores.length >= 30) {
        _oilScores.shift();
      }

      horizontalScores.push(action.horizontalScore);
      verticalScores.push(action.verticalScore);
      _punctualScores.push(action.punctualScore);
      _oilScores.push(action.oilScore);

      return {
        ...state,
        horizontalScores,
        verticalScores,
        punctualScores: _punctualScores,
        oilScores: _oilScores,
        wasLastBatchDefective: action.isDefectiveBatch,
      };

    case Actions.CONNECTION_LOST:
      return {
        ...state,
        isConnectionLost: action.data,
      };
    case Actions.DISABLE_HOME_ACTION:
      return {
        ...state,
        isDisableHomeAction: action.data,
      };
    case Actions.FABRIC_DETAIL_DIALOG:
      console.log('>>>>>>>', action);
      return {
        ...state,
        fabricDetail: action.data,
      };
    default:
      return state;
  }
};

export default Reducer;
