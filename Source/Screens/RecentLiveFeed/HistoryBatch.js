import React, {memo} from 'react';
import {Text, StyleSheet, View, Dimensions} from 'react-native';
import moment from 'moment/min/moment-with-locales';
import i18n from 'i18next';
import Batch from '../Home/Feed/Batch';
import {Styles} from '@themes';

const ROW_COUNT = 5;
const height = (Dimensions.get('screen').height - 82) / ROW_COUNT;

const HistoryBatch = ({batch, navigate}) => {
  moment.locale(i18n.language);
  const timeStamp = batch.feed[0].timestamp;
  const time = moment(timeStamp).format('LTS');

  return (
    <View style={styles.row}>
      <Text style={styles.time}>{time}</Text>
      <View style={styles.images}>
        <Batch images={batch.feed} navigate={navigate} />
      </View>
      <Text style={styles.time}>{batch.rotation}</Text>
      <Text style={styles.rpm}>{batch.rpm}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  images: {
    flex: 1,
    flexDirection: 'row',
    height: height,
  },
  time: {
    ...Styles.h6,
    width: 120,
    textAlign: 'center',
  },
  rpm: {
    ...Styles.h6,
    width: 60,
    textAlign: 'center',
  },
});

export default memo(HistoryBatch);
