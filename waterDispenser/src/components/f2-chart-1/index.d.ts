import { Component } from 'react';
import { ViewStyle, ViewPropTypes, ColorPropType } from 'react-native';

interface MainProps {
  style?: any;
  width?: number;
  height?: number;
  type?: 'dark' | 'light';
  data?: [any];
  loading?: boolean;
  loadingColor?: any;
  updateThreshold?: number;
  loadingTimeout?: number;
  chartConfig?: any; // https://www.yuque.com/antv/f2/api-chart#1eeogf
  renderer?: () => void;
  onMessage?: () => void;
  onError?: () => void;
  placeholder?: string;
  placeHolderTextStyle?: any;
  renderPlaceHolder?: () => void;
  renderLoading: () => void;
}
export default class F2Chart extends Component<MainProps> {}
