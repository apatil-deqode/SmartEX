import React, {memo, useCallback} from 'react';
import {StyleSheet, Pressable, View, Image, Text} from 'react-native';
// import Image from 'react-native-fast-image';
import {Constants} from '@data';
import Icon from '@icons';
import {defectLavel} from 'Helpers/CheckDefect';
import {withTranslation} from 'react-i18next';

const Batch = ({images, navigate, t}) => {
  const onPressCallback = useCallback(
    (index) => {
      if (images[index].defect) {
        // let imagesFiltered = images
        //   .filter((image) => image.defect)
        //   .map((image) => ({
        //     thumbnail: image.thumbnail,
        //     defect: image.defect,
        //     timestamp: image.timestamp.getTime(),
        //     frames: JSON.parse(image.frames),
        //     score: image.score,
        //     thresholds: image.thresholds,
        //   }));
        let filteredImages = [];
        let newIndex = index;
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          if (i === index) {
            newIndex = filteredImages.length;
          }
          if (image.defect) {
            filteredImages.push({
              thumbnail: image.thumbnail,
              defect: image.defect,
              defectLevel: image.defectLevel,
              timestamp: image.timestamp.getTime(),
              frames: JSON.parse(image.frames),
              score: image.score,
              thresholds: image.thresholds,
            });
          }
        }
        // Note: Commented because its large request
        navigate('carousel', {images: filteredImages, index: newIndex});
      }
    },
    [images, navigate],
  );

  const getIconForDefect = (defectType) => {
    if (defectType === defectLavel.red) {
      return (
        <View style={styles.errorContainer}>
          <Icon.Error />
        </View>
      );
    }
    if (defectType === defectLavel.gray) {
      return (
        <View style={styles.errorContainer}>
          <Icon.ErrorGrey />
        </View>
      );
    }
    return null;
  };

  return Array.isArray(images) ? (
    images.map((image, index) => {
      return (
        <Pressable
          key={index}
          style={styles.image}
          onPress={() => onPressCallback(index)}>
          <Image
            style={StyleSheet.absoluteFill}
            source={{uri: Constants.BASE64_PREFIX + image.thumbnail}}
          />
          <View style={styles.errorContainer}>
            {getIconForDefect(image.defectLevel)}
          </View>
        </Pressable>
      );
    })
  ) : (
    <View style={styles.missingImagesContainer}>
      <Text style={styles.missingImagesText}>{t('error_loading_batch')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: 'black',
    width: '12.5%',
    height: '100%',
  },
  errorContainer: {
    position: 'absolute',
    bottom: 8,
    end: 8,
  },
  missingImagesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  missingImagesText: {
    color: 'white',
    fontSize: 25,
  },
});

export default withTranslation()(memo(Batch));
