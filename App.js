import React, {Component} from 'react';
import codePush from 'react-native-code-push';
import {LogBox, NativeModules} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {Provider as PaperProvider} from 'react-native-paper';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {AppTheme} from '@themes';
import {Stores, persistor} from '@state';
import {AppContainer} from '@navigators';
import {initialize} from '@localization';
import Config from 'react-native-config';
const {LockTask} = NativeModules;

class App extends Component {
  constructor(props) {
    super(props);

    LogBox.ignoreAllLogs();
    initialize();

    LockTask.startLockTask();
  }

  render() {
    return (
      <Provider store={Stores}>
        <PersistGate persistor={persistor} loading={null}>
          <PaperProvider theme={AppTheme}>
            <NavigationContainer theme={AppTheme}>
              <AppContainer />
            </NavigationContainer>
          </PaperProvider>
        </PersistGate>
      </Provider>
    );
  }
}

if (!Config.local_ip) {
  const codePushOptions = {
    checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
    installMode: codePush.InstallMode.IMMEDIATE,
  };
  App = codePush(codePushOptions)(App);
}

export default App;
