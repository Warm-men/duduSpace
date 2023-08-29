import React, { useEffect, useState } from 'react';
import { commonColor, commonStyles, cx, width, dpCodes } from '@config';
import i18n from '@i18n';
import Res from '@res';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SwitchButton, TYText, TYSdk, Utils } from 'tuya-panel-kit';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { getCleanDayLeft } from '@utils';

const { childLockCode, powerModeCode, batteryLevelCode, cleanTimeCode, cleanTypeCode } = dpCodes;
const { toFixed } = Utils.CoreUtils;

const Setting: React.FC = props => {
  const {
    [childLockCode]: childLock,
    [powerModeCode]: powerMode,
    [batteryLevelCode]: batteryLevel,
    [cleanTimeCode]: cleanTime,
    [cleanTypeCode]: cleanType,
  } = useSelector(({ dpState }: any) => dpState);

  const { filterState } = useSelector(({ cloudData }: any) => cloudData);

  const { switch: _switch, time, repeat, hourAndMinute } = filterState || {
    switch: false,
    time: '',
    repeat: 30,
    hourAndMinute: [0, 0, 0],
  };

  const [filterSwitch, setFilterSwitch] = useState(false);
  const [filterTime, setFilterTime] = useState('');
  const [filterRepeat, setFilterRepeat] = useState(30);
  const [filterHourAndMinute, setFilterHourAndMinute] = useState([0, 0, 0]);
  const navigation = useNavigation();

  useEffect(() => {
    if (_switch && time) {
      setFilterSwitch(_switch);
      setFilterTime(time);
      setFilterRepeat(repeat);
      setFilterHourAndMinute(hourAndMinute);
    }
  }, [_switch, time, repeat, hourAndMinute]);

  const getFilterHint = () => {
    // 未设置干燥剂提醒
    if (!filterSwitch) return null;
    if (filterRepeat === 0) return '';

    const [hour, minute] = filterHourAndMinute;
    // 用cleanReminderTime的记录的这一天，得出离今天过去了多少天
    const diffDay = moment().diff(moment(filterTime, 'YYYY-MM-DD'), 'days');
    // 用相差的天数，对比提醒周期天数，得出是否预期
    const isOverDay = diffDay - filterRepeat;
    // 对比当前时间是否已经过了设置的时间 cleanReminderHourAndMinute: hour、minute
    const isOverHourAndMinute = moment().isAfter(moment().set({ hour, minute }));
    const leftDay = filterRepeat - diffDay;
    const isToday = filterRepeat === diffDay;
    if (isToday && isOverHourAndMinute) {
      return i18n.getLang('remain_time_3');
    }
    if (isOverDay > 0 && isOverHourAndMinute) {
      return `${i18n.getLang('over_day')} ${isOverDay} ${i18n.getLang('remain_time_2')}`;
    }
    return `${i18n.getLang('remain_time_1')} ${leftDay} ${i18n.getLang('remain_time_2')}`;
  };

  const getWashingHint = () => {
    // !cleanType 表示设备倒计时清理还没到期
    const leftDay = getCleanDayLeft(cleanTime);
    if (!leftDay.isOverTimer) {
      return `${i18n.getLang('device_washing_left')}${leftDay.leftDay}${i18n.getLang(
        'device_washing_unit'
      )}`;
    }
    return `${i18n.getLang('over_day')}${Math.abs(leftDay.leftDay)}${i18n.getLang(
      'device_washing_unit'
    )}`;
  };

  const batteryLowLevel = ['twenty'];
  const data1 = [
    {
      icon: Res.setting_icon_power_type,
      title: i18n.getLang('power_type'),
      value:
        powerMode === 'strong_power' ? i18n.getLang('power_mode_0') : i18n.getLang('power_mode_1'),
      hasClick: false,
      show: true,
    },
    {
      icon: Res.setting_icon_battery_status,
      title: i18n.getLang('battery_status'),
      value: i18n.getLang(`${batteryLevelCode}_${batteryLevel}`),
      hasClick: false,
      color: batteryLowLevel.includes(batteryLevel) ? '#FA5F5F' : '#ADA49B',
      show: powerMode === 'battery_power',
    },
    {
      icon: Res.setting_icon_fitter_replace,
      title: i18n.getLang('fitter_replace'),
      value: filterSwitch ? getFilterHint() : i18n.getLang('go_setting'),
      onPress: () => {
        navigation.navigate('filterElement');
      },
      hasClick: true,
      show: true,
    },
    {
      icon: Res.setting_icon_cleanout,
      title: i18n.getLang('device_clean'),
      value: getWashingHint(),
      onPress: () => {
        navigation.navigate('deviceWash');
      },
      hasClick: true,
      show: true,
    },
  ];
  const data2 = [
    {
      icon: Res.setting_icon_lock,
      title: i18n.getLang('child_lock'),
      desc: i18n.getLang('child_lock_tip'),
      value: childLock,
      onPress: value => {
        TYSdk.device.putDeviceData({ [childLockCode]: value });
      },
      isBool: true,
      show: true,
    },
    {
      icon: Res.setting_icon_specification,
      title: i18n.getLang('instructions'),
      onPress: () => {
        // TODO 跳转到说明书
        console.log('111');
      },
      show: true,
    },
  ];

  const renderItem = ({ icon, title, desc, color, value, onPress, isBool, hasClick, show }) => {
    if (!show) return null;
    return (
      <TouchableOpacity
        disabled={!!value || !hasClick}
        key={title}
        style={[commonStyles.flexRowBetween, styles.setBox]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={commonStyles.flexRowCenter}>
          <Image source={icon} style={styles.img} />
          <View>
            <TYText color={commonColor.mainText} size={cx(15)}>
              {title}
            </TYText>
            {!!desc && (
              <TYText color="#ADA49B" size={cx(12)} style={styles.decText}>
                {desc}
              </TYText>
            )}
          </View>
        </View>
        {!onPress && (
          <TYText color={color || '#ADA49B'} size={cx(15)}>
            {value}
          </TYText>
        )}
        {!!onPress && (
          <View>
            {isBool ? (
              <SwitchButton
                value={value}
                theme={{ width: cx(45), height: cx(26), thumbSize: cx(21) }}
                onTintColor={commonColor.brown}
                tintColor="#ECEBE8"
                onValueChange={onPress}
              />
            ) : (
              <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={!hasClick}>
                <View style={commonStyles.flexRowCenter}>
                  {!!value && (
                    <TYText color={color || '#ADA49B'} size={cx(15)}>
                      {value}
                    </TYText>
                  )}
                  {hasClick && <Image source={Res.arrow_right} />}
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={commonStyles.flexOne}>
      <View style={[commonStyles.shadow, styles.container]}>
        {data1.map(item => renderItem(item))}
      </View>
      <View style={[commonStyles.shadow, styles.container]}>
        {data2.map(item => renderItem(item))}
      </View>
    </View>
  );
};

export default Setting;

const styles = StyleSheet.create({
  container: {
    marginTop: cx(15),
    marginHorizontal: cx(15),
    padding: cx(15),
    width: width - cx(30),
    borderRadius: cx(10),
  },
  setBox: {
    paddingVertical: cx(12),
  },
  img: {
    marginRight: cx(16),
    width: cx(30),
    height: cx(30),
  },
  decText: {
    width: cx(200),
    lineHeight: cx(16),
    marginTop: cx(5),
  },
});
