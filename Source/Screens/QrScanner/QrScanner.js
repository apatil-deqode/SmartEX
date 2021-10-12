import React, {PureComponent} from 'react';
import {Text, View, StyleSheet, Image, TouchableHighlight} from 'react-native';
import {connect} from 'react-redux';
import {Button as TextButton} from 'react-native-paper';
import {RNCamera} from 'react-native-camera';
import {withTranslation} from 'react-i18next';

import {Actions} from '@state';
import {AppTheme, Styles} from '@themes';
import Icon from '@icons';
import Images from '@images';

const AvailableCameras = Object.freeze({
  front: 'front',
  back: 'back',
});

class QrScanner extends PureComponent {
  shouldReadQr = true;

  constructor(props) {
    super(props);
    this.state = {
      activeCamera: AvailableCameras.front,
    };
  }

  onBarCodeRead = async (e) => {
    if (this.shouldReadQr) {
      this.shouldReadQr = false;
      // logAnalytics(
      //   Events.QR_READ,
      //   `updatting producing number to ${producingNumber}`,
      // );
      this.props.setProducingNumber(e.data);
      this.props.navigation.pop();
    }
  };

  switchCamera = () => {
    if (this.state.activeCamera === AvailableCameras.front) {
      this.setState({
        activeCamera: AvailableCameras.back,
      });
    } else {
      this.setState({
        activeCamera: AvailableCameras.front,
      });
    }
  };

  render() {
    const {t} = this.props;
    return (
      <View style={styles.flex}>
        <RNCamera
          type={this.state.activeCamera}
          captureAudio={false}
          style={styles.flex}
          onBarCodeRead={this.onBarCodeRead}
        />
        <View style={styles.overlay}>
          <View style={styles.leftColumnOverlay}>
            <TextButton
              color="white"
              uppercase={false}
              onPress={() => this.props.navigation.pop()}
              labelStyle={Styles.h5}
              icon={(size, color) => <Icon.Cross size={size} color={color} />}>
              {t('cancel')}
            </TextButton>
          </View>
          <View>
            <View style={styles.centerColumnOverlay}>
              <Text style={styles.title}>{t('scan_code_here')}</Text>
            </View>
            <View style={styles.qr} />
            <View style={styles.overlayFilled} />
          </View>
          <View style={styles.overlayFilled} />
          <TouchableHighlight
            underlayColor="transparent"
            onPress={this.switchCamera}
            style={styles.cameraButton}>
            <Image source={Images.switchCamera} style={styles.cameraImage} />
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
  },
  cameraImage: {
    width: 80,
    height: 60,
  },
  cameraButton: {
    position: 'absolute',
    right: 16,
    top: 30,
  },
  overlayFilled: {
    flex: 1,
    backgroundColor: AppTheme.colors.overlay,
  },
  title: {
    ...Styles.subtitle1,
    alignSelf: 'center',
  },
  leftColumnOverlay: {
    flex: 1,
    backgroundColor: AppTheme.colors.overlay,
    alignItems: 'flex-start',
    paddingStart: 16,
    paddingTop: 30,
    flexDirection: 'row',
  },
  centerColumnOverlay: {
    flex: 1,
    backgroundColor: AppTheme.colors.overlay,
    justifyContent: 'center',
  },
  qr: {
    width: '40%',
    aspectRatio: 0.4,
  },
  flex: {flex: 1},
});

const mapDispatchToProps = (dispatch) => {
  return {
    setProducingNumber: (number) =>
      dispatch({type: Actions.SET_PRODUCING_NUMBER, data: number}),
    showSnackbar: (message) => dispatch({type: Actions.NOTIFY, message}),
  };
};

export default withTranslation()(connect(null, mapDispatchToProps)(QrScanner));
