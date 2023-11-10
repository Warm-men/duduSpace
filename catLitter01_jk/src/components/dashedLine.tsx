import React from 'react';
import { StyleProp, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { Utils } from 'tuya-panel-kit';

interface Props {
  width: number;
  height: number;
  isColumn?: boolean;
  color?: string;
  style?: StyleProp;
}
const { convertX: cx } = Utils.RatioUtils;
const DashedLine: React.FC<Props> = props => {
  const { style = {}, width = cx(1), height = cx(70), isColumn = true, color = '#E5E0DF' } = props;

  return (
    <View style={[style, { width, height }]}>
      <Svg width={width} height={height}>
        <Line
          x1="0"
          y1="0"
          x2={isColumn ? '0' : '100%'}
          y2={isColumn ? '100%' : '0'}
          stroke={color}
          strokeWidth={isColumn ? width : height}
          strokeDasharray={[cx(4), cx(2)]}
        />
      </Svg>
    </View>
  );
};

export default DashedLine;
