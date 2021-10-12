import analytics from '@react-native-firebase/analytics';
import {Stores} from '@state';
import Config from 'react-native-config';

export const logAnalytics = (eventName, eventMessage) => {
  const {installationId} = Stores.getState().persisted.device;

  const eventMessageWithInstallationId = `${eventMessage} ${
    installationId ? `(installation id: ${installationId})` : ''
  }`;
  if (Config.ANALYTICS_ENABLED === 'true') {
    analytics()
      .logEvent(eventName, {
        event_items: eventMessageWithInstallationId,
      })
      .then(() => {})
      .catch((e) => {});
  } else {
  }
};

export const setUserId = (id) => {
  analytics()
    .setUserId(id)
    .then(() => {})
    .catch((e) => {});
};

export const setUserProperties = (id) => {
  analytics()
    .setUserProperties({installation_id: 'id'})
    .then(() => {})
    .catch((e) => {});
};
