import React from 'react';
import {Text, View} from 'react-native';
import DropDownPicker from './DropDownPicker';
import {AppTheme, Styles} from '@themes';
import {withTranslation} from 'react-i18next';
import Icon from '@icons';
import {ScaledSheet, ls} from '@helpers';

const FormPicker = ({label, showError, style, t, ...rest}) => {
  return (
    <View style={style}>
      <Text style={Styles.subtitle2}>{label}</Text>
      <DropDownPicker
        arrowSize={ls(38)}
        arrowColor="#FFF"
        dropDownMaxHeight={ls(180)}
        placeholder={t('select')}
        placeholderStyle={styles.placeHolder}
        dropDownStyle={styles.dropDown}
        itemStyle={styles.dropDownItem}
        labelStyle={styles.dropDownLabel}
        containerStyle={{marginTop: ls(8), height: ls(55)}}
        style={styles.dropDownField}
        {...rest}
      />
      {showError ? (
        <View style={styles.errorContainer}>
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
  placeHolder: {
    ...Styles.body1,
    color: AppTheme.colors.placeholder,
  },
  dropDown: {
    elevation: 4,
    backgroundColor: AppTheme.colors.card,
    borderColor: AppTheme.colors.card,
  },
  dropDownItem: {
    justifyContent: 'flex-start',
    paddingStart: '16@ls',
    paddingVertical: '11@ls',
  },
  dropDownField: {
    backgroundColor: AppTheme.colors.input,
    borderColor: AppTheme.colors.input,
    borderRadius: 5,
    paddingHorizontal: '16@ls',
  },
  dropDownLabel: {
    color: '#FFF',
    fontSize: '22@ls',
    fontFamily: Fonts.regular,
  },
  error: {
    fontSize: '17@ls',
    marginStart: '8@ls',
    fontFamily: Fonts.semiBold,
    color: '#F03A3A',
  },
  errorContainer: {flexDirection: 'row', marginTop: '5@ls'},
});

export default withTranslation()(FormPicker);
