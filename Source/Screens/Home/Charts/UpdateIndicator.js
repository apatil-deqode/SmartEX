import React, {memo} from 'react';
import {StyleSheet, Text} from 'react-native';
import {AppTheme} from '@themes';
import {withTranslation} from 'react-i18next';
import {connect} from 'react-redux';

const UpdateIndicator = ({t, visible}) => {
  return visible ? <Text style={styles.indicator}>{t('updating')}</Text> : null;
};

const styles = StyleSheet.create({
  indicator: {
    backgroundColor: AppTheme.colors.background,
    color: 'white',
    padding: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
});

const mapStateToProps = (state) => {
  return {
    visible: state.auth.settingsUpdating,
  };
};

export default withTranslation()(
  connect(mapStateToProps)(memo(UpdateIndicator)),
);
