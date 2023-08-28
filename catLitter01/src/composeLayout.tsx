import _ from 'lodash';
import { Store } from 'redux';
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { TYSdk, Theme, DevInfo, DpValue } from 'tuya-panel-kit';
import { Connect } from '@components';
import { actions } from '@models';
import { theme, dpCodes } from '@config';
import { getDeviceCloudData, saveDeviceCloudData } from '@api';

interface Props {
  devInfo: DevInfo;
  preload?: boolean;
}

const TYEvent = TYSdk.event;
const TYDevice = TYSdk.device;
const { setClearPlanCode } = dpCodes;

/**
 *
 * @param {Object} store - redux store
 * @param {ReactComponent} component - 需要连接到redux store的组件，通常为即为main
 */
const composeLayout = (store: Store, component: React.ComponentType) => {
  const NavigatorLayout = component;
  const { dispatch } = store;

  /**
   * 此处监听了`设备数据变更`事件，
   * 每当dp点数据变更时，会将变更的dp点状态同步更新到`redux`中去。
   * 同理当设备信息变更时，也会将变更的设备信息值同步更新到`redux`中去。
   */
  TYEvent.on('deviceDataChange', data => {
    switch (data.type) {
      case 'dpData':
        dispatch(actions.common.responseUpdateDp(data.payload as Record<string, DpValue>));
        break;
      default:
        dispatch(actions.common.deviceChange(data.payload as DevInfo));
        break;
    }
  });

  /**
   * 此处监听了`网络状态变更事件`事件，
   * 每当设备信息变更时，会将变更的设备信息值同步更新到`redux`中去。
   */
  TYSdk.event.on('networkStateChange', data => {
    dispatch(actions.common.deviceChange(data as any));
  });

  class PanelComponent extends Component<Props> {
    /**
     * 如果面板进入时，`devInfo`已经存在(通常都会存在的)
     * 这里会调用 setDeviceInfo 将原始的devInfo处理一下，并置入`redux`
     *
     * 如果面板进入时，`devInfo`不存在，
     * 那么会调用 getDeviceInfo 异步获取处理好的`devInfo`，并置入`redux`
     */
    constructor(props: Props) {
      super(props);
      if (props && props.devInfo && props.devInfo.devId) {
        TYDevice.setDeviceInfo(props.devInfo);
        TYDevice.getDeviceInfo()
          .then(data => {
            dispatch(actions.common.devInfoChange(data));
            return Promise.all([TYDevice.getDeviceState(), data]);
          })
          .then(([dpState, devInfo]) => {
            const isEqual = _.isEqual(dpState, devInfo.state);
            if (isEqual) return;
            dispatch(actions.common.responseUpdateDp(dpState));
          });
      } else if (props.preload) {
        // do something
      } else {
        TYDevice.getDeviceInfo().then(data => dispatch(actions.common.devInfoChange(data)));
      }
    }

    async componentDidMount() {
      const res = await getDeviceCloudData('setClearPlan');
      // 如果云端有数据，则不处理；如果云端没有数据，则设置默认值
      if (!res || !res.value) {
        await TYSdk.device.putDeviceData({
          [setClearPlanCode]: '017f0600017f0b00017f110001',
        });
        await saveDeviceCloudData('setClearPlan', { value: 'set' });
      }
    }

    render() {
      return (
        <Provider store={store}>
          <Theme theme={theme}>
            <Connect mapStateToProps={_.identity}>
              {({ mapStateToProps, ...props }: { mapStateToProps: any; [prop: string]: any }) => {
                const hasInit = Object.keys(props.dpState).length > 0;
                return hasInit ? <NavigatorLayout {...props} /> : null;
              }}
            </Connect>
          </Theme>
        </Provider>
      );
    }
  }

  return PanelComponent;
};

export default composeLayout;
