import React, { useEffect, useState, useRef } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BrickButton, TYText, Popup, GlobalToast, TYSdk, Utils } from 'tuya-panel-kit';
import _ from 'lodash';
import moment from 'moment';
import { useSelector } from 'react-redux';
import {
  commonColor,
  commonStyles,
  commonPopStyle,
  cx,
  width,
  commonPopStyleTimePiker,
  dpCodes,
} from '@config';
import i18n from '@i18n';
import Res from '@res';
import TipModal from '@components/tipModal';
import { base64ToUI111, ui111ToBase64, getCleanDayLeft } from '@utils';

const { cleanTimeCode, cleanTypeCode, cleanTimerSettingCode } = dpCodes;
const { toFixed } = Utils.CoreUtils;
const DeviceWash: React.FC = props => {
  const {
    [cleanTimeCode]: cleanTime,
    [cleanTypeCode]: cleanType,
    [cleanTimerSettingCode]: cleanTimerSetting,
  } = useSelector(({ dpState }: any) => dpState);

  const currentCleanTimeSetting = useRef();

  // 当前时间：小时
  const currentHour = moment().hour();
  // 当前时间：分钟
  const currentMinute = moment().minute();
  const [repeatCurrent, setRepeatCurrent] = useState(7);
  const [hourAndMinute, setHourAndMinute] = useState([currentHour, 0, currentMinute]);

  const [showTip, setShowTip] = useState('');

  useEffect(() => {
    if (cleanTimerSetting) {
      const { day, hour, minute } = base64ToUI111(cleanTimerSetting);
      setRepeatCurrent(day);
      setHourAndMinute([hour, 0, minute]);
      if (currentCleanTimeSetting.current === cleanTimerSetting) {
        currentCleanTimeSetting.current = cleanTimerSetting;
        GlobalToast.show({
          text: i18n.getLang('setting_success'),
          showIcon: false,
          contentStyle: {},
          onFinish: () => {
            GlobalToast.hide();
          },
        });
      }
    }
  }, [cleanTimerSetting]);

  const onSave = async () => {
    // 下发数据
    const dpData = ui111ToBase64({
      day: repeatCurrent,
      hour: hourAndMinute[0],
      minute: hourAndMinute[2],
    });
    TYSdk.device.putDeviceData({
      [cleanTimerSettingCode]: dpData,
    });
    currentCleanTimeSetting.current = dpData;
  };

  const handleFinishSet = async () => {
    setShowTip(true);
  };

  const showRepeatTimePicker = () => {
    const dataSource = _.range(1, 31).map((item: number) => ({
      label: `${item}`,
      value: item,
    }));
    Popup.picker({
      ...commonPopStyle,
      dataSource,
      title: i18n.getLang('reminder_circle'),
      cancelText: i18n.getLang('cancel'),
      confirmText: i18n.getLang('confirm'),
      pickerWrapperStyle: { width: cx(285) },
      pickerStyle: {
        height: cx(210),
        width: cx(285),
        justifyContent: 'center',
      },
      value: repeatCurrent,
      labelOffset: cx(50),
      label: i18n.getLang('unit_day'),
      pickerFontColor: commonColor.mainText,
      pickerUnitColor: commonColor.mainText,
      theme: { fontSize: cx(18) },
      onMaskPress: Popup.close,
      onConfirm: (value, idx, { close }) => {
        setRepeatCurrent(value);
        Popup.close();
      },
      onCancel: Popup.close,
    });
  };

  const showReminderTimePicker = () => {
    const dataSource1 = _.range(0, 24).map((item: number) => ({
      label: `${toFixed(item, 2)}`,
      value: item,
    }));
    const dataSource2 = _.range(0, 60).map((item: number) => ({
      label: `${toFixed(item, 2)}`,
      value: item,
    }));
    Popup.picker({
      ...commonPopStyleTimePiker,
      dataSource: [dataSource1, [{ label: ':', value: 0 }], dataSource2],
      singlePicker: false,
      title: i18n.getLang('reminder_time'),
      cancelText: i18n.getLang('cancel'),
      confirmText: i18n.getLang('confirm'),
      value: hourAndMinute,
      pickerStyle: {
        height: cx(210),
        width: cx(100),
        justifyContent: 'center',
      },
      labelOffset: cx(40),
      onMaskPress: Popup.close,
      theme: { fontSize: cx(18) },
      onConfirm: (value, idx, { close }) => {
        setHourAndMinute(value);
        Popup.close();
      },
    });
  };

  const renderPopTip = () => {
    // 用相差的天数，对比提醒周期天数，得出是否预期
    // const isToday = cleanTime === 0;
    // // if (isToday) {
    // //   return (
    // //     <View style={[styles.center, { marginLeft: cx(90) }]}>
    // //       <View style={[styles.center, styles.productTextBox]}>
    // //         <TYText size={cx(14)} color={commonColor.red}>
    // //           {i18n.getLang('remain_time_3')}
    // //         </TYText>
    // //       </View>
    // //       <Image source={Res.tip_} style={styles.popImage} />
    // //     </View>
    // //   );
    // // }
    const leftDay = getCleanDayLeft(cleanTime);
    if (leftDay.isOverTimer) {
      return (
        <View style={[styles.center, { marginLeft: cx(90) }]}>
          <View style={[styles.center, styles.productTextBox]}>
            <TYText size={cx(14)} color="#7C7269">
              {i18n.getLang('over_day')}
              <TYText size={cx(14)} color={commonColor.red}>
                {` ${leftDay.leftDay} `}
              </TYText>
              {i18n.getLang('remain_time_2')}
            </TYText>
          </View>
          <Image source={Res.tip_} style={styles.popImage} />
        </View>
      );
    }
    return (
      <View style={[styles.center, { marginLeft: cx(90) }]}>
        <View style={[styles.center, styles.productTextBox]}>
          <TYText size={cx(14)} color="#7C7269">
            {i18n.getLang('remain_time_1')}
            <TYText size={cx(14)} color={commonColor.green}>
              {` ${leftDay.leftDay} `}
            </TYText>
            {i18n.getLang('remain_time_2')}
          </TYText>
        </View>
        <Image source={Res.tip_} style={styles.popImage} />
      </View>
    );
  };

  return (
    <View style={commonStyles.flexOne}>
      <ScrollView style={commonStyles.flexOne}>
        <View style={[commonStyles.shadow, styles.container]}>
          <View style={[styles.center, styles.productBox]}>
            {renderPopTip()}
            <Image source={Res.dryProduct} style={{ width: cx(120), height: cx(120) }} />
          </View>
          <View style={styles.productTipsBox}>
            <TYText
              size={cx(14)}
              color={commonColor.mainText}
              weight={500}
              style={{ marginBottom: cx(5) }}
            >
              {i18n.getLang('tips')}
            </TYText>
            <TYText style={styles.tips}>{i18n.getLang('device_wash_desc')}</TYText>
          </View>
          <View style={styles.productTipsBox1}>
            <TYText
              size={cx(14)}
              color={commonColor.mainText}
              weight={500}
              style={{ marginBottom: cx(5) }}
            >
              {i18n.getLang('wash_way')}
            </TYText>
            <TYText style={styles.tips}>{i18n.getLang('wash_way_desc_1')}</TYText>
            <TYText style={styles.tips}>{i18n.getLang('wash_way_desc_2')}</TYText>
            <TYText style={styles.tips}>{i18n.getLang('wash_way_desc_3')}</TYText>
            <TYText style={styles.tips}>{i18n.getLang('wash_way_desc_4')}</TYText>
          </View>
        </View>

        <View style={[commonStyles.shadow, styles.container1, { marginBottom: cx(16) }]}>
          <View style={[styles.flexRowBetween, styles.optionBox]}>
            <TYText style={styles.optionTitle}>{i18n.getLang('reminder_circle')}</TYText>
            <TouchableOpacity activeOpacity={0.8} onPress={showRepeatTimePicker}>
              <View style={commonStyles.flexRowCenter}>
                <TYText style={styles.optionValue}>
                  {`${repeatCurrent}${i18n.getLang('unit_day')}`}
                </TYText>
                <Image source={Res.arrow_right} />
              </View>
            </TouchableOpacity>
          </View>
          <View style={[styles.flexRowBetween, styles.optionBox]}>
            <TYText style={styles.optionTitle}>{i18n.getLang('reminder_time')}</TYText>
            <TouchableOpacity activeOpacity={0.8} onPress={showReminderTimePicker}>
              <View style={commonStyles.flexRowCenter}>
                <TYText style={styles.optionValue}>
                  {`${toFixed(hourAndMinute[0], 2)}:${toFixed(hourAndMinute[2], 2)}`}
                </TYText>
                <Image source={Res.arrow_right} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <BrickButton
        text={i18n.getLang('reset')}
        type="primaryGradient"
        onPress={handleFinishSet}
        background={{
          x1: '0%',
          y1: '0%',
          x2: '100%',
          y2: '0%',
          stops: {
            '0%': '#E6B26A',
            '100%': '#D49157',
          },
        }}
        style={styles.btnBox}
        wrapperStyle={styles.btn}
        textStyle={{ fontSize: cx(15) }}
      />
      <TipModal
        isVisibleModal={showTip}
        title={i18n.getLang('reset_repeat_tip')}
        subTitle={i18n.getLang('reset_repeat_tip_sub')}
        cancelText={i18n.getLang('think_again')}
        onCancel={() => {
          setShowTip(false);
        }}
        onConfirm={() => {
          onSave();
          setShowTip(false);
        }}
      />
    </View>
  );
};

export default DeviceWash;

const styles = StyleSheet.create({
  container: {
    marginTop: cx(16),
    marginHorizontal: cx(15),
    paddingHorizontal: cx(15),
    paddingTop: cx(30),
    paddingBottom: cx(15),
    borderRadius: cx(10),
  },
  container1: {
    marginTop: cx(16),
    marginHorizontal: cx(15),
    paddingHorizontal: cx(15),
    paddingVertical: cx(15),
    borderRadius: cx(10),
  },
  productBox: {
    marginBottom: cx(13.5),
  },
  flexRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  productTextBox: {
    paddingHorizontal: cx(10),
    paddingVertical: cx(5),
    borderWidth: cx(0.5),
    borderColor: commonColor.mainText,
    borderRadius: cx(10),
    backgroundColor: '#fff',
  },
  productTipsBox: {
    marginBottom: cx(15),
  },
  productTipsBox1: {
    marginBottom: cx(0),
  },
  tips: {
    marginTop: cx(5),
    color: '#ADA49B',
    fontSize: cx(12),
    lineHeight: cx(19),
  },
  optionBox: {
    height: cx(44),
  },
  optionTitle: {
    color: commonColor.mainText,
    fontSize: cx(15),
    fontWeight: '500',
  },
  optionValue: {
    color: '#ADA49B',
    fontSize: cx(15),
  },
  btnBox: {
    marginBottom: cx(44),
    marginHorizontal: cx(30),
  },
  btn: {
    width: width - cx(60),
    height: cx(49),
    borderRadius: cx(25.5),
  },
  popImage: {
    width: cx(16),
    height: cx(10),
    marginTop: -cx(1.7),
  },
});
