module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['@babel/plugin-proposal-decorators', {legacy: true}],
    [
      'module-resolver',
      {
        root: ['./Source'],
        alias: {
          '@navigators': ['./Source/Navigators/'],
          '@components': ['./Source/Components/'],
          '@services': ['./Source/Services/'],
          '@images': ['./Source/Resources/Images/'],
          '@icons': ['./Source/Resources/Icons/'],
          '@data': ['./Source/Resources/Data/'],
          '@fonts': ['./Source/Resources/Fonts/'],
          '@helpers': ['./Source/Helpers/'],
          '@state': ['./Source/State/'],
          '@themes': ['./Source/Themes/'],
          '@screens': ['./Source/Screens/'],
          '@localization': ['./Source/Localization/'],
          '@db': ['./Source/db'],
        },
      },
    ],
  ],
};
