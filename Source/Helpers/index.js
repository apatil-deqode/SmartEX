export * from './Analytics/FirebaseAnalyticsLogger';
export * from './Analytics/Events';
import Slack from 'react-native-slack-webhook';
import Config from 'react-native-config';

import DeviceInfo from 'react-native-device-info';

import {Constants} from '@data';
import scaledSheetCreator from './Scale/ScaledSheet';
import CopilotManager, {Introductions} from './CopilotManager';
import {ls, vs, ms} from './Scale/scaling-utils';
import CacheManager from './CacheManager';
import isAuthorisationNeededToChangeSettings from './SettingsAuth/isAuthorisationNeededToChangeSettings';
import downloadAPK from './DownloadManager';
import CheckDefect from './CheckDefect';

const ScaledSheet = scaledSheetCreator(ls, vs, ms);
const slackWebhook = new Slack(Config.SLACK_WEBHOOK);

const slackLog = (message) => {
  slackWebhook.post(message, '#tablet-log');
};

const randomId = (n = 5) => {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < n; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const parsePing = (result) => {
  const ping = {
    isAvailable: true,
    isCoreOn: result?.core_service?.on ?? false,
    isCoreConnected: result?.core_service?.connected ?? false,
    isMachineOn: result?.machine_service?.on ?? false,
    isMachineConnected: result?.machine_service?.connected ?? false,
    isMlOn: result?.ml_service?.on ?? false,
    isMlConnected: result?.ml_service?.connected ?? false,
    isSensingOn: result?.sensing_service?.on ?? false,
    isSensingConnected: result?.sensing_service?.connected ?? false,
  };

  for (const key in ping) {
    if (!ping[key]) {
      ping.isAvailable = false;
      break;
    }
  }

  return ping;
};
const ifDefect = (defect) =>
  defect === Constants.NO_DEFECT || defect === Constants.NOT_ANALYZED
    ? null
    : defect;

const irTopFrame = (frame) => frame.type === 'IR' && frame.pos === 'TOP';

const getPhysicalDeviceInfo = async () => {
  const uniqueId = DeviceInfo.getUniqueId();
  const deviceId = uniqueId + Constants.EMAIL_SUFFIX;
  const macAddress = await DeviceInfo.getMacAddress();

  return {uniqueId, deviceId, macAddress};
};

const logger = (function (oldConsole) {
  return {
    log: function (...text) {
      if (__DEV__) {
        oldConsole.log(...text);
      }
    },
    info: function (...text) {
      if (__DEV__) {
        oldConsole.info(...text);
      }
    },
    warn: function (...text) {
      if (__DEV__) {
        oldConsole.warn(...text);
      }
    },
    error: function (...text) {
      // TODO: Replace with more nice logger
      // if (__DEV__) {
      oldConsole.error(...text);
      // }
    },
  };
})(console);

export {
  ls,
  vs,
  ms,
  ScaledSheet,
  randomId,
  parsePing,
  ifDefect,
  irTopFrame,
  getPhysicalDeviceInfo,
  CopilotManager,
  Introductions,
  CacheManager,
  logger,
  downloadAPK,
  isAuthorisationNeededToChangeSettings,
  slackLog,
  CheckDefect,
};
