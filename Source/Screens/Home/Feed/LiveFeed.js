import React, {Component} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {Card} from 'react-native-paper';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import Animated, {Easing, timing, Value} from 'react-native-reanimated';
import {withTranslation} from 'react-i18next';
import {AppTheme, Styles} from '@themes';
import Batch from './Batch';

const height = Dimensions.get('screen').height;
const LIVE_FEED_HEIGHT = height * 0.285;
const ANIMATION_TIME = 8000; //in ms
class LiveFeed extends Component {
  constructor(props) {
    super();

    const feed = props.liveFeed?.feed;

    this.state = {
      recentFeed: feed ?? [],
      oldFeed: [],
    };
    this.translate = new Value(feed ? 0 : -LIVE_FEED_HEIGHT);
    this.isFirstFeed = feed ? false : true;
  }

  centimetersToMeter = (valueInCentimeters) => {
    const NUMBER_OF_CENTIMERERS_IN_METER = 100.0;
    return valueInCentimeters / NUMBER_OF_CENTIMERERS_IN_METER;
  };

  componentDidUpdate(prevProps) {
    if (this.props.liveFeed !== null) {
      if (
        prevProps.liveFeed !== this.props.liveFeed &&
        this.props.liveFeed.feed
        // && !this.isBlur This variable is not referenced anywhere else. What is it for?
      ) {
        this.animateNewFeed(this.props.liveFeed);
      }
    } else {
      if (this.state.oldFeed.length !== 0) {
        this.setState({oldFeed: [], recentFeed: []});
      }
    }
  }

  animateNewFeed = (feed) => {
    this.setState(
      (prevState) => ({
        oldFeed: prevState.recentFeed,
        recentFeed: feed.feed,
      }),
      () => {
        if (this.isFirstFeed) {
          this.translate.setValue(0);
          this.isFirstFeed = false;
        } else {
          this.translate.setValue(-LIVE_FEED_HEIGHT);
          timing(this.translate, {
            toValue: 0,
            duration: ANIMATION_TIME,
            easing: Easing.linear,
          }).start();
        }
      },
    );
  };

  render() {
    const {recentFeed, oldFeed} = this.state;
    const {t, rollLength, navigation} = this.props;
    return (
      <Animated.View>
        {oldFeed.length > 0 ? ( // Only shows the animation when there is a recent and an old feed
          <Card elevation={AppTheme.elevation} style={styles.card}>
            <Animated.View
              style={[
                styles.batch,
                {transform: [{translateY: this.translate}]}, // translateY < 0 -> UP
              ]}>
              <Batch images={recentFeed} navigate={navigation.navigate} />
            </Animated.View>
            <Animated.View
              style={[
                styles.batch,
                {transform: [{translateY: this.translate}]},
              ]}>
              {oldFeed.length > 0 ? (
                <Batch images={oldFeed} navigate={navigation.navigate} />
              ) : (
                <Text style={styles.emptyText}>{t('live_camera_feed')}</Text>
              )}
            </Animated.View>
            <Text style={styles.rollLength}>
              {this.centimetersToMeter(rollLength)} m
            </Text>
          </Card>
        ) : recentFeed.length > 0 ? (
          // Render still Image
          <View style={styles.batch}>
            <Batch images={recentFeed} navigate={navigation.navigate} />
          </View>
        ) : (
          <Animated.View style={styles.batch}>
            <Text style={styles.emptyText}>{t('live_camera_feed')}</Text>
            <Text style={styles.rollLength}>0 m</Text>
          </Animated.View>
        )}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    height: LIVE_FEED_HEIGHT,
    overflow: 'hidden',
  },
  batch: {
    width: '100%',
    flexDirection: 'row',
    height: LIVE_FEED_HEIGHT,
    justifyContent: 'center',
  },
  emptyText: {
    ...Styles.h5,
    alignSelf: 'center',
  },
  rollLength: {
    ...Styles.h6,
    position: 'absolute',
    end: 6,
    bottom: 0,
    color: AppTheme.colors.placeholder,
  },
});

const rotationSelector = (state) => state.liveFeed.liveFeed?.rotation;
const cmPerRotationSelector = (state) => state.persisted.settings.cmPerRotation;
const rollLengthSelector = createSelector(
  rotationSelector,
  cmPerRotationSelector,
  (rotation, cmPerRotation) => {
    if (!rotation || !cmPerRotation) {
      return null;
    } else {
      return parseInt(rotation * cmPerRotation, 0);
    }
  },
);

const mapStateToProps = (state) => {
  return {
    liveFeed: state.liveFeed.liveFeed,
    rollLength: rollLengthSelector(state),
  };
};

export default withTranslation()(connect(mapStateToProps)(LiveFeed));
