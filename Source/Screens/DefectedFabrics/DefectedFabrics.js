import React, {Component} from 'react';
import {Text, View, FlatList} from 'react-native';
import {Card, TouchableRipple} from 'react-native-paper';
import {withTranslation} from 'react-i18next';
import moment from 'moment/min/moment-with-locales';
import Icon from '@icons';
import {AppTheme, Styles} from '@themes';
import {ScaledSheet, ls} from '@helpers';
import DefectsBatch from './DefectsBatch';
import DbHelper from '@db';
import {reverse} from 'lodash/array';

class DefectedFabrics extends Component {
  state = {
    feeds: [],
  };

  async componentDidMount() {
    moment.locale(this.props.i18n.language);

    const feeds = await DbHelper.database.get('feeds').query().fetch();
    // console.log('feeds: ', feeds);
    this.setState({feeds: reverse(feeds)});
  }

  render() {
    const {
      t,
      route: {
        params: {lastDefectTimestamp, currentRollDefectCount},
      },
    } = this.props;
    return (
      <View elevation={AppTheme.elevation} style={styles.card}>
        <View style={styles.header}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableRipple
              borderless
              style={styles.back}
              onPress={() => this.props.navigation.goBack()}>
              <Icon.Back width={ls(30)} height={ls(30)} style={{top: ls(4)}} />
            </TouchableRipple>
            <Text style={[Styles.subtitle1]}>{t('all_defects')}</Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text style={Styles.body2}>
              {moment(lastDefectTimestamp).fromNow()}
            </Text>
            <View style={styles.divider} />
            <Text style={Styles.body2}>
              {`${currentRollDefectCount} ` + t('occurrences_current_roll')}
            </Text>
          </View>
        </View>
        <Card elevation={AppTheme.elevation} style={styles.card}>
          <View style={styles.headerStyle}>
            <Text style={styles.time}>{t('hour')}</Text>
            <View style={styles.camRow}>
              <Text style={styles.cameraHeading}>{t('cam_1')}</Text>
              <Text style={styles.cameraHeading}>{t('cam_2')}</Text>
              <Text style={styles.cameraHeading}>{t('cam_3')}</Text>
              <Text style={styles.cameraHeading}>{t('cam_4')}</Text>
              <Text style={styles.cameraHeading}>{t('cam_5')}</Text>
              <Text style={styles.cameraHeading}>{t('cam_6')}</Text>
              <Text style={styles.cameraHeading}>{t('cam_7')}</Text>
              <Text style={styles.cameraHeading}>{t('cam_8')}</Text>
            </View>
            <Text style={styles.time}>{t('rotation')}</Text>
            <Text style={styles.rpm}>{t('rpm')}</Text>
          </View>
          <FlatList
            data={this.state.feeds}
            contentContainerStyle={styles.list}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={this.itemSeparator}
            renderItem={this.renderItem}
          />
        </Card>
      </View>
    );
  }

  renderItem = ({item, index}) => (
    <DefectsBatch
      feed={item}
      last={index === this.state.feeds.length - 1}
      navigate={this.props.navigation.navigate}
    />
  );
}

const styles = ScaledSheet.create({
  card: {
    margin: '15@ls',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: '10@ls',
    paddingBottom: '10@ls',
    paddingHorizontal: '20@ls',
    justifyContent: 'space-between',
  },
  headerStyle: {
    height: '50@ls',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '10@ls',
    backgroundColor: AppTheme.colors.darkGray,
    borderRadius: 8,
    elevation: 8,
  },
  rpm: {
    ...Styles.h6,
    width: '60@ls',
    textAlign: 'center',
  },
  time: {
    ...Styles.h6,
    width: '120@ls',
    textAlign: 'center',
  },
  cameraHeading: {
    ...Styles.h6,
    width: '12.5%',
    textAlign: 'center',
  },
  camRow: {
    flex: 1,
    flexDirection: 'row',
    marginStart: '20@ls',
  },
  divider: {
    width: '2@ls',
    height: '25@ls',
    marginStart: '20@ls',
    marginEnd: '20@ls',
    backgroundColor: '#979797',
  },
  back: {
    padding: '15@ls',
    marginEnd: '30@ls',
    borderRadius: AppTheme.roundness,
  },
  list: {
    paddingVertical: '20@ls',
    backgroundColor: '#30343F',
  },
});

export default withTranslation()(DefectedFabrics);
