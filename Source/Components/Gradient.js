import * as React from 'react';
import LinearGradient from 'react-native-linear-gradient';

export const BlueGradient = ({style, children}) => {
  return (
    <LinearGradient
      colors={['#7C9CDF', '#6A73FE']}
      start={{x: 0, y: 0}}
      end={{x: 3, y: 0}}
      style={style}>
      {children}
    </LinearGradient>
  );
};

export const PurpleGradient = ({style, children}) => {
  return (
    <LinearGradient
      colors={['#BA76E2', '#7354F7']}
      start={{x: 0, y: 1}}
      end={{x: 1, y: 0}}
      style={style}>
      {children}
    </LinearGradient>
  );
};

export const AppBackground = ({style, children}) => {
  return (
    <LinearGradient
      colors={['#3a3f4c', '#424957']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={style}>
      {children}
    </LinearGradient>
  );
};

export const BlueButtonGradient = ({style, children}) => {
  return (
    <LinearGradient
      colors={['#6D8AF8', '#6A6DFB']}
      start={{x: 0, y: 1}}
      end={{x: 1, y: 0}}
      style={style}>
      {children}
    </LinearGradient>
  );
};
