import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Toast, TYSdk, TYText, Utils, SwitchButton, Popup } from 'tuya-panel-kit';
import { useNavigation } from '@react-navigation/native';
import Res from '@res';
import i18n from '@i18n';
import { styles as commonStyles1 } from '@utils/commonStyles';
import { commonColor, commonPopStyle, commonStyles, width, commonPopStyleTimePiker } from '@config';
import { getDeviceCloudData, saveDeviceCloudData } from '@api';

const { convert: c, convertX: cx, convertY: cy, isIphoneX } = Utils.RatioUtils;
const ClearToiletReminder: React.FC = (props: any) => {
  const [pickervalue, setPickerValue] = useState('');
  const [cleanValue, setCleanValue] = useState(15);

  const [autoClean, setAutoClean] = useState(true);
  const [cleanReminder, setCleanReminder] = useState(true);
  const [duplicateCleaning, setDuplicateCleaning] = useState(true);
  const [timerPickerValue, setTimerPickerValue] = useState(['a', '1']);

  const navigation = useNavigation();

  useEffect(() => {
    getCleanReminder();
  }, []);

  const getCleanReminder = async () => {
    const res = await getDeviceCloudData('cleanReminder');
    console.log('🚀 ~ file: index.tsx:29 ~ getCleanReminder ~ res:', res);
    if (typeof res === 'string') {
      setCleanReminder(res);
    }
    if (typeof res === 'object' && res.cleanReminder) {
      setCleanReminder(res.cleanReminder);
    }
    if (typeof res === 'object' && !res.cleanReminder) {
      setCleanReminder(false);
    }
    console.log('res', res);
  };

  const handleCleanReminderSwitch = async (value: boolean) => {
    setCleanReminder(value);
    await saveDeviceCloudData('cleanReminder', value);
  };

  const showCirclePicker = () => {
    Popup.picker({
      ...commonPopStyle,
      dataSource: [
        {
          label: '1',
          value: '1',
        },
        {
          label: '2',
          value: '2',
        },
      ],
      title: i18n.getLang('delay_clean_time'),
      cancelText: i18n.getLang('cancel'),
      confirmText: i18n.getLang('confirm'),
      pickerWrapperStyle: { width: cx(285) },
      pickerStyle: {
        height: cx(210),
        width: cx(285),
      },
      value: 1,
      spacing: cx(80),
      theme: { fontSize: cx(18) },
      pickerFontColor: commonColor.mainText,
      pickerUnitColor: commonColor.mainText,
      onMaskPress: ({ close }) => close(),
      onConfirm: (value, idx, { close }) => {
        close();
      },
      onCancel: () => Popup.close(),
    });
  };

  const showReminderTimePicker = () => {
    Popup.picker({
      ...commonPopStyleTimePiker,
      dataSource: [
        [
          {
            label: 'a',
            value: 'a',
          },
          {
            label: 'b',
            value: 'b',
          },
          {
            label: 'c',
            value: 'c',
          },
        ],
        [
          {
            label: '1',
            value: '1',
          },
          {
            label: '2',
            value: '2',
          },
          {
            label: '3',
            value: '3',
          },
        ],
      ],
      label: ['时', '分'],
      singlePicker: false,
      title: i18n.getLang('reminder_time'),
      cancelText: i18n.getLang('cancel'),
      confirmText: i18n.getLang('confirm'),
      value: timerPickerValue,
      pickerStyle: {
        height: cx(210),
        width: cx(100),
      },
      spacing: cx(80),
      theme: { fontSize: cx(18) },
      onMaskPress: ({ close }) => close(),
      onConfirm: (value, idx, { close }) => {
        setTimerPickerValue(value);
        close();
      },
    });
  };

  const size = { width: cx(45), height: cx(26), activeSize: cx(21) };
  return (
    <ScrollView style={styles.flex1} contentContainerStyle={styles.scrollViewStyle}>
      <View style={[commonStyles1.viewShadow, styles.alignItemCenter, styles.viewBox]}>
        {/* 砂仓清洗提醒 */}
        <View style={[styles.rowSpw, styles.itemView]}>
          <View style={[styles.justifyContentCenter, styles.flex1]}>
            <TYText style={styles.title15}>{i18n.getLang('clear_toilet_reminder_switch')}</TYText>
            <TYText style={styles.title12}>
              {i18n.getLang('clear_toilet_reminder_switch_tip')}
            </TYText>
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
        {/* 提醒周期 */}
        {cleanReminder ? (
          <View style={[styles.rowSpw, styles.itemView, styles.itemViewSmall]}>
            <View style={[styles.justifyContentCenter, styles.flex1]}>
              <TYText style={styles.title15}>{i18n.getLang('reminder_cycle')}</TYText>
            </View>
            <TouchableOpacity
              onPress={() => {
                showCirclePicker();
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.row, styles.alignItemCenter, styles.arrowView]}>
                <TYText style={styles.text15}>1小时15分钟</TYText>
                <Image source={Res.arrow_right} style={styles.arrowImage} resizeMode="stretch" />
              </View>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* 提醒时间 */}
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
                <TYText style={styles.text15}>1小时15分钟</TYText>
                <Image source={Res.arrow_right} style={styles.arrowImage} resizeMode="stretch" />
              </View>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
};

export default ClearToiletReminder;

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
