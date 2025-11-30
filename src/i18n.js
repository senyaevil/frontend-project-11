// src/i18n.js
import i18n from 'i18next';
import ru from './locales/ru.js';

export default () => {
  return i18n.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru,
    },
  });
};