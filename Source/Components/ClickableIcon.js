import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

const ClickableIcon = ({children, onPress, dense, style}) => {
  return (
    <TouchableOpacity style={style} onPress={onPress ? onPress : null}>
      <View style={{...styles.container, width: dense ? 40 : 60}}>
        {children}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ClickableIcon;
