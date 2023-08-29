import React, { useEffect, useState } from 'react';
import { commonColor, commonStyles, cx, width, dpCodes } from '@config';
import i18n from '@i18n';
import Res from '@res';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SwitchButton, TYText, TYSdk } from 'tuya-panel-kit';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

const { childLockCode } = dpCodes;

const Setting: React.FC = props => {
  const { [childLockCode]: childLock } = useSelector(({ dpState }: any) => dpState);

  const navigation = useNavigation();

  const { dryAgentState, catLitterType: _catLitterType, cleanReminderState } = useSelector(
    ({ cloudData }: any) => cloudData
  );

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

  const [catLitterType, setCatLitterType] = useState(_catLitterType);
  const [cleanReminderSwitch, setCleanReminderSwitch] = useState(false);
  const [cleanReminderTime, setCleanReminderTime] = useState('');
  const [cleanReminderRepeat, setCleanReminderRepeat] = useState(0);
  const [cleanReminderHourAndMinute, setCleanReminderHourAndMinute] = useState([0, 0]);

  const [dryAgentSwitch, setDryAgentSwitch] = useState(false);
  const [dryAgentTime, setDryAgentTime] = useState('');
  const [dryAgentRepeat, setDryAgentRepeat] = useState(0);
  const [dryAgentHourAndMinute, setDryAgentHourAndMinute] = useState([0, 0]);

  useEffect(() => {
    if (_dryAgentSwitch && _dryAgentTime) {
      setDryAgentSwitch(_dryAgentSwitch);
      setDryAgentTime(_dryAgentTime);
      setDryAgentRepeat(_dryAgentRepeat);
      setDryAgentHourAndMinute(_dryAgentHourAndMinute);
    }
  }, [_dryAgentSwitch, _dryAgentTime, _dryAgentRepeat, _dryAgentHourAndMinute]);

  useEffect(() => {
    setCleanReminderSwitch(_cleanReminderSwitch);
    setCleanReminderTime(_cleanReminderTime);
    setCleanReminderRepeat(_cleanReminderRepeat);
    setCleanReminderHourAndMinute(_cleanReminderHourAndMinute);
  }, [_cleanReminderSwitch, _cleanReminderTime, _cleanReminderRepeat, _cleanReminderHourAndMinute]);

  useEffect(() => {
    if (_catLitterType) {
      setCatLitterType(_catLitterType);
    }
  }, [_catLitterType]);

  const getRemindHint = () => {
    if (cleanReminderRepeat === 0) return '';
    const [hour, minute] = cleanReminderHourAndMinute;
    // 用cleanReminderTime的记录的这一天，得出离今天过去了多少天
    const diffDay = moment().diff(moment(cleanReminderTime, 'YYYY-MM-DD'), 'days');
    // 用相差的天数，对比提醒周期天数，得出当前是否今天需要提醒，提醒周期定义为：每隔n天
    const isToday = diffDay % cleanReminderRepeat === 0;
    // 对比当前时间是否已经过了设置的时间 cleanReminderHourAndMinute: hour、minute
    const isOverHourAndMinute = moment().isAfter(moment().set({ hour, minute }));
    if (isToday && isOverHourAndMinute && diffDay > 0) {
      return i18n.getLang('need_clean_reminder');
    }
    const leftDay = diffDay > 0 ? diffDay % (cleanReminderRepeat + 1) : cleanReminderRepeat;
    return i18n.formatValue('clean_reminder_left', leftDay);
  };

  const getDryAgentHint = () => {
    // 未设置干燥剂提醒
    if (!dryAgentSwitch) return null;
    if (dryAgentRepeat === 0) return '';

    const [hour, minute] = dryAgentHourAndMinute;
    // 用cleanReminderTime的记录的这一天，得出离今天过去了多少天
    const diffDay = moment().diff(moment(dryAgentTime, 'YYYY-MM-DD'), 'days');
    // 用相差的天数，对比提醒周期天数，得出是否预期
    const isOverDay = diffDay - dryAgentRepeat;
    // 对比当前时间是否已经过了设置的时间 cleanReminderHourAndMinute: hour、minute
    const isOverHourAndMinute = moment().isAfter(moment().set({ hour, minute }));
    const leftDay = dryAgentRepeat - diffDay;
    const isToday = dryAgentRepeat === diffDay;
    if (isToday && isOverHourAndMinute) {
      return i18n.getLang('remainTime3');
    }
    if (isOverDay > 0 && isOverHourAndMinute) {
      return `${i18n.getLang('over_day')} ${isOverDay} ${i18n.getLang('remainTime2')}`;
    }
    return `${i18n.getLang('remainTime1')} ${leftDay} ${i18n.getLang('remainTime2')}`;
  };

  const data1 = [
    {
      icon: Res.setting_icon_catLitter,
      title: i18n.getLang('cat_litter_type'),
      value: catLitterType ? i18n.getLang(catLitterType) : i18n.getLang('cat_litter_type_00'),
      onPress: () => {
        navigation.navigate('catLitterType');
      },
    },
    {
      icon: Res.setting_icon_cleanout,
      title: i18n.getLang('cleaning_reminder'),
      value: cleanReminderSwitch ? getRemindHint() : i18n.getLang('clean_reminder_off'),
      onPress: () => {
        navigation.navigate('cleaningReminder');
      },
    },
    {
      icon: Res.common_icon_deodorization,
      title: i18n.getLang('reminder_deodorizer_block'),
      value: dryAgentSwitch ? getDryAgentHint() : i18n.getLang('go_setting'),
      onPress: () => {
        navigation.navigate('dryAgent');
      },
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
    },
    {
      icon: Res.setting_icon_specification,
      title: i18n.getLang('instructions'),
      onPress: () => {
        // TODO 跳转到说明书
        console.log('111');
      },
    },
    // 通知功能暂时不做
    // {
    //   icon: Res.setting_icon_inform,
    //   title: i18n.getLang('notification_switch'),
    //   onPress: () => {
    //     navigation.navigate('notice');
    //   },
    // },
  ];

  const renderItem = ({ icon, title, desc, color, value, onPress, isBool }) => {
    return (
      <TouchableOpacity
        disabled={!!value}
        key={title}
        style={[commonStyles.flexRowBetween, styles.setBox]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={commonStyles.flexRowCenter}>
          <Image source={icon} style={styles.img} />
          <View>
            <TYText color={commonColor.mainText} size={cx(15)} weight={500}>
              {title}
            </TYText>
            {!!desc && (
              <TYText color="#ADA49B" size={cx(12)}>
                {desc}
              </TYText>
            )}
          </View>
        </View>
        {!onPress && (
          <TYText color={color || '#ADA49B'} size={cx(15)} weight={500}>
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
              <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
                <View style={commonStyles.flexRowCenter}>
                  {!!value && (
                    <TYText color="#ADA49B" size={cx(15)} weight={500}>
                      {value}
                    </TYText>
                  )}
                  <Image source={Res.arrow_right} />
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
    height: cx(60),
  },
  img: {
    marginRight: cx(16),
    width: cx(30),
    height: cx(30),
  },
});
