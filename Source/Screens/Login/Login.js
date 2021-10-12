import {Button, InputField} from '@components';
import {Events, logAnalytics, ls, ScaledSheet, setUserId} from '@helpers';
import Images from '@images';
import {SmartexService} from '@services';
import {Actions} from '@state';
import {AppTheme, Styles} from '@themes';
import React, {Component, createRef} from 'react';
import {withTranslation} from 'react-i18next';
import {Image, View} from 'react-native';
import {Card} from 'react-native-paper';
import {connect} from 'react-redux';

class Login extends Component {
  passowrdRef = createRef();

  state = {
    username: null,
    password: null,
    loading: false,
    usernameError: false,
    passwordError: false,
    errorMessage: null,
  };

  login = async () => {
    const update = {};
    const {username, password} = this.state;
    if (!username) {
      update.usernameError = true;
    }

    if (!password) {
      update.passwordError = true;
    }

    if (Object.keys(update).length > 0) {
      this.setState(update);
      return;
    }

    logAnalytics(
      Events.MANUAL_LOGIN,
      `Logging in with ${username}/${password}`,
    );

    this.setState({loading: true});
    const result = await SmartexService.login(username, password);
    if (result.error) {
      this.props.showSnackbar(result.error.message);
      this.setState({loading: false});
    } else {
      this.props.setLoginCredentials({username, password});
      const {access_token, refresh_token} = result.data;
      this.props.setTokens(access_token, refresh_token);
      setUserId(username);
      this.props.route.params.onLoginSuccess();
      this.props.navigation.pop();
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
              label={t('username')}
              returnKeyType="next"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.inputContainer}
              inputStyle={styles.inputStyle}
              value={this.state.username}
              error={this.state.usernameError}
              onChangeText={(newValue) =>
                this.setState({username: newValue, usernameError: false})
              }
              onSubmitEditing={() => this.passowrdRef.current?.focus()}
            />
            <InputField
              forwardRef={this.passowrdRef}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              label={t('password')}
              style={{...styles.inputContainer, marginTop: ls(16)}}
              inputStyle={styles.inputStyle}
              value={this.state.password}
              error={this.state.passwordError}
              onChangeText={(newValue) =>
                this.setState({password: newValue, passwordError: false})
              }
            />
          </View>
          <Button
            mode="contained"
            uppercase={false}
            contentStyle={styles.button}
            loading={this.state.loading}
            disabled={this.state.loading}
            labelStyle={Styles.h1}
            onPress={this.login}>
            {t('login')}
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
    width: '360@ls',
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

export default withTranslation()(connect(null, mapDispatchToProps)(Login));
