import { commonApi } from '@tuya/tuya-panel-api';
import { TYSdk } from 'tuya-panel-kit';

// 存储数据
export const saveDeviceCloudData = (key, data) => {
  return new Promise((resolve, reject) => {
    try {
      const jsonString = typeof data === 'object' ? JSON.stringify(data) : data;
      TYSdk.native.setDevProperty(key, jsonString, resolve, reject);
    } catch (e) {
      reject(e);
    }
  });
};

// 获取数据
export const getDeviceCloudData = key => {
  return new Promise((resolve, reject) => {
    TYSdk.native.getDevProperty(
      d => {
        if (typeof d !== 'undefined') {
          let data = d;
          if (key) {
            data = typeof d[key] !== 'undefined' ? d[key] : {};
          }
          if (typeof data === 'string') data = JSON.parse(data);
          resolve(data);
        } else reject({});
      },
      () => reject({})
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
export const getLogByIdAndTime = params => {
  return commonApi.statApi.getLogInSpecifiedTime({
    devId: TYSdk.devInfo.devId,
    offset: 0,
    limit: 1000,
    sortType: 'DESC',
    ...params,
  });
};
