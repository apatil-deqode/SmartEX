import React from 'react';
import {View, TouchableOpacity, Text, Touchable} from 'react-native';
import {Card} from 'react-native-paper';
import {AppTheme, Styles} from '@themes';
import {withTranslation} from 'react-i18next';
import {ScaledSheet, ls} from '@helpers';
import Icon from '@icons';
import {PurpleGradient} from '@components';
import {Actions, Stores} from '@state';

const FabricItem = ({
  portrait,
  fabric,
  selected,
  onPress,
  onViewDetails,
  t,
}) => {
  const renderFabricItem = () => {
    return (
      <View style={[styles.container, {paddingHorizontal: 10}]}>
        <View style={styles.headers}>
          <Icon.favoriteFillIcon height={20} width={20} />
          <TouchableOpacity
            onPress={() =>
              Stores.dispatch({
                type: Actions.FABRIC_DETAIL_DIALOG,
                data: {isOpenDialog: true, fabricData: fabric},
              })
            }>
            <Icon.moreDetailsIcon height={20} width={20} />
          </TouchableOpacity>
        </View>
        <View>
          <View style={styles.data}>
            <Icon.editIconWhite height={10} width={10} />
            <Text style={[Styles.h5, {left: 8}]}>Jersey Especial 35</Text>
          </View>
          <View style={styles.data}>
            <Icon.hashIcon height={10} width={10} />
            <Text style={[Styles.caption2, {left: 8}]}>Jersey Especial 35</Text>
          </View>
          <View style={styles.data}>
            <Icon.structureIcon height={10} width={10} />
            <Text style={[Styles.caption2, {left: 8}]}>Jersey Especial 35</Text>
          </View>
          <View style={styles.data}>
            <Icon.yarnIcon height={10} width={10} />
            <Text style={[Styles.caption2, {left: 8}]}>Jersey Especial 35</Text>
          </View>
          <View style={styles.data}>
            <Icon.favoriteFillIcon height={10} width={10} />
            <Text style={[Styles.caption2, {left: 8}]}>Jersey Especial 35</Text>
          </View>
          <View style={styles.data}>
            <Icon.rapportIcon height={10} width={10} />
            <Text style={[Styles.caption2, {left: 8}]}>Jersey Especial 35</Text>
          </View>
        </View>
        {/* <Text
            adjustsFontSizeToFit
            minimumFontScale={1}
            numberOfLines={2}
            style={{
              ...styles.title,
              color: selected ? AppTheme.colors.card : 'white',
            }}>
            {fabric.name}
          </Text>
          {selected ? (
            <>
              <View style={{width: '100%', paddingHorizontal: ls(10)}}>
                <View style={styles.row}>
                  <Text style={styles.label}>{t('name')}</Text>
                  <Text style={styles.label} numberOfLines={1}>
                    {fabric.name}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>{t('structure')}</Text>
                  <Text style={styles.label} numberOfLines={1}>
                    {fabric.structure?.name}
                  </Text>
                </View>
              </View>
              <Button
                onPress={onViewDetails}
                color={AppTheme.colors.card}
                mode="contained"
                uppercase={false}
                contentStyle={{padding: ls(6)}}
                labelStyle={Styles.caption}>
                {t('view_details')}
              </Button>
            </>
          ) : null} */}
      </View>
    );
  };

  return (
    <View style={[styles.itemStyle]}>
      <PurpleGradient
        style={[styles.container, {borderRadius: 8, elevation: 8}]}>
        {renderFabricItem()}
      </PurpleGradient>
    </View>
  );
};

const styles = ScaledSheet.create({
  itemStyle: {
    paddingHorizontal: '8@ls',
    aspectRatio: 1.4,
    height: 200,
  },
  container: {
    flex: 1,
  },
  unselectedCard: {
    flex: 1,
    borderColor: AppTheme.colors.background,
    borderWidth: 1,
  },
  selectedCard: {
    flex: 1,
    backgroundColor: AppTheme.colors.accent,
  },
  label: {
    fontFamily: 'TitilliumWeb-SemiBold',
    fontSize: '14@vs',
    color: 'black',
    maxWidth: '70%',
  },
  row: {
    width: '100%',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  title: {
    ...Styles.subtitle1,
    paddingHorizontal: '8@ls',
    textAlign: 'center',
    fontSize: '18@ls',
  },
  headers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
  },
  data: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
});

export default withTranslation()(FabricItem);
