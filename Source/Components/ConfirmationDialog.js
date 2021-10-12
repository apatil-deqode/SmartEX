import React from 'react';
import {Text} from 'react-native-paper';
import {View, StyleSheet} from 'react-native';
import {AppTheme, Styles} from '@themes';
import {withTranslation} from 'react-i18next';
import Button from './Button';
import NegativeButton from './NegativeButton';

const ConfirmationDialog = ({
  title,
  subtitle,
  textPositive,
  textNegative,
  onPressPositive,
  onPressNegative,
  t,
}) => {
  return (
    <View style={{alignItems: 'center', paddingVertical: 40}}>
      <Text style={styles.h1}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.buttonsContainer}>
        <NegativeButton style={{marginEnd: 22}} onPress={onPressNegative}>
          {textNegative ? textNegative : t('cancel')}
        </NegativeButton>
        <Button onPress={onPressPositive}>
          {textPositive ? textPositive : t('confirm')}
        </Button>
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
});

export default withTranslation()(ConfirmationDialog);
