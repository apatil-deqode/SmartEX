import React, {Component} from 'react';
import {ActivityIndicator, Image, Text, View} from 'react-native';
import {withTranslation} from 'react-i18next';
import Base64 from 'react-native-base64';
import Config from 'react-native-config';
import {connect} from 'react-redux';
import {Button, Card} from 'react-native-paper';

import {
  Events,
  logAnalytics,
  ls,
  ScaledSheet,
  setUserId,
  setUserProperties,
  getPhysicalDeviceInfo,
  logger,
} from '@helpers';
import Images from '@images';
import {
  DiscoveryClient,
  SmartexService,
  CoreServiceAPIService,
  CoreWebsocketService,
} from '@services';
import {Actions} from '@state';
import {AppTheme, Styles} from '@themes';
import RegisterDialog from './RegisterDialog';
import {CancellablePromise} from 'Helpers/CancellablePromise';
import {
  formatPersistedStateSettings,
  getInitialSettings,
} from 'State/Reducers/PersistedReducer';

class Splash extends Component {
  state = {
    loading: true,
    message: null,
    manualLoginRequired: false,
    deviceId: null,
    macAddress: null,
    username: null,
    password: null,
    registerDialogVisible: false,
    loginLoading: false,
    pairingLoading: false,
    syncingStateLoading: false,
    shouldRestart: false,
    retryTimeoutMultiplier: 5,
  };
  retryTimeout = null;
  maxTimeoutMultipler = 30 * 60;

  cancellablePromise = CancellablePromise(60 /*3*/ * 1000); // Change the time to 60 when merging!
  restartAppPromise = this.cancellablePromise.promise;
  restartAppCancel = this.cancellablePromise.cancel; // Cancels restartAppPromise

  knownErrors = {
    MANUAL_LOGIN: 'manualLoginRequired',
    USER_INACTIVE: 'user_inactive',
  };

  async componentDidMount() {
    const {i18n, selectedLanguage} = this.props;
    i18n.changeLanguage(selectedLanguage);

    await this.setPhysicalDeviceInfo();
    this.initialState = this.state; // After getting physicalDeviceInfo in order to have the username and password != null
    this.login(false);

    this.restartAppPromise
      .then((res) => {
        this.setState({
          shouldRestart: true,
        });
      })
      .catch((err) => {});
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
  }

  async setPhysicalDeviceInfo() {
    const {deviceId, macAddress} = await getPhysicalDeviceInfo();
    const password = Base64.encode(macAddress);
    this.setState({
      deviceId,
      macAddress,
      username: deviceId,
      password,
    });
  }

  setError(loading, message, knownError, timeoutMultiplerIncrement = 1) {
    this.setState(
      {
        loading: loading,
        message: message,
      },
      () => {
        if (knownError === this.knownErrors.MANUAL_LOGIN) {
          this.setState({
            [knownError]: true,
          });
          return;
        } else if (knownError === this.knownErrors.USER_INACTIVE) {
          this.props.navigation.navigate('deactivated');
          return;
        } else {
          this.setRetry('', timeoutMultiplerIncrement);
        }
      },
    );
  }

  setRetry(requestType, timeoutMultiplerIncrement = 1) {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    this.retryTimeout = setTimeout(() => {
      if (requestType === 'broker') {
        this.getDeviceInfo();
      } else {
        this.setState(
          (prevState) => ({
            ...this.initialState,
            loading: prevState.loading,
            message: prevState.message,
            manualLoginRequired: prevState.manualLoginRequired,
            shouldRestart: prevState.shouldRestart,
            // Need to have this here, since otherwise when manualLogin is needed it will show ticks (Could show a different icon in the future)
            loginLoading: true,
            retryTimeoutMultiplier:
              prevState.retryTimeoutMultiplier * timeoutMultiplerIncrement >
              this.maxTimeoutMultipler
                ? this.maxTimeoutMultipler
                : prevState.retryTimeoutMultiplier * timeoutMultiplerIncrement,
          }),
          () => {
            this.props.setTokens(null, null);
            this.login();
          },
        );
      }
    }, 1000 * this.state.retryTimeoutMultiplier);
  }

  login = async (retry) => {
    this.setState({
      loginLoading: true,
      message: null,
      manualLoginRequired: false,
    });
    const {authToken, t} = this.props;

    if (authToken) {
      this.getDeviceInfo();
    } else {
      const {username, password} = this.state;
      logAnalytics(
        Events.LOGIN,
        `${
          retry ? 'Retry logging in' : 'Logging in'
        } with device ID ${username}/${password}`,
      );
      const result = await SmartexService.login(username, password);
      if (result.error) {
        if (result.error.status) {
          if (result.error.status === 401) {
            // User needs to manual login
            this.setError(
              false,
              t('authentication_failed'),
              this.knownErrors.MANUAL_LOGIN,
            );
            return;
          } else if (result.error.status === 400) {
            // User inactive
            this.setError(
              false,
              t('user_inactive'),
              this.knownErrors.USER_INACTIVE,
            );
            return;
          }
        }
        this.setError(false, result.error.message, false); // will try again
      } else {
        const {access_token, refresh_token} = result.data;
        this.props.setTokens(access_token, refresh_token);
        setUserId(username);
        this.getDeviceInfo();
      }
    }
  };

  getDeviceInfo = async () => {
    const result = await SmartexService.getDeviceInfo();
    if (result.error) {
      /*
      if (result.error.status === 401) {
        this.login(); // Why this.login() when error is 401 instead of calling the setError method
      } else {
        this.setError(false, result.error.message, false);
      } */
      this.setError(false, result.error.message, false);
    } else {
      this.setState({loginLoading: false, pairingLoading: true});
      const data = result.data[0];
      console.log('data >>>', data);
      const deviceInfo = {
        installationId: data.mainInstallation,
        factory: data.factory,
        machine: data.machine,
      };
      this.props.setDeviceInfo(deviceInfo);
      this.getBrokerIp(
        deviceInfo.installationId,
        Config.BROKER_DISCOVERY_API_USER,
      );
      setUserProperties(result.data[0].mainInstallation);
    }
  };

  getBrokerIp = async (
    installationId,
    service = Config.BROKER_DISCOVERY_API_USER,
  ) => {
    console.log('service >>>>>', service);
    const successCallback =
      service === Config.BROKER_DISCOVERY_API_USER
        ? this.setupCoreAPIService.bind(this, installationId)
        : this.setupCoreWSService.bind(this, installationId);

    const discoveryClient = new DiscoveryClient();
    discoveryClient.discover(installationId, service, successCallback, () => {
      this.setRetry(false, 'broker');
    });
  };

  /**
   *
   * @param {*} installationId
   * @param {*} param1 port and address come from DiscoveryClient
   * @returns
   */
  setupCoreAPIService = async (installationId, {port, address}) => {
    const coreServiceAPIService = new CoreServiceAPIService();
    coreServiceAPIService.initilize(installationId, address, port);
    const ping = await coreServiceAPIService.checkConnection();
    console.log('ping >>>>', ping);
    if (!ping) {
      // TODO: handle connection error
      // Restart process ?
      this.setRetry(false, '', 2);
      return;
    }
    this.getBrokerIp(installationId, Config.BROKER_DISCOVERY_WS_USER);
  };

  setupCoreWSService = async (installationId, {port, address}) => {
    const discoveryClient = new DiscoveryClient();
    discoveryClient.close();
    const coreWebsocketService = new CoreWebsocketService();
    coreWebsocketService.onopen = () => {
      this.setState({pairingLoading: false, syncingStateLoading: true});
      this.checkMachineState();
      coreWebsocketService.onopen = null;
    };

    // NOT RESTARTING THE PROCESS WHEN ERRORS OCCURR IN THE WEBSOCKET SETUP
    coreWebsocketService.initilize(installationId, address, port);
  };

  /**
   * Check if persistedSettings are valid. If not sets them to initialSettings
   * @param {*} settings
   */
  validatePersistedSettings = (settings) => {
    let persistedSettings = formatPersistedStateSettings(settings);
    if (persistedSettings == null) {
      logger.info('[Splash] Changing settings to default...');
      this.props.setSettings(getInitialSettings());
    }
  };

  checkMachineState = async () => {
    const {setisLoggedIn, settings} = this.props;
    const coreServiceAPIService = new CoreServiceAPIService();
    const [status, result] = await coreServiceAPIService.getState();
    if (!status) {
      // TODO: Handle error
      // Maybe should restart the login process again?
      this.setRetry(false, '');
      return;
    }

    if (!result) {
      console.log('[Splash] Trying persisted settings...');
      this.validatePersistedSettings(settings);
    }

    this.restartAppCancel(); // TEST WHEN IT NEEDS TO RESTART (TAKES TOO LONG)
    this.setState({syncingStateLoading: false, shouldRestart: false});

    setisLoggedIn(true);
  };

  register = async (name) => {
    const {username, password} = this.state;
    this.setState({registerDialogVisible: false});
    this.props.showProgressBar();
    const result = await SmartexService.register(name, username, password);
    this.props.hideProgressBar();
    if (result.error) {
      this.props.showSnackbar(result.error.message);
    } else {
      this.login();
    }
  };

  renderInsideCard = (children) => {
    const {t} = this.props;
    return (
      <Card elevation={AppTheme.elevation} style={styles.card}>
        <View style={styles.container}>
          <Image
            resizeMode="contain"
            source={Images.logo}
            style={styles.image}
          />
          {this.state.shouldRestart && (
            <View style={styles.labelContainer}>
              <Text style={styles.warningTextStyle}>
                {t('restart_application')}
              </Text>
              <View style={styles.warningIcon}>
                <Image
                  source={Images.unavailable}
                  resizeMode={'contain'}
                  style={{width: 50, height: 50}}
                />
              </View>
            </View>
          )}
          <View>
            {/* {children} */}
            <View style={styles.labelContainer}>
              <View style={styles.labelStyle}>
                {this.state.loginLoading ? (
                  <ActivityIndicator
                    size={ls(45)}
                    color={AppTheme.colors.accent}
                  />
                ) : (
                  <View style={Styles.tickIconStyle}>
                    <Image
                      source={Images.tick}
                      resizeMode={'contain'}
                      style={styles.icon}
                    />
                  </View>
                )}
                <Text style={styles.labelTextStyle}>{t('logging_in')}</Text>
              </View>
              <View style={styles.labelStyle}>
                {!this.state.loginLoading ? (
                  <View style={Styles.tickIconStyle}>
                    {this.state.pairingLoading ? (
                      <ActivityIndicator
                        size={ls(45)}
                        color={AppTheme.colors.accent}
                      />
                    ) : (
                      <Image
                        source={Images.tick}
                        resizeMode={'contain'}
                        style={styles.icon}
                      />
                    )}
                  </View>
                ) : null}

                <Text style={styles.labelTextStyle}>{t('pairing')}</Text>
              </View>
              <View style={styles.labelStyle}>
                {!this.state.loginLoading && !this.state.pairingLoading ? (
                  <View style={Styles.tickIconStyle}>
                    {this.state.syncingStateLoading ? (
                      <ActivityIndicator
                        size={ls(45)}
                        color={AppTheme.colors.accent}
                      />
                    ) : (
                      <Image
                        source={Images.tick}
                        resizeMode={'contain'}
                        style={styles.icon}
                      />
                    )}
                  </View>
                ) : null}
                <Text style={styles.labelTextStyle}>{t('syncing')}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{position: 'absolute'}}>
          {this.state.deviceId ? (
            <Text style={{...Styles.caption}}>{this.state.deviceId}</Text>
          ) : null}
          {this.state.macAddress ? (
            <Text style={{...Styles.caption, marginTop: 4}}>
              {this.state.macAddress}
            </Text>
          ) : null}
        </View>
        {this.state.manualLoginRequired ? (
          <>
            <View style={styles.buttonContainer}>
              <Button
                style={{marginRight: 8}}
                contentStyle={{paddingVertical: 8, marginRight: 8}}
                uppercase={false}
                mode="contained"
                onPress={() =>
                  this.props.navigation.navigate('login', {
                    onLoginSuccess: this.login,
                  })
                }>
                {t('manual_login')}
              </Button>
              <Button
                contentStyle={{paddingVertical: 8}}
                uppercase={false}
                mode="contained"
                onPress={() => {
                  this.setState({registerDialogVisible: true});
                }}>
                {t('register_device')}
              </Button>
            </View>

            <RegisterDialog
              visible={this.state.registerDialogVisible}
              onDismiss={() => this.setState({registerDialogVisible: false})}
              onSubmit={this.register}
            />
          </>
        ) : null}
        <Text style={styles.version}>{Config.VERSION_NAME}</Text>
      </Card>
    );
  };

  render() {
    return this.renderInsideCard(
      <ActivityIndicator size={ls(85)} color={AppTheme.colors.accent} />,
    );
  }
}

const styles = ScaledSheet.create({
  buttonContainer: {
    position: 'absolute',
    bottom: 16,
    end: 16,
    flexDirection: 'row',
  },
  tickIconStyle: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  labelStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 35,
    width: 220,
    justifyContent: 'flex-end',
  },
  labelContainer: {
    justifyContent: 'center',
  },
  labelTextStyle: {
    width: 150,
    color: 'white',
    fontSize: 20,
    marginLeft: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flex: 1,
    margin: 15,
  },
  container: {
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flex: 1,
  },
  ripple: {
    marginTop: '40@ls',
    borderRadius: '43@ls',
  },
  image: {
    width: '80%',
    maxWidth: 738,
    maxHeight: '17%',
  },
  version: {
    ...Styles.caption,
    start: 4,
    bottom: 4,
  },
  warningTextStyle: {
    fontSize: 25,
    color: 'white',
  },
  warningIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
});

const mapStateToProps = ({persisted}) => {
  return {
    authToken: persisted.session.authToken,
    installationId: persisted.device.installationId,
    brokerIp: persisted.brokerIp,
    selectedLanguage: persisted.settings.selectedLanguage,
    settings: persisted.settings,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setisLoggedIn: (isLoggedIn) =>
      dispatch({type: Actions.SET_IS_LOGGED_IN, isLoggedIn}),
    setTokens: (auth, refresh) =>
      dispatch({
        type: Actions.SET_TOKEN,
        payload: {auth, refresh},
      }),
    setBrokerIp: (data) => dispatch({type: Actions.SET_BROKER_IP, data}),
    setDeviceInfo: (info) =>
      dispatch({type: Actions.SET_DEVICE_INFO, data: info}),
    showSnackbar: (message) => dispatch({type: Actions.NOTIFY, message}),
    showProgressBar: () => dispatch({type: Actions.SHOW_PROGRESS_BAR}),
    hideProgressBar: () => dispatch({type: Actions.HIDE_PROGRESS_BAR}),
    setSettings: (data) => dispatch({type: Actions.SET_SETTINGS, data}),
  };
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(Splash),
);
