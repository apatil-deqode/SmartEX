import React from 'react';
import {TouchableOpacity, View, Image, StyleSheet} from 'react-native';
import Images from '@images';
import {AppTheme} from 'Themes';
import {vs} from '@helpers';
import {AppBackground} from '@components';

const SwitchOffButton = ({style, onPress, copilot}) => {
  return (
    <AppBackground style={{...style, ...styles.button}}>
      <TouchableOpacity style={{...style}} onPress={onPress} {...copilot}>
        <View style={styles.button}>
          <Image
            resizeMode={'contain'}
            style={{width: vs('35'), height: vs('35')}}
            source={Images.power}
          />
        </View>
      </TouchableOpacity>
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: AppTheme.colors.error,
  },
});

export default SwitchOffButton;
