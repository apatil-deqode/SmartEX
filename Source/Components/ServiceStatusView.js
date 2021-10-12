import {ScaledSheet} from '@helpers';
import Images from '@images';
import {AppTheme, Styles} from '@themes';
import React, {useCallback} from 'react';
import {ActivityIndicator, Image, Text, View} from 'react-native';

const viewStyle = (bool) => ({
  color: bool ? AppTheme.colors.green : AppTheme.colors.red,
});

const ServiceStatusView = ({t, status}) => {
  const getStatusText = useCallback(
    (on, connected, isPingMissing) => {
      return (
        <Text style={Styles.h5}>
          <Text style={viewStyle(on)}>
            {isPingMissing ? t('unknown') : on ? t('on') : t('off')}
          </Text>
          {' | '}
          <Text style={viewStyle(connected)}>
            {isPingMissing
              ? t('unknown')
              : connected
              ? t('connected')
              : t('disconnected')}
          </Text>
        </Text>
      );
    },
    [t],
  );

  return (
    <View style={styles.container}>
      <ActivityIndicator size={60} color={AppTheme.colors.accent} />
      <Text style={styles.title}>{t('smartex_subsystems_unavailable')}</Text>
      <Text style={styles.subtitle}>{t('waiting_for_reconnection')}</Text>
      <View style={styles.table}>
        <View style={styles.row}>
          <View>
            <Image source={Images.core} style={styles.icon} />
            <Image source={Images.machine} style={styles.icon} />
            <Image source={Images.sensing} style={styles.icon} />
            <Image source={Images.core} style={styles.icon} />
          </View>
          <View style={styles.titles}>
            <Text style={Styles.h5}>{t('core_service')}</Text>
            <Text style={Styles.h5}>{t('machine_service')}</Text>
            <Text style={Styles.h5}>{t('sensing_service')}</Text>
            <Text style={Styles.h5}>{t('ml_service')}</Text>
          </View>
        </View>
        <View style={styles.core}>
          <Text style={Styles.h5}>
            <Text style={viewStyle(status?.isCoreOn)}>
              {status?.isPingMissing
                ? t('unknown')
                : status?.isCoreOn
                ? t('on')
                : t('off')}
            </Text>
            {' | '}
            <Text style={viewStyle(status?.isCoreConnected)}>
              {status?.isCoreConnected ? t('connected') : t('disconnected')}
            </Text>
          </Text>
          {getStatusText(
            status?.isMachineOn,
            status?.isMachineConnected,
            status?.isPingMissing,
          )}
          {getStatusText(
            status?.isSensingOn,
            status?.isSensingConnected,
            status?.isPingMissing,
          )}
          {getStatusText(
            status?.isMlOn,
            status?.isMlConnected,
            status?.isPingMissing,
          )}
        </View>
      </View>
    </View>
  );
};

const styles = ScaledSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '30@ls',
    paddingHorizontal: '50@ls',
  },
  title: {
    ...Styles.subtitle1,
    marginTop: '16@vs',
  },
  icon: {
    marginVertical: 8,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
  },
  subtitle: {
    ...Styles.h5,
    marginTop: '8@ls',
    marginHorizontal: '30@ls',
  },
  table: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '30@ls',
    marginHorizontal: '30@ls',
  },
  core: {
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  titles: {
    justifyContent: 'space-around',
    marginStart: 16,
  },
});

export default ServiceStatusView;
