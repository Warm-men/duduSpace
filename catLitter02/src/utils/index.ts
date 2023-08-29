/* eslint-disable import/prefer-default-export */
import { Utils } from 'tuya-panel-kit';
import { Base64 } from 'js-base64';
import { store } from '../models';
import Strings from '../i18n';

export const getFaultStrings = (faultCode: string, faultValue: number, onlyPrior = true) => {
  const { devInfo } = store.getState();
  if (!faultValue) return '';
  const { label } = devInfo.schema[faultCode];
  const labels: string[] = [];
  for (let i = 0; i < label!.length; i++) {
    const value = label![i];
    const isExist = Utils.NumberUtils.getBitValue(faultValue, i);
    if (isExist) {
      labels.push(Strings.getDpLang(faultCode, value));
      if (onlyPrior) break;
    }
  }
  return onlyPrior ? labels[0] : labels.join(', ');
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

/**
 * Data[0]:滚筒模式 0-手动清理 1-定时清理 2-自动清理 3-倾倒猫砂 4-平整猫砂 5-复位
 * Data[1]: 0-待机 1-异常暂停 2-人为暂停 3-执行中 4-失败 5--完成
 * Data[2]:错误原因 0：正常 1：便仓未到位 2：便仓已满 3：上盖异常 4：猫进入 5：滚筒无法到位 6：猫靠近 7： 计划时间冲突
 * Data[3]:关联106时间戳
 *
 * @param str
 * @returns
 **/

const RollerStateList = ['rollerMode', 'rollerState', 'errorCode', 'timerDrop'];
export const getUploadRollerState = (string: string) => {
  if (string.length % 2 !== 0) {
    return { rollerMode: 0, rollerState: 0, errorCode: 0, timerDrop: 0 };
  }
  const obj = {};
  let i = 0;
  RollerStateList.forEach(id => {
    let str = string.slice(i, i + 2);
    obj[id] = str ? parseInt(str, 16) : 0;
    if (id === 'errorCode') {
      str = string.slice(i, i + 4);
      obj[id] = str ? parseInt(str, 16) : 0;
      i += 4;
    } else {
      i += 2;
    }
  });
  return obj;
};

interface SleepData {
  startTime: number;
  endTime: number;
}

export const sleepData2String = (data: SleepData) => {
  const { startTime, endTime } = data;
  const startH = Math.floor(startTime / 60);
  const startM = startTime % 60;
  const endH = Math.floor(endTime / 60);
  const endM = endTime % 60;
  const startStr = startH.toString(16).padStart(2, '0') + startM.toString(16).padStart(2, '0');
  const endStr = endH.toString(16).padStart(2, '0') + endM.toString(16).padStart(2, '0');
  return startStr + endStr;
};

export const sleepString2Data = (str: string) => {
  if (str.length !== 8) {
    return {
      startTime: 0,
      endTime: 0,
    };
  }
  const obj: SleepData = {
    startTime: 0,
    endTime: 0,
  };
  obj.startTime = parseInt(str.slice(0, 2), 16) * 60 + parseInt(str.slice(2, 4), 16);
  obj.endTime = parseInt(str.slice(4, 6), 16) * 60 + parseInt(str.slice(6, 8), 16);
  return obj;
};
/**
 * Data[0]:设置还是清除 1设置 0清除全部计划
 * Data[1]:星期，bit数据，0位是周一，最后一位是周日: 0000000 从左到右 依次为 周一 周二 周三 周四 周五 周六 周日
 * Data[2]:小时
 * Data[3]:分钟
 * Data[4]:是否开启 0：关闭 1:开启
 * 每4个bytes 为一个计划 以此类推,最多10条
 * @param data
 */

interface CleanPlanData {
  repeat: string;
  hour: number;
  minute: number;
  open?: boolean;
}

export const data2cleanPlanString = (data: CleanPlanData) => {
  const { repeat, hour, minute } = data;
  const repeatStr = repeat.split('').reverse().join('');
  const repeatHex = parseInt(repeatStr, 2).toString(16).padStart(2, '0');
  const hourHex = hour.toString(16).padStart(2, '0');
  const minuteHex = minute.toString(16).padStart(2, '0');
  const openHex = '01';
  return repeatHex + hourHex + minuteHex + openHex;
};

export const cleanPlanString2Data = (str: string) => {
  const obj: CleanPlanData = {
    repeat: '0000000',
    hour: 0,
    minute: 0,
  };
  const repeat = parseInt(str.slice(0, 2), 16)
    .toString(2)
    .padStart(7, '0')
    .split('')
    .reverse()
    .join('');
  const hour = parseInt(str.slice(2, 4), 16);
  const minute = parseInt(str.slice(4, 6), 16);
  obj.repeat = repeat;
  obj.hour = hour;
  obj.minute = minute;
  return obj;
};

/**
 * planString: 清理计划字符串
 * data[0]: 默认设置为1，固定写死，不需要解析
 * data[1]:星期，bit数据，0位是周一，最后一位是周日: 0000000 从左到右 依次为 周一 周二 周三 周四 周五 周六 周日
 * data[2]:小时
 * data[3]:分钟
 * data[4]:是否开启 0：关闭 1:开启
 * data1-4 为一个计划，以此类推，最多10条
 * @param planString
 * @return: [CleanPlanData]
 */
export const decodeCleanPlan = (planString: string) => {
  if (!planString) return [];
  const planList = [];
  const planValueString = planString.slice(2);
  for (let i = 0; i < planValueString.length; i += 8) {
    const planValue = planValueString.slice(i, i + 8);
    const planData = cleanPlanString2Data(planValue);
    planList.push(planData);
  }
  return planList;
};
export const encodeCleanPlan = (planList: CleanPlanData[]) => {
  if (!planList.length) return '00'; // 00 代表清除所有计划
  let planString = '';
  planList.forEach(plan => {
    planString += data2cleanPlanString(plan);
  });
  return `01${planString}`;
};

// base64转16进制
const base64toHEX = (base64: string) => {
  const raw = decodeURIComponent(Base64.decode(base64));
  const HEX = [];
  for (let i = 0; i < raw.length; i++) {
    const _hex = raw.charCodeAt(i).toString(16);
    HEX.push(_hex.length === 2 ? _hex : `0${_hex}`);
  }
  return HEX.join('');
};

// dp 106协议
// Data[0]：排泄时长(分钟) Data[1]：排泄时长(秒钟)

// dp 127协议
// Data[0]: 滚简模式 0-待机模式 1-手动清理 2-定时清理 3-自动清理 4-倾倒猫砂 5-平整猫砂 6--手动清理复位 7--定时清理复位 8--自动清理复位 9--倾倒猫砂复位 10-平整猫砂复位 11-其它复位(故障复位)
// Data[1]: 0-待机 1-异常暂停 2-人为暂停 3-执行中 4-停止失败 5-操作完成 (遇到故障暂停) (APP操作暂停) 恢复执行) (超10分钟操作停止)(10分钟内继续执行)
// Data[2]: 错误原因 0:正常 1:便仓未到位 28便仓已满 3上稼伯镇彩碍挨熬辫隘异常 猫进入 5滚筒无法到位 6猫靠近 7:计划时间冲突
// Data[3]--Data[8] 是猫如厕的时间，如果是非自动清理模式，则填充0 （以记录型的DP上报）

// 新的dp127协议
// Data[0]: 滚简模式 0-待机模式 1-手动清理 2-定时清理 3-自动清理 4-倾倒猫砂 5-平整猫砂 6--手动清理复位 7--定时清理复位 8--自动清理复位 9--倾倒猫砂复位 10-平整猫砂复位 11-其它复位(故障复位)
// Data[1]: 0-待机 1-异常暂停 2-人为暂停 3-执行中 4-停止失败 5-操作完成 (遇到故障暂停) (APP操作暂停) 恢复执行) (超10分钟操作停止)(10分钟内继续执行)
// Data[2-3]: 错误原因 0:正常 1:便仓未到位 2:便仓已满 3:上盖异常 4：猫进入 5：滚筒无法到位 6：猫靠近 7：马达堵转 8：计划时间冲突
// Data[4-9] 是猫如厕的时间
// Data[10-11]如果是非自动清理模式，则填充0 最后二个字节为当面电机的ADC采集值。
// （以记录型的DP上报）

const dpFormat = {
  127: ['mode', 'status', 'error', 'year', 'month', 'day', 'hour', 'minute', 'second'],
  106: ['minute', 'second'],
};

const dpStringLen = {
  127: 24,
  106: 4,
};

/**
 * @param: HEX: 16进制字符串
 * @return: 10进制字符串
 **/
export const hexTo10 = (HEX: string) => {
  return parseInt(HEX, 16);
};

/**
 * @param: dec: 10进制字符串, formatObject: 格式化对象
 * @return: targetObject: 格式化后的对象
 * */

export const formatDec = (
  dpString: string,
  formatObject: string[],
  dpStringLen: number,
) => {
  // 将dec字符串转换成2个字符串为一组的数组
  if (!dpString || dpString.length < dpStringLen) return {};
  // 截取dpString的前12个字符
  const targetObject = {};
  // 如果key是error，则取两个字符，否则取一个字符
  let i = 0;
  formatObject.forEach((key: string) => {
    let value = dpString.slice(i, i + 2);
    let step = 2;
    if (key === 'error') {
      value = dpString.slice(i, i + 4);
      step = 4;
    }
    targetObject[key] = hexTo10(value);
    i += step;
  });
  return targetObject;
};

interface DpListItem {
  dpId: number;
  value: any;
  timeStamp: number;
  timeStr: string;
}
/**
 * 通过base64toHEX方法将base64字符串数组转换为16进制字符串数组
 * @param: list: base64字符串数组
 * @return: dp协议解析数组
 **/
export const base64ListToUIList = (list: DpListItem[], dpId: number) => {
  if (!list.length) return [];
  const hexList: DpListItem[] = [];
  list.forEach(item => {
    // 新的dp127协议不需要转换，raw改成string型dp上报
    const dpString = dpId === 127 ? item.value : base64toHEX(item.value);
    const dpObject = formatDec(dpString, dpFormat[dpId], dpStringLen[dpId]);
    const newItem = { ...item, value: dpObject };
    hexList.push(newItem);
  });
  return hexList;
};
