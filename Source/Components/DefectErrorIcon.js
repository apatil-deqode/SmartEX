import React, {memo} from 'react';
import {StyleSheet, View} from 'react-native';
import Icon from '@icons';
import {CheckDefect} from '@helpers';
import {defectLavel} from 'Helpers/CheckDefect';

const DefectErrorIcon = ({image, settings}) => {
  const getIconForDefect = () => {
    const defectType = CheckDefect.defectTypes(image, settings);

    if (defectType === defectLavel.red) {
      return (
        <View>
          <Icon.Error />
        </View>
      );
    }
    if (defectType === defectLavel.gray) {
      return (
        <View>
          <Icon.ErrorGrey />
        </View>
      );
    }
    return null;
  };

  return <View>{getIconForDefect()}</View>;
};

const styles = StyleSheet.create({
  errorContainer: {
    position: 'absolute',
    bottom: 8,
    end: 8,
  },
});

export default memo(DefectErrorIcon);
