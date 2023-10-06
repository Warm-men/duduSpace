import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { TYSdk, TYText, Utils, SwitchButton, Popup, Notification } from 'tuya-panel-kit';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Res from '@res';
import i18n from '@i18n';
import { styles as commonStyles1 } from '@utils/commonStyles';
import { commonColor, commonPopStyle, commonPopStyleTimePiker, dpCodes } from '@config';
import { sleepData2String, sleepString2Data } from '@utils/index';

const { convertX: cx } = Utils.RatioUtils;
const {
  autoCleanCode,
  delayCleanTimeCode,
  repeatClearSwitchCode,
  setRepeatClearTimeCode,
  sleepSwitchCode,
  setSleepPlanCode,
  clearPlanSwitchCode,
  soundSwitchCode,
  attachedActionCode,
} = dpCodes;

const CleaningIntervalView: React.FC = (props: any) => {
  const { cleanValue: cleanValueProps } = props;
  const [cleanValue, setCleanValue] = useState(cleanValueProps);
  const cleanData = [15, 30, 45, 60];
  return (
    <ScrollView style={styles.popScrollView}>
      {cleanData.map((item, index) => {
        const isActive = cleanValue === item;
        return (
          <TouchableOpacity
            key={item}
            onPress={() => {
              setCleanValue(item);
              props.onValueChange(item);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.popItem}>
              <TYText style={styles.popItemText}>{i18n.getLang(`clean_interval_${item}`)}</TYText>
              <Image source={isActive ? Res.common_btn_choice : Res.common_btn_choice_gray} />
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const SmartSettings: React.FC = (props: any) => {
  const {
    [delayCleanTimeCode]: delayCleanTime,
    [autoCleanCode]: autoClean,
    [repeatClearSwitchCode]: repeatClearSwitch,
    [setRepeatClearTimeCode]: setRepeatClearTime,
    [sleepSwitchCode]: sleepSwitch,
    [setSleepPlanCode]: setSleepPlan,
    [clearPlanSwitchCode]: clearPlanSwitch,
    [soundSwitchCode]: soundSwitch,
    [attachedActionCode]: attachedAction,
  } = useSelector(({ dpState }: any) => dpState);
  const [cleanValue, setCleanValue] = useState(setRepeatClearTime);
  const [timerPickerValue, setTimerPickerValue] = useState([0, 0]);

  const navigation = useNavigation();

  const handleAutoCleanPicker = () => {
    const { min, max, step } = TYSdk.device.getDpSchema(delayCleanTimeCode);
    const range = Utils.NumberUtils.range(min + step, max + step, step);
    const timerRange = range.map((item: number) => {
      return {
        label: `${item}${i18n.getLang('unit_minute')}`,
        value: item,
      };
    });
    Popup.picker({
      ...commonPopStyle,
      dataSource: timerRange,
      title: i18n.getLang('delay_clean_time'),
      cancelText: i18n.getLang('cancel'),
      confirmText: i18n.getLang('confirm'),
      pickerWrapperStyle: { width: cx(285) },
      pickerStyle: {
        height: cx(210),
        width: cx(285),
      },
      value: delayCleanTime,
      spacing: cx(80),
      theme: { fontSize: cx(18) },
      pickerFontColor: commonColor.mainText,
      pickerUnitColor: commonColor.mainText,
      pickerFontSize: cx(14),
      onMaskPress: ({ close }) => close(),
      onConfirm: (value, idx, { close }) => {
        TYSdk.device.putDeviceData({ [delayCleanTimeCode]: value });
        close();
      },
      onCancel: () => Popup.close(),
    });
  };

  const handleCleanValue = value => {
    TYSdk.device.putDeviceData({ [setRepeatClearTimeCode]: value });
  };

  const handleCleaningInterval = () => {
    Popup.custom({
      ...commonPopStyle,
      footerType: 'singleCancel',
      cancelText: i18n.getLang('confirm'),
      onCancel: () => Popup.close(),
      onMaskPress: ({ close }) => close(),
      title: i18n.getLang('cleaning_interval'),
      content: (
        <CleaningIntervalView cleanValue={setRepeatClearTime} onValueChange={handleCleanValue} />
      ),
    });
  };

  const showSleepPicker = () => {
    const { startTime, endTime } = sleepString2Data(setSleepPlan);
    Popup.timerPicker({
      ...commonPopStyleTimePiker,
      symbol: '~',
      title: i18n.getLang('sleep_time'),
      cancelText: i18n.getLang('cancel'),
      confirmText: i18n.getLang('confirm'),
      startTime,
      endTime,
      is12Hours: false,
      onMaskPress: ({ close }) => close(),
      onConfirm: ({ startTime, endTime }, { close }) => {
        if (startTime === endTime) {
          Notification.show({
            message: i18n.getLang('same_time'),
            onClose: () => {
              Notification.hide();
            },
            enableClose: false,
            autoCloseTime: 2000,
          });
          return;
        }
        setTimerPickerValue([startTime, endTime]);
        const data = sleepData2String({ startTime, endTime });
        TYSdk.device.putDeviceData({ [setSleepPlanCode]: data });
        close();
      },
    });
  };

  const formatMinute2Hour = (minute: number) => {
    const hour = `${Math.floor(minute / 60)}`;
    const min = `${minute % 60}`;
    return `${hour.padStart(2, 0)}:${min.padStart(2, 0)}`;
  };

  const sleepTimeText = () => {
    const { startTime, endTime } = sleepString2Data(setSleepPlan);
    const startTimeText = formatMinute2Hour(startTime);
    const endTimeText = formatMinute2Hour(endTime);
    return `${startTimeText}-${endTimeText}`;
  };

  const formatMinute = (minute: number) => {
    const hour = Math.floor(minute / 60);
    const min = minute % 60;
    if (hour === 1 && min === 0) {
      return `${hour}${i18n.getLang('unit_hour')}`;
    }
    if (hour > 0) {
      if (min > 0) return `${hour}${i18n.getLang('unit_hour')}${min}${i18n.getLang('unit_minute')}`;
      return `${hour}${i18n.getLang('unit_hour')}`;
    }
    return `${minute}${i18n.getLang('unit_minute')}`;
  };

  const size = { width: cx(45), height: cx(26), activeSize: cx(21) };
  return (
    <View style={styles.flex1}>
      <ScrollView style={styles.flex1}>
        <TYText style={styles.title12Bold}>{i18n.getLang('clean_setting')}</TYText>

        <View style={[commonStyles1.viewShadow, styles.alignItemCenter, styles.viewBox]}>
          {/* 自动清理 */}
          <View style={[styles.rowSpw, styles.itemView]}>
            <View style={[styles.justifyContentCenter, styles.flex1]}>
              <TYText style={styles.title15}>{i18n.getLang('auto_clean')}</TYText>
              <TYText style={styles.title12}>{i18n.getLang('auto_clean_tip')}</TYText>
            </View>
            <SwitchButton
              size={size}
              onValueChange={value => {
                if (value && clearPlanSwitch) {
                  TYSdk.device.putDeviceData({
                    [autoCleanCode]: value,
                    [clearPlanSwitchCode]: false,
                  });
                  return;
                }
                TYSdk.device.putDeviceData({ [autoCleanCode]: value });
              }}
              value={autoClean}
              onTintColor="#DFA663"
            />
          </View>
          {/* 延迟清理时间 */}
          {autoClean ? (
            <View style={[styles.rowSpw, styles.itemView]}>
              <View style={[styles.justifyContentCenter, styles.flex1]}>
                <TYText style={styles.title15}>{i18n.getLang('delay_clean_time')}</TYText>
                <TYText style={styles.title12}>{i18n.getLang('delay_clean_time_tip')}</TYText>
              </View>
              <TouchableOpacity
                onPress={() => {
                  handleAutoCleanPicker();
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.row, styles.alignItemCenter, styles.arrowView]}>
                  <TYText style={styles.text15_1}>{formatMinute(delayCleanTime)}</TYText>
                  <Image source={Res.arrow_right} style={styles.arrowImage} resizeMode="stretch" />
                </View>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* 避免重复清理 */}
          <View style={[styles.rowSpw, styles.itemView, styles.itemViewSmall]}>
            <View style={[styles.justifyContentCenter, styles.flex1]}>
              <TYText style={styles.title15}>{i18n.getLang('avoiding_duplicate_cleaning')}</TYText>
            </View>
            <SwitchButton
              size={size}
              onValueChange={value => {
                TYSdk.device.putDeviceData({ [repeatClearSwitchCode]: value });
              }}
              value={repeatClearSwitch}
              onTintColor="#DFA663"
            />
          </View>
          {/* 清理时间间隔 */}
          {repeatClearSwitch ? (
            <View style={[styles.rowSpw, styles.itemView]}>
              <View style={[styles.justifyContentCenter, styles.flex1]}>
                <TYText style={styles.title15}>{i18n.getLang('cleaning_interval')}</TYText>
                <TYText style={styles.title12}>{i18n.getLang('cleaning_interval_tip')}</TYText>
              </View>
              <TouchableOpacity
                onPress={() => {
                  handleCleaningInterval();
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.row, styles.alignItemCenter, styles.arrowView]}>
                  <TYText style={styles.text15_1}>
                    {/* {i18n.getLang(`clean_interval_${setRepeatClearTime}`)} */}
                    {formatMinute(setRepeatClearTime)}
                  </TYText>
                  <Image source={Res.arrow_right} style={styles.arrowImage} resizeMode="stretch" />
                </View>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* 定时清理 */}
          <View style={[styles.rowSpw, styles.itemView, styles.itemViewSmall]}>
            <View style={[styles.justifyContentCenter, styles.flex1]}>
              <TYText style={styles.title15}>{i18n.getLang('regular_cleaning')}</TYText>
            </View>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('scheduledCleaning');
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.row, styles.alignItemCenter, styles.arrowView]}>
                <TYText style={[styles.text15_1, { color: clearPlanSwitch ? '#43B648' : '#ADA49B' }]}>
                  {clearPlanSwitch
                    ? i18n.getLang('plan_switch_on')
                    : i18n.getLang('plan_switch_off')}
                </TYText>
                <Image source={Res.arrow_right} style={styles.arrowImage} resizeMode="stretch" />
              </View>
            </TouchableOpacity>
          </View>
          {/* 预埋设置 */}
          <View style={[styles.rowSpw, styles.itemView]}>
            <View style={[styles.justifyContentCenter, styles.flex1]}>
              <TYText style={styles.title15}>{i18n.getLang('attached_action')}</TYText>
              <TYText style={styles.title12}>{i18n.getLang('attached_action_tip')}</TYText>
            </View>
            <SwitchButton
              size={size}
              onValueChange={value => {
                TYSdk.device.putDeviceData({ [attachedActionCode]: value });
              }}
              value={attachedAction}
              onTintColor="#DFA663"
            />
          </View>
        </View>

        {/* 其他设置 */}
        <TYText style={[styles.title12Bold, { marginTop: cx(30) }]}>
          {i18n.getLang('other_setting')}
        </TYText>
        <View
          style={[
            commonStyles1.viewShadow,
            styles.alignItemCenter,
            styles.viewBox,
            { marginBottom: cx(10) },
          ]}
        >
          {/* 免打扰 */}
          <View style={[styles.rowSpw, styles.itemView, styles.itemViewSmall]}>
            <View style={[styles.justifyContentCenter, styles.flex1]}>
              <TYText style={styles.title15}>{i18n.getLang('do_not_disturb')}</TYText>
            </View>
            <SwitchButton
              size={size}
              onValueChange={value => {
                TYSdk.device.putDeviceData({ [sleepSwitchCode]: value });
              }}
              value={sleepSwitch}
              onTintColor="#DFA663"
            />
          </View>
          {/* 延迟清理时间 */}
          {sleepSwitch ? (
            <View style={[styles.rowSpw, styles.itemView, styles.itemViewSmall]}>
              <View style={[styles.justifyContentCenter, styles.flex1]}>
                <TYText style={styles.title15}>{i18n.getLang('do_not_disturb_period')}</TYText>
              </View>
              <TouchableOpacity onPress={showSleepPicker} activeOpacity={0.8}>
                <View style={[styles.row, styles.alignItemCenter, styles.arrowView]}>
                  <TYText style={styles.text15_1}>{sleepTimeText()}</TYText>
                  <Image source={Res.arrow_right} style={styles.arrowImage} resizeMode="stretch" />
                </View>
              </TouchableOpacity>
            </View>
          ) : null}
          {/* 免打扰 */}
          <View style={[styles.rowSpw, styles.itemView, styles.itemViewSmall_1]}>
            <View style={[styles.justifyContentCenter, styles.flex1]}>
              <TYText style={styles.title15}>{i18n.getLang('sound_switch')}</TYText>
            </View>
            <SwitchButton
              size={size}
              onValueChange={value => {
                TYSdk.device.putDeviceData({ [soundSwitchCode]: value });
              }}
              value={soundSwitch}
              onTintColor="#DFA663"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SmartSettings;

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  alignItemCenter: {
    alignItems: 'center',
  },
  justifyContentCenter: {
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  rowSpw: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title12Bold: {
    fontSize: cx(12),
    fontWeight: 'bold',
    marginLeft: cx(30),
    marginVertical: cx(15),
    color: '#ADA49B',
  },
  title15: {
    fontSize: cx(15),
    color: '#49362F',
    width: cx(200),
  },
  text15: {
    fontSize: cx(15),
    color: '#ADA49B',
    width: cx(200),
  },
  text15_1: {
    fontSize: cx(15),
    color: '#ADA49B',
  },
  title12: {
    fontSize: cx(12),
    color: '#ADA49B',
    lineHeight: cx(18),
    marginTop: cx(6),
    width: cx(200),
  },
  viewBox: {
    width: cx(345),
    marginHorizontal: cx(15),
    borderRadius: cx(10),
    backgroundColor: '#fff',
    paddingHorizontal: cx(15),
    paddingTop: cx(15),
    paddingBottom: cx(10),
  },
  itemView: {
    // height: cx(65.5),
    marginBottom: cx(14),
    alignItems: 'center',
  },
  itemViewSmall: {
    // height: cx(44),
    marginBottom: cx(24),
    alignItems: 'center',
  },
  itemViewSmall_1: {
    alignItems: 'center',
  },
  arrowImage: {
    width: cx(20),
    height: cx(20),
  },
  arrowView: {
    width: cx(110),
    justifyContent: 'flex-end',
  },
  popScrollView: {
    height: cx(155),
    marginBottom: cx(27),
  },
  popItem: {
    flexDirection: 'row',
    paddingVertical: cx(12),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popItemText: {
    color: '#49362F',
    fontSize: cx(15),
  },
});
