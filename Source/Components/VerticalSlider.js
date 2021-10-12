import * as React from 'react';
import {
  View,
  Text,
  Animated,
  PanResponder,
  StyleSheet,
  Easing,
} from 'react-native';
import Line from './Line';
import {Stores} from '@state';
import {isAuthorisationNeededToChangeSettings} from '@helpers';
import LinearGradient from 'react-native-linear-gradient';
import {BlueGradient} from '@components';
import Icons from '@icons';

export default class VerticalSlider extends React.Component {
  _moveStartValue = 0;

  constructor(props) {
    super(props);

    let panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => {
        const {timestamp} = Stores.getState().persisted;
        const {
          isSensitivityThresholdLock,
        } = Stores.getState().persisted.settings;
        if (isSensitivityThresholdLock) {
          if (isAuthorisationNeededToChangeSettings(timestamp)) {
            if (this.props.onDisplaySettingAuthDialog) {
              this.props.onDisplaySettingAuthDialog();
            }
            return false;
          }
          return true;
        } else {
          return true;
        }
      },
      onMoveShouldSetPanResponder: () => false,
      onPanResponderGrant: () => {
        this._moveStartValue = this.state.value;
      },
      onPanResponderMove: (_event, gestureState) => {
        if (this.props.disabled) {
          return;
        }
        const value = this._fetchNewValueFromGesture(gestureState);
        this._changeState(value);
        if (this.props.onChange) {
          this.props.onChange(value);
        }
      },
      onPanResponderRelease: (_event, gestureState) => {
        if (this.props.disabled) {
          return;
        }
        const value = this._fetchNewValueFromGesture(gestureState);
        this._changeState(value);
        if (this.props.onComplete) {
          this.props.onComplete(value);
        }
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: (_event, gestureState) => {
        if (this.props.disabled) {
          return;
        }
        const value = this._fetchNewValueFromGesture(gestureState);
        this._changeState(value);
        if (this.props.onComplete) {
          this.props.onComplete(value);
        }
      },
    });

    this.height = props.height;
    this.initialValue = props.value;
    this.state = {
      value: props.value || props.min,
      sliderHeight: new Animated.Value(0),
      ballHeight: new Animated.Value(0),
      panResponder,
    };
  }

  componentDidUpdate() {
    if (this.height !== this.props.height) {
      this.height = this.props.height;
      let {value} = this.state;
      this._changeState(value);
    } else if (this.props.value !== this.initialValue) {
      this.initialValue = this.props.value;
      this._changeState(this.props.value);
    }
  }

  _fetchNewValueFromGesture = (gestureState) => {
    const {min, max, step, height} = this.props;
    const ratio = -gestureState.dy / height;
    const diff = max - min;
    if (step) {
      return Math.max(
        min,
        Math.min(
          max,
          this._moveStartValue + Math.round((ratio * diff) / step) * step,
        ),
      );
    }
    let value = Math.max(min, this._moveStartValue + ratio * diff);
    return Math.floor(value * 100) / 100;
  };

  _getSliderHeight = (value) => {
    const {min, max, height} = this.props;
    return ((value - min) * height) / (max - min);
  };

  _changeState = (value) => {
    const {height, animationDuration} = this.props;
    const sliderHeight = this._getSliderHeight(value);
    let ballPosition = sliderHeight;
    const ballHeight = 30;
    ballPosition = ballPosition - ballHeight / 2;
    // if (ballPosition + ballHeight >= height) {
    //   ballPosition = height - ballHeight;
    // } else if (ballPosition - ballHeight <= 0) {
    //   ballPosition = 0;
    // } else {
    //   ballPosition = ballPosition - ballHeight / 2;
    // }
    Animated.parallel([
      Animated.timing(this.state.sliderHeight, {
        toValue: sliderHeight,
        easing: Easing.linear,
        duration: animationDuration || 0,
        useNativeDriver: false,
      }),
      Animated.timing(this.state.ballHeight, {
        toValue: ballPosition,
        easing: Easing.linear,
        duration: animationDuration || 0,
        useNativeDriver: false,
      }),
    ]).start();

    this.setState({value});
  };

  componentDidMount() {
    const {value} = this.props;
    if (value) {
      this._changeState(value);
    }
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   if (nextProps.value && nextProps.value !== nextState.value) {
  //     this._changeState(nextProps.value);
  //   }
  //   return false;
  // }

  render() {
    const {
      width = 350,
      height = 30,
      maximumTrackTintColor = 'transparent',
      showBallIndicator = false,
      ballIndicatorWidth = 48,
      ballIndicatorPosition = -60,
    } = this.props;
    const {value} = this.state;
    return (
      <View style={{height, width}}>
        <View
          style={[
            styles.container,
            {
              height,
              width,
              backgroundColor: maximumTrackTintColor,
            },
          ]}
          {...this.state.panResponder.panHandlers}>
          <Animated.View
            style={[
              styles.slider,
              {
                height: this.state.sliderHeight,
                width,
              },
            ]}>
            <View
              style={{
                width,
                top: -10,
              }}>
              <Icons.GraphLine />
            </View>
          </Animated.View>
        </View>
        {showBallIndicator ? (
          <Animated.View
            style={[
              styles.ball,
              {
                bottom: this.state.ballHeight,
                left: ballIndicatorPosition,
                width: ballIndicatorWidth,
              },
            ]}>
            <BlueGradient
              style={[
                styles.ball,
                {
                  width: ballIndicatorWidth,
                },
              ]}>
              <Text style={styles.ballText}>{(value / 100).toFixed(2)}</Text>
            </BlueGradient>
          </Animated.View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  ball: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    height: 30,
    backgroundColor: '#ECECEC',
  },
  ballText: {
    fontFamily: 'TitilliumWeb-SemiBold',
    color: '#ffffff',
  },
  container: {
    overflow: 'hidden',
    // zIndex: 1,
  },
  slider: {
    position: 'absolute',
    bottom: 0,
  },
});
