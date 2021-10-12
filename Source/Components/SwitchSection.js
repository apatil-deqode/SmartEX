import {AppTheme, Styles} from '@themes';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Switch from 'react-native-switch-pro';

const textInputProps = {
  maxLength: 3,
  textAlign: 'center',
  keyboardType: 'number-pad',
};
const SwitchSection = ({
  heading,
  vertical,
  horizontal,
  punctual,
  oil,
  horizontalSwitchValue,
  verticalSwitchValue,
  punctualSwitchValue,
  oilSwitchValue,
  onHorSwitchChange,
  onVertSwitchChange,
  punctualSwitchChange,
  oilSwitchChange,
}) => {
  return (
    <View style={styles.mainContainer}>
      <Text style={Styles.subtitle3}> {heading} </Text>
      <View style={styles.innerRowContainer}>
        <Text style={{...Styles.h6, width: 120}}>{horizontal}</Text>
        <Switch
          width={60}
          height={30}
          circleColorActive={'#8D8FFA'}
          circleColorInactive={'#757C91'}
          circleStyle={{
            elevation: 10,
          }}
          backgroundActive={'#7B9EDF'}
          backgroundInactive={'#586075'}
          value={horizontalSwitchValue}
          onSyncPress={(value) => onHorSwitchChange(value)}
          style={{
            elevation: 10,
          }}
        />
      </View>
      <View style={styles.innerRowContainer}>
        <Text style={{...Styles.h6, width: 120}}>{vertical}</Text>
        <Switch
          width={60}
          height={30}
          circleColorActive={'#8D8FFA'}
          circleColorInactive={'#757C91'}
          circleStyle={{
            elevation: 10,
          }}
          backgroundActive={'#7B9EDF'}
          backgroundInactive={'#586075'}
          style={{
            elevation: 10,
          }}
          value={verticalSwitchValue}
          onSyncPress={(value) => onVertSwitchChange(value)}
        />
      </View>

      <View style={styles.innerRowContainer}>
        <Text style={{...Styles.h6, width: 120}}>{punctual}</Text>
        <Switch
          width={60}
          height={30}
          circleColorActive={'#8D8FFA'}
          circleColorInactive={'#757C91'}
          circleStyle={{
            elevation: 10,
          }}
          backgroundActive={'#7B9EDF'}
          backgroundInactive={'#586075'}
          style={{
            elevation: 10,
          }}
          value={punctualSwitchValue}
          onSyncPress={(value) => punctualSwitchChange(value)}
        />
      </View>

      <View style={styles.innerRowContainer}>
        <Text style={{...Styles.h6, width: 120}}>{oil}</Text>
        <Switch
          width={60}
          height={30}
          circleColorActive={'#8D8FFA'}
          circleColorInactive={'#757C91'}
          circleStyle={{
            elevation: 10,
          }}
          backgroundActive={'#7B9EDF'}
          backgroundInactive={'#586075'}
          style={{
            elevation: 10,
          }}
          value={oilSwitchValue}
          onSyncPress={(value) => oilSwitchChange(value)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  h1: {
    ...Styles.h3,
    color: AppTheme.colors.accent,
  },
  subtitle: {
    ...Styles.h4,
    marginTop: 60,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 100,
    paddingBottom: 2,
  },
  mainContainer: {
    marginTop: 10,
    alignItems: 'center',
    backgroundColor: AppTheme.colors.darkGray,
    elevation: 5,
    borderRadius: 8,
    // borderWidth: 2,
    paddingHorizontal: 10,
  },
  innerRowContainer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    ...Styles.h6,
    backgroundColor: AppTheme.colors.input,
    borderRadius: 8,
    marginStart: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    marginEnd: 16,
    width: 70,
  },
});

export default SwitchSection;
