import {Languages} from '@localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import {createMigrate, persistReducer, persistStore} from 'redux-persist';
import ReduxThunk from 'redux-thunk';
import DialogReducer from '../Reducers/DialogReducer';
import HomeReducer from '../Reducers/HomeReducer';
import LiveFeedReducer from '../Reducers/LiveFeedReducer';
import PersistedReducer from '../Reducers/PersistedReducer';
import AuthReducer from '../Reducers/Reducer';
import SnackbarReducer from '../Reducers/SnackbarReducer';
import CutRollMiddleWare from './CutRollMiddleWare';

const migrations = {
  1: (state) => {
    return {
      ...state,
      home: {
        currentRollDefectCount: state.home.currentRollDefectCount,
        lastDefectTimestamp: state.home.lastDefectTimestamp,
        horizontalScores: [],
        verticalScores: [],
      },
    };
  },
  2: (state) => {
    return {
      ...state,
      persisted: {
        ...state.persisted,
        selectedLanguage:
          state.persisted.settings.selectedLanguage ?? Languages.ENGLISH,
      },
    };
  },
  3: (state) => {
    return {
      ...state,
      home: {
        ...state.home,
        wasLastBatchDefective: true,
      },
    };
  },
  4: (state) => {
    return {
      ...state,
      persisted: {
        ...state.persisted,
        loginCredentials: {
          username: null,
          password: null,
        },
      },
    };
  },
  5: (state) => {
    return {
      ...state,
      persisted: {
        ...state.persisted,
        settingsUnlockPassword: '1234',
      },
    };
  },
  6: (state) => {
    return {
      ...state,
      home: {
        ...state.home,
        punctualScores: [],
      },
    };
  },
  7: (state) => {
    return {
      ...state,
      persisted: {
        ...state.persisted,
        allFabrics: [],
      },
    };
  },
  8: (state) => {
    return {
      ...state,
      persisted: {
        ...state.persisted,
        settings: {
          ...state.persisted.settings,
          isSensitivityThresholdLock: false,
        },
      },
    };
  },
  9: (state) => {
    return {
      ...state,
      persisted: {
        ...state.persisted,
        settings: {
          ...state.persisted.settings,
          cameraDefectSettings: {
            0: {
              verticalSwitchValue: true,
              horizontalSwitchValue: true,
              punctualSwitchValue: true,
            },
            1: {
              verticalSwitchValue: true,
              horizontalSwitchValue: true,
              punctualSwitchValue: true,
            },
            2: {
              verticalSwitchValue: true,
              horizontalSwitchValue: true,
              punctualSwitchValue: true,
            },
            3: {
              verticalSwitchValue: true,
              horizontalSwitchValue: true,
              punctualSwitchValue: true,
            },
            4: {
              verticalSwitchValue: true,
              horizontalSwitchValue: true,
              punctualSwitchValue: true,
            },
            5: {
              verticalSwitchValue: true,
              horizontalSwitchValue: true,
              punctualSwitchValue: true,
            },
            6: {
              verticalSwitchValue: true,
              horizontalSwitchValue: true,
              punctualSwitchValue: true,
            },
            7: {
              verticalSwitchValue: true,
              horizontalSwitchValue: true,
              punctualSwitchValue: true,
            },
          },
        },
      },
    };
  },
  10: (state) => {
    return {
      ...state,
      persisted: {
        ...state.persisted,
        lastLiveFeedImageTime: null,
      },
    };
  },
  11: (state) => {
    return {
      ...state,
      persisted: {
        ...state.persisted,
        isFromSetting: false,
      },
    };
  },
  12: (state) => {
    return {
      ...state,
      persisted: {
        ...state.persisted,
        settings: {
          ...state.persisted.settings,
          db_collection_mode: false,
          selected_model: '',
        },
      },
    };
  },
  13: (state) => {
    return {
      ...state,
      home: {
        ...state.home,
        oilScores: [],
      },
      persisted: {
        ...state.persisted,
        settings: {
          ...state.persisted.settings,
          oilSwitchValue: true,
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
              ...state.persisted.settings.cameraDefectSettings[0],
              oilSwitchValue: true,
            },
            1: {
              ...state.persisted.settings.cameraDefectSettings[1],
              oilSwitchValue: true,
            },
            2: {
              ...state.persisted.settings.cameraDefectSettings[2],
              oilSwitchValue: true,
            },
            3: {
              ...state.persisted.settings.cameraDefectSettings[3],
              oilSwitchValue: true,
            },
            4: {
              ...state.persisted.settings.cameraDefectSettings[4],
              oilSwitchValue: true,
            },
            5: {
              ...state.persisted.settings.cameraDefectSettings[5],
              oilSwitchValue: true,
            },
            6: {
              ...state.persisted.settings.cameraDefectSettings[6],
              oilSwitchValue: true,
            },
            7: {
              ...state.persisted.settings.cameraDefectSettings[7],
              oilSwitchValue: true,
            },
          },
        },
      },
    };
  },
  14: (state) => {
    return {
      ...state,
      home: {
        ...state.home,
        currentRollDefectCountH: 0,
        currentRollDefectCountV: 0,
        currentRollDefectCountP: 0,
        currentRollDefectCountO: 0,
      },
    };
  },
  15: (state) => {
    return {
      ...state,
      persisted: {
        ...state.persisted,
        settings: {
          ...state.persisted.settings,
          stoppage_state: false,
          selectedLanguage: Languages.ENGLISH,
        },
      },
    };
  },
  16: (state) => {
    return {
      ...state,
      home: {
        ...state.home,
        isDisableHomeAction: false,
      },
    };
  },
  17: (state) => {
    return {
      ...state,
      home: {
        ...state.home,
        fabricDetail: {
          isOpenDialog: false,
          fabricData: null,
        },
      },
    };
  },
};

const rootReducer = combineReducers({
  auth: AuthReducer,
  snackbar: SnackbarReducer,
  dialog: DialogReducer,
  home: HomeReducer,
  liveFeed: LiveFeedReducer,
  persisted: PersistedReducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['home', 'persisted'],
  version: 17,
  migrate: createMigrate(migrations, {debug: false}),
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const Stores = createStore(
  persistedReducer,
  {},
  applyMiddleware(ReduxThunk, CutRollMiddleWare),
);

let persistor = persistStore(Stores);

export {Stores, persistor};
