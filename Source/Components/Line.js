import * as React from 'react';
import Svg, {Line} from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg width={props.width} height={1}>
      <Line
        x1="40"
        y1="0"
        x2={props.width}
        y2="0"
        strokeDasharray="5 5"
        stroke="white"
        strokeWidth="4"
      />
    </Svg>
  );
}

export default SvgComponent;
