import React, {useState, useEffect, useRef} from 'react';
import {connect} from 'react-redux';
import {AppTheme} from '@themes';
import {createStackNavigator} from '@react-navigation/stack';
import AppDrawerNavigators from './AppDrawerNavigators';
import {
  Start,
  QrScanner,
  RecentLiveFeed,
  ImageCarousel,
  AllFabrics,
  AddFabricScreen,
  FabricDetails,
} from '@screens';
import DeviceBattery from 'react-native-device-battery';
import {CoreServiceAPIService} from 'Services';
import {logger} from 'Helpers';

const Stack = createStackNavigator();

const MainStackNavigator = ({stoppage_state}) => {
  const [batteryLevel, setBatteryLevel] = useState(-1);
  const stateRef = useRef();
  stateRef.current = batteryLevel; // stateRef will always have a reference to the current batteryLevel

  const onBatteryStateChanged = async (batteryState) => {
    // Send battery level to Core
    let roundedBatteryLevel = Math.round(batteryState.level * 100);

    // CHECK IF BATTERY LEVEL IS DIFFERENT FROM THE PREVIOUS
    if (roundedBatteryLevel == stateRef.current) return;

    // Make CoreService API Call to update battery level
    const coreServiceAPIService = new CoreServiceAPIService();
    const status = await coreServiceAPIService.sendTabletBatteryLevel(
      roundedBatteryLevel,
    );

    if (status) {
      setBatteryLevel(roundedBatteryLevel);
      logger.info(`[System] Battery level changed to: ${roundedBatteryLevel}`);
    }
  };

  useEffect(() => {
    DeviceBattery.addListener(onBatteryStateChanged);

    return () => {
      DeviceBattery.removeListener(onBatteryStateChanged);
    };
  }, []);

  return (
    <Stack.Navigator headerMode="none" initialRouteName="main">
      {stoppage_state ? (
        <Stack.Screen name="main" component={AppDrawerNavigators} />
      ) : (
        <>
          <Stack.Screen
            name="start"
            component={Start}
            options={{
              animationTypeForReplace: stoppage_state ? 'push' : 'pop',
            }}
          />
          <Stack.Screen name="allFabrics" component={AllFabrics} />
          <Stack.Screen name="addFabric" component={AddFabricScreen} />
          <Stack.Screen name="fabricDetails" component={FabricDetails} />
        </>
      )}
      <Stack.Screen name="qrScan" component={QrScanner} />
      <Stack.Screen
        name="recentLiveFeed"
        component={RecentLiveFeed}
        options={() => ({
          cardStyleInterpolator: ({current: {progress}}) => {
            return {
              cardStyle: {
                opacity: progress,
              },
            };
          },
        })}
      />
      <Stack.Screen
        name="carousel"
        component={ImageCarousel}
        options={{
          cardStyle: {
            backgroundColor: AppTheme.colors.backdrop,
          },
          cardStyleInterpolator: ({current: {progress}}) => {
            return {
              cardStyle: {
                opacity: progress,
              },
            };
          },
        }}
      />
    </Stack.Navigator>
  );
};

const mapStateToProps = (state) => {
  return {
    stoppage_state: state.persisted.settings.stoppage_state,
  };
};

export default connect(mapStateToProps)(MainStackNavigator);
