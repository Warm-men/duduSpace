import { NativeModules } from 'react-native';
import { TYSdk } from 'tuya-panel-kit';
import { commonApi } from '@tuya/tuya-panel-api';

function isJSON(str: string) {
  try {
    const obj = JSON.parse(str);
    return !!obj && typeof obj === 'object';
  } catch (e) {
    return false;
  }
}

export const api = function (a: string, postData: { [key: string]: any }, v = '1.0'): any {
  const params = { a, postData, v };
  // TYSdk.mobile.showLoading()
  return new Promise((resolve, reject) => {
    TYSdk.native.apiRNRequest(
      params,
      (res: any) => {
        // TYSdk.mobile.hideLoading()
        const data = typeof res === 'string' && isJSON(res) ? JSON.parse(res) : res;
        if (__DEV__) {
          console.log(`${a} params: `, JSON.stringify(params));
          console.log(`API Success: %c${a}%o`, 'background: green; color: #fff;', data);
        }
        resolve(data);
      },
      (err: any) => {
        // TYSdk.mobile.hideLoading()
        // TYSdk.native.simpleTipDialog(err.message || 'error', () => { })
        const error = typeof err === 'string' && isJSON(err) ? JSON.parse(err) : err;
        if (__DEV__) {
          console.log(`${a} params: `, JSON.stringify(params));
          console.log(`API Failed: %c${a}%o`, 'background: red; color: #fff;', params, error);
        }
        reject(error);
      }
    );
  });
};

export const nativeJumpToPage = (url: string) => {
  NativeModules.TYRCTPublicManager.jumpTo(url);
};

// 存储数据到云端
export const saveDeviceCloudData = (key: string, data: any) => {
  return new Promise((resolve, reject) => {
    try {
      const jsonString = typeof data === 'object' ? JSON.stringify(data) : data;
      TYSdk.native.setDevProperty(key, jsonString, resolve, reject);
    } catch (e) {
      reject(e);
    }
  });
};

// 从云端获取数据
export const getDeviceCloudData = (key: string) => {
  return new Promise((resolve, reject) => {
    TYSdk.native.getDevProperty(
      d => {
        if (typeof d !== 'undefined') {
          let data = d;
          if (key) {
            data = typeof d[key] !== 'undefined' ? d[key] : {};
          }
          if (typeof data === 'string' && data.includes('{')) data = JSON.parse(data);
          resolve(data);
        }
      },
      err => reject(err)
    );
  });
};
// 获取dp点统计数据
export const getStatByDP = params => {
  return commonApi.statApi.getDpResultByHour({
    devId: TYSdk.devInfo.devId,
    auto: 2,
    type: 'sum',
    ...params,
  });
};

// 获取dp点指定时间段日志
export const getLogInSpecifiedTime = params => {
  return commonApi.statApi.getLogInSpecifiedTime({
    devId: TYSdk.devInfo.devId,
    offset: 0,
    limit: 999,
    sortType: 'DESC',
    ...params,
  });
};
