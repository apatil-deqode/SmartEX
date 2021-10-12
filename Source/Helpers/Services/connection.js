import {logger} from 'Helpers';
import Config from 'react-native-config';
import {
  CoreServiceAPIService,
  DiscoveryClient,
  CoreWebsocketService,
} from 'Services';

const setupServices = (installationId) => {
  setupSpecificService(installationId, Config.BROKER_DISCOVERY_API_USER);
};

const setupSpecificService = (installationId, service) => {
  const successCallback =
    service === Config.BROKER_DISCOVERY_API_USER
      ? setupCoreAPIService.bind(this, installationId)
      : setupCoreWSService.bind(this, installationId);

  const discoveryClient = new DiscoveryClient();
  discoveryClient.discover(installationId, service, successCallback, () => {
    // this.setRetry(false, 'broker');
    // not retrying for now
  });
};

/**
 *
 * @param {*} installationId
 * @param {*} param1 port and address come from DiscoveryClient
 * @returns
 */
const setupCoreAPIService = async (installationId, {port, address}) => {
  logger.info('[connection] Reconnecting coreAPIService...');
  const coreServiceAPIService = new CoreServiceAPIService();
  coreServiceAPIService.initilize(installationId, address, port);
  const ping = await coreServiceAPIService.checkConnection();
  if (!ping) {
    // TODO: handle connection error

    // For now, does not retry. Could be changed later
    // this.setRetry(false, '', 2);

    return;
  }
  logger.info('[connection] CoreAPIService reconnected with success!');
  setupSpecificService(installationId, Config.BROKER_DISCOVERY_WS_USER);
};

const setupCoreWSService = async (installationId, {port, address}) => {
  logger.info('[connection] Reconnecting coreWSService...');
  const discoveryClient = new DiscoveryClient();
  discoveryClient.close();
  const coreWebsocketService = new CoreWebsocketService();
  coreWebsocketService.onopen = () => {
    coreWebsocketService.onopen = null;
  };

  // NOT RESTARTING THE PROCESS WHEN ERRORS OCCURR IN THE WEBSOCKET SETUP
  coreWebsocketService.initilize(installationId, address, port);
};

export default setupServices;
