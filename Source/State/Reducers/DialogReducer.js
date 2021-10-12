import {Actions} from '../Actions/Actions';

const initialState = {
  loaderVisible: false,
  defectStopVisible: false,
  sessionExpiredVisible: false,
  defect: null,
  pingErrorDialogVisible: false,
  connectionStatus: {
    isAvailable: true,
    isCoreConnected: true,
    isCoreOn: true,
    isMachineConnected: true,
    isMachineOn: true,
    isMlConnected: true,
    isMlOn: true,
    isSensingConnected: true,
    isSensingOn: true,
  },
  serviceDialogVisibility: {isVisible: false},
};

const DialogReducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.SHOW_PROGRESS_BAR:
      return {
        ...state,
        loaderVisible: true,
      };
    case Actions.HIDE_PROGRESS_BAR:
    case Actions.SET_SELECTED_FABRIC:
      return {
        ...state,
        loaderVisible: false,
      };
    case Actions.SHOW_DEFECT_STOP:
      return {
        ...state,
        defectStopVisible: true,
        type: action.payload.type,
        defect: action.payload.defect,
        cm: action.payload.cm,
        occurrences: action.payload.occurrences,
        timestamp: action.payload.timestamp,
      };
    case Actions.HIDE_DEFECT_STOP:
      return {
        ...state,
        defectStopVisible: false,
      };
    case Actions.SHOW_DISCONNECTED_ERROR:
      return {
        ...state,
        pingErrorDialogVisible: true,
        connectionStatus: action.payload,
      };
    case Actions.HIDE_DISCONNECTED_ERROR:
      return {
        ...state,
        pingErrorDialogVisible: false,
        connectionStatus: action.payload,
      };
    case Actions.SHOW_HIDE_SERVICES_DILOAG:
      return {
        ...state,
        serviceDialogVisibility: action.payload,
      };
    case Actions.NOTIFY:
      if (state.loaderVisible) {
        return {
          ...state,
          loaderVisible: false,
        };
      } else {
        return state;
      }
    case Actions.SHOW_SESSION_TIMOUT:
      return {
        ...state,
        sessionExpiredVisible: true,
      };
    case Actions.HIDE_SESSION_TIMEOUT:
      return {
        ...state,
        sessionExpiredVisible: false,
      };
    case Actions.SHOW_PING_ERROR_DIALOG:
      return {
        ...state,
        pingErrorDialogVisible: true,
      };
    case Actions.HIDE_PING_ERROR_DIALOG:
      return {
        ...state,
        pingErrorDialogVisible: false,
      };

    default:
      return state;
  }
};

export default DialogReducer;
