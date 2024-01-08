/* eslint-disable array-callback-return */
/* eslint-disable import/prefer-default-export */
import { TYSdk, Utils } from 'tuya-panel-kit';
import { DryAgent, EatResult, MealPlan } from '@config';
import _ from 'lodash';
import { Base64 } from 'js-base64';
import { store } from '../models';
import Strings from '../i18n';

const { toFixed } = Utils.CoreUtils;

export const getFaultStrings = (
  faultCode: string,
  faultValue: number,
  isDesc = true,
  onlyPrior = true
) => {
  const { devInfo } = store.getState();
  if (!faultValue) return '';
  const { label } = devInfo.schema[faultCode];
  const labels: string[] = [];
  for (let i = 0; i < label!.length; i++) {
    const value = label![i];
    const isExist = Utils.NumberUtils.getBitValue(faultValue, i);
    if (isExist) {
      labels.push(Strings.getDpLang(faultCode, `${value}${isDesc ? '_desc' : ''}`));
      if (onlyPrior) break;
    }
  }
  return onlyPrior ? labels[0] : labels;
};

export const getIsFault = (faultCode: string, faultValue: number, code: string) => {
  const { devInfo } = store.getState();
  if (!faultValue) return false;
  const { label } = devInfo.schema[faultCode];
  const labels: string[] = [];
  for (let i = 0; i < label!.length; i++) {
    const value = label![i];
    const isExist = Utils.NumberUtils.getBitValue(faultValue, i);
    if (isExist && value === code) {
      return true;
    }
  }
  return false;
};

export const getRepeatStr = (source: string) => {
  if (!source) return '';
  const days: any[] = [];
  let repeat = '';
  source.split('').map((item, index) => {
    if (item === '1') {
      days.push(Strings.getLang(`week${index}`));
    }
  });
  if (days.length === 0) {
    repeat = Strings.getLang('dayOnce');
  } else if (days.length === 7) {
    repeat = Strings.getLang('dayEvery');
  } else if (days.length === 5 && source.substring(1, 6) === '11111') {
    repeat = Strings.getLang('weekDays');
  } else if (days.length === 2 && source.startsWith('1') && source.endsWith('1')) {
    repeat = Strings.getLang('weekend');
  } else {
    repeat = days.join(' ');
  }
  return repeat;
};

const base64toHEX = (base64: string) => {
  let raw = '';
  try {
    raw = decodeURIComponent(Base64.decode(base64));
  } catch (error) {
    // if decodeURIComponent error, use Base64.decode
    raw = Base64.decode(base64);
  }
  const HEX = [];
  for (let i = 0; i < raw.length; i++) {
    const _hex = raw.charCodeAt(i).toString(16);
    HEX.push(_hex.length === 2 ? _hex : `0${_hex}`);
  }
  return HEX.join('');
};

// 文字编码下发
function encode(data: number[], num = 2) {
  const codeList = data.map(item => {
    const dataItem = item.toString(16).padStart(num, '0');
    return dataItem;
  });

  return codeList.join('');
}

// 解析设备上报
function decode(dataStr: string, num = 2) {
  const reg = new RegExp(`\\w{${num}}`, 'g');
  const res = dataStr.match(reg) || [];
  const resList = res.map((item: any) => parseInt(item, 16));

  return resList;
}

// 解码干燥剂更换提醒
export const decodeDry = (dryInfoStr: string): DryAgent => {
  if (!dryInfoStr) return { period: 30, time: { hours: 18, minutes: 0 } };
  const data = decode(dryInfoStr);
  return { period: data[0], time: { hours: data[1], minutes: data[2] } };
};

// 编码干燥剂更换提醒
export const encodeDry = (dryInfo: DryAgent): string => {
  const { period, time } = dryInfo;
  const data = [period, time.hours, time.minutes];

  return encode(data);
};

// 解码喂食计划
export const decodeMealPlan = (mealPlanStr: string): Array<MealPlan | undefined> => {
  if (!mealPlanStr || typeof mealPlanStr !== 'string' || mealPlanStr === '00') return [];
  const reg = new RegExp(`\\w{10}`, 'g');
  let mealPlan = mealPlanStr.match(reg) || [];
  // console.log('mealPlan==', mealPlan);
  mealPlan = mealPlan.map((singleStr, idx) => {
    const singleArr = decode(singleStr);
    const repeatStr = _.padStart(singleArr[0].toString(2), 7, '0');
    const sunday = repeatStr.slice(6);
    const otherDay = repeatStr.slice(0, 6);
    const planInfo = {
      repeatStr: `${sunday}${otherDay}`,
      timeStr: `${_.padStart(singleArr[1], 2, '0')}:${_.padStart(singleArr[2], 2, '0')}`,
      parts: singleArr[3],
      switchValue: !!singleArr[4],
      id: idx + 1,
    };

    return planInfo;
  });

  return mealPlan;
};

// 编码喂食计划
export const encodeMealPlan = (mealPlan: Array<MealPlan | undefined>): string => {
  let mealPlanStr = '';
  mealPlan.forEach((item: MealPlan) => {
    const { repeatStr, timeStr, parts, switchValue } = item;
    const sunday = repeatStr.slice(0, 1);
    const otherDay = repeatStr.slice(1);
    const newRepeatStr = parseInt(`${otherDay}${sunday}`, 2);
    const timeArr = timeStr.split(':').map(elem => Number(elem));
    const itemStr = encode([newRepeatStr, timeArr[0], timeArr[1], parts, Number(switchValue)]);
    mealPlanStr += itemStr;
  });
  console.log('mealPlanStr===', mealPlanStr);
  return !mealPlanStr ? '00' : mealPlanStr;
};

// 解码手动喂食/计划喂食结果上报
export const decodeEatResult = (data: string): EatResult => {
  if (!data) return {};
  const eatStr = base64toHEX(data);
  const dataArr = decode(eatStr.slice(0, 16), 8);
  const fault = decode(eatStr.slice(16));
  const eatObj = {
    parts: dataArr[0],
    planParts: dataArr[1],
    fault: fault[0],
  };

  return eatObj;
};

// 解析时间字符串为数组格式
export const timeStrToArr = (timerStr: string): number[] => {
  const timerArr = timerStr.split(':');
  return timerArr.map(item => +item);
};

// 解析时间数组格式为字符串
export const timeArrToStr = (timerArr: number[]): string => {
  const timerStrArr = timerArr.map(item => toFixed(item, 2));
  return timerStrArr.join(':');
};

// 获取小时/分钟数组
export const getHourOrMinuteArr = (type: string, is12Hours: boolean): IPickerValue[] => {
  let list = [];
  if (type === 'hour') {
    list = is12Hours
    ? _.times(12, n => ({
        value: n,
        label: toFixed(n === 0 ? 12 : n, 2),
      }))
    : _.times(24, n => ({
        value: n,
        label: toFixed(n, 2),
      }));
  } else {
    list = _.times(60, n => ({
      value: n,
      label: toFixed(n, 2),
    }));
  }
  return list;
};

// 格式化猫靠近时间
export const formatEatTime = data => {
  return +data * 10;
};
