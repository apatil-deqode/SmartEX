import {Button, InputField} from '@components';
import {Constants} from '@data';
import {ScaledSheet} from '@helpers';
import {Actions} from '@state';
import React, {useEffect, useState, useRef} from 'react';
import {withTranslation} from 'react-i18next';
import {Text, View} from 'react-native';
import Orientation from 'react-native-orientation';
import {Dialog, Portal} from 'react-native-paper';
import {connect} from 'react-redux';
import {Styles} from 'Themes';

const UnlockDialog = ({visible, onDismiss, onSubmit, t, showSnackbar}) => {
  const [portrait, setPortrait] = useState(
    Orientation.getInitialOrientation() === Constants.PORTRAIT,
  );
  const password = useRef('');
  const [usernameError, setUsernameError] = useState(false);
  const unlockPassword = 'lycralycra';
  useEffect(() => {
    const updateOrientation = (orientation) => {
      setPortrait(Constants.PORTRAIT === orientation);
    };

    Orientation.addOrientationListener(updateOrientation);
    return () => {
      Orientation.removeOrientationListener(updateOrientation);
    };
  }, []);

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={{alignSelf: 'center', width: portrait ? '85%' : '50%'}}>
        <View style={{alignItems: 'flex-start', padding: 24}}>
          <Text style={Styles.h4}>{t('UnlockDevice')}</Text>
          <InputField
            label={t('password')}
            returnKeyType="done"
            autoCorrect={false}
            style={styles.inputContainer}
            inputStyle={styles.inputStyle}
            error={usernameError}
            onChangeText={(newValue) => {
              password.current = newValue;
              if (usernameError) {
                setUsernameError(false);
              }
            }}
          />
          <Button
            style={{marginTop: 40, alignSelf: 'flex-end'}}
            onPress={() => {
              if (password.current === unlockPassword) {
                onSubmit();
              } else if (password.current.length === 0) {
                setUsernameError(true);
              } else {
                showSnackbar(t('wrong_password'));
              }
            }}>
            {t('done')}
          </Button>
        </View>
      </Dialog>
    </Portal>
  );
};

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
  connect(null, mapDispatchToProps)(UnlockDialog),
);
