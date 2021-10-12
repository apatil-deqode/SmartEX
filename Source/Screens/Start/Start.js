import {CoreServiceAPIService, CoreWebsocketService} from '@services';
import React, {Component} from 'react';
import {View, Image} from 'react-native';
import {State, PanGestureHandler} from 'react-native-gesture-handler';
import {connect} from 'react-redux';
import {Card, Button} from 'react-native-paper';
import Images from '@images';
import {AppTheme, Styles} from '@themes';
import {Actions} from '@state';
import {logAnalytics, ScaledSheet, Events} from '@helpers';
import {withTranslation} from 'react-i18next';
import LiveFeed from '../Home/Feed/LiveFeed';
import {NegativeButton} from 'Components';
import Animated, {Easing, Value, timing} from 'react-native-reanimated';
import {enableStoppageState} from 'State/Actions/AsyncActions';

class Start extends Component {
  constructor() {
    super();
    this.translateY = new Value(0);
    this.navigated = false;

    this.state = {
      loading: false,
    };
  }

  componentWillUnmount() {
    const coreWebsocketService = new CoreWebsocketService();
    // coreWebsocketService.close();
  }

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

  startMachine = async () => {
    logAnalytics(Events.ENABLE_MACHINE, 'enabling machine');
    this.props.enableStoppageState();
  };

  render() {
    const {t} = this.props;
    return (
      <Card elevation={AppTheme.elevation} style={styles.card}>
        <View style={styles.containter}>
          <Image
            resizeMode="contain"
            source={Images.logo}
            style={styles.image}
          />
          <Animated.View
            style={[
              styles.animated,
              {
                transform: [{translateY: this.translateY}],
              },
            ]}>
            <PanGestureHandler
              onGestureEvent={this.onGestureEvent}
              onHandlerStateChange={this.onHandlerStateChange}>
              <View style={styles.liveFeedContainer}>
                <LiveFeed
                  style={styles.liveFeed}
                  navigation={this.props.navigation}
                />
              </View>
            </PanGestureHandler>
            <View style={styles.buttonsContainer}>
              <Button
                mode="contained"
                uppercase={false}
                contentStyle={styles.button}
                loading={this.props.isVisible}
                disabled={this.props.isVisible}
                labelStyle={Styles.h1}
                onPress={this.startMachine}>
                {t('start')}
              </Button>
              <NegativeButton
                onPress={this.handleRollButtonClick}
                style={styles.button}
                contentStyle={styles.cutRollContent}
                labelStyle={Styles.h1}>
                {t('cut_roll')}
              </NegativeButton>
            </View>
          </Animated.View>
        </View>
      </Card>
    );
  }

  handleRollButtonClick = () => {
    this.props.navigation.navigate('allFabrics');
  };
}

const styles = ScaledSheet.create({
  card: {
    flex: 1,
    margin: 15,
  },
  containter: {
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flex: 1,
  },
  image: {
    width: '80%',
    maxWidth: 738,
    maxHeight: '17%',
  },
  button: {
    width: '360@ls',
    height: '120@ls',
  },
  cutRollContent: {
    borderWidth: 0,
    height: '120@ls',
    backgroundColor: AppTheme.colors.primary,
  },
  animated: {
    height: '60%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveFeed: {
    width: '100%',
  },
  liveFeedContainer: {
    width: '98%',
  },
  buttonsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
});

const mapStateToProps = ({persisted, dialog}) => {
  return {
    installationId: persisted.device.installationId,
    rollStatus: persisted.rollStatus,
    isVisible: dialog.serviceDialogVisibility.isVisible,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setStoppageState: (stoppage_state) =>
      dispatch({type: Actions.SET_STOPPAGE_STATE, stoppage_state}),
    showSnackbar: (message) => dispatch({type: Actions.NOTIFY, message}),
    enableStoppageState: () => dispatch(enableStoppageState),
  };
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(Start),
);
