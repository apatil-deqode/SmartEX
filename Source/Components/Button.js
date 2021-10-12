import React from 'react';
import {Button as ContainedButton} from 'react-native-paper';
import {Styles} from '@themes';
import {ls} from '@helpers';

const Button = ({children, mode, style, contentStyle, textStyle, ...rest}) => {
  return (
    <ContainedButton
      mode={mode ? mode : 'contained'}
      uppercase={false}
      style={{elevation: mode ? 0 : 5, ...style}}
      contentStyle={{
        height: ls(85),
        minWidth: ls(170),
        alignSelf: 'center',
        ...contentStyle,
      }}
      labelStyle={[Styles.h3, textStyle]}
      {...rest}>
      {children}
    </ContainedButton>
  );
};

export default Button;
