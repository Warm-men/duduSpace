import React from 'react';
import { View } from 'react-native';
import { Utils, LinearGradient } from 'tuya-panel-kit';
import { Rect } from 'react-native-svg';

const { convert: c, convertX: cx, convertY: cy } = Utils.RatioUtils;
const LinearGradientView: React.FC = (props: any) => {
  const width = props.width || cx(100);
  const height = props.height || cx(40);
  return (
    <View style={props.style}>
      <LinearGradient
        gradientId="Gradient1"
        style={{
          height,
          width,
        }}
        x1="0%"
        y1="0%"
        x2="100%"
        y2="0%"
        stops={{
          '0%': props.color1 || '#E6B26A',
          '100%': props.color1 || '#D49157',
        }}
      >
        <Rect width={width} height={height} />
      </LinearGradient>
      {props.children}
    </View>
  );
};

export default LinearGradientView;
