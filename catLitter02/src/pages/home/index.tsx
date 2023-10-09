import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Toast, TYSdk, TYText, Utils, TopBar, Notification } from 'tuya-panel-kit';
import moment from 'moment';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { useNavigation } from '@react-navigation/native';
import { commonColor, dpCodes } from '@config';
import { useSelector, useDispatch } from 'react-redux';
import Res from '@res';
import String from '@i18n';
import { getUploadRollerState, base64ListToUIList, sleepString2Data } from '@utils';
import TipModal from '@components/tipModal';
// import { actions } from '@models';
import Tip1 from './tip1';
import Tip2 from './tip2';
import Tip3 from './tip3';
import Tip4 from './tip4';
import Tip5 from './tip5';
import StatusPopup from './statusPopup';
import WorkRecord from './workRecord';
import { getLogInSpecifiedTime } from '../../api';

const {
  faultCode,
  starRollerCode,
  uploadRollerStateCode,
  sleepSwitchCode,
  setSleepPlanCode,
  pirIndexCode,
} = dpCodes;
const { convertX: cx, isIphoneX } = Utils.RatioUtils;
const Home: React.FC = () => {
  const {
    [faultCode]: fault,
    [uploadRollerStateCode]: uploadRollerState,
    [sleepSwitchCode]: sleepSwitch,
    [setSleepPlanCode]: setSleepPlan,
    [pirIndexCode]: pirIndex,
  } = useSelector(({ dpState }: any) => dpState);

  const { deviceOnline } = useSelector(({ devInfo }: any) => devInfo);

  const navigation = useNavigation();
  const [successShow, setSuccessShow] = useState(false);
  const [failShow, setFailShow] = useState(false);
  const [successHint, setSuccessHint] = useState('');
  const [failHint, setFailHint] = useState('');
  const [toiletRecordList, setToiletRecordList] = useState([]);
  const [workRecordList, setWorkRecordList] = useState([]);
  const [isSleep, setIsSleep] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  // const [activeSlide, setActiveSlide] = useState(0);

  const timer = useRef<any>(null);

  useEffect(() => {
    if (!uploadRollerState) return;
    const uploadRollerStateData = getUploadRollerState(uploadRollerState);
    const { rollerMode, rollerState, errorCode } = uploadRollerStateData;
    // Data[0]:滚简模式 0-待机模式 1-手动清理 2-定时清理 3-自动清理 4-倾倒猫砂 5-平整猫砂 6--手动清理复位 7--定时清理复位 8--自动清理复位 9--倾倒猫砂复位 10-平整猫砂复位 11-其它复位(故障复位) 12-猫如厕模式
    // Data[1]:滚筒状态 0-待机、1-异常暂停、2-人为暂停、3-执行中、4-停止失败、5-操作完成、6-人为强制暂停、7-强制执行、8-强制执行停止失败、9-强制执行操作完成
    // Data[2]: 错误原因 0:正常 1:便仓未到位 2集便仓已满 3上盖异常 4猫进入 5滚筒无法到位 6猫靠近 7：马达堵转 8：计划时间冲突
    if ([5, 9].includes(rollerState) && errorCode === 0) {
      let hint = '';
      if (rollerMode === 1) hint = String.getLang('successHint_1_5_0'); // 手动清理完成
      if (rollerMode === 4) hint = String.getLang('successHint_4_5_0'); // 倾倒猫砂完成
      if (rollerMode === 5) hint = String.getLang('successHint_5_5_0'); // 平整猫砂完成
      if (!hint) return;
      setSuccessHint(hint);
      setSuccessShow(true);
    }
    if ([4, 8].includes(rollerState) && errorCode === 0) {
      let hint = '';
      if (rollerMode === 1) hint = String.getLang('successHint_1_4_0'); // 手动清理失败
      if (rollerMode === 4) hint = String.getLang('successHint_4_4_0'); // 倾倒猫砂失败
      if (rollerMode === 5) hint = String.getLang('successHint_5_4_0'); // 平整猫砂失败
      // 手动清理失败
      if (!hint) return;
      setFailHint(hint);
      setFailShow(true);
    }
  }, [uploadRollerState]);

  useEffect(() => {
    getTodayDpLog();
  }, []);

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

  const getTodayDpLog = async () => {
    // 通过moment获取今天的开始时间 startTimer 和结束时间 endTimer
    const startTime = moment().startOf('day').valueOf();
    const endTime = moment().endOf('day').valueOf();
    const res = await getLogInSpecifiedTime({
      dpIds: '127,106',
      startTime,
      endTime,
    });
    if (!res || !res?.dps.length) return;
    const dpsData = res.dps;
    // 根据dp点选出对应列表数据
    const list127 = dpsData.filter((item: any) => item.dpId === 127);
    const list106 = dpsData.filter((item: any) => item.dpId === 106);
    // 将base64转换为16进制
    try {
      const list127Hex = base64ListToUIList(list127, 127);
      const list106Hex = base64ListToUIList(list106, 106);
      setToiletRecordList(list106Hex);
      setWorkRecordList(list127Hex);
      // console.log('🚀 ~ file: index.tsx:100 ~ getDpLog ~ list106Hex:', list127Hex);
    } catch (error) {
      console.log('🚀 ~ file: index.tsx:127 ~ getDpLog ~ error:', error);
    }
  };

  const getErrorBitmap2FaultList = (errorCode: number) => {
    const errorCodeList = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    // 用errorCodeList遍历errorCode获取对应位置是否有值，有值则返回对应的faultCode
    return errorCodeList
      .map((item: number) => {
        return Utils.NumberUtils.getBitValue(errorCode, item) === 1 ? item : false;
      })
      .filter((item: number) => item);
  };

  // const faultArr = [1, 3, 5];
  const faultArr = +fault ? getErrorBitmap2FaultList(fault) : [];

  const isMotorStall = faultArr.includes(8);

  const showFaultModal = () => {
    Notification.show({
      message: String.getLang('fault_motor_stall'),
      onClose: () => {
        Notification.hide();
      },
      enableClose: false,
      autoCloseTime: 10000,
      theme: {
        successIcon: 'red',
        errorIcon: 'yellow',
        warningIcon: 'black',
      },
    });
  };
  const isFault2 = faultArr.includes(2);

  const showFault2Modal = () => {
    Notification.show({
      message: String.getLang('fall'),
      onClose: () => {
        Notification.hide();
      },
      enableClose: false,
      autoCloseTime: 2000,
      theme: {
        successIcon: 'red',
        errorIcon: 'yellow',
        warningIcon: 'black',
      },
    });
  };

  const tabData = [
    {
      key: 'clean',
      label: String.getLang('clean_now'),
      icon: Res.home_tab_clean,
      onPress: () => {
        if (!deviceOnline) return;
        if (isFault2) return showFault2Modal();
        if (isMotorStall) {
          return showFaultModal();
        }
        TYSdk.device.putDeviceData({ [starRollerCode]: 'manual_clean' });
      },
      disabled: isSleep,
    },
    {
      key: 'outwell',
      label: String.getLang('out_well'),
      icon: Res.home_tab_outwell,
      onPress: () => {
        if (!deviceOnline) return;
        if (isFault2) return showFault2Modal();
        if (isMotorStall) {
          return showFaultModal();
        }
        TYSdk.device.putDeviceData({ [starRollerCode]: 'pour_sand' });
      },
      disabled: isSleep,
    },
    {
      key: 'smooth',
      label: String.getLang('smooth'),
      icon: Res.home_tab_smooth,
      onPress: () => {
        if (!deviceOnline) return;
        if (isFault2) return showFault2Modal();
        if (isMotorStall) {
          return showFaultModal();
        }
        TYSdk.device.putDeviceData({ [starRollerCode]: 'smooth_sand' });
      },
      disabled: isSleep,
    },
    {
      key: 'settings',
      label: String.getLang('settings'),
      icon: Res.home_tab_setting,
      onPress: () => {
        if (!deviceOnline) return;
        navigation.navigate('smartSettings');
      },
      disabled: false,
    },
  ];

  const faultNeedPressList = [
    1, // 便仓异常
    3, // 上盖异常
    5, // 滚筒异常
  ];

  const handleFaultPress = (item: number) => {
    if (item === 1) {
      return navigation.navigate('warehouseStatus');
    }
    if (item === 3) {
      return navigation.navigate('upperCover');
    }
    if (item === 5) {
      return navigation.navigate('rollerInstall');
    }
  };

  const getToiletTimes = () => {
    return toiletRecordList.length;
  };

  // 获取今天上厕所的平均时间：分钟、秒
  const getToiletAvgMinute = () => {
    if (toiletRecordList.length === 0) return { minute: 0, second: 0 };
    const totalSecond = toiletRecordList.reduce((total, item) => {
      const { minute = 0, second = 0 } = item.value;
      return total + minute * 60 + second;
      // return total + item.value.second + item.value.minute * 60;
    }, 0);
    const avgDaySecond = totalSecond / toiletRecordList.length;
    return {
      minute: Math.floor(avgDaySecond / 60),
      second: +(avgDaySecond % 60).toFixed(1),
    };
  };

  const getCatCloseText = faultValue => {
    if (faultValue !== 6) return String.getDpLang(faultCode, faultValue);
    // 猫靠近时，需要加上pir_index dp进行位置判断
    if (typeof pirIndex !== 'number') return String.getDpLang(faultCode, faultValue);
    if ([1, 2, 8].includes(pirIndex)) {
      const textKey = `dp_fault_6_${pirIndex}`;
      return String.getLang(textKey);
    }
    return String.getDpLang(faultCode, faultValue);
  };

  const renderItem = ({ item }) => {
    const disabled = !faultNeedPressList.includes(item) || !deviceOnline;
    return (
      <View style={[styles.row, styles.center]} key={item}>
        <TouchableOpacity disabled={disabled} onPress={() => handleFaultPress(item)}>
          <Image source={Res.fault} style={styles.bannerIcon} resizeMode="stretch" />
        </TouchableOpacity>
        <TYText style={styles.title13}>{getCatCloseText(item)}</TYText>
      </View>
    );
  };

  const formatMinute2Hour = (minute: number) => {
    const hour = `${Math.floor(minute / 60)}`;
    const min = `${minute % 60}`;
    return `${hour.padStart(2, 0)}:${min.padStart(2, 0)}`;
  };

  const getTipLabel = () => {
    const { startTime, endTime } = sleepString2Data(setSleepPlan);
    const startTimeText = formatMinute2Hour(startTime);
    const endTimeText = formatMinute2Hour(endTime);
    return String.formatValue('do_not_disturb_sub_title', startTimeText, endTimeText);
  };

  return (
    <View style={styles.flex1}>
      <TopBar
        title={TYSdk.devInfo.name || ''}
        titleStyle={{ color: commonColor.mainText }}
        background="transparent"
        onBack={() => TYSdk.native.back()}
        actions={[
          {
            source: Res.device_info,
            contentStyle: {
              width: cx(26),
              height: cx(26),
              paddingRight: cx(6),
            },
            color: commonColor.mainText,
            onPress: () => TYSdk.native.showDeviceMenu(),
          },
          {
            source: Res.setting,
            contentStyle: {
              width: cx(26),
              height: cx(26),
              paddingRight: cx(11),
            },
            color: commonColor.mainText,
            onPress: () => {
              if (!deviceOnline) return;
              navigation.navigate('setting');
            },
          },
        ]}
      />
      <ScrollView style={styles.flex1} showsVerticalScrollIndicator={false}>
        <View style={[styles.topView, styles.center]}>
          <Image source={Res.product} style={styles.product} />
          <Tip1 />
          <Tip2 />
          <Tip3 />
          <Tip4 />
          <Tip5 />
        </View>
        <View style={styles.bannerView}>
          {faultArr.length > 1 ? (
            <View>
              <Carousel
                autoplay={true}
                autoplayInterval={3000}
                loop={true}
                loopClonesPerSide={5}
                data={faultArr}
                renderItem={renderItem}
                sliderWidth={cx(300)}
                itemWidth={cx(300)}
              />
            </View>
          ) : null}

          {faultArr.length === 1 ? (
            <View style={[styles.row, styles.center, { height: cx(50), flex: 1 }]}>
              <TouchableOpacity
                disabled={!faultNeedPressList.includes(faultArr[0])}
                onPress={() => handleFaultPress(faultArr[0])}
              >
                <Image source={Res.fault} style={styles.bannerIcon} resizeMode="stretch" />
              </TouchableOpacity>
              <TYText style={styles.title13}>{getCatCloseText(faultArr[0])}</TYText>
            </View>
          ) : null}
        </View>

        <View style={styles.recordBanner}>
          <TYText style={styles.title13}>{String.getLang('toilet_statistics')}</TYText>
          <View style={[styles.rowSpw, { marginTop: cx(16) }]}>
            <View style={styles.bannerItem}>
              <TYText style={styles.title12}>{String.getLang('today_toilet_count')}</TYText>
              <TYText style={styles.text20}>
                {getToiletTimes()}
                <TYText style={styles.text15}>{String.getLang('count_unit')}</TYText>
              </TYText>
            </View>
            <View style={styles.bannerItem}>
              <TYText style={styles.title12}>{String.getLang('today_toilet_average')}</TYText>
              <View style={styles.row}>
                <View style={styles.row}>
                  {(getToiletAvgMinute().minute !== 0 ||
                    (getToiletAvgMinute().minute === 0 && getToiletAvgMinute().second === 0)) && (
                    <TYText style={styles.text20}>
                      {getToiletAvgMinute().minute}
                      <TYText style={styles.text15}>{String.getLang('minute_unit')}</TYText>
                    </TYText>
                  )}
                  <TYText style={styles.text20}>
                    {getToiletAvgMinute().second}
                    <TYText style={styles.text15}>{String.getLang('second_unit')}</TYText>
                  </TYText>
                </View>
              </View>
            </View>
          </View>
        </View>
        <WorkRecord toiletRecordList={toiletRecordList} workRecordList={workRecordList} />
      </ScrollView>
      <View style={styles.bottomView}>
        {tabData.map(item => {
          const disabled = !deviceOnline || (isSleep && item.key !== 'settings');
          return (
            <TouchableOpacity
              activeOpacity={0.65}
              style={[styles.tabItem]}
              key={item.key}
              onPress={item.onPress}
            >
              <TouchableOpacity
                onPress={item.onPress}
                activeOpacity={0.65}
                disabled={disabled}
                style={[{ opacity: disabled ? 0.45 : 1 }]}
              >
                <Image source={item.icon} style={styles.itemImage} />
                <TYText style={styles.itemText}>{item.label}</TYText>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </View>
      <StatusPopup />
      <Toast
        image={Res.icon_succeed}
        showPosition="center"
        imageStyle={styles.toastImage}
        show={successShow}
        text={successHint}
        onFinish={() => {
          setTimeout(() => {
            setSuccessShow(false);
          }, 3000);
        }}
        contentStyle={styles.toast}
        textStyle={styles.textStyle}
      />
      <Toast
        image={Res.cat_icon_insufficient}
        showPosition="center"
        imageStyle={styles.toastImage1}
        show={failShow}
        text={failHint}
        onFinish={() => {
          setTimeout(() => {
            setFailShow(false);
          }, 3000);
        }}
        contentStyle={styles.toast}
        textStyle={styles.textStyle}
      />
      <TipModal
        isVisibleModal={showTipModal}
        title={String.getLang('do_not_disturb')}
        subTitle={getTipLabel()}
        icon={Res.common_icon_No_disturbing}
        onConfirm={() => {
          setShowTipModal(false);
        }}
        confirmText={String.getLang('got_it')}
        cancelText={String.getLang('go_setting')}
        onCancel={() => {
          setShowTipModal(false);
          navigation.navigate('smartSettings');
        }}
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
    marginTop: cx(30),
  },
  bannerView: {
    height: cx(50),
    width: cx(300),
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: cx(-10),
  },
  title13: {
    fontSize: cx(13),
    fontWeight: 'bold',
    color: '#49362F',
  },
  text15: {
    fontSize: cx(15),
    // fontWeight: 'bold',
    color: '#49362F',
  },
  title12: {
    fontSize: cx(12),
    color: '#968E87',
    marginBottom: cx(4),
  },
  text20: {
    fontSize: cx(20),
    // fontWeight: 'bold',
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
    borderRadius: cx(13),
    backgroundColor: '#fff',
    paddingHorizontal: cx(15),
    paddingVertical: cx(18),
    shadowColor: '#ddd',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    elevation: 4,
    shadowRadius: 4,
  },
  bottomView: {
    width: cx(375),
    height: isIphoneX ? cx(130) : cx(124),
    shadowColor: '#ddd',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    elevation: 4,
    shadowRadius: 4,
    backgroundColor: '#fff',
    borderTopRightRadius: cx(15),
    borderTopLeftRadius: cx(15),
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: cx(16),
    paddingTop: cx(20),
  },
  tabItem: {
    width: cx(70),
    alignItems: 'center',
  },
  itemImage: {
    width: cx(50),
    height: cx(50),
    marginBottom: cx(10),
  },
  itemText: {
    fontSize: cx(14),
    color: '#49362F',
  },
  toastImage: {
    width: cx(39),
    height: cx(27),
    marginTop: cx(10),
    tintColor: '#fff',
  },
  toastImage1: {
    width: cx(39),
    height: cx(39),
    marginTop: cx(15),
    tintColor: '#fff',
  },
  toast: {
    width: cx(110),
    height: cx(115),
    borderRadius: cx(10),
    paddingVertical: cx(10),
  },
  textStyle: {
    fontSize: cx(12),
    color: '#fff',
    marginTop: cx(0),
  },
  bannerIcon: {
    width: cx(15),
    height: cx(15),
    marginRight: cx(5.5),
  },
});
