import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Toast, TYSdk, TYText, Utils, TopBar } from 'tuya-panel-kit';
import moment from 'moment';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { useNavigation } from '@react-navigation/native';
import TipModal from '@components/tipModal';
import { commonColor, dpCodes } from '@config';
import { useSelector, useDispatch } from 'react-redux';
import Res from '@res';
import { base64ListToUIList108, sleepString2Data, mergeSort } from '@utils';
import i18n from '@i18n';
import { forEach } from 'lodash';
import _deepClone from 'lodash/cloneDeep';
import { getDeviceCloudData, getLogInSpecifiedTime, saveDeviceCloudData } from '@api';
import Tip1 from './tip1';
import Tip2 from './tip2';
import Tip3 from './tip3';
import WorkRecord from './workRecord';

interface ChartItem {
  time: string;
  value: number;
  timeValue: number;
}
const {
  faultCode,
  workModeCode,
  sleepSwitchCode,
  setSleepPlanCode,
  cleanTimerSettingCode,
  powerModeCode,
  workStateCode,
} = dpCodes;
const { convertX: cx, isIphoneX } = Utils.RatioUtils;
const Home: React.FC = () => {
  const dispatch = useDispatch();
  const {
    [faultCode]: fault,
    [workModeCode]: workMode,
    [setSleepPlanCode]: sleepPlan,
    [sleepSwitchCode]: sleepSwitch,
    [powerModeCode]: powerMode,
    [workStateCode]: workState,
  } = useSelector(({ dpState }: any) => dpState);
  const { deviceOnline } = useSelector(({ devInfo }: any) => devInfo);

  const timer = useRef<any>(null);

  const [log7Days, setLog7Days] = useState(0);
  const [logToday, setLogToday] = useState(0);
  const [log7DaysList, setLog7DaysList] = useState([]);
  const [showTipModal, setShowTipModal] = useState(false);
  const [showTipModalPower, setShowTipModalPower] = useState(false);
  const [subTitle, setSubTitle] = useState('');
  const navigation = useNavigation();
  useEffect(() => {
    getTodayDpLog();
  }, []);

  useEffect(() => {
    if (!sleepSwitch && !workState) {
      return setSubTitle('');
    }
    if (workState && !sleepSwitch) {
      return setSubTitle(i18n.getLang('work_sleep'));
    }
    if (sleepSwitch && !workState) {
      const { startTime, endTime } = sleepString2Data(sleepPlan);
      const startTimeText = formatMinute2Hour(startTime);
      const endTimeText = formatMinute2Hour(endTime);
      const text = `${i18n.getLang('do_not_disturb')} ${startTimeText}~${endTimeText}`;
      return setSubTitle(text);
    }
    if (sleepSwitch && workState) {
      const text = `${i18n.getLang('work_sleep_and_no_disturb')}`;
      return setSubTitle(text);
    }
  }, [sleepSwitch, workState, sleepPlan]);

  useEffect(() => {
    setTimeout(() => {
      timer.current = setInterval(() => {
        getTodayDpLog();
      }, 12000);
    }, 1000);
    return () => {
      clearInterval(timer.current);
    };
  }, []);

  useEffect(() => {
    getReportDp();
  }, []);

  const getReportDp = async () => {
    const res = await getDeviceCloudData('washing_device');
    if (typeof res === 'object' && Object.keys(res).length === 0) {
      // 配网之后，下发清洗设备默认值，dp协议：3个Byte： 1：天数 2：小时 3：分钟；例如 07 - 0A - 00，表示7天后10点整，进行清洗报警。
      // 获取当前小时数
      const hour = moment().hour();
      // 获取当前分钟数
      const minute = moment().minute();
      const hourHex = hour.toString(16);
      const minuteHex = minute.toString(16);
      const dpData = `07${hourHex.padStart(2, '0')}${minuteHex.padStart(2, '0')}`;
      TYSdk.device.putDeviceData({
        [cleanTimerSettingCode]: dpData,
      });
      saveDeviceCloudData('washing_device', { value: '1' });
    }
  };

  const formatMinute2Hour = (minute: number) => {
    const hour = `${Math.floor(minute / 60)}`;
    const min = `${minute % 60}`;
    return `${hour.padStart(2, 0)}:${min.padStart(2, 0)}`;
  };

  const getWeekTime = () => {
    // 通过moment获取近7天的开始时间 startTimer 和结束时间 endTimer
    const now = moment();
    const startTime = now.clone().subtract(6, 'days').valueOf();
    const endTime = now.valueOf();
    return {
      startTime,
      endTime,
    };
  };

  const getTodayDpLog = async () => {
    // 通过moment获取今天的开始时间 startTimer 和结束时间 endTimer
    const { startTime, endTime } = getWeekTime();
    const res = await getLogInSpecifiedTime({
      dpIds: '108',
      startTime,
      endTime,
    });
    if (!res || !res?.dps.length) return;
    const list = res.dps;
    // 根据dp点选出对应列表数据
    try {
      const list108 = base64ListToUIList108(list);
      const list7Days = get7DaysList(list108);
      const todayString = moment().format('M-D');
      const todayItem = list7Days.find((item: ChartItem) => item.time === todayString);
      todayItem && setLogToday(todayItem.value);
      setLog7DaysList(list7Days);
      const count7Days = get7DaysCount(list7Days);
      setLog7Days(count7Days);
    } catch (error) {
      console.log('🚀 ~ file: index.tsx:102 ~ getDpLog ~ error:', error);
    }
  };

  const get7DaysList = (list: any[]) => {
    if (!list.length) return [];
    // 遍历list，根据list中item.value.day分类，把每一天的数据放到对应的数组中
    const list7Days: ChartItem[] = [];
    forEach(list, (item: any) => {
      const { day, month } = item.value;
      const timeText = `${month}-${day}`;
      // 找到list7Days中同一个time的数据，把value值相加
      const index = list7Days.findIndex((item: any) => item.time === timeText);
      if (index !== -1) {
        list7Days[index].value += 1;
      } else {
        list7Days.push({
          time: timeText,
          value: 1,
          timeValue: +moment(`${month}-${day}`).valueOf(),
        });
      }
    });
    // list7Days.sort((a: ChartItem, b: ChartItem) => a.timeValue - b.timeValue);
    // 定义以今天开始，前7天的时间数组，格式是'[M-D']
    const today = moment().format('M-D');
    const list7DaysTime = [today];
    for (let i = 1; i < 7; i++) {
      const time = moment().subtract(i, 'days').format('M-D');
      list7DaysTime.push(time);
    }
    // 遍历list7Days，如果item的time不在list7DaysTime中，则移除item
    const list7DaysFilter = list7Days.filter((item: ChartItem) =>
      list7DaysTime.includes(item.time)
    );
    // 遍历list7DaysTime，如果item的time不在list7Days中，则添加item
    list7DaysTime.forEach((item: string) => {
      const index = list7DaysFilter.findIndex((item2: ChartItem) => item2.time === item);
      if (index === -1) {
        list7DaysFilter.push({
          time: item,
          value: 0,
          timeValue: +moment(item).valueOf(),
        });
      }
    });
    const _sortList7Days = _deepClone(list7DaysFilter);
    // if (Platform.OS === 'android') {
    //   _sortList7Days.sort((a: ChartItem, b: ChartItem) => a.timeValue - b.timeValue);
    //   console.log('🚀 ~ file: index.tsx:201 ~ get7DaysList ~ _sortList7Days:', _sortList7Days);
    // } else {
    //   _sortList7Days = mergeSort(list7DaysFilter);
    //   console.log('🚀 ~ file: index.tsx:203 ~ get7DaysList ~ _sortList7Days:', _sortList7Days);
    // }
    _sortList7Days.sort((a: ChartItem, b: ChartItem) => a.timeValue - b.timeValue);
    // list7DaysFilter.sort((a: ChartItem, b: ChartItem) => a.timeValue - b.timeValue);
    const newList = mergeSort(list7DaysFilter);
    return newList;
  };

  const get7DaysCount = (list: ChartItem[]) => {
    if (!list.length) return 0;
    return list.reduce((pre: number, cur: ChartItem) => pre + cur.value, 0);
  };

  const getErrorBitmap2FaultList = (errorCode: number) => {
    // 1~5: pump_blocked：水泵堵塞提醒； filter_replace：滤芯更换提醒； clean_reminder：清洗提醒； low_battery：电池低电提醒； lack_water：缺水提醒；
    const errorCodeList = [1, 2, 3, 4, 5];
    // 用errorCodeList遍历errorCode获取对应位置是否有值，有值则返回对应的faultCode
    return errorCodeList
      .map((item: number) => {
        return Utils.NumberUtils.getBitValue(errorCode, item) === 1 ? item : 0;
      })
      .filter((item: number) => !!item);
  };

  const faultArr = +fault ? getErrorBitmap2FaultList(fault) : [];

  const tabData = [
    {
      key: 'continuous_mode',
      label: i18n.getLang('continuous_mode'),
      icon: Res.home_tab_0,
      iconOff: Res.home_tab_0_off,
      isActive: workMode === 'Sustain',
      onPress: () => {
        if (workState || !deviceOnline) return;
        if (powerMode === 'battery_power') {
          return setShowTipModalPower(true);
        }
        if (sleepSwitch) {
          setShowTipModal(true);
          return;
        }
        let workModeValue = 'Sustain';
        if (workMode === 'Sustain') {
          workModeValue = 'Stop';
        }
        if (['Intermittence', 'Induction', 'Mixed', 'Stop'].includes(workMode)) {
          workModeValue = 'Sustain';
        }
        TYSdk.device.putDeviceData({ [workModeCode]: workModeValue });
      },
      disabled: workState || sleepSwitch || powerMode === 'battery_power' || !deviceOnline,
    },
    {
      key: 'intermittence_mode',
      label: i18n.getLang('intermittence_mode'),
      icon: Res.home_tab_1,
      iconOff: Res.home_tab_1_off,
      isActive: ['Intermittence', 'Mixed'].includes(workMode),
      onPress: () => {
        if (workState || !deviceOnline) return;
        if (sleepSwitch) {
          setShowTipModal(true);
          return;
        }
        // Induction：感应出水模式 Intermittence：间歇出水模式 Mixed：间歇+感应出水模式 Sustain：持续出水模式 Stop：不出水模式
        let workModeValue = 'Intermittence';
        if (workMode === 'Induction') {
          workModeValue = 'Mixed';
        }
        if (workMode === 'Intermittence') {
          workModeValue = 'Stop';
        }
        if (workMode === 'Mixed') {
          workModeValue = 'Induction';
        }
        TYSdk.device.putDeviceData({ [workModeCode]: workModeValue });
      },
      disabled: workState || sleepSwitch || !deviceOnline,
    },
    {
      key: 'induction_mode',
      label: i18n.getLang('induction_mode'),
      icon: Res.home_tab_2,
      iconOff: Res.home_tab_2_off,
      isActive: ['Induction', 'Mixed'].includes(workMode),
      onPress: () => {
        if (workState || !deviceOnline) return;
        if (sleepSwitch) {
          setShowTipModal(true);
          return;
        }
        // Induction：感应出水模式 Intermittence：间歇出水模式 Mixed：间歇+感应出水模式 Sustain：持续出水模式 Stop：不出水模式
        let workModeValue = 'Induction';
        if (workMode === 'Intermittence') {
          workModeValue = 'Mixed';
        }
        if (workMode === 'Induction') {
          workModeValue = 'Stop';
        }
        if (workMode === 'Mixed') {
          workModeValue = 'Intermittence';
        }
        TYSdk.device.putDeviceData({ [workModeCode]: workModeValue });
      },
      disabled: workState || sleepSwitch || !deviceOnline,
    },
    {
      key: 'smart_settings',
      label: i18n.getLang('smart_settings'),
      icon: Res.smart_settings,
      iconOff: Res.smart_settings,
      onPress: () => {
        if (workState || !deviceOnline) return;
        navigation.navigate('smartSettings');
      },
      disabled: workState || !deviceOnline,
    },
  ];

  const faultNeedPressList = [
    1, // 便仓异常
    3, // 上盖异常
    5, // 滚筒异常
  ];

  const handleFaultPress = (item: number) => {};

  const renderItem = ({ item }) => {
    const disabled = !faultNeedPressList.includes(item);
    return (
      <View style={[styles.row, styles.center]} key={item}>
        <TouchableOpacity disabled={true} onPress={() => handleFaultPress(item)}>
          <Image source={Res.fault} style={styles.bannerIcon} resizeMode="stretch" />
        </TouchableOpacity>
        <TYText style={styles.title13}>{i18n.getDpLang(faultCode, item)}</TYText>
      </View>
    );
  };

  const getTipLabel = () => {
    const { startTime, endTime } = sleepString2Data(sleepPlan);
    const startTimeText = formatMinute2Hour(startTime);
    const endTimeText = formatMinute2Hour(endTime);
    return i18n.formatValue('do_not_disturb_sub_title', startTimeText, endTimeText);
  };

  return (
    <View style={styles.flex1}>
      <TopBar
        title={TYSdk.devInfo.name || ''}
        titleStyle={{ color: commonColor.mainText }}
        subTitle={subTitle}
        subTitleStyle={{ color: commonColor.mainText, fontSize: cx(13) }}
        background="transparent"
        onBack={() => TYSdk.native.back()}
        actions={[
          {
            source: Res.device_info,
            contentStyle: styles.topBarAction,
            color: commonColor.mainText,
            onPress: () => TYSdk.native.showDeviceMenu(),
          },
          {
            source: Res.setting,
            contentStyle: styles.topBarAction1,
            color: commonColor.mainText,
            onPress: () => {
              if (!deviceOnline || workState) {
                return;
              }
              navigation.navigate('setting');
            },
          },
        ]}
      />
      <ScrollView style={styles.flex1}>
        <View style={[styles.topView, styles.center]}>
          <Image source={Res.product} style={styles.product} />
          <Tip1 deviceOnline={deviceOnline} workState={workState} />
          <Tip2 deviceOnline={deviceOnline} workState={workState} />
          <Tip3 deviceOnline={deviceOnline} workState={workState} />
        </View>
        {faultArr.length > 1 ? (
          <View style={styles.carouselView}>
            <Carousel
              autoplay={true}
              autoplayInterval={3000}
              loop={true}
              loopClonesPerSide={5}
              data={faultArr}
              renderItem={renderItem}
              sliderWidth={cx(280)}
              itemWidth={cx(280)}
              containerCustomStyle={{ marginBottom: cx(18) }}
            />
          </View>
        ) : null}

        {faultArr.length === 1 ? (
          <View style={[styles.row, styles.center, { height: cx(50), marginTop: -cx(20) }]}>
            <TouchableOpacity
              disabled={!faultNeedPressList.includes(faultArr[0])}
              onPress={() => handleFaultPress(faultArr[0])}
            >
              <Image source={Res.fault} style={styles.bannerIcon} resizeMode="stretch" />
            </TouchableOpacity>
            <TYText style={styles.title13}>{i18n.getDpLang(faultCode, `${faultArr[0]}`)}</TYText>
          </View>
        ) : null}

        <View style={styles.recordBanner}>
          <TYText style={styles.title13}>{i18n.getLang('drink_statistics')}</TYText>
          <View style={[styles.rowSpw, { marginTop: cx(16) }]}>
            <View style={styles.bannerItem}>
              <TYText style={styles.title12}>{i18n.getLang('today_drink_count')}</TYText>
              <TYText style={styles.text20}>
                {logToday}
                <TYText style={styles.text15}>{i18n.getLang('count_unit')}</TYText>
              </TYText>
            </View>
            <View style={styles.bannerItem}>
              <TYText style={styles.title12}>{i18n.getLang('week_drink_count')}</TYText>
              <View style={styles.row}>
                <View style={styles.row}>
                  <TYText style={styles.text20}>
                    {log7Days}
                    <TYText style={styles.text15}>{i18n.getLang('count_unit')}</TYText>
                  </TYText>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={{ marginBottom: cx(50) }}>
          <WorkRecord data={log7DaysList} />
        </View>
      </ScrollView>
      <View style={styles.bottomView}>
        {tabData.map(item => {
          const { disabled } = item;
          return (
            <TouchableOpacity activeOpacity={0.65} key={item.key} onPress={item.onPress}>
              <TouchableOpacity
                activeOpacity={0.65}
                style={[styles.tabItem, { opacity: disabled ? 0.45 : 1 }]}
                onPress={item.onPress}
                disabled={disabled}
              >
                <Image source={item.isActive ? item.icon : item.iconOff} style={styles.itemImage} />
                <TYText align="center" style={styles.itemText}>
                  {item.label}
                </TYText>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </View>
      <TipModal
        isVisibleModal={showTipModal}
        title={i18n.getLang('do_not_disturb')}
        subTitle={getTipLabel()}
        icon={Res.common_icon_No_disturbing}
        onConfirm={() => {
          setShowTipModal(false);
        }}
        confirmText={i18n.getLang('got_it')}
        cancelText={i18n.getLang('go_setting')}
        onCancel={() => {
          setShowTipModal(false);
          navigation.navigate('smartSettings');
        }}
      />
      <TipModal
        isVisibleModal={showTipModalPower}
        title={i18n.getLang('battery_power_disabled')}
        onConfirm={() => {
          setShowTipModalPower(false);
        }}
        confirmText={i18n.getLang('got_it')}
      />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowSpw: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topView: {
    marginTop: cx(16),
  },
  topBarAction: {
    width: cx(26),
    height: cx(26),
    marginRight: cx(6),
  },
  topBarAction1: {
    width: cx(26),
    height: cx(26),
    marginRight: cx(11),
  },
  carouselView: {
    justifyContent: 'center',
    alignItems: 'center',
    width: cx(375),
  },
  title13: {
    fontSize: cx(13),
    fontWeight: 'bold',
    color: '#49362F',
  },
  text15: {
    fontSize: cx(15),
    color: '#49362F',
  },
  title12: {
    fontSize: cx(12),
    color: '#968E87',
    marginBottom: cx(4),
  },
  text20: {
    fontSize: cx(20),
    color: '#49362F',
  },
  bannerItem: {
    flex: 1,
  },
  product: {
    width: cx(285),
    height: cx(285),
  },
  recordBanner: {
    marginHorizontal: cx(15),
    width: cx(345),
    // height: cx(108),
    borderRadius: cx(13),
    backgroundColor: '#fff',
    paddingHorizontal: cx(15),
    paddingVertical: cx(18),
    shadowColor: '#ddd',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomView: {
    width: cx(375),
    height: isIphoneX ? cx(130) : cx(124),
    shadowColor: '#ddd',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    backgroundColor: '#fff',
    borderTopRightRadius: cx(15),
    borderTopLeftRadius: cx(15),
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: cx(16),
    paddingTop: cx(14),
  },
  tabItem: {
    width: cx(70),
    alignItems: 'center',
    shadowColor: '#999',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  itemImage: {
    width: cx(64),
    height: cx(64),
    marginBottom: cx(0),
  },
  itemText: {
    fontSize: cx(14),
    color: '#49362F',
  },
  bannerIcon: {
    width: cx(15),
    height: cx(15),
    marginRight: cx(5.5),
  },
});
