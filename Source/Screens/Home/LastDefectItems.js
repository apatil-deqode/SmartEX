import React, {memo, useCallback} from 'react';
import {FlatList, TouchableOpacity, Image} from 'react-native';
// import FastImage from 'react-native-fast-image';
import {ScaledSheet} from '@helpers';
import {Constants} from '@data';
import withObservables from '@nozbe/with-observables';
import {Q} from '@nozbe/watermelondb';
import {withTranslation} from 'react-i18next';
import {defectLavel} from 'Helpers/CheckDefect';

const LastDefectItems = ({defects, navigate, t, itemHeight}) => {
  const showCarousel = useCallback(
    (index) => {
      let images = defects.map((defect) => ({
        defect: defect.defect,
        defectLevel: defect.defectLevel,
        timestamp: defect.timestamp.getTime(),
        frames: JSON.parse(defect.frames),
        score: defect.score,
        thresholds: defect.thresholds,
      }));
      navigate('carousel', {
        images,
        index,
      });
    },
    [defects, navigate],
  );

  // useCallback is being used for performance purposes
  const renderItem = useCallback(
    ({item, index}) => {
      const uri = Constants.BASE64_PREFIX + item.thumbnail;
      return (
        <TouchableOpacity
          onPress={showCarousel.bind(this, index)}
          style={styles.defectItem}>
          <Image source={{uri}} style={styles.defectImage} />
        </TouchableOpacity>
      );
    },
    [itemHeight, showCarousel],
  );

  return (
    <FlatList
      extraData={itemHeight}
      data={defects}
      numColumns={3}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.flatListContainer}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
    />
  );
};

const styles = ScaledSheet.create({
  flatListContainer: {
    marginHorizontal: '3@vs',
    marginTop: '8@vs',
    borderRadius: 8,
    flex: 1,
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
  },
  defectImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
  defectItem: {
    width: '33.33%',
  },
});

const enhance = withObservables([], ({database}) => ({
  defects: database
    .get('images')
    .query(
      Q.where('defect', Q.notEq(null)),
      Q.and(
        Q.where('defectLevel', Q.notEq(defectLavel.gray)),
        Q.where('defectLevel', Q.notEq(defectLavel.noDefect)),
      ),
      Q.experimentalSortBy('timestamp', Q.desc),
      Q.experimentalTake(3),
    ),
}));

export default withTranslation()(enhance(memo(LastDefectItems)));
