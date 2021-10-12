import React, {Component} from 'react';
import {View, Pressable, Dimensions, FlatList} from 'react-native';
import {Provider} from 'react-native-paper';
import {AppTheme} from '@themes';
import Icon from '@icons';
import {ls, ScaledSheet, irTopFrame} from '@helpers';
import ImageCarouselItem from './ImageCarouselItem';
import {Actions, Stores} from '@state';

const window = Dimensions.get('screen');
const itemWidth = window.width * 0.815;
const itemHeight = window.height * 0.8;

export const Change = {
  pos: 'pos',
  type: 'type',
};

class ImageCarousel extends Component {
  constructor(props) {
    super();
    this.ref = null;
    const images = props.images ?? props.route.params.images;
    const index = props.index ?? props.route.params.index;
    const isHome = props.isHome
      ? props.isHome
      : props.route.params.isHome
      ? props.route.params.isHome
      : false;
    const initialFrames = images[index].frames;
    const initalFrame = initialFrames.find(irTopFrame) ?? initialFrames[0];
    this.state = {
      initialIndex: index,
      index: index,
      feed: images,
      type: initalFrame.type,
      pos: initalFrame.pos,
      changed: null,
      isHome: isHome,
    };
  }
  componentDidMount() {
    if (this.state.isHome === true) {
      Stores.dispatch({type: Actions.IS_FROM_SETTING, data: true});
    }
  }
  onTypeChanged = (type) => this.setState({type, changed: Change.type});
  onPositionChanged = (pos) => this.setState({pos, changed: Change.pos});

  static getDerivedStateFromProps(props, state) {
    const {feed, index, type, pos, changed} = state;

    if (!feed[index].frames.find((f) => f.type === type && f.pos === pos)) {
      let frame;
      if (changed === Change.pos) {
        frame = feed[index].frames.find((f) => f.pos === pos);
      } else {
        frame = feed[index].frames.find((f) => f.type === type);
      }
      if (!frame) {
        frame = feed[index].frames[0];
      }
      return {
        type: frame.type,
        pos: frame.pos,
      };
    }
    return null;
  }

  /**
   *
   * @param {*} item feed that is being sent on FlatList on 'data' prop
   * @param {*} idx
   * @returns
   */
  renderItem = (item, idx) => {
    const {index, pos, type, isHome, feed, initialIndex} = this.state;
    const {goBack} = this.props.navigation ?? this.props;
    const data = initialIndex !== null ? feed[initialIndex] : item.item;
    return (
      <ImageCarouselItem
        key={initialIndex !== null ? initialIndex : data.index}
        pos={pos}
        type={type}
        camera={data}
        goBack={goBack}
        isHome={isHome}
        index={index}
        onTypeChanged={this.onTypeChanged}
        onPositionChanged={this.onPositionChanged}
      />
    );
  };

  onViewableItemsChanged = ({viewableItems, changed}) => {
    const {initialIndex} = this.state;
    if (initialIndex !== null) {
      this.ref.scrollToIndex({index: initialIndex, animated: false});
      this.setState({index: initialIndex, initialIndex: null});
    } else {
      if (viewableItems.length !== 0) {
        const obj = viewableItems[0];
        const inx = obj.index;
        this.setState({index: inx});
      }
    }
  };

  render() {
    const {feed, index} = this.state;
    const {goBack} = this.props.navigation ?? this.props;
    return (
      <Provider>
        <View style={styles.root}>
          <Pressable style={styles.overlay} onPress={goBack}>
            {this.renderBackButton(index)}
          </Pressable>
          <View style={styles.container}>
            <Pressable style={styles.horizontalOverlay} onPress={goBack} />
            <View style={styles.popup}>
              <FlatList
                ref={(r) => (this.ref = r)}
                data={feed}
                renderItem={this.renderItem}
                horizontal={true}
                pagingEnabled={true}
                onViewableItemsChanged={this.onViewableItemsChanged}
                viewabilityConfig={{
                  itemVisiblePercentThreshold: 50,
                }}
                nestedScrollEnabled={true}
              />
            </View>
            <Pressable style={styles.horizontalOverlay} onPress={goBack} />
          </View>
          <Pressable style={styles.overlay} onPress={goBack}>
            {this.renderNextButton(index !== feed.length - 1)}
          </Pressable>
        </View>
      </Provider>
    );
  }

  onPageChanged = (index) => this.setState({index});

  onPressBackButton = () => {
    const {index} = this.state;
    this.setState({index: index - 1});
    this.ref.scrollToIndex({index: index - 1});
  };

  renderBackButton = (visible) => {
    return visible ? (
      <Pressable style={styles.button} onPress={this.onPressBackButton}>
        <Icon.Previous width={ls(86)} height={ls(86)} />
      </Pressable>
    ) : (
      <View style={styles.buttonPlaceholder} />
    );
  };

  onPressNextButton = () => {
    const {index} = this.state;
    this.setState({index: index + 1});
    this.ref.scrollToIndex({index: index + 1});
  };

  renderNextButton = (visible) => {
    return visible ? (
      <Pressable style={styles.button} onPress={this.onPressNextButton}>
        <Icon.Next width={ls(86)} height={ls(86)} />
      </Pressable>
    ) : (
      <View style={styles.buttonPlaceholder} />
    );
  };
}

const styles = ScaledSheet.create({
  root: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    height: '100%',
  },
  overlay: {
    width: '10%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalOverlay: {
    height: '5%',
  },
  popup: {
    // width: '100%',
    width: itemWidth,
    height: '90%',
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.roundness,
    overflow: 'hidden',
  },
  image: {
    height: itemHeight,
    width: itemWidth,
    backgroundColor: 'black',
  },

  button: {
    marginHorizontal: '16@ls',
  },
  buttonPlaceholder: {
    width: '118@ls',
  },
});

export default ImageCarousel;
