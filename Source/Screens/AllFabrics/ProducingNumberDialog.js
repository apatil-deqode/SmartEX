import React, {PureComponent} from 'react';
import {View, Text, Image, TextInput, TouchableOpacity} from 'react-native';
import {Portal, Dialog, Button as TextButton} from 'react-native-paper';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';

import {Actions} from '@state';
import {Styles, AppTheme} from 'Themes';
import Images from '@images';
import Icon from '@icons';
import {NegativeButton, Button} from '@components';
import {ScaledSheet} from '@helpers';

const ScanQr = ({onPress, t}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.qrContainer}>
        <Image source={Images.qr} />
        <Text style={styles.qrLabel}>{t('scan_code')}</Text>
      </View>
    </TouchableOpacity>
  );
};

class ProducingNumberDialog extends PureComponent {
  constructor(props) {
    super();

    this.input = props.number;
  }

  scanQr = () => {
    this.props.onDismiss();
    //     logAnalytics(Events.SCAN_QR, 'scanning qr...');
    this.props.navigation.navigate('qrScan');
  };

  setInput = (value) => {
    this.input = value;
  };

  updateProductionOrder = async () => {
    //     // logAnalytics(
    //     //   Events.UPDATE_PRODUCING_NUMBER,
    //     //   `updatting producing number to ${producingNumber}`,
    //     // );
    this.props.setProducingNumber(this.input);
    this.props.onDismiss();
  };

  render() {
    const {visible, onDismiss, name, number, t} = this.props;
    return (
      <Portal>
        <Dialog style={styles.dialog} visible={visible} onDismiss={onDismiss}>
          <View style={styles.rootContainer}>
            <View style={styles.row}>
              <View style={styles.fabricNameContainer}>
                <TextButton
                  color="white"
                  uppercase={false}
                  onPress={onDismiss}
                  labelStyle={Styles.h5}
                  icon={(size, color) => (
                    <Icon.Back size={size} color={color} />
                  )}>
                  {t('back')}
                </TextButton>
                <Text style={styles.fabricName} numberOfLines={2}>
                  {name}
                </Text>
                <Text style={styles.label}>{t('producing_number')}</Text>
              </View>
              <ScanQr t={t} onPress={this.scanQr} />
            </View>
            <View style={styles.inputContainer}>
              <Icon.Hash />
              <TextInput
                style={styles.input}
                onChangeText={this.setInput}
                defaultValue={number}
              />
            </View>
            <View style={styles.buttonsContainer}>
              <NegativeButton style={styles.negativeButton} onPress={onDismiss}>
                {t('cancel')}
              </NegativeButton>
              <Button onPress={this.updateProductionOrder}>{t('save')}</Button>
            </View>
          </View>
        </Dialog>
      </Portal>
    );
  }
}

// const ProducingNumberDialog = ({
//   name,
//   visible,
//   onDismiss,
//   number,
//   setProducingNumber,
//   t,
//   showSnackbar,
// }) => {
//   const [input, setInput] = useState(number);
//   const [portrait, setPortrait] = useState(
//     Orientation.getInitialOrientation() === Constants.PORTRAIT,
//   );

//   useEffect(() => {
//     const updateOrientation = (orientation) => {
//       setPortrait(Constants.PORTRAIT === orientation);
//     };

//     Orientation.addOrientationListener(updateOrientation);
//     return () => {
//       Orientation.removeOrientationListener(updateOrientation);
//     };
//   }, []);

//   const updateProductionOrder = useCallback(() => {
//     RabbitMQService.instance.updateProductionOrder(input);
//     // logAnalytics(
//     //   Events.UPDATE_PRODUCING_NUMBER,
//     //   `updatting producing number to ${producingNumber}`,
//     // );
//     setProducingNumber(input);
//     onDismiss();
//   }, [input, onDismiss, setProducingNumber]);

//   const navigation = useNavigation();

//   const scanQr = useCallback(() => {
//     onDismiss();
//     logAnalytics(Events.SCAN_QR, 'scanning qr...');
//     navigation.navigate('qrScan');
//   }, [navigation, onDismiss]);

//   useEffect(() => {
//     setInput(number);
//     RabbitMQService.instance.setPOUpdateCallback(
//       (isSuccess, producingNumber) => {
//         if (isSuccess) {
//         } else {
//           showSnackbar(t('update_po_error'));
//         }
//       },
//     );
//   }, [number, onDismiss, setProducingNumber, showSnackbar, t]);
// };

const styles = ScaledSheet.create({
  row: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  dialog: {
    alignSelf: 'center',
    width: '50%',
  },
  qrLabel: {
    ...Styles.h6,
    color: 'white',
    marginTop: '24@ls',
  },
  rootContainer: {
    paddingVertical: '36@ls',
    paddingEnd: '36@ls',
    paddingStart: '18@ls',
  },
  fabricName: {
    ...Styles.subtitle1,
    marginStart: '18@ls',
  },
  label: {
    ...Styles.subtitle2,
    marginStart: '18@ls',
    top: '8@ls',
  },
  fabricNameContainer: {
    maxWidth: '60%',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  qrContainer: {
    elevation: AppTheme.elevation,
    borderRadius: 5,
    paddingVertical: '20@ls',
    paddingHorizontal: '40@ls',
    backgroundColor: AppTheme.colors.input,
    alignItems: 'center',
  },
  input: {
    ...Styles.h2,
    paddingHorizontal: '16@ls',
    color: 'white',
    flex: 1,
    height: '100%',
  },
  inputContainer: {
    overflow: 'hidden',
    alignItems: 'center',
    paddingStart: '24@ls',
    flexDirection: 'row',
    marginTop: '24@ls',
    marginStart: '18@ls',
    height: '81@ls',
    borderRadius: 5,
    backgroundColor: AppTheme.colors.input,
    elevation: AppTheme.elevation,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: '36@ls',
    paddingBottom: '2@ls',
  },
  negativeButton: {
    marginEnd: '22@ls',
  },
});

const mapStateToProps = ({persisted}) => {
  return {
    number: persisted.producingNumber,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setProducingNumber: (number) =>
      dispatch({type: Actions.SET_PRODUCING_NUMBER, data: number}),
    showSnackbar: (message) => dispatch({type: Actions.NOTIFY, message}),
  };
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(ProducingNumberDialog),
);
