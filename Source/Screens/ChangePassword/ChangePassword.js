import {Button, InputField} from '@components';
import {ls, ScaledSheet} from '@helpers';
import Images from '@images';
import {Actions} from '@state';
import {AppTheme, Styles} from '@themes';
import React, {Component, createRef} from 'react';
import {withTranslation} from 'react-i18next';
import {Image, View} from 'react-native';
import {Card} from 'react-native-paper';
import {connect} from 'react-redux';

class ChangePassword extends Component {
  passowrdRef = createRef();

  state = {
    confirmPassword: null,
    password: null,
    loading: false,
    confirmPasswordError: false,
    passwordError: false,
    errorMessage: null,
  };

  checkPasswordIsNumericOnly = (passwordValue) => {
    const value = parseInt(passwordValue, 10);
    if (!value) {
      return false;
    }
    return true;
  };

  passwordsMatch = (passwordValue, confirmPasswordValue) => {
    return passwordValue === confirmPasswordValue;
  };

  changePassword = async () => {
    const {t} = this.props;
    const update = {};
    const {confirmPassword = '', password = ''} = this.state;

    if (!password) {
      update.passwordError = true;
    }

    if (!confirmPassword) {
      update.confirmPasswordError = true;
    }

    if (password.length !== 4) {
      this.props.showSnackbar(t('invalid_password'));
      return;
    }

    if (!this.passwordsMatch(password, confirmPassword)) {
      this.props.showSnackbar(t('passwords_mismatch'));
      return;
    }
    if (
      this.checkPasswordIsNumericOnly(password) &&
      this.checkPasswordIsNumericOnly(confirmPassword)
    ) {
      this.props.showSnackbar(t('password_update_success'));
      this.props.updatePassword(this.state.confirmPassword);
      if (this.props.onSuccess) {
        this.props.onSuccess();
      }
    } else {
      this.props.showSnackbar(t('invalid_password'));
    }
  };

  render() {
    const {t} = this.props;
    return (
      <Card style={Styles.rootCard} elevation={AppTheme.elevation}>
        <View style={styles.container}>
          <Image
            resizeMode="contain"
            source={Images.logo}
            style={styles.image}
          />
          <View style={{alignItems: 'center', width: '100%'}}>
            <InputField
              label={t('password')}
              returnKeyType="next"
              autoCapitalize="none"
              secureTextEntry
              autoCorrect={false}
              maxLength={4}
              keyboardType="numeric"
              style={styles.inputContainer}
              inputStyle={styles.inputStyle}
              error={this.state.confirmPasswordError}
              onChangeText={(newValue) =>
                this.setState({
                  confirmPassword: newValue,
                  confirmPasswordError: false,
                })
              }
              onSubmitEditing={() => this.passowrdRef.current?.focus()}
            />
            <InputField
              forwardRef={this.passowrdRef}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={4}
              keyboardType="numeric"
              label={t('confirm_password')}
              style={{...styles.inputContainer, marginTop: ls(16)}}
              inputStyle={styles.inputStyle}
              error={this.state.passwordError}
              onChangeText={(newValue) =>
                this.setState({
                  password: newValue,
                  passwordError: false,
                })
              }
            />
          </View>
          <Button
            mode="contained"
            uppercase={false}
            contentStyle={{...styles.button}}
            loading={this.state.loading}
            disabled={this.state.loading}
            labelStyle={Styles.h1}
            onPress={this.changePassword}>
            {t('confirm')}
          </Button>
        </View>
      </Card>
    );
  }
}

const styles = ScaledSheet.create({
  image: {
    width: '80%',
    maxWidth: 738,
    maxHeight: '17%',
  },
  button: {
    width: '440@ls',
    height: '120@ls',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  inputContainer: {width: '80%', maxWidth: '738@ls'},
  inputStyle: {height: '76@ls', padding: '16@ls'},
});

const mapDispatchToProps = (dispatch) => {
  return {
    showSnackbar: (message) => dispatch({type: Actions.NOTIFY, message}),
    updatePassword: (password) =>
      dispatch({
        type: Actions.UPDATE_SETTINGS_UNLOCK_PASSWORD,
        payload: {password},
      }),
    showSnackbar: (message) => dispatch({type: Actions.NOTIFY, message}),
    setTokens: (auth, refresh) =>
      dispatch({
        type: Actions.SET_TOKEN,
        payload: {auth, refresh},
      }),
    setLoginCredentials: (credentials) =>
      dispatch({type: Actions.SET_LOGIN_CREDENTIALS, payload: credentials}),

    setDeviceInfo: (info) =>
      dispatch({type: Actions.SET_DEVICE_INFO, data: info}),
  };
};

export default withTranslation()(
  connect(null, mapDispatchToProps)(ChangePassword),
);
