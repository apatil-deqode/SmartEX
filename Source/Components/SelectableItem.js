import React from 'react';
import {Text} from 'react-native';
import {Card} from 'react-native-paper';
import {AppTheme, Styles} from '@themes';
import {ScaledSheet} from '@helpers';

const SelectableItem = ({selected, label, onPress, style}) => {
  return (
    <Card
      onPress={onPress}
      elevation={AppTheme.elevation}
      style={{
        ...styles.container,
        backgroundColor: selected
          ? AppTheme.colors.accent
          : AppTheme.colors.input,
        ...style,
      }}>
      <Text
        style={{
          ...styles.text,
          color: selected ? AppTheme.colors.card : 'white',
        }}>
        {label}
      </Text>
    </Card>
  );
};

const styles = ScaledSheet.create({
  text: {
    ...Styles.h5,
    width: '100%',
    height: '100%',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  container: {
    borderRadius: 5,
    height: '35@ls',
    flex: 1,
  },
});

export default SelectableItem;
