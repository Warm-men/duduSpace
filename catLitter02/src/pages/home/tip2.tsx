import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import _get from 'lodash/get';
import { getDeviceCloudData } from '@api';
import String from '@i18n';
import { actions } from '@models';
import { commonColor } from '@config';
import TipPop from '@components/tip';

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
      return (
        <TYText style={styles.text1}>
          {String.getLang('go_setting_filter_0')}
          <TYText style={styles.text3}>{String.getLang('go_setting_filter_1')}</TYText>
        </TYText>
      );

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
    <TipPop
      style={{ position: 'absolute', bottom: cx(26), left: cx(14), width: cx(84) }}
      boxStyle={{ flexDirection: 'column' }}
      subTitleStyle={{ color: 'red' }}
      onPress={() => {
        navigation.navigate('dryAgent', { onCallBack: handleGetCloud });
      }}
      lineStyle={{
        position: 'absolute',
        top: cx(163),
        left: cx(84),
        width: cx(54),
        height: cx(74),
      }}
      isHDirect={true}
      isVDirect={false}
      renderText={renderPopTip}
      disabled={!deviceOnline}
    />
  );
};

export default Tip;

const styles = StyleSheet.create({
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
  text3: {
    fontSize: cx(12),
    color: '#FA5F5F',
    lineHeight: cx(16),
  },
});
