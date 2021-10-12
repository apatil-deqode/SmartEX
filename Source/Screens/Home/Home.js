import React, {Component} from 'react';
import {
  View,
  PermissionsAndroid,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import {State, PanGestureHandler} from 'react-native-gesture-handler';
import {withTranslation} from 'react-i18next';
import {connect} from 'react-redux';
import {
  ScaledSheet,
  CopilotManager,
  Introductions,
  logAnalytics,
  Events,
  ls,
} from '@helpers';
import {CopilotStep} from 'react-native-copilot-fullscreen';
import {Actions, Stores} from '@state';
import {CopilotView} from '@components';
import {Styles, AppTheme} from '@themes';
import {CoreWebsocketService, CoreServiceAPIService} from '@services';
import LiveFeed from './Feed/LiveFeed';
import Icons from '@icons';
import Gif from '@gif';
import moment from 'moment/min/moment-with-locales';
import i18n from 'i18next';
import RunningFabric from './RunningFabric';
import SettingsAuthDialog from '../Settings/SettingsAuthDialog';
import LastDefects from './LastDefects';
import ShiftChart from './Charts/ShiftChart';
import Animated, {timing, Easing, Value} from 'react-native-reanimated';
import NetInfo from '@react-native-community/netinfo';
import {BlueGradient, PurpleGradient} from '@components';
import {Card} from 'react-native-paper';
import Images from '@images';

const height = Dimensions.get('screen').height;
const LIVE_FEED_HEIGHT = height * 0.285;

const DATA = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'First Item',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Second Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    title: 'Third Item',
  },
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'First Item',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Second Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    title: 'Third Item',
  },
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'First Item',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Second Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    title: 'Third Item',
  },
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'First Item',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Second Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    title: 'Third Item',
  },
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'First Item',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Second Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    title: 'Third Item',
  },
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'First Item',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Second Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    title: 'Third Item',
  },
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'First Item',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Second Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    title: 'Third Item',
  },
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'First Item',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Second Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    title: 'Third Item',
  },
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'First Item',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Second Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    title: 'Third Item',
  },
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'First Item',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Second Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    title: 'Third Item',
  },
];

class Home extends Component {
  constructor(props) {
    super(props);
    this.translateY = new Value(0);
    this.navigated = false;

    this.state = {
      rotationsLeft: 0,
      isSettingAuthVisible: false,
      isMachinePaused: false,
      isInternetConnected: false,
      isOpenNotofications: false,
    };
  }

  async componentDidMount() {
    moment.locale(i18n.language);
    await this.checkCameraPermission();
    const coreWebsocketService = new CoreWebsocketService();
    coreWebsocketService.initServicePingTimer(this.props.installationId);
    //this.showIfIntroductionNeeded();
    coreWebsocketService.setDefectsStoppageCallback((rotationsLeft) => {
      let isSetPushed = false;
      if (rotationsLeft > 0) {
        isSetPushed = true;
      }
      this.setState({
        rotationsLeft: rotationsLeft,
        isMachinePaused: isSetPushed,
      });
    });
    coreWebsocketService.setGetSettingsCallback(this.sendSettings);
    await this.sendSettings(); // Sending settings everytime we navigate to Home.js. Should we keep that logic?
    NetInfo.addEventListener((netInfoData) => {
      this.setState({isInternetConnected: netInfoData.isInternetReachable});
    });
  }

  componentWillUnmount() {
    const coreWebsocketService = new CoreWebsocketService();
    coreWebsocketService.cancelServicePingTimer();
    coreWebsocketService.setDefectsStoppageCallback(null);
    coreWebsocketService.setGetSettingsCallback(null);
  }
  sendSettings = async () => {
    const {settings} = this.props;

    const coreServiceAPIService = new CoreServiceAPIService();
    const result = await coreServiceAPIService.sendSettings(settings);
    if (!result) {
      // TODO: Error accoured. Basic error already handeled in API service
    }
  };

  onGestureEvent = ({nativeEvent}) => {
    if (nativeEvent.translationY < 0 || nativeEvent.numberOfPointers > 1) {
      return;
    }
    if (nativeEvent.translationY > 80 && !this.navigated) {
      this.navigated = true;
      this.props.navigation.navigate('recentLiveFeed');
    }
    this.translateY.setValue(nativeEvent.translationY);
  };

  onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      this.navigated = false;

      timing(this.translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.linear,
      }).start();
    }
  };

  showIfIntroductionNeeded = async (forced) => {
    if (forced || (await CopilotManager.isNeeded(Introductions.HOME))) {
      const {startIntro, onCopilotEvent} = this.props.route.params;
      onCopilotEvent('stop', () =>
        CopilotManager.setCompleted(Introductions.HOME),
      );
      startIntro();
    }
  };

  checkCameraPermission = async () => {
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    if (!granted) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
      if (result !== PermissionsAndroid.RESULTS.GRANTED) {
        this.props.showSnackbar(this.props.t('camera_permission_denied'));
      }
    }
  };

  handleRollButtonClick = () => {
    logAnalytics(Events.CUT_ROLL_BUTTON, 'Cut roll clicked');
    this.props.navigation.navigate('allFabrics');
  };

  snoozeStoppage = async (isPaused) => {
    const coreServiceAPIService = new CoreServiceAPIService();
    const result = await coreServiceAPIService.snoozeStoppage(isPaused);
    if (!result) {
      // TODO: Error accoured. Basic error already handeled in API service
    }
  };
  renderItem = ({item}) => <Text>{item.title}</Text>;

  render() {
    const {
      t,
      i18n: {language},
    } = this.props;
    const {rotationsLeft, isMachinePaused, isInternetConnected} = this.state;
    const {
      lastLiveFeedImageTime,
      isConnectionLost,
      isDisableHomeAction,
    } = this.props;
    if (isConnectionLost === true) {
      this.props.setConnectionLost();
    }
    return (
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{translateY: this.translateY}],
          },
        ]}>
        {/* <FAB
          small
          icon="help"
          style={styles.fab}
          onPress={this.showIfIntroductionNeeded.bind(this, true)}
        /> */}
        <CopilotStep
          key={t('step_live_feed')}
          text={t('step_live_feed')}
          order={8}
          name="step_live_feed">
          <CopilotView>
            <PanGestureHandler
              onGestureEvent={this.onGestureEvent}
              onHandlerStateChange={this.onHandlerStateChange}>
              <View>
                <LiveFeed navigation={this.props.navigation} />
              </View>
            </PanGestureHandler>
          </CopilotView>
        </CopilotStep>
        {rotationsLeft ? (
          <View style={styles.warningContainer}>
            <View style={[styles.warning]}>
              <View style={styles.warningIcon}>
                <Icons.Snooze width={50} height={50} />
              </View>
              <Text style={Styles.h5}>
                {getStoppageMessage(rotationsLeft, language)}
              </Text>
            </View>
          </View>
        ) : null}
        <View style={styles.middleRow}>
          <CopilotStep
            key={t('step_selected_fabric')}
            text={t('step_selected_fabric')}
            order={9}
            name="step_selected_fabric">
            <CopilotView style={styles.runningFarbric}>
              <RunningFabric />
            </CopilotView>
          </CopilotStep>
          <CopilotStep
            key={t('step_start_roll')}
            text={t('step_start_roll')}
            order={10}
            name="step_start_roll">
            <CopilotView>
              <View style={styles.cutRollRow}>
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      const updatedMachineState = !isMachinePaused;
                      this.snoozeStoppage(updatedMachineState);
                      this.setState({
                        isMachinePaused: updatedMachineState,
                      });
                    }}>
                    {isMachinePaused ? (
                      // <View style={styles.button}>
                      //   <Icons.Snooze width={ls(58)} height={ls(60)} />
                      // </View>
                      <BlueGradient style={styles.button}>
                        <View style={styles.button}>
                          <Image
                            source={Gif.Clock}
                            style={{width: 60, height: 60}}
                          />
                        </View>
                      </BlueGradient>
                    ) : (
                      // <View style={[styles.button, styles.disabledButton]}>
                      //   <Icons.Snooze width={ls(58)} height={ls(60)} />)
                      // </View>
                      <View style={styles.buttonActive}>
                        <Icons.Snooze width={ls(58)} height={ls(60)} />
                      </View>
                      // <View style={styles.buttonActive}>
                      //   <Image
                      //     source={Gif.Clock}
                      //     style={{width: 60, height: 60}}
                      //   />
                      // </View>
                    )}
                  </TouchableOpacity>
                  {isDisableHomeAction === true ? (
                    <View
                      style={[
                        styles.overlayView,
                        {
                          bottom: -57,
                          borderBottomLeftRadius: 0,
                          borderBottomRightRadius: 0,
                        },
                      ]}
                    />
                  ) : null}
                </View>
                <PurpleGradient
                  style={[
                    styles.cutRollButton,
                    isInternetConnected === false
                      ? {backgroundColor: 'grey'}
                      : null,
                  ]}>
                  <TouchableOpacity
                    disabled={!isInternetConnected}
                    onPress={this.handleRollButtonClick}
                    style={[
                      styles.cutRollButton,
                      isInternetConnected === false
                        ? {backgroundColor: 'grey'}
                        : null,
                    ]}>
                    <Icons.CutRoll width={ls(79)} height={ls(51)} />
                  </TouchableOpacity>
                </PurpleGradient>
              </View>
              <View style={styles.lastImageTime}>
                <Text style={Styles.h6}>
                  {t('last_image')}{' '}
                  {lastLiveFeedImageTime
                    ? moment(lastLiveFeedImageTime).fromNow()
                    : ''}
                </Text>
              </View>
            </CopilotView>
          </CopilotStep>
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.bottomRow}>
            <CopilotStep
              key={t('step_shifts')}
              text={t('step_shifts')}
              order={12}
              name="step_shifts">
              <CopilotView style={{flex: 4, marginEnd: 8}}>
                <ShiftChart
                  navigation={this.props.navigation}
                  onDisplaySettingAuthDialog={() =>
                    this.setState({isSettingAuthVisible: true})
                  }
                />
              </CopilotView>
            </CopilotStep>
            <CopilotStep
              key={t('step_last_defective')}
              text={t('step_last_defective')}
              order={13}
              name="step_last_defective">
              <CopilotView style={{flex: 1, marginStart: 8}}>
                <View style={styles.rootCard}>
                  {this.state.isOpenNotofications === false ? (
                    <LastDefects
                      navigate={this.props.navigation.navigate}
                      shrinked={rotationsLeft !== 0}
                    />
                  ) : null}

                  <Card
                    elevation={AppTheme.elevation}
                    style={
                      this.state.isOpenNotofications === true
                        ? {marginTop: 0, height: '100%'}
                        : {marginTop: 10, height: '60%'}
                    }>
                    <TouchableOpacity
                      style={{alignItems: 'center', flex: 1, padding: 10}}
                      disabled={this.state.isOpenNotofications}
                      onPress={() => {
                        this.setState({isOpenNotofications: true});
                      }}>
                      <View style={styles.notificationContainer}>
                        <Image
                          // eslint-disable-next-line react-native/no-inline-styles
                          style={{
                            width: 20,
                            height: 20,
                          }}
                          resizeMode="contain"
                          source={Images.notificationsWhite}
                        />
                        <Text
                          // eslint-disable-next-line react-native/no-inline-styles
                          style={{
                            ...Styles.h6,
                            fontSize: 15,
                            marginLeft: 10,
                          }}>
                          {'NOTIFICATIONS'}
                        </Text>
                      </View>

                      <FlatList
                        data={DATA}
                        renderItem={this.renderItem}
                        keyExtractor={(item) => item.id}
                      />
                      {this.state.isOpenNotofications === true ? (
                        <BlueGradient style={styles.buttonClose}>
                          <TouchableOpacity
                            onPress={() => {
                              this.setState({isOpenNotofications: false});
                            }}>
                            <Text style={Styles.caption2}>Close</Text>
                          </TouchableOpacity>
                        </BlueGradient>
                      ) : null}
                    </TouchableOpacity>
                  </Card>
                </View>
              </CopilotView>
            </CopilotStep>
          </View>
          {isDisableHomeAction === true ? (
            <View style={styles.overlayView}>
              <Icons.closedEyeIconWhite fill="white" />
            </View>
          ) : null}
        </View>
        <SettingsAuthDialog
          settingsUnlockPassword={this.props.settingsUnlockPassword}
          onCancelPress={() => this.setState({isSettingAuthVisible: false})}
          visible={this.state.isSettingAuthVisible}
          onSubmit={() => {
            this.setState({isSettingAuthVisible: false});
            this.props.setSettingsTimeout(new Date().getTime());
          }}
        />
      </Animated.View>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    margin: '15@vs',
  },
  rootCard: {
    flex: 1,
    overflow: 'hidden',
  },
  cutRollRow: {
    flexDirection: 'row',
    width: '381@vs',
  },
  lastImageTime: {
    top: 10,
    height: 30,
    width: '381@vs',
  },
  button: {
    height: '120@vs',
    width: '120@vs',
    // backgroundColor: AppTheme.colors.darkYellow,
    borderRadius: AppTheme.roundness,
    justifyContent: 'center',
    padding: 16,
    alignItems: 'center',
    opacity: 0.5,
  },
  buttonActive: {
    height: '120@vs',
    width: '120@vs',
    backgroundColor: AppTheme.colors.darkYellow, //'white',
    borderRadius: AppTheme.roundness,
    justifyContent: 'center',
    padding: 16,
    alignItems: 'center',
  },
  cutRollButton: {
    // backgroundColor: AppTheme.colors.blue,
    height: '120@vs',
    width: '250@vs',
    borderRadius: AppTheme.roundness,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 10,
  },
  runningFarbric: {
    flex: 1,
    marginEnd: '15@ls',
  },
  middleRow: {
    flexDirection: 'row',
    flex: 1,
    marginVertical: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    flex: 2.3,
  },
  warningContainer: {
    position: 'absolute',
    top: LIVE_FEED_HEIGHT - 80,
    alignSelf: 'center',
    backgroundColor: '#00000090',
    width: '100%',
    height: 80,
  },
  warning: {
    height: 80,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningIcon: {
    marginEnd: '8@ls',
    // height: '50@vs',
    // width: '50@vs',
    // backgroundColor: AppTheme.colors.darkYellow,
    borderRadius: '25@vs',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  overlayView: {
    flex: 1,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    opacity: 0.8,
    backgroundColor: 'black',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonClose: {
    borderRadius: 8,
    width: 80,
    padding: 10,
    alignItems: 'center',
    bottom: 20,
  },
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
});

const getStoppageMessage = (x, language) => {
  switch (language) {
    case 'pt':
      return `A paragem de máquina está em pausa por ${x} rotações`;
    case 'it':
      return `Il meccanismo di arresto della macchina viene messo in pausa per ${x} ulteriori rotazioni`;
    case 'tr':
      return `Makine durdurma mekanizması ${x} tur daha durdurulur`;
    default:
      return `The machine stoppage mechanism is paused for ${x} more rotations`;
  }
};

const mapStateToProps = ({
  persisted: {
    rollStatus,
    settings,
    settingsUnlockPassword,
    lastLiveFeedImageTime,
    device,
  },
  home: {isConnectionLost, isDisableHomeAction},
}) => {
  return {
    rollStatus: rollStatus,
    settings: settings,
    settingsUnlockPassword: settingsUnlockPassword,
    lastLiveFeedImageTime: lastLiveFeedImageTime,
    isConnectionLost: isConnectionLost,
    installationId: device.installationId,
    isDisableHomeAction: isDisableHomeAction,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    showSnackbar: (message) => dispatch({type: Actions.NOTIFY, message}),
    setSettingsTimeout: (timeStamp) =>
      dispatch({type: Actions.SET_SETTINGS_TIME_STAMP, timestamp: timeStamp}),
    setConnectionLost: () =>
      dispatch({type: Actions.CONNECTION_LOST, data: false}),
    setStoppageState: (stoppage_state) =>
      dispatch({type: Actions.SET_STOPPAGE_STATE, stoppage_state}),
  };
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(Home),
);
