import React, {PureComponent} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {AppTheme, Styles} from '@themes';
import {Slider} from 'Components';
import Switch from 'react-native-switch-pro';
import Chart from './Chart';

class ScoreChart extends PureComponent {
  render() {
    const {
      label,
      value,
      scores,
      chartWidth,
      chartHeight,
      style,
      enabled,
      setEnabled,
      onThresholdChanged,
    } = this.props;

    return (
      <View style={[styles.root, style]}>
        <Chart
          scores={scores}
          chartWidth={chartWidth}
          chartHeight={chartHeight > 320 ? 330 : 288}
        />
        <View style={styles.row}>
          <Text style={styles.label}>{label}</Text>
          <Switch
            width={60}
            height={30}
            circleColorActive={'#8D8FFA'}
            circleColorInactive={'#757C91'}
            circleStyle={{
              elevation: 10,
            }}
            backgroundActive={'#7B9EDF'}
            backgroundInactive={'#586075'}
            value={enabled}
            onSyncPress={setEnabled}
            style={{
              elevation: 10,
            }}
          />
        </View>
        <View
          style={[
            styles.sliderContainer,
            {
              width: chartWidth * 0.77,
              height: chartHeight > 320 ? 228 : 187,
            },
          ]}>
          <Slider
            min={0}
            max={100}
            step={1}
            value={value}
            showBallIndicator
            ballIndicatorPosition={0}
            ballIndicatorWidth={36}
            height={chartHeight > 320 ? 228 : 187}
            width={chartWidth * 0.8}
            onComplete={onThresholdChanged}
            onDisplaySettingAuthDialog={this.props.onDisplaySettingAuthDialog}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
  },
  label: {
    ...Styles.h5,
    marginEnd: 10,
  },
  chart: {
    top: 20,
  },
  sliderContainer: {
    position: 'absolute',
    start: '5%',
    top: 70,
    justifyContent: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    bottom: 16,
  },
});

export default ScoreChart;
