import React from 'react';
import {Text, View} from 'react-native';
import {TouchableRipple} from 'react-native-paper';
import {AppTheme, Styles} from '@themes';
import {ScaledSheet} from '@helpers';

const NegativeButton = ({
  children,
  onPress,
  labelStyle,
  contentStyle,
  style,
}) => {
  return (
    <TouchableRipple
      borderless={true}
      onPress={onPress}
      style={{
        borderRadius: AppTheme.roundness,
        elevation: AppTheme.elevation,
        ...style,
      }}>
      <View style={[styles.button, contentStyle]}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{...Styles.h3, color: '#FFF', ...labelStyle}}>
          {children}
        </Text>
      </View>
    </TouchableRipple>
  );
};

const styles = ScaledSheet.create({
  button: {
    height: '85@ls',
    minWidth: '170@ls',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: AppTheme.roundness,
    borderColor: AppTheme.colors.darkGray,
    borderWidth: 1,
    backgroundColor: AppTheme.colors.darkGray,
    paddingHorizontal: '16@ls',
  },
});

export default NegativeButton;
