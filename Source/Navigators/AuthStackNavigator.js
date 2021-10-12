import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {Splash, Login} from '@screens';
import Deactivated from 'Screens/Splash/Deactivated';

const Stack = createStackNavigator();

const AuthStackNavigator = () => {
  return (
    <Stack.Navigator headerMode="none">
      <Stack.Screen name="splash" component={Splash} />
      <Stack.Screen name="login" component={Login} />
      <Stack.Screen name="deactivated" component={Deactivated} />
    </Stack.Navigator>
  );
};

export default AuthStackNavigator;
