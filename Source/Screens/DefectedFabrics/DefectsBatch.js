import React, {memo} from 'react';
import {Text, View, Dimensions} from 'react-native';
import {ScaledSheet} from '@helpers';
import {Styles} from '@themes';
import i18n from 'i18next';
import moment from 'moment/min/moment-with-locales';
import withObservables from '@nozbe/with-observables';
import Batch from './Batch';
import Svg, {Line} from 'react-native-svg';
import Icon from '@icons';

const ROW_HEIGHT = Dimensions.get('screen').height / 6;

const NoDefectSeparator = ({visible}) => {
  return visible ? (
    <View style={styles.noDefect}>
      <Svg width={2} height={80}>
        <Line
          x1="0"
          y1="3"
          x2="0"
          y2="80"
          strokeDasharray="3 6"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="4"
        />
      </Svg>
      <Icon.NoDefect style={styles.absolute} />
    </View>
  ) : null;
};
const DefectStopSeparator = ({visible}) => {
  return visible ? (
    <View style={styles.noDefect}>
      <Svg width={2} height={80}>
        <Line
          x1="0"
          y1="3"
          x2="0"
          y2="80"
          strokeDasharray="3 6"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="4"
        />
      </Svg>
      <Icon.DefectStop style={styles.absolute} />
    </View>
  ) : null;
};

const DefectsBatch = ({feed, images, last, navigate}) => {
  moment.locale(i18n.language);
  const time = moment(feed.timestamp.getTime()).format('LTS');
  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <Text style={styles.time}>{time}</Text>
        <View style={styles.batch}>
          <Batch images={images} navigate={navigate} />
        </View>
        <Text style={styles.time}>{feed.rotation}</Text>
        <Text style={styles.rpm}>{feed.rpm}</Text>
      </View>
      {feed.defectStop ? (
        <DefectStopSeparator visible={true && !last} />
      ) : (
        <NoDefectSeparator visible={!feed.wasLastBatchDefective && !last} />
      )}
    </View>
  );
};

const styles = ScaledSheet.create({
  root: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    marginHorizontal: '10@ls',
  },
  time: {
    ...Styles.h6,
    width: '120@ls',
    textAlign: 'center',
  },
  rpm: {
    ...Styles.h6,
    width: '60@ls',
    textAlign: 'center',
  },
  batch: {
    flex: 1,
    flexDirection: 'row',
    height: ROW_HEIGHT,
    justifyContent: 'center',
    borderColor: '#F0A847',
    overflow: 'hidden',
    borderWidth: 3,
    marginStart: '10@ls',
  },
  noDefect: {
    width: '42@ls',
    marginStart: '140@ls',
    marginEnd: '190@ls',
    alignItems: 'center',
    justifyContent: 'center',
  },
  absolute: {
    position: 'absolute',
  },
});

const enhance = withObservables([], ({feed}) => ({
  images: feed.images,
}));

const areEqual = (prev, next) => prev.id === next.id;
export default enhance(memo(DefectsBatch, areEqual));
