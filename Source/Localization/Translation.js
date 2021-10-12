import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

const translationGetters = {
  en: () => require('./english.json'),
  pt: () => require('./portuguese.json'),
  it: () => require('./italian.json'),
  tr: () => require('./turkish.json'),
  de: () => require('./german.json'),
};

const initialize = () => {
  i18n.use(initReactI18next).init({
    lng: 'en',
    resources: {
      en: {
        translation: translationGetters.en(),
      },
      pt: {
        translation: translationGetters.pt(),
      },
      it: {
        translation: translationGetters.it(),
      },
      tr: {
        translation: translationGetters.tr(),
      },
      de: {
        translation: translationGetters.de(),
      },
    },
  });
};

export {initialize};
