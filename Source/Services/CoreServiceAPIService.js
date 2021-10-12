import axios from 'axios';
import i18n from 'i18next';

import {Actions, Stores} from '@state';
import {logger} from '@helpers';
import {formatPersistedStateSettings} from 'State/Reducers/PersistedReducer';

const DEFAULT_API_RETRY_COUNT = 3;

const GET_PING = '/ping';
const GET_STATE = '/get_state';
const ENABLE_MACHINE_STOPPAGE = '/enable_machine_stoppage';
const DISABLE_MACHINE_STOPPAGE = '/disable_machine_stoppage';
const CUT_ROLL = '/cut_roll';
const UNLOCK_MACHINE = '/unlock_machine';
const SEND_SETTINGS = '/send_settings';
const DEFECT_STOP_RESPONSE = '/defect_stop_response_queue';
const DEFECT_ALERT_RESPONSE = '/defect_alert_response_queue';
const TRIGGER_STOPPAGE_PAUSE = '/trigger_stoppage_pause';
const SEND_TABLET_BATTERY_LEVEL = '/tablet_battery_level_update';

export default class CoreServiceAPIService {
  constructor() {
    if (CoreServiceAPIService.instance instanceof CoreServiceAPIService) {
      return CoreServiceAPIService.instance;
    }
    this.clientId = 'SmartexTablet';
    this.installationId = null;
    this.IP = null;
    this.port = null;
    this.isSecure = false;
    this.instance = null;
    logger.info('[CoreServiceAPIService] New instance created.');
    CoreServiceAPIService.instance = this;
  }

  initilize = (installationId, ip, port = null, isSecure = false) => {
    this.installationId = installationId;
    this.IP = ip;
    this.port = port;
    this.isSecure = isSecure;
    this.createAxiosInstance();
  };

  createAxiosInstance = () => {
    const protocol = this.isSecure ? 'https' : 'http';
    const url = this.port
      ? `${protocol}://${this.IP}:${this.port}`
      : `${protocol}://${this.IP}`;
    console.log('>>>>>>>', url);
    this.instance = axios.create({
      baseURL: url,
      headers: {
        'X-Client-Id': this.clientId,
        'X-Installation-Id': this.installationId,
      },
      timeout: 1000 * 30 /*1*/, // 60 seconds waiting for the request? If the url is wrong it will take a long time
    });
  };

  request = async (config, retryCount = DEFAULT_API_RETRY_COUNT) => {
    console.log('config >>>', config.url);
    try {
      if (!this.instance) {
        this.createAxiosInstance();
      }
      logger.info(
        `[CoreServiceAPIService] Request [${config.url}] Retry [${retryCount}]`,
      );
      const response = await this.instance(config);
      return [true, response.data];
    } catch (error) {
      logger.error(`[CoreServiceAPIService] Request failed [${config.url}]`);
      if (!error) {
        // TODO: Something went wrong
        logger.error(
          `[CoreServiceAPIService] Request [${config.url}] Unknown error`,
        );
      }

      if (error.response) {
        logger.error(
          `[CoreServiceAPIService] Request [${config.url}] failed with code: ${error.response.status}`,
        );
      }

      if (retryCount <= 0) {
        return [false, error];
      }

      return this.request(config, --retryCount);
    }
  };

  checkConnection = async () => {
    const [status, _] = await this.request({url: GET_PING});
    return status;
  };

  getState = async () => {
    const [status, result] = await this.request({url: GET_STATE});

    if (!status) {
      return [status, null];
    }

    if (result.content.settings) {
      if (result.content.settings.stoppage_state == null) {
        // should be stoppage_state
        result.content.settings.stoppage_state = result.content.stoppage_state;
      }
      if (result.content.settings.selected_model == null) {
        result.content.settings.selected_model = result.content.selected_model;
      }
      // Need to check for the others variables? I think that it's not needed
    } else {
      // invalid settings will just discard them
      result.content.settings = {
        db_collection_mode: result.content.db_collection_mode,
        selected_model: result.content.selected_model,
        stoppage_state: result.content.stoppage_state,
      };
    }

    console.log('GET STATE result: ', JSON.stringify(result));

    Stores.dispatch({
      type: Actions.SET_MACHINE_AND_ROLL_NUMBER,
      rollNumber: result.content.roll_number,
      machineNumber: result.content.machine_number,
      mlModelList: result.content.ml_model_list,
    });
    Stores.dispatch({
      type: Actions.SELECTED_AI_MODEL,
      selected_model: result.content.settings.selected_model, // now is inside settings (settings are all the modifiable variables)
    });

    let newSettings = formatPersistedStateSettings(result.content.settings);

    if (newSettings != null) {
      console.log(
        '[CoreServiceAPIService] Settings from the CoreService are valid',
      );

      Stores.dispatch({
        type: Actions.SET_SETTINGS,
        data: newSettings,
      });
    }

    return [true, newSettings];
  };

  cutRoll = async (fabricId, end, productionOrder) => {
    const data = {idFabric: fabricId, end, producingNumber: productionOrder};
    Stores.dispatch({type: Actions.SET_CUT_ROLL_UPDATING, data: true});

    const [status, result] = await this.request({
      url: CUT_ROLL,
      method: 'post',
      data,
    });

    Stores.dispatch({type: Actions.SET_CUT_ROLL_UPDATING, data: false});
    if (!status) {
      // Stores.dispatch({
      //   type: Actions.SET_CUT_ROLL_PO_FALLBACK,
      //   errorMessage: i18n.t('cut_roll_error'),
      //   producingNumber: this.producingNumber,
      //   selectedFabric: this.selectedFabric,
      // });
      return status;
    }

    Stores.dispatch({
      type: Actions.SET_ROLL_NUMBER,
      rollNumber: result.content?.roll_number,
    });
  };

  unlockMachine = async (confirmed) => {
    const data = {confirmed: confirmed};
    Stores.dispatch({type: Actions.SHOW_PROGRESS_BAR});
    const [status, _] = await this.request({
      url: UNLOCK_MACHINE,
      method: 'post',
      data,
    });
    Stores.dispatch({type: Actions.HIDE_PROGRESS_BAR});
    if (!status) {
      const message = i18n.t('unlock_machine_error');
      Stores.dispatch({type: Actions.NOTIFY, message});
      return status;
    }
    const message = i18n.t('unlock_machine_success');
    Stores.dispatch({type: Actions.HIDE_DEFECT_STOP});
    Stores.dispatch({type: Actions.NOTIFY, message});
    return status;
  };

  sendSettings = async (data) => {
    Stores.dispatch({type: Actions.SET_UPDATING, data: true});
    const [status, _] = await this.request({
      url: SEND_SETTINGS,
      method: 'post',
      data,
    });
    Stores.dispatch({type: Actions.SET_UPDATING, data: false});

    console.log('[CoreServiceAPIService] Settings sent' /*, data*/);

    if (!status) {
      // Stores.dispatch({
      //   type: Actions.SET_SETTINGS,
      //   data: this.fallbackSettings,
      //   isFallback: true,
      //   errorMessage: i18n.t('send_settings_error'),
      // });
    }
    return status;
  };

  defectStopResponse = async () => {
    const [status, _] = await this.request({url: DEFECT_STOP_RESPONSE});
    return status;
  };

  defectAlertResponse = async () => {
    const [status, _] = await this.request({url: DEFECT_ALERT_RESPONSE});
    return status;
  };

  snoozeStoppage = async (isPaused) => {
    const requestConfig = {
      method: 'post',
      url: TRIGGER_STOPPAGE_PAUSE,
      data: {action: isPaused},
    };
    const [status, _] = await this.request(requestConfig);
    return status;
  };

  /* These 2 following functions are for retrocompatibility */
  enableMachineStoppage = async () => {
    const [status, result] = await this.request({url: ENABLE_MACHINE_STOPPAGE});

    return status;
  };

  disableMachineStoppage = async () => {
    // Stores.dispatch({type: Actions.SHOW_PROGRESS_BAR});
    const [status, _] = await this.request({url: DISABLE_MACHINE_STOPPAGE});
    // Stores.dispatch({type: Actions.HIDE_PROGRESS_BAR});

    return status;
  };

  sendTabletBatteryLevel = async (batteryLevel) => {
    const [status, _] = await this.request({
      url: SEND_TABLET_BATTERY_LEVEL,
      method: 'post',
      data: {level: batteryLevel},
    });

    return status;
  };
}
