import React, {memo} from 'react';
import {StyleSheet, View} from 'react-native';
import {
  VictoryChart,
  VictoryLine,
  VictoryTheme,
  VictoryAxis,
  VictoryScatter,
  VictoryArea,
} from 'victory-native';
import {ls} from '@helpers';
import {Svg, Circle} from 'react-native-svg';
import {defectLavel} from 'Helpers/CheckDefect';

const baseLabelStyles = {
  fontFamily: 'TitilliumWeb-SemiBold',
  padding: 10,
  fontSize: ls('18'),
  fill: 'white',
  stroke: 'transparent',
};

const theme = {
  ...VictoryTheme.grayscale,
  area: {
    style: {
      data: {
        fill: 'red',
      },
      labels: baseLabelStyles,
    },
  },
  axis: {
    style: {
      axis: {
        fill: 'transparent',
        stroke: 'white',
        strokeWidth: 1,
      },
      grid: {
        fill: 'none',
        stroke: 'none',
        pointerEvents: 'painted',
      },
      ticks: {
        fill: 'transparent',
        size: 4,
        stroke: 'white',
      },
      tickLabels: {...baseLabelStyles, fontSize: ls('14')},
    },
  },
};

const DataPoint = ({x, y, datum: {color, aboveThreshold}}) => {
  // let pointColor = aboveThreshold
  //   ? color === defectLavel.red
  //     ? 'red'
  //     : color === defectLavel.gray
  //     ? 'gray'
  //     : '#62D6D6'
  //   : '#62D6D6';
  return (
    <Svg height="3" width="3">
      <Circle cx={x} cy={y} r="3" fill={aboveThreshold ? 'red' : 'white'} />
      {/* <Circle cx={x} cy={y} r="5" fill={pointColor} /> */}
    </Svg>
  );
};

const Chart = ({chartWidth, chartHeight, scores = []}) => {
  let data = scores.map((s, index) => ({
    x: index,
    y: s.score,
    aboveThreshold: s.aboveThreshold,
    color: s.color,
  }));

  return (
    <View style={styles.root}>
      <VictoryChart
        width={chartWidth}
        height={chartHeight}
        theme={theme}
        maxDomain={{y: 1}}>
        <VictoryAxis dependentAxis />
        <VictoryAxis style={{tickLabels: {fontSize: 0}, ticks: {size: 0}}} />
        <VictoryLine
          data={data}
          style={{data: {stroke: 'white', strokeWidth: 1}}}
        />
        <VictoryArea
          style={{data: {fill: 'rgba(255, 255, 255, 0.1)'}}}
          data={data}
        />
        <VictoryScatter
          dataComponent={<DataPoint />}
          style={{data: {fill: '#62D6D6'}}}
          size={5}
          data={data}
        />
      </VictoryChart>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: 'transparent',
    top: 20,
  },
});

export default memo(Chart);
