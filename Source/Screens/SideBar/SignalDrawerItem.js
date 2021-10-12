import React, {Component} from 'react';
import NetInfo from '@react-native-community/netinfo';
import {withTranslation} from 'react-i18next';
import Images from '@images';
import {DrawerItem} from '@components';
class SignalDrawerItem extends Component {
  constructor(props) {
    super();

    this.state = {
      textKey: 'strong_signal',
      signalTypeIcon: Images.excellentSignal,
    };
  }

  componentDidMount() {
    this.unsubscribe = NetInfo.addEventListener((state) => {
      this.setSignalValue(state);
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  setSignalValue = (state) => {
    let strengthText = 'strong_signal';
    let strengthIcon = Images.excellentSignal;

    const strength = state.details.strength;
    if (strength) {
      switch (true) {
        case strength < 25:
          strengthText = 'week_signal';
          strengthIcon = Images.weakSignal;
          break;
        case strength >= 25 && strength < 50:
          strengthText = 'average_signal';
          strengthIcon = Images.averageSignal;
          break;
        case strength >= 50 && strength < 75:
          strengthText = 'strong_signal';
          strengthIcon = Images.goodSignal;
          break;
        default:
          strengthText = 'strong_signal';
          strengthIcon = Images.excellentSignal;
      }
    } else if (!state.isConnected || !state.isInternetReachable) {
      strengthText = 'no_signal';
      strengthIcon = Images.weakSignal;
    }

    this.setState({
      textKey: strengthText,
      signalTypeIcon: strengthIcon,
    });
  };

  render() {
    const {textKey, signalTypeIcon} = this.state;
    const {t} = this.props;
    return (
      <DrawerItem title={t(textKey)} icon={signalTypeIcon} style={{flex: 1}} />
    );
  }
}

export default withTranslation()(SignalDrawerItem);
