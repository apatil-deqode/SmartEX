import React, {useState, useEffect} from 'react';
import {View, Text} from 'react-native';
import {Dialog, Portal} from 'react-native-paper';
import {withTranslation} from 'react-i18next';
import Orientation from 'react-native-orientation';
import {InputField, Button} from '@components';
import {Constants} from '@data';
import {ScaledSheet} from '@helpers';
import {Styles} from 'Themes';

const RegisterDialog = ({visible, onDismiss, onSubmit, t}) => {
  const [portrait, setPortrait] = useState(
    Orientation.getInitialOrientation() === Constants.PORTRAIT,
  );
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState(false);

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
          <Text style={Styles.h4}>{t('register_device')}</Text>
          <InputField
            label={t('username')}
            returnKeyType="done"
            autoCorrect={false}
            style={styles.inputContainer}
            inputStyle={styles.inputStyle}
            value={username}
            error={usernameError}
            onChangeText={(newValue) => {
              setUsername(newValue);
              setUsernameError(false);
            }}
          />
          <Button
            style={{marginTop: 40, alignSelf: 'flex-end'}}
            onPress={() => {
              if (username.length > 0) {
                onSubmit(username);
              } else {
                setUsernameError(true);
              }
            }}>
            {t('register')}
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

export default withTranslation()(RegisterDialog);
