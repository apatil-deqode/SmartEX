import {Languages} from '@localization';
import {Actions} from '../Actions/Actions';

const initialState = {
  settingsUnlockPassword: '1234',
  timestamp: null,
  selectedFabric: null,
  producingNumber: null,
  rollStatus: null,
  defectAlert: false,
  device: {
    factory: null,
    installationId: null,
  },
  session: {
    authToken: null,
    refreshToken: null,
  },
  loginCredentials: {
    username: null,
    password: null,
  },
  settings: {
    horizontalSwitchValue: true,
    verticalSwitchValue: true,
    punctualSwitchValue: true,
    oilSwitchValue: true,
    cmPerRotation: 5,
    ignoreDefectRotationCount: 85,
    isSensitivityThresholdLock: false,
    horizontal: {
      defectStopCount: 3,
      defectStopLength: 100,
      defectAlertCount: 0,
      defectAlertLength: 0,
      defectPerRollCount: 0,
      sensitivityThreshold: 0.9,
    },
    vertical: {
      defectStopCount: 3,
      defectStopLength: 100,
      defectAlertCount: 0,
      defectAlertLength: 0,
      defectPerRollCount: 0,
      sensitivityThreshold: 0.9,
    },
    punctual: {
      defectStopCount: 3,
      defectStopLength: 100,
      defectAlertCount: 0,
      defectAlertLength: 0,
      defectPerRollCount: 0,
      sensitivityThreshold: 0.9,
    },
    oil: {
      defectStopCount: 3,
      defectStopLength: 100,
      defectAlertCount: 0,
      defectAlertLength: 0,
      defectPerRollCount: 0,
      sensitivityThreshold: 0.9,
    },
    cameraDefectSettings: {
      0: {
        verticalSwitchValue: true,
        horizontalSwitchValue: true,
        punctualSwitchValue: true,
        oilSwitchValue: true,
      },
      1: {
        verticalSwitchValue: true,
        horizontalSwitchValue: true,
        punctualSwitchValue: true,
        oilSwitchValue: true,
      },
      2: {
        verticalSwitchValue: true,
        horizontalSwitchValue: true,
        punctualSwitchValue: true,
        oilSwitchValue: true,
      },
      3: {
        verticalSwitchValue: true,
        horizontalSwitchValue: true,
        punctualSwitchValue: true,
        oilSwitchValue: true,
      },
      4: {
        verticalSwitchValue: true,
        horizontalSwitchValue: true,
        punctualSwitchValue: true,
        oilSwitchValue: true,
      },
      5: {
        verticalSwitchValue: true,
        horizontalSwitchValue: true,
        punctualSwitchValue: true,
        oilSwitchValue: true,
      },
      6: {
        verticalSwitchValue: true,
        horizontalSwitchValue: true,
        punctualSwitchValue: true,
        oilSwitchValue: true,
      },
      7: {
        verticalSwitchValue: true,
        horizontalSwitchValue: true,
        punctualSwitchValue: true,
        oilSwitchValue: true,
      },
    },
    db_collection_mode: false,
    selected_model: '',
    stoppage_state: false,
    selectedLanguage: Languages.ENGLISH,
  },
  allFabrics: [],
  lastLiveFeedImageTime: null,
  isFromSetting: false,
};

/**
 *
 * @param {*} newSettings Object that should contain ALL key-value pairs of the settings
 * @returns new settings object if valid, null otherwise
 */
export const formatPersistedStateSettings = (newSettings) => {
  let validSettings = {};
  for (const key in initialState.settings) {
    // NOT SENDING BECAUSE MACHINE_STATUS IS UNDEFINED (AS IT SHOULD BE). BUT /send is not sending MACHINE_STATUS
    if (newSettings.hasOwnProperty(key) /* && newSettings[key] != undefined*/) {
      validSettings[key] = newSettings[key];
    } else {
      return null;
    }
  }

  return validSettings;
};

export const getInitialSettings = () => {
  return initialState.settings;
};

const PersistedReducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.SET_DEVICE_INFO:
      return {
        ...state,
        device: action.data,
      };
    case Actions.SET_SETTINGS:
      return {
        ...state,
        settings: action.data,
      };
    case Actions.SET_DEFECT_ALERT:
      return {
        ...state,
        defectAlert: true,
      };
    case Actions.SET_PRODUCING_NUMBER:
      return {
        ...state,
        producingNumber: action.data,
      };
    case Actions.SET_SELECTED_FABRIC:
      const newState = {
        ...state,
        selectedFabric: action.fabric,
      };
      if (!newState.rollStatus) {
        newState.rollStatus = true;
      }
      if (newState.defectAlert) {
        newState.defectAlert = false;
      }
      return newState;
    case Actions.SET_TOKEN:
      return {
        ...state,
        session: {
          authToken: action.payload.auth,
          refreshToken: action.payload.refresh,
        },
      };
    case Actions.HIDE_SESSION_TIMEOUT:
      return {
        ...state,
        session: {
          authToken: null,
          refreshToken: null,
        },
      };
    case Actions.SET_CUT_ROLL_PO_FALLBACK:
      return {
        ...state,
        producingNumber: action.producingNumber,
        selectedFabric: action.selectedFabric,
      };
    case Actions.SET_LOGIN_CREDENTIALS:
      return {
        ...state,
        loginCredentials: action.payload,
      };
    case Actions.SET_SETTINGS_TIME_STAMP:
      return {
        ...state,
        timestamp: action.timestamp,
      };
    case Actions.UPDATE_SETTINGS_UNLOCK_PASSWORD:
      return {
        ...state,
        settingsUnlockPassword: action.payload.password,
      };

    case Actions.ALL_FABRICS:
      return {
        ...state,
        allFabrics: action.payload,
      };

    case Actions.LAST_IMAGE_TIME:
      return {
        ...state,
        lastLiveFeedImageTime: action.data,
      };
    case Actions.IS_FROM_SETTING:
      return {
        ...state,
        isFromSetting: action.data,
      };
    case Actions.SELECTED_AI_MODEL:
      return {
        ...state,
        settings: {
          ...state.settings,
          selected_model: action.selected_model,
        },
      };
    case Actions.SET_STOPPAGE_STATE:
      return {
        ...state,
        settings: {
          ...state.settings,
          stoppage_state: action.stoppage_state,
        },
      };
    case Actions.SET_LANGUAGE:
      return {
        ...state,
        settings: {
          ...state.settings,
          selectedLanguage: action.language,
        },
      };
    default:
      return state;
  }
};

export default PersistedReducer;
