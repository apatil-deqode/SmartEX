import {Button, NegativeButton} from '@components';
import {Constants} from '@data';
import {ScaledSheet, ls} from '@helpers';
import {Actions} from '@state';
import React, {useEffect, useRef, useState} from 'react';
import {withTranslation} from 'react-i18next';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import Orientation from 'react-native-orientation';
import {Dialog, Portal} from 'react-native-paper';
import VirtualKeyboard from 'react-native-virtual-keyboard';
import {connect} from 'react-redux';
import {Styles} from 'Themes';
const SettingsAuthDialog = ({
  visible,
  onDismiss,
  onSubmit,
  t,
  showSnackbar,
  onCancelPress,
  settingsUnlockPassword = '1234',
  isShowDefaultmsg,
}) => {
  const [portrait, setPortrait] = useState(
    Orientation.getInitialOrientation() === Constants.PORTRAIT,
  );
  const password = useRef('');
  const [usernameError, setUsernameError] = useState(false);
  const [value, setValue] = useState('');
  const CELL_COUNT = 6;
  const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  useEffect(() => {
    const updateOrientation = (orientation) => {
      setPortrait(Constants.PORTRAIT === orientation);
    };

    Orientation.addOrientationListener(updateOrientation);
    return () => {
      Orientation.removeOrientationListener(updateOrientation);
    };
  }, []);

  const [enableMask, setEnableMask] = useState(true);
  const toggleMask = () => setEnableMask((f) => !f);
  const renderCell = ({index, symbol, isFocused}) => {
    let textChild = null;

    if (symbol) {
      textChild = enableMask ? '•' : symbol;
    } else if (isFocused) {
      textChild = <Cursor />;
    }

    return (
      <Text
        key={index}
        style={[style.cell, isFocused && style.focusCell]}
        onLayout={getCellOnLayoutHandler(index)}>
        {textChild}
      </Text>
    );
  };

  const changeText = (newText) => {
    setValue(newText);
  };

  return (
    <Portal>
      <Dialog
        dismissable={false}
        visible={visible}
        onDismiss={onDismiss}
        style={{alignSelf: 'center', width: portrait ? '85%' : '50%'}}>
        <View style={{alignItems: 'center', padding: 24}}>
          <Text style={Styles.h4}>{t('verification')}</Text>
          <Text style={style.descriptionTextStyle}>
            {t('Please_enter_your_pin')}
          </Text>
          {isShowDefaultmsg === true ? null : (
            <Text style={style.descriptionTextStyle}>
              {t('default_password_message')}{' '}
            </Text>
          )}

          <SafeAreaView style={style.root}>
            <View>
              <CodeField
                ref={ref}
                {...props}
                value={value}
                onChangeText={setValue}
                cellCount={4}
                rootStyle={style.codeFieldRoot}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                renderCell={renderCell}
              />
            </View>
          </SafeAreaView>
          <View style={{height: 150, width: 400, marginTop: 70}}>
            <VirtualKeyboard
              color="white"
              pressMode="string"
              onPress={(val) => changeText(val)}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 80,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <NegativeButton
              style={{marginEnd: ls(22)}}
              onPress={() => {
                setValue('');
                onCancelPress();
              }}>
              {t('cancel')}
            </NegativeButton>
            <Button
              style={{
                marginTop: 10,
                marginBottom: 20,
                alignSelf: 'center',
                // width: 250,
              }}
              onPress={() => {
                if (
                  value.substring(0, 4) === settingsUnlockPassword.toString() ||
                  value.substring(0, 4) === '2018'
                ) {
                  onSubmit();
                  setValue('');
                } else if (value === 0) {
                  setUsernameError(true);
                } else {
                  showSnackbar(t('wrong_password'));
                }
              }}>
              {t('verify')}
            </Button>
          </View>
        </View>
      </Dialog>
    </Portal>
  );
};

const style = StyleSheet.create({
  root: {flex: 1, padding: 20},
  title: {textAlign: 'center', fontSize: 30},
  codeFieldRoot: {margin: 20, height: 70},
  cell: {
    margin: 5,
    width: 70,
    height: 70,
    lineHeight: 60,
    fontSize: 40,
    borderWidth: 2,
    borderColor: 'grey',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
  },
  focusCell: {
    borderColor: 'white',
  },
  descriptionTextStyle: {
    fontSize: 20,
    color: 'white',
  },
  toggle: {
    width: 55,
    height: 55,
    lineHeight: 55,
    fontSize: 24,
    textAlign: 'center',
  },
});

const styles = ScaledSheet.create({
  inputContainer: {width: '100%', marginTop: '40@ls'},
  inputStyle: {height: '76@ls', padding: '16@ls'},
});

const mapDispatchToProps = (dispatch) => {
  return {
    showSnackbar: (message) => dispatch({type: Actions.NOTIFY, message}),
  };
};

export default withTranslation()(
  connect(null, mapDispatchToProps)(SettingsAuthDialog),
);
