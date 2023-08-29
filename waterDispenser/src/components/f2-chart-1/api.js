/* eslint-disable import/prefer-default-export */
import { TYSdk } from 'tuya-panel-kit';

const getOssUrl = function() {
  return TYSdk.apiRequest('tuya.m.app.panel.url.get', {});
};

export { getOssUrl };
