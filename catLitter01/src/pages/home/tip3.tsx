import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import _get from 'lodash/get';
import Res from '@res';
import { getDeviceCloudData } from '@api';
import String from '@i18n';
import { actions } from '@models';
import { commonColor } from '@config';

const { convertX: cx } = Utils.RatioUtils;
const Tip: React.FC = () => {
  const navigation = useNavigation();

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

  const { deviceOnline } = useSelector(({ devInfo }: any) => devInfo);
  const [dryAgentSwitch, setDryAgentSwitch] = useState(false);
  const [dryAgentTime, setDryAgentTime] = useState('');
  const [dryAgentRepeat, setDryAgentRepeat] = useState(30);
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
    handleGetCloud();
    getCatLitterType();
    handleGetCloudReminder();
  }, []);

  const handleGetCloudReminder = async () => {
    // 用promise.all请求所有接口，返回后统一处理
    const results = await Promise.all([
      getDeviceCloudData('cleanReminderSwitch'),
      getDeviceCloudData('cleanReminderTime'),
      getDeviceCloudData('cleanReminderRepeat'),
      getDeviceCloudData('cleanReminderHourAndMinute'),
    ]);
    const [switchRes, timeRes, repeatRes, hourAndMinuteRes] = results;
    const _switch = !!+switchRes;
    const _time = _get(timeRes, 'time', '');
    const _repeat = +repeatRes || 0;
    const _hour = _get(hourAndMinuteRes, 'hour', 0);
    const _minute = _get(hourAndMinuteRes, 'minute', 0);
    const cleanReminderState = {
      cleanReminderSwitch: _switch,
      cleanReminderTime: _time,
      cleanReminderRepeat: _repeat,
      cleanReminderHourAndMinute: [_hour, _minute],
    };
    dispatch(actions.common.updateCloudData({ cleanReminderState }));
  };

  const getCatLitterType = async () => {
    const res = await getDeviceCloudData('catLitterType');
    if (typeof res === 'string') {
      dispatch(actions.common.updateCloudData({ catLitterType: res }));
    }
  };

  const handleGetCloud = async () => {
    // 用promise.all请求所有接口，返回后统一处理
    const results = await Promise.all([
      getDeviceCloudData('dryAgentSwitch'),
      getDeviceCloudData('dryAgentTime'),
      getDeviceCloudData('dryAgentRepeat'),
      getDeviceCloudData('dryAgentHourAndMinute'),
    ]);
    const [switchRes, timeRes, repeatRes, hourAndMinuteRes] = results;
    const _switch = !!+switchRes;
    const _time = _get(timeRes, 'time', '');
    const _repeat = +repeatRes || 0;
    const _hour = _get(hourAndMinuteRes, 'hour', 0);
    const _minute = _get(hourAndMinuteRes, 'minute', 0);
    if (_switch) {
      setDryAgentSwitch(_switch);
    }
    if (_time) {
      setDryAgentTime(_time);
    }
    if (_repeat) {
      setDryAgentRepeat(_repeat);
    }
    if (_hour) {
      setDryAgentHourAndMinute([_hour, _minute]);
    }
    const _dryAgentState = {
      dryAgentSwitch: _switch,
      dryAgentTime: _time,
      dryAgentRepeat: _repeat,
      dryAgentHourAndMinute: [_hour, _minute],
    };
    dispatch(actions.common.updateCloudData({ dryAgentState: _dryAgentState }));
  };

  const renderPopTip = () => {
    // 未设置干燥剂提醒
    if (!dryAgentSwitch)
      return <TYText style={styles.text1}>{String.getLang('go_setting_filter')}</TYText>;

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
        // <TYText style={styles.text1}>
        //   {String.getLang('deodorizing_block')}
        //   <TYText style={styles.text1} color={commonColor.red}>
        //     <TYText style={styles.text2}>{String.getLang('remainTime3')}</TYText>
        //   </TYText>
        // </TYText>
        <TYText style={styles.text1}>
          {String.getLang('deodorizing_block')}
          <TYText style={styles.text1}>
            {String.getLang('remainTime1')}
            <TYText style={styles.text2}>{` ${leftDay} `}</TYText>
            {String.getLang('remainTime2')}
          </TYText>
        </TYText>
      );
    }
    if (isOverDay > 0 && isOverHourAndMinute) {
      return (
        <TYText style={styles.text1}>
          {String.getLang('deodorizing_block')}
          <TYText style={styles.text1}>
            {String.getLang('over_day')}
            <TYText style={[styles.text2, { color: commonColor.red }]}>{` ${isOverDay} `}</TYText>
            {String.getLang('remainTime2')}
          </TYText>
        </TYText>
      );
    }
    return (
      <TYText style={styles.text1}>
        {String.getLang('deodorizing_block')}
        <TYText style={styles.text1}>
          {String.getLang('remainTime1')}
          <TYText style={styles.text2}>{` ${leftDay} `}</TYText>
          {String.getLang('remainTime2')}
        </TYText>
      </TYText>
    );
  };

  return (
    <View style={styles.tipView}>
      <View style={styles.fadeView}>
        <TouchableOpacity
          style={styles.bubble}
          activeOpacity={0.8}
          onPress={() => {
            navigation.navigate('dryAgent', { onCallBack: handleGetCloud });
          }}
          disabled={!deviceOnline}
        >
          {renderPopTip()}
        </TouchableOpacity>
      </View>
      <View style={styles.fadeView}>
        <Image source={Res.p_line_3} style={styles.line} resizeMode="stretch" />
      </View>
    </View>
  );
};

export default Tip;

const styles = StyleSheet.create({
  tipView: {
    flex: 1,
    position: 'absolute',
    top: cx(68),
    right: cx(14),
    flexDirection: 'row-reverse',
  },
  fadeView: {
    height: cx(120),
    justifyContent: 'center',
  },
  text1: {
    fontSize: cx(12),
    color: '#49362F',
    lineHeight: cx(16),
  },
  text2: {
    fontSize: cx(12),
    color: '#44B74A',
    lineHeight: cx(16),
  },
  line: {
    width: cx(46),
    height: cx(38),
    marginTop: cx(36),
  },
  bubble: {
    alignSelf: 'flex-start',
    width: cx(75),
    borderRadius: cx(15),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: cx(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 2,
    shadowRadius: 2,
    paddingHorizontal: cx(8),
    flexDirection: 'row',
  },
});
