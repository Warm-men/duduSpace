import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import Svg, { Line, Path, Circle } from 'react-native-svg';
import { commonColor, commonStyles, cx } from '@config';

interface Props {
  onPress?: () => void;
  disabled?: boolean;
  title?: string;
  subTitle?: any;
  style: StyleProp;
  boxStyle?: StyleProp;
  lineStyle: StyleProp;
  subTitleStyle?: StyleProp;
  isHDirect: boolean; // true-右 false-左
  isVDirect: boolean; // true-下 false-上
  renderText?: () => void;
}

const Tip: React.FC<Props> = props => {
  const {
    style,
    boxStyle,
    lineStyle = {},
    title,
    subTitle,
    subTitleStyle,
    onPress,
    disabled = false,
    isHDirect,
    isVDirect,
    renderText,
  } = props;

  const width = lineStyle.width || 0;
  const height = lineStyle.height || 0;
  const r = cx(2.5);
  const strokeWidthR = cx(0.5);

  const getPath = () => {
    const path = `M${isHDirect ? width : 0} ${isVDirect ? height : 0} L${
      isHDirect ? cx(25) : width - cx(25)
    } ${isVDirect ? 0 : height} L${isHDirect ? 0 : width} ${isVDirect ? 0 : height}`;

    return path;
  };

  const _renderText = () => {
    if (renderText && typeof renderText === 'function') {
      return renderText();
    }
    if (title && subTitle) {
      return (
        <View style={[commonStyles.flexRowCenter, styles.bubble, boxStyle]}>
          <TYText style={styles.title}>{title}</TYText>
          <TYText style={[styles.subTitle, subTitleStyle]}>{subTitle}</TYText>
        </View>
      );
    }
  };

  return (
    <>
      <View style={[style, { zIndex: 2 }]}>
        <TouchableOpacity
          style={[commonStyles.flexRowCenter, commonStyles.shadow, styles.bubble, boxStyle]}
          activeOpacity={0.8}
          onPress={onPress}
          disabled={disabled}
        >
          {_renderText()}
        </TouchableOpacity>
      </View>
      <View style={[lineStyle, { zIndex: 1 }]}>
        <Svg width={width} height={height}>
          {/* 折线 */}
          <Line
            x1={isHDirect ? width - r - strokeWidthR : r}
            y1={isVDirect ? height - r - strokeWidthR : r}
            x2={isHDirect ? cx(25) : width - cx(25) - r}
            y2={isVDirect ? 0 : height - strokeWidthR}
            stroke={commonColor.brown}
            strokeWidth={strokeWidthR * 2}
          />
          {/* 横线 */}
          <Line
            x1={isHDirect ? cx(25) : width - cx(25) - r}
            y1={isVDirect ? strokeWidthR : height - strokeWidthR}
            x2={isHDirect ? 0 : width}
            y2={isVDirect ? strokeWidthR : height - strokeWidthR}
            stroke={commonColor.brown}
            strokeWidth={strokeWidthR * 2}
          />
          <Circle
            cx={isHDirect ? width - r : r}
            cy={isVDirect ? height - r : r}
            r={r}
            fill={commonColor.brown}
          />
        </Svg>
      </View>
    </>
  );
};

export default Tip;

const styles = StyleSheet.create({
  title: {
    fontSize: cx(12),
    color: '#49362F',
    lineHeight: cx(18),
    fontWeight: '500',
  },
  subTitle: {
    fontSize: cx(12),
    color: '#7C7269',
    lineHeight: cx(18),
  },
  bubble: {
    borderWidth: cx(1),
    borderColor: 'rgba(0, 0, 0, 0.10)',
    alignSelf: 'flex-start',
    paddingVertical: cx(6),
    paddingHorizontal: cx(6),
    // minWidth: cx(84),
    maxWidth: cx(100),
    borderRadius: cx(8),
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    elevation: 0, // 关键, 设置值跟shadowRadius一致
    shadowRadius: 0,
    marginVertical: cx(4),
    marginHorizontal: cx(4),
  },
});
