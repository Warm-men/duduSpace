/* eslint-disable no-shadow */
import { DRY_KEY, commonColor, commonStyles, cx, dpCodes, width } from '@config';
import i18n from '@i18n';
import Res from '@res';
import React, { useEffect, useState } from 'react';
import { DeviceEventEmitter, Image, StyleSheet, View } from 'react-native';
import { TYSdk, TYText } from 'tuya-panel-kit';
import moment from 'moment';
import { actions, useSelector } from '@models';
import { getDeviceCloudData, getStatByDP } from '@api';
import { decodeDry, decodeMealPlan, formatEatTime, getFaultStrings, getIsFault } from '@utils';
import { useDispatch } from 'react-redux';
import Tip from './tip';
import useInterval from '../../hooks/useInterval';

const OUTPUT_STAT = [
  {
    title: 'plan_output',
    valueKey: 'plan',
    unit: 'unit_copies',
    color: commonColor.brown,
  },
  {
    title: 'outputed',
    valueKey: 'output',
    unit: 'unit_copies',
    color: commonColor.green,
  },
];

const EAT_STAT = [
  {
    title: 'today_eat',
    valueKey: 'todayEat',
    unit: 'unit_time',
    color: commonColor.mainText,
  },
  {
    title: 'eat_total',
    minValueKey: 'minutes',
    minUnit: 'unit_minutes',
    secValueKey: 'seconds',
    secUnit: 'unit_seconds',
  },
];

const {
  child_lock,
  desiccant: desiccantCode,
  auto_lock_enable,
  fault: faultCode,
  meal_plan,
  feed_report,
  cat_close_time,
  enter_sleep,
} = dpCodes;

const Content: React.FC = () => {
  const dispatch = useDispatch();
  const schema = useSelector(state => state.devInfo.schema);
  const dpState = useSelector(state => state.dpState);
  const {
    [child_lock]: childLock,
    [desiccantCode]: desiccant,
    [auto_lock_enable]: autoLockEnable,
    [faultCode]: fault,
    [meal_plan]: mealPlan,
    [enter_sleep]: enterSleep,
  } = dpState;

  const [dryInfo, setDryInfo] = useState({});
  const [faultList, setFaultList] = useState([]);
  const [curFault, setCurFault] = useState(0);
  const [outputPlan, setOutputPlan] = useState(0);
  const [outPuted, setOutPuted] = useState(0);
  const [eatTotal, setEatTotal] = useState(0);
  const [eatTimes, setEatTimes] = useState({});

  useEffect(() => {
    // 初次调用
    getOutputInfo();
    // getEatStat();
    let timer = setInterval(() => {
      getOutputInfo();
      // getEatStat();
    }, 1000 * 15);

    return () => {
      clearInterval(timer);
      timer = null;
    };
  }, []);

  useEffect(() => {
    getDryInfo();
    const subscription = DeviceEventEmitter.addListener(DRY_KEY, () => {
      getDryInfo();
    });

    return () => {
      subscription && subscription.remove();
    };
  }, [desiccant]);

  useEffect(() => {
    getFaultList();
  }, [fault]);

  useEffect(() => {
    getGrainInfo();
  }, [mealPlan]);

  // 获取干燥剂内容
  const getDryInfo = async () => {
    const data = await getDeviceCloudData(DRY_KEY);
    console.log('getDryInfo==', data);
    if (Object.keys(data).length > 0) {
      const current = moment().startOf('day');
      const recordTime = moment(data.time).startOf('day');
      const days = current.diff(recordTime, 'days');

      const { period = 0 } = decodeDry(data.dryData);
      const cycleDays = days - period;

      const newDryInfo = {
        day: Math.abs(cycleDays),
        isOverdue: cycleDays > 0,
        dryData: data.dryData,
      };
      setDryInfo(newDryInfo);
      dispatch(actions.common.updateRecord({ dryAgent: newDryInfo }));
    }
  };

  // 获取故障数据
  const getFaultList = () => {
    const faults = getFaultStrings(faultCode, fault, true, false) || [];
    console.log('faults===', faults);
    // if (!dryInfo.isOverdue && dryInfo.day < 7) {
    //   faults.push(i18n.formatValue('dryAgentLow7', dryInfo.day));
    // }

    setFaultList(faults);
    setCurFault(0);
  };

  // 获取当前故障
  const getCurFault = () => {
    const current = curFault + 1;
    setCurFault(current < faultList.length ? current : 0);
  };
  useInterval(getCurFault, faultList.length > 1 ? 1000 * 2 : null);

  // 获取出粮计划数据
  const getGrainInfo = () => {
    const plan = decodeMealPlan(mealPlan);
    const day = moment().day();

    let outPut = 0;
    plan.forEach(item => {
      if ((+item.repeatStr[day] || item.repeatStr === '0000000') && item.switchValue) {
        outPut += item.parts;
      }
    });

    setOutputPlan(outPut);
  };

  // 获取已出粮数据
  const getOutputInfo = async () => {
    const data = await getStatByDP({
      dpId: schema[feed_report].id,
      date: moment().format('YYYYMMDD'),
    });

    let output = 0;
    (Object.keys(data) || []).forEach(item => {
      if (data[item] !== '#') {
        output += +data[item];
      }
    });

    setOutPuted(output);
  };

  // 获取进食统计数据
  const getEatStat = () => {
    const { scale, id } = schema[cat_close_time];
    getStatByDP({
      dpId: id,
      date: moment().format('YYYYMMDD'),
    }).then(data => {
      console.log('res1===', data);

      let timeData = 0;
      (Object.keys(data) || []).forEach(item => {
        if (data[item] !== '#') {
          timeData += formatEatTime(data[item]);
        }
      });

      const minutes = Math.floor(timeData / 60);
      const seconds = timeData - minutes * 60;

      setEatTimes({ minutes, seconds });
    });
    getStatByDP({
      dpId: id,
      date: moment().format('YYYYMMDD'),
      type: 'count',
    }).then(data => {
      console.log('res2===', data);
      let count = 0;
      (Object.keys(data) || []).forEach(item => {
        if (data[item] !== '#') {
          count += formatEatTime(data[item]);
        }
      });
      setEatTotal(count);
    });
  };

  const grainStatus = getIsFault(faultCode, fault, 'pet_food_shortages');
  const grainOutStatus = getIsFault(faultCode, fault, 'pet_food_jam');
  const outputInfo = { plan: outputPlan, output: outPuted };
  const eatInfo = { ...eatTimes, todayEat: eatTotal };

  // 渲染干燥剂更换提示框
  const renderDryTip = () => {
    if (Object.keys(dryInfo).length <= 0) {
      return (
        <Tip
          title={i18n.getLang('dry')}
          subTitle={i18n.getLang('noDry')}
          style={{ position: 'absolute', top: cx(44), left: cx(22) }}
          boxStyle={{ flexDirection: 'column' }}
          subTitleStyle={{ color: commonColor.red }}
          onPress={() => TYSdk.Navigator.push({ id: 'dryAgent' })}
          lineStyle={{
            position: 'absolute',
            top: cx(31),
            left: cx(105),
            width: width / 2 - cx(82),
            height: cx(44),
          }}
          isHDirect={true}
          isVDirect={false}
        />
      );
    }

    const tipText = (
      <TYText size={cx(14)} color="#7C7269">
        {`${i18n.getLang(dryInfo.isOverdue ? 'overdueTime1' : 'remainTime1')} `}
        <TYText size={cx(12)} color={dryInfo.isOverdue ? commonColor.red : commonColor.green}>
          {dryInfo.day}
        </TYText>
        {` ${i18n.getLang(dryInfo.isOverdue ? 'overdueTime2' : 'remainTime2')}`}
      </TYText>
    );

    return (
      <Tip
        title={i18n.getLang('dry')}
        subTitle={tipText}
        style={{ position: 'absolute', top: cx(44), left: cx(22) }}
        boxStyle={{ flexDirection: 'column' }}
        onPress={() => TYSdk.Navigator.push({ id: 'dryAgent' })}
        lineStyle={{
          position: 'absolute',
          top: cx(31),
          left: cx(105),
          width: width / 2 - cx(82),
          height: cx(44),
        }}
        isHDirect={true}
        isVDirect={false}
      />
    );
  };

  // 渲染统计内容
  const renderStat = (title, data = [], dataObj = {}) => {
    return (
      <View style={[commonStyles.shadow, styles.statBox]}>
        <TYText size={cx(13)} color={commonColor.mainText} weight={500}>
          {i18n.getLang(title)}
        </TYText>
        <View style={[commonStyles.flexRowBetween, styles.statInfo]}>
          {data.map(item => (
            <View key={item.title} style={{ width: '50%' }}>
              <TYText size={cx(12)} color={commonColor.subText} weight={500}>
                {i18n.getLang(item.title)}
              </TYText>
              {item.valueKey !== undefined ? (
                <View style={[commonStyles.flexRow, styles.statNumBox]}>
                  <TYText color={item.color} size={cx(20)} weight={600}>
                    {dataObj[item.valueKey] || 0}
                  </TYText>
                  <TYText style={styles.unit}>{i18n.getLang(item.unit)}</TYText>
                </View>
              ) : (
                <View style={[commonStyles.flexRow, styles.statNumBox]}>
                  <TYText color={commonColor.mainText} size={cx(20)} weight={600}>
                    {dataObj[item.minValueKey] || 0}
                  </TYText>
                  <TYText style={styles.unit}>{i18n.getLang(item.minUnit)}</TYText>
                  <TYText color={commonColor.mainText} size={cx(20)} weight={600}>
                    {dataObj[item.secValueKey] || 0}
                  </TYText>
                  <TYText style={styles.unit}>{i18n.getLang(item.secUnit)}</TYText>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[commonStyles.flexRowCenter, styles.content]}>
        <Image source={Res.productLogo} style={styles.img} />
        <View style={styles.contentBox}>
          {renderDryTip()}
          {autoLockEnable && (
            <Tip
              title={i18n.getDpLang(child_lock, childLock)}
              subTitle={i18n.getLang(`dp_child_lock_${childLock ? 'on' : 'off'}_desc`)}
              style={{ position: 'absolute', bottom: cx(78), left: cx(22) }}
              boxStyle={{ flexDirection: 'column', opacity: enterSleep ? 0.8 : 1 }}
              // subTitleStyle={{ textAlign: 'center' }}
              disabled={enterSleep}
              onPress={() => TYSdk.device.putDeviceData({ [child_lock]: !childLock })}
              lineStyle={{
                position: 'absolute',
                bottom: cx(104),
                left: cx(105),
                width: width / 2 - cx(98),
                height: cx(28),
              }}
              isHDirect={true}
              isVDirect={false}
            />
          )}
          {/* <Tip
            title={i18n.getLang('grain')}
            subTitle={i18n.getLang(grainStatus ? 'grainAnomaly' : 'grainNormal')}
            style={{ position: 'absolute', top: cx(22), right: cx(24) }}
            subTitleStyle={{
              marginLeft: cx(3),
              color: grainStatus ? commonColor.red : commonColor.green,
            }}
            disabled={true}
            lineStyle={{
              position: 'absolute',
              top: cx(40),
              right: cx(108),
              width: width / 2 - cx(145),
              height: cx(45),
            }}
            boxStyle={{ flexWrap: 'wrap' }}
            isHDirect={false}
            isVDirect={true}
          /> */}
          {/* <Tip
            title={i18n.getLang('grainOut')}
            subTitle={i18n.getLang(grainOutStatus ? 'grainOutAnomaly' : 'grainOutNormal')}
            style={{ position: 'absolute', bottom: cx(100), left: cx(15) }}
            subTitleStyle={{
              marginLeft: cx(3),
              color: grainOutStatus ? commonColor.red : commonColor.green,
              textAlign: 'center',
            }}
            disabled={true}
            lineStyle={{
              position: 'absolute',
              bottom: cx(78),
              left: cx(95),
              width: width / 2 - cx(106),
              height: cx(38),
            }}
            boxStyle={{ flexWrap: 'wrap' }}
            isHDirect={true}
            isVDirect={true}
          /> */}
        </View>
      </View>

      {/* 故障显示 */}
      {faultList.length > 0 && (
        <View style={styles.faultBox}>
          <View style={commonStyles.flexRowCenter}>
            <Image source={Res.warn} style={{ width: cx(15), height: cx(15) }} />
            <TYText style={styles.faulTYText}>{faultList[curFault]}</TYText>
          </View>
        </View>
      )}

      {renderStat('output_stat', OUTPUT_STAT, outputInfo)}
      {/* {renderStat('eat_stat', EAT_STAT, eatInfo)} */}
    </View>
  );
};

export default Content;

const styles = StyleSheet.create({
  container: {
    paddingTop: cx(15),
    paddingBottom: cx(15),
    width: '100%',
  },
  content: {
    position: 'relative',
    width: '100%',
    height: cx(285),
  },
  contentBox: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  img: {
    width: cx(285),
    height: cx(285),
  },
  faultBox: {
    marginBottom: cx(15),
    paddingHorizontal: cx(14),
  },
  faulTYText: {
    maxWidth: width - cx(48.5),
    marginLeft: cx(5.5),
    color: commonColor.mainTYText,
    fontSize: cx(14),
    lineHeight: cx(18),
  },
  statBox: {
    marginTop: cx(15),
    marginLeft: cx(12),
    marginRight: cx(17),
    paddingVertical: cx(20),
    paddingHorizontal: cx(14),
    width: width - cx(29),
    borderRadius: cx(10),
  },
  statInfo: {
    marginTop: cx(20),
  },
  statNumBox: {
    marginTop: cx(5),
    alignItems: 'flex-end',
  },
  unit: {
    marginLeft: cx(3),
    fontSize: cx(12),
    lineHeight: cx(20),
    color: commonColor.mainText,
  },
});
