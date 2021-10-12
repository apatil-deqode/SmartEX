import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import Fonts from '@fonts';
import {ScaledSheet} from '@helpers';

const DrawerItem = ({
  icon,
  isDisabled = false,
  title,
  onPress,
  style,
  copilot,
  ...textProps
}) => {
  return (
    <TouchableOpacity
      onPress={onPress ? onPress : null}
      disabled={isDisabled}
      style={{...style}}
      {...copilot}>
      <View style={styles.container}>
        <Image source={icon} resizeMode={'contain'} style={styles.icon} />
        <Text adjustsFontSizeToFit style={styles.title} {...textProps}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = ScaledSheet.create({
  icon: {
    width: '35@vs',
    height: '35@vs',
    marginBottom: '8@vs',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    textAlign: 'center',
    color: 'white',
    fontSize: '12@vs',
    paddingHorizontal: '6@ls',
    fontFamily: Fonts.semiBold,
  },
});

export default DrawerItem;
