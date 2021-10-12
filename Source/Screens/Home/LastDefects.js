import React, {Component} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import {Card} from 'react-native-paper';
import {withTranslation} from 'react-i18next';
import {Styles, AppTheme} from '@themes';
import Icon from '@icons';
import Images from '@images';
import moment from 'moment/min/moment-with-locales';
import i18n from 'i18next';
import {connect} from 'react-redux';
import {vs, ScaledSheet} from '@helpers';
import DbHelper from '@db';
import LastDefectsItems from './LastDefectItems';
import Animated, {
  interpolateColors,
  Easing,
  timing,
  Value,
} from 'react-native-reanimated';

const configIn = {
  toValue: 100,
  duration: 1000,
  easing: Easing.linear,
};
const configOut = {
  toValue: 0,
  duration: 1000,
  easing: Easing.linear,
};

class LastDefects extends Component {
  constructor(props) {
    super();
    this.state = {
      loading: false,
      lastUpdateTimestamp: Date.now(),
      shrinked: false,
      itemHeight: vs(120),
    };
    this.color = new Value(props.defectAlert ? 100 : 0);
    this.interval = null;
  }

  componentDidMount() {
    moment.locale(i18n.language);
    this.interval = setInterval(() => {
      if (Date.now() - this.state.lastUpdateTimestamp > 56000) {
        //trigger state change to update moment.fromNow() values
        this.setState({lastUpdateTimestamp: Date.now()});
      }
    }, 60000);
  }

  componentDidUpdate(prevProps) {
    moment.locale(i18n.language);

    if (this.props.defectAlert !== prevProps.defectAlert) {
      (this.props.defectAlert
        ? timing(this.color, configIn)
        : timing(this.color, configOut)
      ).start();
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.shrinked !== state.shrinked) {
      return {
        shrinked: props.shrinked,
        itemHeight: props.shrinked ? vs(96) : vs(120),
      };
    }
    return null;
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  render() {
    const {
      t,
      lastDefectTimestamp,
      currentRollDefectCount,
      currentRollDefectCountH,
      currentRollDefectCountV,
      currentRollDefectCountP,
      currentRollDefectCountO,
    } = this.props;
    const {itemHeight} = this.state;
    return (
      <Card elevation={AppTheme.elevation} style={styles.rootCard}>
        <View style={styles.rootCard}>
          <Animated.View
            style={[
              styles.rootContainer,
              {
                borderColor: interpolateColors(this.color, {
                  inputRange: [0, 100],
                  outputColorRange: [AppTheme.colors.card, 'yellow'],
                }),
              },
            ]}>
            <View style={styles.container}>
              <Text style={{...Styles.subtitle1, fontSize: 18}}>
                {t('last_defective')}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '80%',
                  height: '100%',
                }}>
                <View
                  style={{
                    width: '45%',
                    height: '60%',
                    alignItems: 'center',
                  }}>
                  {currentRollDefectCount > 0 ? (
                    <View
                      style={{
                        flex: 1,
                      }}>
                      <View
                        style={{
                          flex: 1,
                        }}>
                        <LastDefectsItems
                          // itemHeight={itemHeight}
                          navigate={this.props.navigate}
                          database={DbHelper.database}
                        />
                      </View>
                      <TouchableOpacity
                        style={{
                          width: 20,
                          height: 20,
                          alignSelf: 'flex-end',
                          right: 5,
                          position: 'absolute',
                        }}
                        onPress={() =>
                          this.props.navigate('defectedFabrics', {
                            lastDefectTimestamp,
                            currentRollDefectCount,
                          })
                        }>
                        <Icon.warningIcon />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.emptyListContainer}>
                      <Text style={Styles.h5}>{t('no_defects')}</Text>
                    </View>
                  )}
                  <Text style={{...Styles.h6, fontSize: 15}}>
                    {currentRollDefectCount ?? 0}
                  </Text>
                  <Text
                    style={{
                      ...Styles.h6,
                      fontSize: 15,
                    }}>
                    {t('occurrences_current_roll')}
                  </Text>
                </View>
                <View
                  style={{
                    width: 2,
                  }}>
                  <Text
                    style={{
                      width: 2,
                      backgroundColor: 'gray',
                      height: '60%',
                    }}
                  />
                </View>
                <View style={{width: '45%', height: '60%'}}>
                  <Image
                    style={{
                      marginTop: 10,
                      width: '45%',
                      height: '45%',
                    }}
                    resizeMode="contain"
                    source={Images.clock}
                  />
                  <Text
                    style={{
                      ...Styles.h6,
                      fontSize: 15,
                    }}>
                    {lastDefectTimestamp
                      ? moment(lastDefectTimestamp).fromNow()
                      : ''}
                  </Text>
                </View>
              </View>
              {/* {currentRollDefectCount > 0 ? (
              <>
                <TouchableOpacity
                  style={styles.viewAll}
                  onPress={() =>
                    this.props.navigate('defectedFabrics', {
                      lastDefectTimestamp,
                      currentRollDefectCount,
                    })
                  }>
                  <View style={styles.viewOccurennces}>
                    <Icon.Eye
                      width={vs('50')}
                      height={vs('50')}
                      style={{marginEnd: vs('10')}}
                    />
                    <Text style={Styles.body2}>{t('view_all')}</Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : null} */}
            </View>

            {/* {currentRollDefectCount > 0 ? (
            <View style={[styles.occurrencesContainer]}> */}
            {/* <View style={styles.divider} /> */}
            {/* <Text style={{...Styles.h6, fontSize: 30}}>
                {currentRollDefectCount ?? 0}
              </Text>
              <Text style={{...Styles.h6, fontSize: 14}}>
                {t('occurrences_current_roll')}
              </Text> */}
            {/* <View style={{alignItems: 'center'}}>
                <Text style={{...Styles.h6, fontSize: 11}}>
                  {t('horizontal')}
                </Text>
                <Text style={{...Styles.h6, fontSize: 20}}>
                  {currentRollDefectCountH ?? 0}
                </Text>
              </View>
              <View style={{alignItems: 'center'}}>
                <Text style={{...Styles.h6, fontSize: 11}}>
                  {t('vertical')}
                </Text>
                <Text style={{...Styles.h6, fontSize: 20}}>
                  {currentRollDefectCountV ?? 0}
                </Text>
              </View>
              <View style={{alignItems: 'center'}}>
                <Text style={{...Styles.h6, fontSize: 11}}>
                  {t('punctual')}
                </Text>
                <Text style={{...Styles.h6, fontSize: 20}}>
                  {currentRollDefectCountP ?? 0}
                </Text>
              </View>
              <View style={{alignItems: 'center'}}>
                <Text style={{...Styles.h6, fontSize: 11}}>{t('oil')}</Text>
                <Text style={{...Styles.h6, fontSize: 20}}>
                  {currentRollDefectCountO ?? 0}
                </Text>
              </View>
            </View>
          ) : null}*/}
            {/* {currentRollDefectCount > 0 ? (
            <LastDefectsItems
              itemHeight={itemHeight}
              navigate={this.props.navigate}
              database={DbHelper.database}
            />
          ) : (
            <View style={styles.emptyListContainer}>
              <Text style={Styles.h5}>{t('no_defects')}</Text>
            </View>
          )}  */}
          </Animated.View>
        </View>
      </Card>
    );
  }
}

const styles = ScaledSheet.create({
  rootCard: {
    flex: 1,
    overflow: 'hidden',
  },
  rootContainer: {
    flex: 1,
    overflow: 'hidden',
    // borderWidth: 8,
  },
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    // marginTop: '10@vs',
    // marginHorizontal: '20@vs',
  },
  occurrencesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  divider: {
    marginHorizontal: '14@vs',
    width: '2@vs',
    height: '24@vs',
    backgroundColor: '#979797',
  },
  viewAll: {
    end: '10@vs',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyListContainer: {
    flex: 1,
    marginBottom: '32@vs',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewOccurennces: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

const mapStateToProps = (state) => {
  return {
    lastDefectTimestamp: state.home.lastDefectTimestamp,
    currentRollDefectCount: state.home.currentRollDefectCount,
    currentRollDefectCountH: state.home.currentRollDefectCountH,
    currentRollDefectCountV: state.home.currentRollDefectCountV,
    currentRollDefectCountP: state.home.currentRollDefectCountP,
    currentRollDefectCountO: state.home.currentRollDefectCountO,
    defectAlert: state.persisted.defectAlert,
  };
};

export default withTranslation()(connect(mapStateToProps)(LastDefects));
