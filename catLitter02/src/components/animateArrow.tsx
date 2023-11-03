import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import Res from '@res';

const { convertX: cx } = Utils.RatioUtils;

interface IProps {
  click: any;
  isRotated: boolean;
}
const AnimateArrow: React.FC = (props: IProps) => {
  const { click, isRotated } = props;
  const rotationValue = new Animated.Value(0);

  useEffect(() => {
    startRotationAnimation();
  }, [isRotated]);

  const startRotationAnimation = () => {
    const toValue = isRotated ? 1 : 0;

    Animated.timing(rotationValue, {
      toValue,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      // setIsRotated(!isRotated);
    });
  };

  const animatedStyle = {
    transform: [
      {
        rotate: rotationValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '-90deg'],
        }),
      },
    ],
  };

  return (
    <TouchableOpacity
      hitSlop={{ left: cx(10), right: cx(10), top: cx(10), bottom: cx(10) }}
      onPress={click}
    >
      <Animated.Image
        source={Res.arrow_right}
        style={[styles.moreIcon, animatedStyle]}
        resizeMode="stretch"
      />
    </TouchableOpacity>
  );
};

export default AnimateArrow;

const styles = StyleSheet.create({
  moreIcon: {
    width: cx(20),
    height: cx(20),
  },
});
