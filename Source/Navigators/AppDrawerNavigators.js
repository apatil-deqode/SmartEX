import React from 'react';
import {StyleSheet} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import HomeStackNavigator from './HomeStackNavigator';
import {Help, Settings, SideBar} from '@screens';
import {CopilotStyle} from '@themes';
import {copilot} from 'react-native-copilot-fullscreen';

const Drawer = createDrawerNavigator();

const AppDrawerNavigators = ({start, copilotEvents: {on}}) => {
  return (
    <>
      <Drawer.Navigator
        drawerStyle={styles.drawerStyle}
        drawerType="permanent"
        backBehavior="initialRoute"
        drawerContent={(props) => <SideBar {...props} />}>
        <Drawer.Screen
          name="HomeStack"
          component={HomeStackNavigator}
          initialParams={{startIntro: start, onCopilotEvent: on}}
        />
        <Drawer.Screen
          name="Help"
          component={Help}
          options={{
            unmountOnBlur: true,
          }}
        />
        <Drawer.Screen
          name="Settings"
          component={Settings}
          options={{
            unmountOnBlur: true,
          }}
        />
      </Drawer.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  drawerStyle: {
    width: 71,
    borderTopEndRadius: 15,
    borderBottomEndRadius: 15,
  },
});

export default copilot(CopilotStyle)(AppDrawerNavigators);
