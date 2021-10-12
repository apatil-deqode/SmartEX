import {DarkTheme as PaperDarkTheme} from 'react-native-paper';
import {DarkTheme as NavigationDarkTheme} from '@react-navigation/native';

export default {
  ...PaperDarkTheme,
  ...NavigationDarkTheme,
  roundness: 14,
  elevation: 5,
  mode: 'exact',
  colors: {
    ...NavigationDarkTheme.colors,
    ...PaperDarkTheme.colors,
    primary: '#385CF8',
    accent: '#68E6E6',
    background: '#292B35',
    surface: '#424957', //for paper theme
    card: '#202226', //for navigation theme
    text: '#FFFFFF',
    placeholder: 'rgba(255,255,255,0.55)',
    input: '#1B1C1F',
    overlay: 'rgba(0,0,0,0.5)',
    error: '#AD1616',
    green: '#00B739',
    red: '#D61818',
    darkYellow: '#ebbf3bff',
    blue: '#3d85c6ff',

    //New UI
    darkGray: '#3A3F4C',
  },
};
