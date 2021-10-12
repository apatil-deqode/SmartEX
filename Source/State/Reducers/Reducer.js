import {Actions} from '../Actions/Actions';

let initialState = {
  isLoggedIn: false,
  rollNumber: null,
  machineNumber: null,
  rpm: 0,
  settingsUpdating: false,
  cutRollUpdating: false,
  mlModelList: [],
};

const Reducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.SET_IS_LOGGED_IN:
      return {...state, isLoggedIn: action.isLoggedIn};

    case Actions.UPDATE_RPM:
      return {...state, rpm: action.data};

    case Actions.SET_ROLL_NUMBER:
      return {...state, rollNumber: action.rollNumber, cutRollUpdating: false};

    case Actions.SET_MACHINE_AND_ROLL_NUMBER:
      return {
        ...state,
        rollNumber: action.rollNumber,
        machineNumber: action.machineNumber,
        mlModelList: action.mlModelList,
      };
    case Actions.HIDE_SESSION_TIMEOUT:
      return {...state, isLoggedIn: null};

    case Actions.SET_UPDATING:
      return {...state, settingsUpdating: action.data};

    case Actions.SET_CUT_ROLL_PO_FALLBACK:
    case Actions.SET_CUT_ROLL_UPDATING:
      return {
        ...state,
        cutRollUpdating: action.data ?? false,
      };

    case Actions.SET_SETTINGS:
      if (action.isFallback) {
        return {...state, settingsUpdating: false};
      }
      return state;
    default:
      return state;
  }
};

export default Reducer;
