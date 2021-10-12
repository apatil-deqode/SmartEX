import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Card} from 'react-native-paper';
import {withTranslation} from 'react-i18next';
import {connect} from 'react-redux';
import {Styles, AppTheme} from '@themes';
import Icon from '@icons';
import {vs} from '@helpers';

const RunningFabric = ({
  t,
  fabric,
  rollNumber,
  machineNumber,
  producingNumber,
  progressVisible,
}) => {
  const navigation = useNavigation();
  return (
    <Card elevation={AppTheme.elevation} style={styles.expanded}>
      {fabric ? (
        <TouchableOpacity
          style={styles.container}
          onPress={() => navigation.navigate('fabricDetails', fabric)}>
          <View style={{flex: 0.8}}>
            <View style={styles.fabricNameRow}>
              <Icon.Threads width={vs('40')} height={vs('40')} />
              <Text style={styles.titleMarginBottom} numberOfLines={2}>
                {fabric.name + '  ' + fabric.structure?.name}
              </Text>
            </View>
            <View style={styles.producingContainer}>
              <Icon.RollNumber width={vs('30')} height={vs('30')} />
              <Text
                numberOfLines={1}
                style={
                  producingNumber ? styles.producingNumber : styles.placeholder
                }>
                {producingNumber ? `#${producingNumber}` : t('not_set')}
              </Text>
            </View>
          </View>
          <View style={{...styles.row, flex: 0.3}}>
            <View
              style={{
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flex: 1,
              }}>
              <View style={styles.centerHorizontal}>
                <Icon.Camera width={vs('30')} height={vs('30')} />
                <Text
                  style={styles.titleMarginTop}
                  adjustsFontSizeToFit
                  numberOfLines={1}>
                  {machineNumber}
                </Text>
              </View>
              <View />
              <View style={styles.rollNumber}>
                <Icon.Roll width={vs('30')} height={vs('30')} />
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={
                    producingNumber && rollNumber
                      ? styles.producingNumber
                      : styles.placeholder
                  }>
                  {producingNumber && rollNumber ? rollNumber : t('not_set')}
                </Text>
                {progressVisible ? (
                  <ActivityIndicator color="white" style={styles.progressBar} />
                ) : null}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.noFabric}>
          <Text style={Styles.h5}>{t('no_fabric_selected')}</Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: '100%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flex: 1,
  },
  fabricContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  noFabric: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  center: {
    justifyContent: 'center',
  },
  expanded: {
    flex: 1,
  },
  
  producingNumber: {
    ...Styles.h5,
    color: AppTheme.colors.accent,
    marginLeft: 12,
  },
  placeholder: {
    ...Styles.h5,
    color: AppTheme.colors.placeholder,
    marginLeft: 12,
  },
  titleMarginTop: {
    ...Styles.h5,
    marginTop: 6,
    marginLeft: 12,
  },
  titleMarginBottom: {
    ...Styles.h5,
    marginLeft: 12,
    marginRight: 10,
    flex: 0.99,
  },
  producingNumberTitle: {
    ...Styles.h5,
    marginBottom: 6,
    textAlign: 'center',
  },
  row: {
    // flexDirection: 'row-reverse',
    alignItems: 'flex-end',
  },
  centerHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rollNumber: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    position: 'absolute',
    bottom: 12,
  },
  fabricNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  producingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
});

const mapStateToProps = ({persisted, auth}) => {
  return {
    fabric: persisted.selectedFabric,
    producingNumber: persisted.producingNumber,
    machineNumber: auth.machineNumber,
    rollNumber: auth.rollNumber,
    progressVisible: auth.cutRollUpdating,
  };
};

export default withTranslation()(connect(mapStateToProps)(RunningFabric));
