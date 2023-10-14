import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BrickButton, TYText, Popup, GlobalToast, TYSdk } from 'tuya-panel-kit';
import _ from 'lodash';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import {
  commonColor,
  commonStyles,
  commonPopStyle,
  cx,
  width,
  commonPopStyleTimePiker,
} from '@config';
import { actions } from '@models';
import i18n from '@i18n';
import Res from '@res';
import { saveDeviceCloudData } from '@api';
import TipModal from '@components/tipModal';

const DryAgent: React.FC = props => {
  const { route } = props;
  const dispatch = useDispatch();
  const { dryAgentState } = useSelector(({ cloudData }: any) => cloudData);

  const {
    dryAgentSwitch: _dryAgentSwitch,
    dryAgentTime: _dryAgentTime,
    dryAgentRepeat: _dryAgentRepeat,
    dryAgentHourAndMinute: _dryAgentHourAndMinute,
  } = dryAgentState || {
    dryAgentSwitch: false,
    dryAgentTime: '',
    dryAgentRepeat: 30,
    dryAgentHourAndMinute: [0, 0],
  };

  // 当前时间：小时
  const currentHour = moment().hour();
  // 当前时间：分钟
  const currentMinute = moment().minute();
  const [dryAgentSwitch, setDryAgentSwitch] = useState(false);
  const [dryAgentTime, setDryAgentTime] = useState('');
  const [dryAgentRepeat, setDryAgentRepeat] = useState(30);
  const [dryAgentRepeatCurrent, setDryAgentRepeatCurrent] = useState(30);
  const [dryAgentHourAndMinute, setDryAgentHourAndMinute] = useState([
    currentHour,
    0,
    currentMinute,
  ]);

  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    if (_dryAgentSwitch && _dryAgentTime) {
      setDryAgentSwitch(_dryAgentSwitch);
      setDryAgentTime(_dryAgentTime);
      setDryAgentRepeat(_dryAgentRepeat);
      setDryAgentRepeatCurrent(_dryAgentRepeat);
      setDryAgentHourAndMinute([_dryAgentHourAndMinute[0], 0, _dryAgentHourAndMinute[1]]);
    }
  }, [_dryAgentSwitch, _dryAgentTime, _dryAgentRepeat, _dryAgentHourAndMinute]);

  const onSave = async () => {
    if (!dryAgentSwitch) {
      await saveDeviceCloudData('dryAgentSwitch', '1');
    }
    const time = moment().format('YYYY-MM-DD');
    await saveDeviceCloudData('dryAgentTime', { time });
    setDryAgentTime(time);
    await saveDeviceCloudData('dryAgentRepeat', `${dryAgentRepeatCurrent}`);
    setDryAgentRepeat(dryAgentRepeatCurrent);
    await saveDeviceCloudData('dryAgentHourAndMinute', {
      hour: dryAgentHourAndMinute[0],
      minute: dryAgentHourAndMinute[2],
    });
    GlobalToast.show({
      text: dryAgentSwitch ? '更新成功' : '设置成功',
      showIcon: false,
      contentStyle: {},
      onFinish: () => {
        GlobalToast.hide();
      },
    });
    const _dryAgentState = {
      dryAgentSwitch,
      dryAgentTime,
      dryAgentRepeat: dryAgentRepeatCurrent,
      dryAgentHourAndMinute: [dryAgentHourAndMinute[0], dryAgentHourAndMinute[2]],
    };
    dispatch(actions.common.updateCloudData({ dryAgentState: _dryAgentState }));
  };

  const handleFinishSet = async () => {
    if (dryAgentSwitch) {
      return setShowTip(true);
    }
    await onSave();
  };

  const showRepeatTimePicker = () => {
    const dataSource = _.range(1, 31).map((item: number) => ({
      label: `${item}`,
      value: item,
    }));
    Popup.picker({
      ...commonPopStyle,
      dataSource,
      title: i18n.getLang('reminder_cycle'),
      cancelText: i18n.getLang('cancel'),
      confirmText: i18n.getLang('confirm'),
      pickerWrapperStyle: { width: cx(285) },
      pickerStyle: {
        height: cx(210),
        width: cx(285),
        justifyContent: 'center',
      },
      value: dryAgentRepeatCurrent,
      labelOffset: cx(50),
      label: i18n.getLang('day'),
      pickerFontColor: commonColor.mainText,
      pickerUnitColor: commonColor.mainText,
      theme: { fontSize: cx(18) },
      onMaskPress: ({ close }) => close(),
      onConfirm: (value, idx, { close }) => {
        setDryAgentRepeatCurrent(value);
        close();
      },
      onCancel: () => Popup.close(),
    });
  };

  const showReminderTimePicker = () => {
    const dataSource1 = _.range(0, 24).map((item: number) => ({
      label: `${item}`,
      value: item,
    }));
    const dataSource2 = _.range(0, 60).map((item: number) => ({
      label: `${item}`,
      value: item,
    }));
    Popup.picker({
      ...commonPopStyleTimePiker,
      dataSource: [dataSource1, [{ label: ':', value: 0 }], dataSource2],
      singlePicker: false,
      title: i18n.getLang('reminder_time'),
      cancelText: i18n.getLang('cancel'),
      confirmText: i18n.getLang('confirm'),
      value: dryAgentHourAndMinute,
      pickerStyle: {
        height: cx(210),
        width: cx(100),
        justifyContent: 'center',
      },
      labelOffset: cx(40),
      theme: { fontSize: cx(18) },
      onMaskPress: ({ close }) => close(),
      onConfirm: (value, idx, { close }) => {
        setDryAgentHourAndMinute(value);
        close();
      },
    });
  };

  const renderPopTip = () => {
    // 未设置干燥剂提醒
    if (!dryAgentSwitch) return null;

    const [hour, _s, minute] = dryAgentHourAndMinute;
    // 用cleanReminderTime的记录的这一天，得出离今天过去了多少天
    const diffDay = moment().diff(moment(dryAgentTime, 'YYYY-MM-DD'), 'days');
    // 用相差的天数，对比提醒周期天数，得出是否预期
    const isOverDay = diffDay - dryAgentRepeat;
    // 对比当前时间是否已经过了设置的时间 cleanReminderHourAndMinute: hour、minute
    const isOverHourAndMinute = moment().isAfter(moment().set({ hour, minute }));
    const leftDay = dryAgentRepeat - diffDay;
    const isToday = dryAgentRepeat === diffDay;
    if (isToday && isOverHourAndMinute) {
      return (
        <View style={[styles.center, { marginLeft: cx(90) }]}>
          <View style={[styles.center, styles.productTextBox]}>
            <TYText size={cx(14)} color={commonColor.red}>
              {i18n.getLang('remainTime3')}
            </TYText>
          </View>
          <Image source={Res.tip_} style={styles.popImage} />
        </View>
      );
    }
    if (isOverDay > 0 && isOverHourAndMinute) {
      return (
        <View style={[styles.center, { marginLeft: cx(90) }]}>
          <View style={[styles.center, styles.productTextBox]}>
            <TYText size={cx(14)} color="#7C7269">
              {i18n.getLang('over_day')}
              <TYText size={cx(14)} color={commonColor.red}>
                {` ${isOverDay} `}
              </TYText>
              {i18n.getLang('remainTime2')}
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
            {i18n.getLang('remainTime1')}
            <TYText size={cx(14)} color={commonColor.green}>
              {` ${leftDay} `}
            </TYText>
            {i18n.getLang('remainTime2')}
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
            <Image source={Res.filter} style={{ width: cx(120), height: cx(120) }} />
          </View>
          <View style={styles.productTipsBox}>
            <TYText
              size={cx(14)}
              color={commonColor.mainText}
              weight={500}
              style={{ marginBottom: cx(10) }}
            >
              {i18n.getLang('tips')}
            </TYText>
            <TYText style={styles.tips}>{i18n.getLang('dryAgentDesc1')}</TYText>
            <TYText style={styles.tips}>{i18n.getLang('dryAgentDesc2')}</TYText>
          </View>
        </View>

        <View style={[commonStyles.shadow, styles.container1]}>
          <View style={[styles.flexRowBetween, styles.optionBox]}>
            <TYText style={styles.optionTitle}>{i18n.getLang('reminder_cycle')}</TYText>
            <TouchableOpacity activeOpacity={0.8} onPress={showRepeatTimePicker}>
              <View style={commonStyles.flexRowCenter}>
                <TYText style={styles.optionValue}>
                  {`${dryAgentRepeatCurrent}${i18n.getLang('unit_day')}`}
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
                  {`${dryAgentHourAndMinute[0]}:${dryAgentHourAndMinute[2]}`}
                </TYText>
                <Image source={Res.arrow_right} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <BrickButton
        text={!dryAgentSwitch ? i18n.getLang('finishSet') : i18n.getLang('reset_dry_agent')}
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

export default DryAgent;

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
    marginTop: -cx(2.2),
  },
});
