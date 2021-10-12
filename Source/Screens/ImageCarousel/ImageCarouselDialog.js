import React from 'react';
import {Modal} from 'react-native';
import ImageCarousel from './ImageCarousel';

const ImageCarouselDialog = ({visible, onRequestClose, images, index}) => {
  return (
    <Modal
      transparent
      visible={visible}
      statusBarTranslucent={true}
      onRequestClose={onRequestClose}>
      <ImageCarousel
        images={images}
        index={index}
        goBack={onRequestClose}
        isHome={true}
      />
    </Modal>
  );
};

export default ImageCarouselDialog;
