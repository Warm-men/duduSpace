import React from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { TYSdk, TYText, Utils, SwitchButton, Popup, Dialog } from 'tuya-panel-kit';
import { useSelector } from 'react-redux';
import Res from '@res';
import i18n from '@i18n';
import { styles as commonStyles1 } from '@utils/commonStyles';
import { commonColor, commonPopStyle, commonPopStyleTimePiker, dpCodes } from '@config';
import {
  sleepData2String,
  sleepString2Data,
  intermittentString2Data,
  data2IntermittentString,
} from '@utils/index';

const { convertX: cx } = Utils.RatioUtils;
const { delayCleanTimeCode, setSleepPlanCode, intermittentSettingCode } = dpCodes;

const SmartSettings: React.FC = (props: any) => {
  const {
    [setSleepPlanCode]: setSleepPlan,
    [intermittentSettingCode]: intermittentSetting,
  } = useSelector(({ dpState }: any) => dpState);

  const { interval, duration } = intermittentString2Data(intermittentSetting);

  const handleWaterIntervalPicker = () => {
    const range = Utils.NumberUtils.range(1, 61, 1);
    const timerRange = range.map((item: number) => {
      return {
        label: `${item}`,
        value: item,
      };
    });
    Popup.picker({
      ...commonPopStyle,
      dataSource: timerRange,
      title: i18n.getLang('effluent_interval'),
      cancelText: i18n.getLang('cancel'),
      confirmText: i18n.getLang('confirm'),
      pickerWrapperStyle: { width: cx(285) },
      pickerStyle: {
        height: cx(210),
        width: cx(285),
        justifyContent: 'center',
      },
      value: interval,
      spacing: cx(80),
      label: [i18n.getLang('min')],
      labelOffset: cx(44),
      pickerFontColor: commonColor.mainText,
      pickerUnitColor: commonColor.mainText,
      theme: { fontSize: cx(15) },
      onMaskPress: Popup.close,
      onConfirm: (value, idx, { close }) => {
        const stringValue = data2IntermittentString({ interval: value, duration });
        TYSdk.device.putDeviceData({ [intermittentSettingCode]: stringValue });
        Popup.close();
      },
      onCancel: Popup.close,
    });
  };

  const handleWaterTimerPicker = () => {
    const range = Utils.NumberUtils.range(15, 181, 1);
    const timerRange = range.map((item: number) => {
      return {
        label: `${item}`,
        value: item,
      };
    });
    Popup.picker({
      ...commonPopStyle,
      dataSource: timerRange,
      title: i18n.getLang('effluent_duration'),
      cancelText: i18n.getLang('cancel'),
      confirmText: i18n.getLang('confirm'),
      pickerWrapperStyle: { width: cx(285) },
      pickerStyle: {
        height: cx(210),
        width: cx(285),
        justifyContent: 'center',
      },
      value: duration,
      spacing: cx(80),
      label: [i18n.getLang('sec')],
      labelOffset: cx(44),
      pickerFontColor: commonColor.mainText,
      pickerUnitColor: commonColor.mainText,
      theme: { fontSize: cx(15) },
      onMaskPress: Popup.close,
      onConfirm: (value, idx, { close }) => {
        TYSdk.device.putDeviceData({ [delayCleanTimeCode]: value });
        const stringValue = data2IntermittentString({ interval, duration: value });
        TYSdk.device.putDeviceData({ [intermittentSettingCode]: stringValue });
        Popup.close();
      },
      onCancel: Popup.close,
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
      onMaskPress: Popup.close,
      onConfirm: ({ startTime, endTime }, { close }) => {
        if (startTime === endTime) {
          Dialog.alert({
            title: '',
            subTitle: i18n.getLang('sleep_time_error'),
            confirmText: i18n.getLang('confirm'),
            onConfirm: (data, { close }) => {
              close();
            },
          });
          return;
        }
        const data = sleepData2String({ startTime, endTime, switchState: true });
        TYSdk.device.putDeviceData({ [setSleepPlanCode]: data });
        Popup.close();
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
    const min = minute % 6;
    if (hour === 1 && min === 0) {
      return `${hour}${i18n.getLang('hour')}`;
    }
    if (hour > 0) {
      return `${hour}${i18n.getLang('hour')}${min}${i18n.getLang('min')}`;
    }
    return `${minute}${i18n.getLang('min')}`;
  };

  const formatSecond = (minute: number) => {
    const min = Math.floor(minute / 60);
    const sec = minute % 60;
    if (min === 1 && sec === 0) {
      return `${min}${i18n.getLang('min')}`;
    }
    if (min > 0) {
      return `${min}${i18n.getLang('min')}${sec}${i18n.getLang('sec')}`;
    }
    return `${minute}${i18n.getLang('sec')}`;
  };

  const handleSleepPlanSwitch = value => {
    const { startTime, endTime } = sleepString2Data(setSleepPlan);
    const data = sleepData2String({ startTime, endTime, switchState: value });
    TYSdk.device.putDeviceData({ [setSleepPlanCode]: data });
  };

  const size = { width: cx(45), height: cx(26), activeSize: cx(21) };
  const { switchState } = sleepString2Data(setSleepPlan);
  return (
    <View style={styles.flex1}>
      <ScrollView style={styles.flex1}>
        <TYText style={styles.title12Bold}>{i18n.getLang('intermittent_setting')}</TYText>

        <View style={[commonStyles1.viewShadow, styles.alignItemCenter, styles.viewBox]}>
          {/* 出水间隔 */}
          <View style={[styles.rowSpw, styles.itemViewSmall]}>
            <View style={[styles.justifyContentCenter, styles.flex1]}>
              <TYText style={styles.title15}>{i18n.getLang('effluent_interval')}</TYText>
            </View>
            <TouchableOpacity onPress={handleWaterIntervalPicker} activeOpacity={0.8}>
              <View style={[styles.row, styles.alignItemCenter, styles.arrowView]}>
                <TYText style={styles.text15}>{formatMinute(interval)}</TYText>
                <Image source={Res.arrow_right} style={styles.arrowImage} resizeMode="stretch" />
              </View>
            </TouchableOpacity>
          </View>
          {/* 出水时长 */}
          <View style={[styles.rowSpw, styles.itemViewSmall]}>
            <View style={[styles.justifyContentCenter, styles.flex1]}>
              <TYText style={styles.title15}>{i18n.getLang('effluent_duration')}</TYText>
            </View>
            <TouchableOpacity onPress={handleWaterTimerPicker} activeOpacity={0.8}>
              <View style={[styles.row, styles.alignItemCenter, styles.arrowView]}>
                <TYText style={styles.text15}>{formatSecond(duration)}</TYText>
                <Image source={Res.arrow_right} style={styles.arrowImage} resizeMode="stretch" />
              </View>
            </TouchableOpacity>
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
            styles.viewBoxMargin,
          ]}
        >
          {/* 免打扰 */}
          <View style={[styles.rowSpw, styles.itemView]}>
            <View style={[styles.justifyContentCenter, styles.flex1]}>
              <TYText style={styles.title15}>{i18n.getLang('do_not_disturb')}</TYText>
              <TYText style={styles.text12}>{i18n.getLang('do_not_disturb_tip')}</TYText>
            </View>
            <SwitchButton
              size={size}
              onValueChange={value => {
                handleSleepPlanSwitch(value);
              }}
              value={switchState}
              onTintColor="#DFA663"
            />
          </View>
          {/* 免打扰时间 */}
          {switchState ? (
            <View style={[styles.rowSpw, styles.itemView, styles.itemViewSmall]}>
              <View style={[styles.justifyContentCenter, styles.flex1]}>
                <TYText style={styles.title15}>{i18n.getLang('do_not_disturb_period')}</TYText>
              </View>
              <TouchableOpacity onPress={showSleepPicker} activeOpacity={0.8}>
                <View style={[styles.row, styles.alignItemCenter, styles.arrowView]}>
                  <TYText style={styles.text15}>{sleepTimeText()}</TYText>
                  <Image source={Res.arrow_right} style={styles.arrowImage} resizeMode="stretch" />
                </View>
              </TouchableOpacity>
            </View>
          ) : null}
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
  },
  text15: {
    fontSize: cx(15),
    color: '#ADA49B',
  },
  text12: {
    fontSize: cx(12),
    color: '#ADA49B',
    marginTop: cx(5),
    width: cx(250),
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
    height: cx(66),
    alignItems: 'center',
  },
  itemViewSmall: {
    height: cx(44),
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
  viewBoxMargin: {
    marginBottom: cx(16),
  },
});
