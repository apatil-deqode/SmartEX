import {Styles} from '@themes';
import React, {Component} from 'react';
import {withTranslation} from 'react-i18next';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  InteractionManager,
  ActivityIndicator,
} from 'react-native';
import {PanGestureHandler, State} from 'react-native-gesture-handler';
import Animated, {timing, Easing, Value} from 'react-native-reanimated';
import {AppTheme} from '@themes';
import {vs} from '@helpers';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import HistoryBatch from './HistoryBatch';
import {Card, TouchableRipple} from 'react-native-paper';
import Icon from '@icons';
import {ls} from '@helpers';
class RecentLiveFeed extends Component {
  constructor(props) {
    super();

    this.translateY = new Value(0);
    this.navigated = false;
    this.state = {
      isReady: false,
    };
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.setState({isReady: true});
    });
  }

  onGestureEvent = ({nativeEvent}) => {
    if (nativeEvent.translationY >= 0 || nativeEvent.numberOfPointers > 1) {
      return;
    }

    if (nativeEvent.translationY < -100 && !this.navigated) {
      this.navigated = true;
      this.props.navigation.goBack();
    }

    this.translateY.setValue(nativeEvent.translationY);
  };

  onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      this.navigated = false;

      timing(this.translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.linear,
      }).start();
    }
  };

  render() {
    const {isReady} = this.state;
    const {feeds, t} = this.props;

    return (
      <PanGestureHandler
        onGestureEvent={this.onGestureEvent}
        onHandlerStateChange={this.onHandlerStateChange}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              transform: [{translateY: this.translateY}],
            },
          ]}>
          <View style={styles.root}>
            {isReady ? (
              <View style={styles.card}>
                <View style={styles.header}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <TouchableRipple
                      borderless
                      style={styles.back}
                      onPress={() => this.props.navigation.goBack()}>
                      <Icon.Back
                        width={ls(30)}
                        height={ls(30)}
                        style={{top: ls(4)}}
                      />
                    </TouchableRipple>
                    <Text style={Styles.subtitle1}>{t('all_defects')}</Text>
                  </View>
                </View>
                <Card elevation={AppTheme.elevation} style={styles.card}>
                  <View style={styles.headerStyle}>
                    <Text style={styles.headerTime}>{t('hour')}</Text>
                    <Text style={styles.cameraHeading}>{t('cam_1')}</Text>
                    <Text style={styles.cameraHeading}>{t('cam_2')}</Text>
                    <Text style={styles.cameraHeading}>{t('cam_3')}</Text>
                    <Text style={styles.cameraHeading}>{t('cam_4')}</Text>
                    <Text style={styles.cameraHeading}>{t('cam_5')}</Text>
                    <Text style={styles.cameraHeading}>{t('cam_6')}</Text>
                    <Text style={styles.cameraHeading}>{t('cam_7')}</Text>
                    <Text style={styles.cameraHeading}>{t('cam_8')}</Text>
                    <Text style={styles.time}>{t('rotation')}</Text>
                    <Text style={styles.rpm}>{t('rpm')}</Text>
                  </View>
                  <FlatList
                    data={feeds}
                    contentContainerStyle={styles.flatListContainer}
                    keyExtractor={(item) => item.feed[0].timestamp.toString()}
                    renderItem={this.renderItem}
                  />
                </Card>
              </View>
            ) : (
              <ActivityIndicator color={AppTheme.colors.accent} size={vs(60)} />
            )}
          </View>
        </Animated.View>
      </PanGestureHandler>
    );
  }

  renderItem = ({item}) => (
    <HistoryBatch batch={item} navigate={this.props.navigation.navigate} />
  );
}

const styles = StyleSheet.create({
  back: {
    padding: 15,
    marginEnd: 30,
    borderRadius: AppTheme.roundness,
  },
  headerTime: {
    ...Styles.h6,
    width: 125,
    textAlign: 'center',
  },
  headerStyle: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: AppTheme.colors.darkGray,
    borderRadius: 8,
    elevation: 8,
  },
  root: {
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 15,
  },
  container: {
    flex: 1,
  },
  flatListContainer: {
    paddingVertical: 20,
    backgroundColor: '#30343F',
  },
  rowExpanded: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  rpm: {
    ...Styles.h6,
    width: 60,
    textAlign: 'center',
  },
  time: {
    ...Styles.h6,
    width: 120,
    textAlign: 'center',
  },
  cameraHeading: {
    ...Styles.h6,
    width: '9.4%',
    textAlign: 'center',
  },
  card: {
    margin: 15,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

const liveFeedSelector = (state) => state.liveFeed.liveFeed;
const historySelector = (state) => state.liveFeed.history;
const feedsSelector = createSelector(
  liveFeedSelector,
  historySelector,
  (feed, history) => {
    if (feed) {
      return [feed, ...history];
    } else {
      return [];
    }
  },
);

const mapStateToProps = (state) => ({
  feeds: feedsSelector(state),
});

export default withTranslation()(connect(mapStateToProps)(RecentLiveFeed));
