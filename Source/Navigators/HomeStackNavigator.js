import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {
  AddFabricScreen,
  AllFabrics,
  DefectedFabrics,
  Home,
  FabricDetails,
  ChangePassword,
} from '@screens';

const Stack = createStackNavigator();

const HomeStackNavigator = ({route}) => {
  return (
    <Stack.Navigator headerMode="none">
      <Stack.Screen name="home" component={Home} initialParams={route.params} />
      <Stack.Screen name="allFabrics" component={AllFabrics} />
      <Stack.Screen name="addFabric" component={AddFabricScreen} />
      <Stack.Screen name="fabricDetails" component={FabricDetails} />
      <Stack.Screen name="defectedFabrics" component={DefectedFabrics} />
      <Stack.Screen name="changePassword" component={ChangePassword} />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
