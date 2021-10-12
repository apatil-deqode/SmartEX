import React from 'react';
import {withTranslation} from 'react-i18next';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Styles, AppTheme} from '@themes';

const CopilotTooltip = ({
  isFirstStep,
  isLastStep,
  handleNext,
  handlePrev,
  handleStop,
  currentStep,
  t,
}) => (
  <View>
    <View style={styles.tooltipContainer}>
      <Text
        testID="stepDescription"
        style={[Styles.h6, {color: AppTheme.colors.card}]}>
        {currentStep.text}
      </Text>
    </View>
    <View style={styles.bottomBar}>
      {!isLastStep ? (
        <TouchableOpacity style={styles.button} onPress={handleStop}>
          <Text style={styles.buttonText}>{t('skip')}</Text>
        </TouchableOpacity>
      ) : null}
      {!isFirstStep ? (
        <TouchableOpacity style={styles.button} onPress={handlePrev}>
          <Text style={styles.buttonText}>{t('previous')}</Text>
        </TouchableOpacity>
      ) : null}
      {!isLastStep ? (
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>{t('next')}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleStop}>
          <Text style={styles.buttonText}>{t('finish')}</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  tooltipContainer: {
    padding: 4,
    flex: 1,
  },
  bottomBar: {
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  buttonText: {
    ...Styles.h5,
    color: '#29838E',
  },
  button: {
    marginStart: 16,
  },
});

export default withTranslation()(CopilotTooltip);
