import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  View,
  Text,
  WebView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Platform,
  PixelRatio,
  ViewPropTypes,
  ColorPropType,
} from 'react-native';
import throttle from './throttle';
import { getOssUrl } from './api';

const window = Dimensions.get('window');

const SOURCE_URL = '/smart/connect-scheme/d2e758ad-5e12-51d5-9ee5-57992d5e654c.html';

const defaultProps = {
  style: null,
  width: window.width,
  height: 400,
  type: 'dark',
  data: [],
  loading: false, // 数据是否正在加载，可用于某些需要数据加载完毕后再装载图表的场景
  loadingColor: null,
  updateThreshold: 375, // 图标数据刷新阈值
  loadingTimeout: 275, // 渲染图表超过多少毫秒后开始显示loading
  chartConfig: null,
  onMessage: null,
  onError: null,
  placeholder: '暂无数据',
  placeHolderTextStyle: null,
  renderPlaceHolder: null,
  renderLoading: null,
};

const propTypes = {
  style: ViewPropTypes.style,
  width: PropTypes.number,
  height: PropTypes.number,
  type: PropTypes.oneOf(['dark', 'light']),
  data: PropTypes.array,
  loading: PropTypes.bool,
  loadingColor: ColorPropType,
  updateThreshold: PropTypes.number,
  loadingTimeout: PropTypes.number,
  chartConfig: PropTypes.object, // https://www.yuque.com/antv/f2/api-chart#1eeogf
  renderer: PropTypes.func.isRequired,
  onMessage: PropTypes.func,
  onError: PropTypes.func,
  placeholder: PropTypes.string,
  placeHolderTextStyle: Text.propTypes.style,
  renderPlaceHolder: PropTypes.func,
  renderLoading: PropTypes.func,
};

export default class F2Chart extends Component {
  static propTypes = propTypes;

  static defaultProps = defaultProps;

  constructor(props) {
    super(props);
    this._hasInitChart = false;
    this._loadingTimerId = null;
    this.throttledUpdateChart = throttle(this._updateChart, props.updateThreshold);
    this.state = {
      initializing: true, // 图表是否正在初始化中
    };
  }

  async componentDidMount() {
    const ossUrl = await getOssUrl();
    const remoteUri = `${ossUrl}${SOURCE_URL}`;
    this.setState({ remoteUri });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.data !== nextProps.data) {
      this.throttledUpdateChart(nextProps.data);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.loading !== nextProps.loading ||
      this.state.initializing !== nextState.initializing ||
      this.state.remoteUri !== nextState.remoteUri ||
      this.shouldUpdateWebView(nextProps) ||
      this.props.width !== nextProps.width ||
      this.props.height !== nextProps.height ||
      this.props.style !== nextProps.style
    );
  }

  componentWillUnmount() {
    this._clearLoadingTimeout();
  }

  get isLoading() {
    return this.props.loading || this.state.initializing;
  }

  get color() {
    return this.props.type === 'dark' ? '#000' : '#fff';
  }

  // 数据从无变有或者从有变化时需要重新渲染
  shouldUpdateWebView(nextProps) {
    return (
      (!this.props.data.length && nextProps.data.length) ||
      (this.props.data.length && !nextProps.data.length)
    );
  }

  _clearLoadingTimeout() {
    if (this._loadingTimerId) {
      clearTimeout(this._loadingTimerId);
    }
  }

  _updateChart(data) {
    this.chart && this.chart.postMessage(JSON.stringify(data));
  }

  _renderChart() {
    const { data, renderer } = this.props;
    if (typeof renderer !== 'function') {
      return;
    }
    const pixelRatio = PixelRatio.get();
    const chartConfig = {
      pixelRatio,
      ...this.props.chartConfig,
      id: 'main',
    };
    /**
     * 低版本系统的WebView不兼容新语法和特性
     * 例如let、===、{...obj}、() => {}等等。（神奇的是有些let不能写的手机，const却可以写）
     * 所以在render字符串里面最好只写纯ES5，以免测试拿出古董机器。。
     *
     * renderer字符串内可定义window.onChartDataChange方法，在data更新时做些事。
     * 例如柱形图更新数据后，柱子的点击高亮状态会丢失，需要手动重新设置颜色。
     */
    return `
      if (typeof Object.assign !== 'function') {
        Object.defineProperty(Object, "assign", {
          value: function assign(target, varArgs) {
            if (target === null || target === undefined) {
              throw new TypeError('Cannot convert undefined or null to object');
            }
            var to = Object(target);
            for (var index = 1; index < arguments.length; index++) {
              var nextSource = arguments[index];
              if (nextSource !== null && nextSource !== undefined) {
                for (var nextKey in nextSource) {
                  if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                    to[nextKey] = nextSource[nextKey];
                  }
                }
              }
            }
            return to;
          },
          writable: true,
          configurable: true
        });
      }

      try {
        var style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(
          document.createTextNode(
            '*{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;}'
          )
        );
        document.body.appendChild(style);

        var chart = new F2.Chart(${JSON.stringify(chartConfig)});
        ${renderer(data)}
        window.document.addEventListener('message', function(e) {
          var newData = JSON.parse(e.data);
          chart.changeData(newData);
          if (typeof window.onChartDataChange == 'function') {
            window.onChartDataChange(newData);
          }
        });
      } catch (error) {
        window.postMessage(JSON.stringify({
          type: 'error',
          error: error,
          message: error.message
        }));
      }
    `;
  }

  _handleMessage = event => {
    const { data } = event.nativeEvent;
    const parsedData = JSON.parse(data);
    if (parsedData.type === 'error') {
      console.warn('F2Chart renderer Error: ', parsedData.message, parsedData.error);
      this.props.onError && this.props.onError(parsedData.error);
    }
    this.props.onMessage && this.props.onMessage(parsedData);
  };

  _handleLoadStart = () => {
    if (this._hasInitChart) return;
    const { loadingTimeout } = this.props;
    this._time = Date.now();
    this._loadingTimerId = setTimeout(() => {
      this.setState({ initializing: true });
    }, loadingTimeout);
  };

  _handleLoadEnd = () => {
    if (this._hasInitChart) return;
    this.setState({ initializing: false });
    this._hasInitChart = true;
    this._time = null;
    this._clearLoadingTimeout();
  };

  renderPlaceHolder() {
    const {
      style,
      width,
      height,
      placeholder,
      placeHolderTextStyle,
      renderPlaceHolder,
    } = this.props;
    if (renderPlaceHolder) return renderPlaceHolder();
    const placeHolderStyle = [
      style,
      styles.center,
      {
        width,
        height,
        backgroundColor: 'transparent',
      },
    ];
    return (
      <View style={placeHolderStyle}>
        <Text style={[{ fontSize: 14, color: this.color }, placeHolderTextStyle]}>
          {placeholder}
        </Text>
      </View>
    );
  }

  renderLoading() {
    const { loadingColor, renderLoading } = this.props;
    if (!this.isLoading) return;
    if (typeof renderLoading === 'function') return renderLoading(this.isLoading);
    return (
      <ActivityIndicator
        style={styles.loading}
        animating={true}
        size="small"
        color={loadingColor || this.color}
      />
    );
  }

  render() {
    if (!this.state.remoteUri) {
      return null;
    }
    const { style, width, height, loading, data } = this.props;
    const containerStyle = [
      style,
      {
        width,
        height,
        backgroundColor: 'transparent',
      },
    ];
    if (!loading && (!data || !data.length)) {
      return this.renderPlaceHolder();
    }
    return (
      <View style={containerStyle}>
        {this.renderLoading()}
        <WebView
          style={containerStyle}
          ref={ref => {
            this.chart = ref;
          }}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          scrollEnabled={false}
          injectedJavaScript={this._renderChart()}
          scalesPageToFit={Platform.OS !== 'ios'}
          source={{ uri: this.state.remoteUri }}
          onMessage={this._handleMessage}
          onLoadStart={this._handleLoadStart}
          onLoadEnd={this._handleLoadEnd}
          onError={this.props.onError}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
