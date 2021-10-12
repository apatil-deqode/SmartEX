import React, {memo, useCallback} from 'react';
import {StyleSheet, Pressable, View, Image} from 'react-native';
// import Image from 'react-native-fast-image';
import {Constants} from '@data';
import DefectErrorIcon from '../../../Components/DefectErrorIcon';
import {Stores} from '@state';
import Icon from '@icons';

const Batch = ({images, navigate}) => {
  const onPressCallback = useCallback(
    (index) => {
      navigate('carousel', {images, index, isHome: true});
    },
    [images, navigate],
  );

  const showWarningBorder = (index) => {
    const {
      verticalSwitchValue,
      horizontalSwitchValue,
      punctualSwitchValue,
      oilSwitchValue,
    } = Stores.getState().persisted.settings.cameraDefectSettings[index];

    if (
      verticalSwitchValue === false ||
      horizontalSwitchValue === false ||
      punctualSwitchValue === false ||
      oilSwitchValue === false
    ) {
      return true;
    }
    return false;
  };

  return images.map((image, index) => (
    <Pressable
      key={index}
      style={[styles.image]}
      onPress={onPressCallback.bind(this, index)}>
      <Image
        resizeMode="stretch"
        style={StyleSheet.absoluteFill}
        source={{uri: Constants.BASE64_PREFIX + image.thumbnail}}
      />
      {showWarningBorder(index) ? (
        <View style={styles.warninigContainer}>
          <Icon.warninigEye />
        </View>
      ) : null}

      <View style={styles.errorContainer}>
        <DefectErrorIcon
          image={image}
          settings={
            Stores.getState().persisted.settings.cameraDefectSettings[index]
          }
        />
      </View>
    </Pressable>
  ));
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: 'black',
    width: '12.5%',
    height: '100%',
  },
  warninigBorder: {
    borderColor: '#FF8C00',
    borderWidth: 2,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 8,
    end: 8,
  },
  warninigContainer: {
    position: 'absolute',
    bottom: 8,
    start: 8,
  },
});

export default memo(Batch);
