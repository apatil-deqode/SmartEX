import React from 'react';
import {View, StyleSheet} from 'react-native';

const Divider = ({style}) => {
  return <View style={[style, styles.divider]} />;
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: '#32343C',
  },
});

export default Divider;
