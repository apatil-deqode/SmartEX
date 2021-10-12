import React, {PureComponent} from 'react';
import {Dimensions, View, StyleSheet, Image, Text} from 'react-native';
import CarouselHeader from './CarouselHeader';
import {PinchImageView} from '@components';
import RNFetchBlob from 'rn-fetch-blob';
import {Constants} from '@data';

// import ImageViewer from 'react-native-image-zoom-viewer';

const {fs} = RNFetchBlob;

const window = Dimensions.get('screen');
const itemWidth = window.width * 0.815;

class ImageCarouselItem extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      uriExists: true,
    };

    const {camera, pos, type} = this.props;

    this.uri;
    let found = camera.frames.find((f) => f.type === type && f.pos === pos);
    if (found) {
      this.uri = found.frame;
    } else {
      this.uri = camera.frames[0].frame;
    }

    fs.exists(this.uri)
      .then((exist) => {
        // console.log('exist: ', exist);
        if (!exist) {
          this.setState({uriExists: false});
        }
      })
      .catch();
  }

  render() {
    const {
      camera,
      goBack,
      pos,
      type,
      onTypeChanged,
      onPositionChanged,
      isHome,
      index,
    } = this.props;

    // const images = [{url: uri}];

    return (
      <View style={styles.item}>
        <CarouselHeader
          goBack={goBack}
          camera={camera}
          pos={pos}
          type={type}
          isHome={isHome}
          index={index}
          onTypeChanged={onTypeChanged}
          onPositionChanged={onPositionChanged}
          isThumbnailImage={!this.state.uriExists}
        />
        {/* <ImageViewer
          renderIndicator={(cIndex) => <View />}
          saveToLocalByLongPress={false}
          imageUrls={images}
        /> */}

        {this.state.uriExists ? (
          <PinchImageView source={{uri: this.uri}} style={styles.pinch} />
        ) : (
          <Image
            source={{uri: Constants.BASE64_PREFIX + camera.thumbnail}}
            style={styles.pinch}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  item: {
    height: '100%',
    width: itemWidth,
    backgroundColor: 'black',
    color: 'white',
  },
  pinch: {
    flex: 1,
    width: '100%',
  },
});

export default ImageCarouselItem;
