import {Actions} from '../Actions/Actions';

const initialState = {
  message: null,
};

const SnackbarReducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.NOTIFY:
      return {message: action.message};
    case Actions.NOTIFY_CLOSE:
      return {message: null};
    case Actions.SET_SETTINGS: {
      if (action.errorMessage) {
        return {message: action.errorMessage};
      }
      return state;
    }
    case Actions.SET_CUT_ROLL_PO_FALLBACK: {
      return {message: action?.errorMessage};
    }
    default:
      return state;
  }
};

export default SnackbarReducer;
