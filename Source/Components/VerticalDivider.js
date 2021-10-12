import React from 'react';
import {View, StyleSheet} from 'react-native';

const VerticalDivider = ({style}) => {
  return <View style={[style, styles.divider]} />;
};

const styles = StyleSheet.create({
  divider: {
    width: 1,
    backgroundColor: '#32343C',
  },
});

export default VerticalDivider;
