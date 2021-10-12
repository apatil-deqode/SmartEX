import React from 'react';
import Fonts from '@fonts';
import {AppTheme, Styles} from '@themes';
import Icon from '@icons';
import {View, Text, TextInput} from 'react-native';
import {withTranslation} from 'react-i18next';
import {ScaledSheet, ls} from '@helpers';

const InputField = ({
  forwardRef,
  style,
  label,
  inputStyle,
  error,
  t,
  copilot,
  ...rest
}) => {
  return (
    <View style={style} {...copilot}>
      <Text style={Styles.subtitle2}>{label}</Text>
      <TextInput
        ref={forwardRef}
        style={[styles.input, inputStyle]}
        {...rest}
      />
      {error ? (
        <View style={{flexDirection: 'row', marginTop: ls(5)}}>
          <Icon.Error />
          <Text style={styles.error}>{label + ' ' + t('required_field')}</Text>
        </View>
      ) : (
        <View style={{height: ls(30)}} />
      )}
    </View>
  );
};

const styles = ScaledSheet.create({
  input: {
    ...Styles.body1,
    backgroundColor: AppTheme.colors.input,
    borderRadius: 5,
    padding: '11@ls',
    marginTop: '8@ls',
  },
  error: {
    fontSize: '17@ls',
    marginStart: '8@ls',
    fontFamily: Fonts.semiBold,
    color: '#F03A3A',
  },
});

export default withTranslation()(InputField);
