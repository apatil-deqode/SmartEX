import React from 'react';
import {Text} from 'react-native-paper';
import {View, TouchableOpacity, Image} from 'react-native';
// import FastImage from 'react-native-fast-image';
import {Styles, AppTheme} from '@themes';
import Icons from '@icons';
import {withTranslation} from 'react-i18next';
import Button from './Button';
import Icon from '@icons';
import {ScaledSheet} from '@helpers';
import {Constants} from '@data';
import DefectErrorIcon from '../Components/DefectErrorIcon';
import {Stores} from '@state';
import moment from 'moment/min/moment-with-locales';
import i18n from 'i18next';

const ErrorDialog = ({
  defect,
  type,
  liveFeed,
  onPressUnlock,
  onPressImage,
  t,
  i18n: {language},
  occurrences,
  cm,
  timestamp,
}) => {
  moment.locale(i18n.language);
  const strDate = new Date(timestamp);
  const time = moment(strDate.getTime()).format('LTS');
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icons.Warning />
        <Text style={styles.h1}>{t('error_detected')}</Text>
      </View>
      {/* <View style={styles.liveFeed}>
        {liveFeed.map((item, index) => {
          return (
            <TouchableOpacity
              key={index}
              style={styles.item}
              onPress={() => onPressImage(index)}>
              <Image
                style={styles.image}
                source={{
                  uri: Constants.BASE64_PREFIX + item.thumbnail,
                }}
              />
              <View style={styles.errorContainer}>
                <DefectErrorIcon
                  image={item}
                  settings={
                    Stores.getState().persisted.settings.cameraDefectSettings[
                      index
                    ]
                  }
                />
              </View> */}
      {/* {item.defect ? (
                <View style={styles.errorContainer}>
                  <Icon.Error />
                </View>
              ) : null} */}
      {/* </TouchableOpacity>
          );
        })}
      </View> */}

      <Text style={styles.subtitle}>
        {type
          ? getErrorMessage({t, type, defect, occurrences, cm, language})
          : t('defect_stop_message')}
      </Text>
      <Text style={styles.timeStop}>{time}</Text>
      <Text style={[styles.timeStop, {marginTop: 20}]}>
        {t('was_this_good_stop')}
      </Text>
      <View style={styles.unlockButtonView}>
        <TouchableOpacity
          // style={styles.unlockButton}
          onPress={() => onPressUnlock(true)}>
          <Icons.likeIcon height={80} width={150} />
        </TouchableOpacity>

        <TouchableOpacity
          // style={styles.unlockButton}
          onPress={() => onPressUnlock(false)}>
          <Icons.dislikeIcon height={80} width={150} />
        </TouchableOpacity>
        {/* <Button
          style={styles.unlockButton}
          onPress={() => onPressUnlock(false)}
           textStyle={{color: 'red'}}>
          {t('no')}
        </Button>
        <Button style={styles.unlockButton} onPress={() => onPressUnlock(true)}
          textStyle={{color: '#6200FC'}}>
          {t('yes')}
        </Button> */}
      </View>
    </View>
  );
};

const getCorrectDefectText = (occurrences, defect) => {
  let prefix = occurrences > 1 ? 'p' : 's';
  return prefix + '_' + defect + 'Error';
};

const getErrorMessageForRollError = ({t, occurrences, language, defect}) => {
  const textKey = getCorrectDefectText(occurrences, defect);
  switch (language) {
    case 'pt':
      return `${occurrences} ${t(textKey)} no rolo atual`;
    case 'de':
      return `${occurrences} ${t(textKey)} in der aktuellen Rolle`;
    case 'it':
      return `${occurrences} occorrenze ${t(textKey)} nel ruolo corrente`;
    case 'tr':
      return `${occurrences} ${t(textKey)} mevcut roldeki olaylar`;
    default:
      return `${occurrences} ${t(textKey)} in the current roll`;
  }
};

const getErrorMessageForContextualError = ({
  t,
  occurrences,
  cm,
  language,
  defect,
}) => {
  const textKey = getCorrectDefectText(occurrences, defect);
  switch (language) {
    case 'pt':
      return `${occurrences} ${t(textKey)} em ${cm} cm`;
    case 'de':
      return `${occurrences} ${t(textKey)} in ${cm} cm`;
    case 'it':
      return `${occurrences} ${t(textKey)} in ${cm} cm`;
    case 'tr':
      return `${cm} cm'de ${occurrences} ${t(textKey)}`;
    default:
      return `${occurrences} ${t(textKey)} in ${cm} cm`;
  }
};

const getErrorMessage = ({type, defect, occurrences, cm, language, t}) => {
  const message =
    type === 'roll'
      ? getErrorMessageForRollError({t, occurrences, language, defect})
      : getErrorMessageForContextualError({
          t,
          occurrences,
          cm,
          language,
          defect,
        });
  return message;
};

const styles = ScaledSheet.create({
  container: {
    backgroundColor: '#E73242',
    borderRadius: 15,
    alignItems: 'center',
    paddingVertical: '40@ls',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  h1: {
    ...Styles.h4,
    color: 'white',
    marginStart: '20@ls',
  },
  subtitle: {
    ...Styles.h5,
    marginTop: '30@ls',
    marginHorizontal: '30@ls',
  },
  timeStop: {
    ...Styles.h5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: '100@ls',
    paddingBottom: '2@ls',
  },
  liveFeed: {
    flexDirection: 'row',
    marginTop: '40@ls',
    width: '100%',
    height: '150@ls',
    backgroundColor: AppTheme.colors.card,
  },
  item: {
    height: '100%',
    flex: 1,
    marginHorizontal: 0.5,
  },
  image: {
    height: '100%',
    flex: 1,
  },
  errorContainer: {
    position: 'absolute',
    end: 8,
    top: 8,
  },
  unlockButtonView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '40%',
    marginTop: '10@ls',
  },
  unlockButton: {
    backgroundColor: 'rgba(252, 252, 252, 0.5)',
    paddingHorizontal: 50,
    paddingVertical: 10,
  },
});

export default withTranslation()(ErrorDialog);
