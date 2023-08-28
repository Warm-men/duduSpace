import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { TYText, Utils, SwitchButton, Popup } from 'tuya-panel-kit';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { actions } from '@models';
import Res from '@res';
import i18n from '@i18n';
import { styles as commonStyles1 } from '@utils/commonStyles';
import { commonColor, commonPopStyle, commonPopStyleTimePiker } from '@config';
import { saveDeviceCloudData } from '@api';

const { toFixed } = Utils.CoreUtils;

const { convertX: cx } = Utils.RatioUtils;
const CleaningReminder: React.FC = (props: any) => {
  const dispatch = useDispatch();

  const { cleanReminderState } = useSelector(({ cloudData }: any) => cloudData);

  const {
    cleanReminderSwitch: _cleanReminderSwitch,
    cleanReminderTime: _cleanReminderTime,
    cleanReminderRepeat: _cleanReminderRepeat,
    cleanReminderHourAndMinute: _cleanReminderHourAndMinute,
  } = cleanReminderState || {
    cleanReminderSwitch: false,
    cleanReminderTime: '',
    cleanReminderRepeat: 30,
    cleanReminderHourAndMinute: [0, 0],
  };

  // 当前时间：小时
  const currentHour = moment().hour();
  // 当前时间：分钟
  const currentMinute = moment().minute();
  const [cleanValue, setCleanValue] = useState(7);
  const [cleanReminder, setCleanReminder] = useState(false);
  const [timerPickerValue, setTimerPickerValue] = useState([currentHour, 0, currentMinute]);

  const cleanRepeatFromCloud = useRef(null);
  const cleanSwitchFromCloud = useRef(null);
  const cleanTimeFromCloud = useRef(null);

  useEffect(() => {
    setCleanReminder(_cleanReminderSwitch);
    cleanSwitchFromCloud.current = _cleanReminderSwitch;
    setCleanValue(_cleanReminderRepeat);
    cleanRepeatFromCloud.current = _cleanReminderRepeat;
    setTimerPickerValue([_cleanReminderHourAndMinute[0], 0, _cleanReminderHourAndMinute[1]]);
    cleanTimeFromCloud.current = [
      _cleanReminderHourAndMinute[0],
      0,
      _cleanReminderHourAndMinute[1],
    ];
  }, []);

  const updateStore = (key, value) => {
    dispatch(
      actions.common.updateCloudData({
        cleanReminderState: {
          ...cleanReminderState,
          [key]: value,
        },
      })
    );
  };

  const handleCleanReminderSwitch = async (value: boolean) => {
    setCleanReminder(value);
    await saveDeviceCloudData('cleanReminderSwitch', value ? '1' : '0');
    // 保存本次修改的时间点，格式为YYYY-MM-DD, 以今天开始算周期
    if (value) {
      const time = moment().format('YYYY-MM-DD');
      await saveDeviceCloudData('cleanReminderTime', { time });
    }
    // 如果开关从关闭到打开，且周期值为空，则更新周期值为默认值7
    if (cleanRepeatFromCloud.current === null) {
      await saveDeviceCloudData('cleanReminderRepeat', '7');
    }
    // 如果开关从关闭到打开，且时间点为空，则更新时间点为当前时间
    if (cleanTimeFromCloud.current === null) {
      await saveDeviceCloudData('cleanReminderHourAndMinute', {
        hour: currentHour,
        minute: currentMinute,
      });
    }
    updateStore('cleanReminderSwitch', value);
  };
  const showCleanReminderRepeatPicker = () => {
    const range = Utils.NumberUtils.range(1, 31, 1);
    const timerRange = range.map((item: number) => {
      return {
        label: i18n.formatValue('clean_reminder_value', item),
        value: item,
      };
    });

    Popup.picker({
      ...commonPopStyle,
      dataSource: timerRange,
      title: i18n.getLang('reminder_cycle'),
      cancelText: i18n.getLang('cancel'),
      confirmText: i18n.getLang('confirm'),
      pickerWrapperStyle: { width: cx(285) },
      pickerStyle: {
        height: cx(210),
        width: cx(285),
      },
      value: cleanValue,
      spacing: cx(80),
      theme: { fontSize: cx(18) },
      pickerFontColor: commonColor.mainText,
      pickerUnitColor: commonColor.mainText,
      onMaskPress: ({ close }) => close(),
      onConfirm: async (value, idx, { close }) => {
        // 如果周期值不变，则不保存
        if (value === cleanValue) return close();
        setCleanValue(value);
        await saveDeviceCloudData('cleanReminderRepeat', `${value}`);
        updateStore('cleanReminderRepeat', value);
        close();
      },
      onCancel: () => Popup.close(),
    });
  };

  const showReminderTimePicker = () => {
    const rangeH = Utils.NumberUtils.range(0, 24, 1);
    const timerRangeH = rangeH.map((item: number) => {
      return {
        label: `${item}`,
        value: item,
      };
    });
    const rangeM = Utils.NumberUtils.range(0, 60, 1);
    const timerRangeM = rangeM.map((item: number) => {
      return {
        label: `${item}`,
        value: item,
      };
    });

    Popup.picker({
      ...commonPopStyleTimePiker,
      dataSource: [timerRangeH, [{ label: ':', value: 0 }], timerRangeM],
      singlePicker: false,
      title: i18n.getLang('reminder_time'),
      cancelText: i18n.getLang('cancel'),
      confirmText: i18n.getLang('confirm'),
      value: timerPickerValue,
      pickerStyle: {
        height: cx(210),
        width: cx(100),
        justifyContent: 'center',
      },
      theme: { fontSize: cx(18) },
      spacing: cx(80),
      onMaskPress: ({ close }) => close(),
      onConfirm: async (value, idx, { close }) => {
        setTimerPickerValue(value);
        // 如果小时和分钟不变，则不处理
        // if (value[0] === timerPickerValue[0] && value[2] === timerPickerValue[2]) return close();
        await saveDeviceCloudData('cleanReminderHourAndMinute', {
          hour: value[0],
          minute: value[2],
        });
        updateStore('cleanReminderHourAndMinute', [value[0], value[2]]);
        close();
      },
    });
  };

  const size = { width: cx(45), height: cx(26), activeSize: cx(21) };
  return (
    <ScrollView style={styles.flex1} contentContainerStyle={styles.scrollViewStyle}>
      <View style={[commonStyles1.viewShadow, styles.alignItemCenter, styles.viewBox]}>
        <View style={[styles.rowSpw, styles.itemView]}>
          <View style={[styles.justifyContentCenter, styles.flex1]}>
            <TYText style={styles.title15}>{i18n.getLang('cleaning_reminder_switch')}</TYText>
            <TYText style={styles.title12}>{i18n.getLang('cleaning_reminder_switch_tip')}</TYText>
          </View>
          <SwitchButton
            size={size}
            onValueChange={value => {
              handleCleanReminderSwitch(value);
            }}
            value={cleanReminder}
            onTintColor="#DFA663"
          />
        </View>
        {cleanReminder ? (
          <View style={[styles.rowSpw, styles.itemView, styles.itemViewSmall]}>
            <View style={[styles.justifyContentCenter, styles.flex1]}>
              <TYText style={styles.title15}>{i18n.getLang('reminder_cycle')}</TYText>
            </View>
            <TouchableOpacity onPress={showCleanReminderRepeatPicker} activeOpacity={0.8}>
              <View style={[styles.row, styles.alignItemCenter, styles.arrowView]}>
                <TYText style={styles.text15}>
                  {i18n.formatValue('clean_reminder_value', cleanValue)}
                </TYText>
                <Image source={Res.arrow_right} style={styles.arrowImage} resizeMode="stretch" />
              </View>
            </TouchableOpacity>
          </View>
        ) : null}
        {cleanReminder ? (
          <View style={[styles.rowSpw, styles.itemView, styles.itemViewSmall]}>
            <View style={[styles.justifyContentCenter, styles.flex1]}>
              <TYText style={styles.title15}>{i18n.getLang('reminder_time')}</TYText>
            </View>
            <TouchableOpacity
              onPress={() => {
                showReminderTimePicker();
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.row, styles.alignItemCenter, styles.arrowView]}>
                <TYText style={styles.text15}>
                  {`${timerPickerValue[0]}:${toFixed(timerPickerValue[2], 2)}`}
                </TYText>
                <Image source={Res.arrow_right} style={styles.arrowImage} resizeMode="stretch" />
              </View>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
      {cleanReminder ? (
        <TYText style={[styles.title12, { marginTop: cx(20), width: cx(308), marginLeft: cx(30) }]}>
          {i18n.getLang('cleaning_reminder_tip')}
        </TYText>
      ) : null}
    </ScrollView>
  );
};

export default CleaningReminder;

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
  scrollViewStyle: {
    paddingTop: cx(20),
  },
  title15: {
    fontSize: cx(15),
    color: '#49362F',
  },
  text15: {
    fontSize: cx(15),
    color: '#ADA49B',
  },
  title12: {
    fontSize: cx(12),
    color: '#ADA49B',
    lineHeight: cx(18),
  },
  viewBox: {
    width: cx(345),
    marginHorizontal: cx(15),
    borderRadius: cx(10),
    backgroundColor: '#fff',
    paddingHorizontal: cx(15),
    paddingTop: cx(15),
    paddingBottom: cx(10),
    marginBottom: cx(10),
  },
  itemView: {
    height: cx(65.5),
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
});
