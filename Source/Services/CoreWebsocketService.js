import {Actions, Stores} from '@state';
import {logger, parsePing} from '@helpers';
import {parseLiveFeed} from './RabbitMqHelper';
import DbHelper from 'db';
import {CheckDefect, CacheManager} from '@helpers';
import {defectLavel} from 'Helpers/CheckDefect';
import {Q} from '@nozbe/watermelondb';
import CodePush from 'react-native-code-push';
import setupServices from 'Helpers/Services/connection';
const SERVICE_PING_CHECK_TIMEOUT = 1000 * 60;

const NEW_RPM = '/new_rpm';
const LIVE_FEED = '/live_feed';
const SERVICE_PING = '/services_ping';
const DEFECT_STOP = '/defect_stop';
const DEFECT_ALERT = '/defect_alert';
const STOPPAGE_PAUSE = '/stoppage_pause';
const GET_SETTINGS = '/get_settings';

export default class CoreWebsocketService {
  constructor() {
    if (CoreWebsocketService.instance instanceof CoreWebsocketService) {
      return CoreWebsocketService.instance;
    }
    this.clientId = 'SmartexTablet';
    this.installationId = null;
    this.IP = null;
    this.port = null;
    this.isSecure = false;
    this.url = null;
    this.instance = null;

    // SERVICE PING
    this.servicePingCount = 0;
    this.servicePingTimer = null;
    this.servicePingFailedCount = 0; // Counts the nº of consecutive minutes without ping requests~

    // CALLBACK
    this.defectStoppageCallback = null;
    this.getSettingsCallback = null;

    this.retryTimeout = null;

    logger.info('[CoreWebsocketService] New instance created.');
    CoreWebsocketService.instance = this;
  }

  initilize = (installationId, ip, port = null, isSecure = false) => {
    this.installationId = installationId;
    this.IP = ip;
    this.port = port;
    this.isSecure = isSecure;

    const protocol = this.isSecure ? 'wss' : 'ws';
    this.url = this.port
      ? `${protocol}://${this.IP}:${this.port}`
      : `${protocol}://${this.IP}`;

    this.createWebsocketInstance();
  };

  createWebsocketInstance = () => {
    // Note: Closing old connection if exist
    if (this.instance) {
      logger.info('[CoreWebsocketService] Closing old connection');
      this.instance.onopen = null;
      this.instance.onmessage = null;
      this.instance.onclose = null;
      this.instance.onerror = null;
      this.instance.close();
      this.instance = null;
    }

    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }

    logger.info(`Websocket URL: ${this.url}`);
    this.instance = new WebSocket(this.url);
    this.instance.onopen = this.onopen;
    this.instance.onmessage = this.onmessage;
    this.instance.onclose = this.onclose;
    this.instance.onerror = this.onerror;
  };

  onopen = () => null;

  onclose = (event) => {
    logger.warn('[CoreWebsocketService] Connection closed', event);
    this.instance = null;
    if (!this.retryTimeout) {
      this.retryConnection();
    }
    Stores.dispatch({type: Actions.CONNECTION_LOST, data: true});
  };

  onerror = ({message}) => {
    logger.error('[CoreWebsocketService] WS error: ', message);
    if (!this.retryTimeout) {
      this.retryConnection();
    }
  };

  onmessage = ({data}) => {
    const message = JSON.parse(data);
    const ReplyTo = message.reply_to ? message.reply_to : null;
    const correlationId = message.correlation_id
      ? message.correlation_id
      : null;
    logger.info(`[CoreWebsocketService] Message on: [${message.routing_key}]`);
    if (message.routing_key === STOPPAGE_PAUSE) {
      this.onStoppagePause(message);
    } else if (message.routing_key === NEW_RPM) {
      this.onRPM(message);
    } else if (message.routing_key === LIVE_FEED) {
      this.onLiveFeed(message);
    } else if (message.routing_key === SERVICE_PING) {
      this.onServicePing(message);
    } else if (message.routing_key === DEFECT_STOP) {
      this.onDefectStop(message);
    } else if (message.routing_key === DEFECT_ALERT) {
      this.onDefectAlert();
    } else if (message.routing_key === GET_SETTINGS) {
      this.onSendSettings();
    } else {
      logger.error(
        `[CoreWebsocketService] Unknown route: ${message.routing_key}`,
      );
    }

    if (ReplyTo !== null) {
      const sendPayload = {routing_key: ReplyTo, correlation_id: correlationId};
      const sendReply = JSON.stringify(sendPayload);
      this.instance.send(sendReply);
    }
  };

  close = () => {
    if (this.instance) {
      this.instance.close(200);
      this.instance = null;
    }
  };

  retryConnection = (count = 0) => {
    if (this.instance && this.instance.readyState === this.instance.OPEN) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
      return;
    }

    this.retryTimeout = setTimeout(this.createWebsocketInstance, 1000 * 10);
  };

  onStoppagePause = (result) => {
    if (this.defectStoppageCallback) {
      this.defectStoppageCallback(result.rotations_left);
    }
  };

  onRPM = (result) => {
    const rpm = result.new_value;
    Stores.dispatch({type: Actions.UPDATE_RPM, data: rpm});
  };

  onLiveFeed = async (result) => {
    try {
      const data = await parseLiveFeed(result, true);
      Stores.dispatch({type: Actions.LAST_IMAGE_TIME, data: data.timestamp});
      Stores.dispatch({type: Actions.UPDATE_LIVE_FEED, ...data});

      /*
      // For Debugging
      // console.log('Is batch defective? ', data.isDefectiveBatch);
      console.log(
        'parsed live_feed: ',
        JSON.stringify(
          data.feed.map((camera) => ({
            ...camera,
            thumbnail: 'empty thumbnail',
          })),
        ),
      );
      */
      if (data.isDefectiveBatch) {
        try {
          const defectStops = await DbHelper.database
            .get('defectStops')
            .query(Q.where('isUsed', Q.eq(false)))
            .fetch();
          if (defectStops.length !== 0) {
            const lastDefectStop = defectStops[defectStops.length - 1];
            const lastTime = lastDefectStop.timestamp;
            if (data.timestamp > lastTime) {
              const oldFeeds = await DbHelper.database
                .get('feeds')
                .query()
                .fetch();
              if (oldFeeds.length !== 0) {
                const lastFeed = oldFeeds[oldFeeds.length - 1];
                await DbHelper.updateFeed(lastFeed);
                await DbHelper.updateDefectStop(lastDefectStop);
              }
            }
          }
          await DbHelper.insertFeed(data);
          // data.feed.map(async (Image, index) => {
          //   if (
          //     isDefectEnabled === null ||
          //     isDefectEnabled !== defectLavel.red
          //   ) {
          //     isDefectEnabled = CheckDefect.defectTypes(
          //       Image,
          //       Stores.getState().persisted.settings.cameraDefectSettings[
          //         index
          //       ],
          //     );
          //   }
          // });
          if (data.count > 0) {
            Stores.dispatch({
              type: Actions.UPDATE_DEFECT_COUNT_AND_TIMESTAMP,
              count: data.count,
              countH: data.countH,
              countV: data.countV,
              countP: data.countP,
              countO: data.countO,
              timestamp: data.timestamp,
            });
          }
        } catch (error) {
          logger.error(
            '[CoreWebsocketService] Inserting defects to database: ',
            error,
          );
        }
      }
    } catch (error) {
      logger.error('[CoreWebsocketService] Live feed parsing', error);
    }
  };

  onDefectStop = async (result) => {
    if (result.defect) {
      // TODO: Send reply on socket
      try {
        let paths = [];
        const liveFeed =
          Stores.getState().liveFeed.defectedFrames?.frames ?? [];
        for (const frames of liveFeed) {
          const framesJson = frames.frames;
          framesJson.forEach((f) => {
            paths.push(f.frame);
          });
        }
        CacheManager.clearGivenPaths(paths);
        const data = await parseLiveFeed(result, false);
        const timeData = {timestamp: data.timestamp};
        await DbHelper.insertDefectStop(timeData);
        Stores.dispatch({type: Actions.UPDATE_DEFECTED_FRAMES, payload: data});
        Stores.dispatch({
          type: Actions.SHOW_DEFECT_STOP,
          payload: {
            defect: result.stop_parameter.defect,
            type: result.stop_parameter.type,
            cm: result.stop_parameter.cm,
            occurrences: result.stop_parameter.occurrences,
            frames: result.frames,
            timestamp: data.timestamp,
          },
        });
      } catch (error) {
        logger.error('[CoreWebsocketService] Live feed parsing', error);
      }
    }
  };

  onSendSettings = () => {
    if (this.getSettingsCallback) {
      this.getSettingsCallback();
    }
  };

  onDefectAlert = () => {
    // TODO: Not doing any thing right now.
  };

  /**
   * Receives Ping requests from Core
   * @param {*} result
   */
  onServicePing = (result) => {
    const connectionStatus = parsePing(result);
    this.servicePingCount++;
    if (connectionStatus.isAvailable) {
      Stores.dispatch({
        type: Actions.HIDE_DISCONNECTED_ERROR,
        payload: connectionStatus,
      });
    } else {
      this.showServiceError(connectionStatus);
    }
  };

  initServicePingTimer(installationId) {
    if (this.servicePingTimer) {
      clearInterval(this.servicePingTimer);
    }
    this.servicePingTimer = setInterval(() => {
      if (this.servicePingCount >= 1) {
        this.servicePingCount = 0;
        this.servicePingFailedCount = 0;
      } else {
        this.servicePingFailedCount++;
        logger.info(
          '[CoreWebsocketService]',
          this.servicePingFailedCount,
          'min without receiving pings from Core',
        );
        if (this.servicePingFailedCount >= 5) {
          CodePush.restartApp();
        } else if (
          this.servicePingFailedCount >= 3 &&
          this.servicePingFailedCount % 3 == 0
        ) {
          setupServices(installationId);
        }
        this.showServiceError({isAvailable: false, isPingMissing: true});
      }
    }, SERVICE_PING_CHECK_TIMEOUT);
  }

  showServiceError = (connectionStatus) => {
    Stores.dispatch({
      type: Actions.SHOW_DISCONNECTED_ERROR,
      payload: connectionStatus,
    });
  };

  cancelServicePingTimer() {
    if (this.servicePingTimer) {
      clearInterval(this.servicePingTimer);
      this.servicePingTimer = null;
    }
  }

  // CALLBACKS
  setDefectsStoppageCallback(defectStoppageCallback) {
    this.defectStoppageCallback = defectStoppageCallback;
  }

  setGetSettingsCallback(getSettingsCallback) {
    this.getSettingsCallback = getSettingsCallback;
  }
}
