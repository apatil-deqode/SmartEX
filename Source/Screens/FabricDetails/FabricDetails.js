import React, {useState, useEffect} from 'react';
import {View, Text} from 'react-native';
import {Card} from 'react-native-paper';
import Orientation from 'react-native-orientation';
import {Button, CustomScrollview} from '@components';
import {Constants} from '@data';
import {ScaledSheet, ls} from '@helpers';
import {AppTheme, Styles} from '@themes';
import {withTranslation} from 'react-i18next';
import YarnListItem from '../AddFabric/YarnListItem';

const FabricDetails = ({route, navigation, t}) => {
  const [portrait, setPortrait] = useState(
    Orientation.getInitialOrientation() === Constants.PORTRAIT,
  );
  const [wholeHeight, setWholeHeight] = useState(1);
  const [visibleHeight, setVisibleHeight] = useState(0);

  useEffect(() => {
    const updateOrientation = (orientation) => {
      setPortrait(Constants.PORTRAIT === orientation);
    };

    Orientation.addOrientationListener(updateOrientation);
    return () => {
      Orientation.removeOrientationListener(updateOrientation);
    };
  }, []);

  const fabric = route.params;
  let yarns = fabric.yarns.map((yarn) => ({
    type: {
      label: yarn.yarnType?.name,
    },
    color: {
      label: yarn.color?.name,
    },
    unit: {
      label: yarn.densityUnit?.name,
    },
    density: yarn.density,
    multiplier: yarn.multiplier,
  }));

  return (
    <Card elevation={AppTheme.elevation} style={styles.card}>
      <Text style={Styles.subtitle1}>{t('fabric_details')}</Text>
      <View style={styles.fabricDetails}>
        <View style={{flex: 1}}>
          <Text style={Styles.subtitle2}>{t('fabric_name')}</Text>
          <Text style={{...Styles.h5, marginTop: ls(12)}}>{fabric.name}</Text>
        </View>
        <View style={{flex: 1}}>
          <Text style={Styles.subtitle2}>{t('fabric_structure')}</Text>
          <Text style={{...Styles.h5, marginTop: ls(12)}}>
            {fabric.structure.name}
          </Text>
        </View>
      </View>
      <Text style={{...Styles.subtitle1, marginTop: ls(32)}}>
        {t('yarns_list')}
      </Text>
      <View style={styles.divider} />
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{t('type')}</Text>
        <Text style={styles.label}>{t('color')}</Text>
        <Text style={styles.label}>{t('density')}</Text>
        <Text style={styles.label}>{t('units')}</Text>
        <Text style={styles.label}>{t('multiplier')}</Text>
        <View style={{width: portrait ? 0 : ls(230)}}></View>
      </View>
      <CustomScrollview
        visibleHeight={visibleHeight}
        wholeHeight={wholeHeight}
        updateVisibleHeight={(height) => setVisibleHeight(height)}
        updateWholeHeight={(height) => setWholeHeight(height)}
        listSize={yarns.length}
        persistentScrollbar
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollView}>
        {yarns.map((yarn, index) => {
          return <YarnListItem key={index} item={yarn} portrait={portrait} />;
        })}
      </CustomScrollview>
      <Button
        onPress={() => navigation.pop()}
        style={{alignSelf: 'flex-end', marginVertical: ls(24)}}>
        {t('done')}
      </Button>
    </Card>
  );
};

const styles = ScaledSheet.create({
  scrollView: {
    flexGrow: 1,
  },
  card: {
    flex: 1,
    margin: '15@ls',
    paddingHorizontal: '25@ls',
    paddingVertical: '16@ls',
  },
  fabricDetails: {
    flexDirection: 'row',
    marginTop: '20@ls',
  },
  divider: {
    marginVertical: '16@ls',
    height: 1,
    backgroundColor: '#32343C',
  },
  label: {
    ...Styles.subtitle2,
    fontSize: '24@ls',
    flex: 1,
  },
  labelContainer: {
    flexDirection: 'row',
    paddingTop: '8@ls',
    paddingBottom: '8@ls',
  },
});

export default withTranslation()(FabricDetails);
