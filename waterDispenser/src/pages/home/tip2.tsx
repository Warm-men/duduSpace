import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Res from '@res';
import String from '@i18n';
import { actions } from '@models';
import { getDeviceCloudData } from '@api';

const { convert: c, convertX: cx, convertY: cy } = Utils.RatioUtils;
interface MainProps {
  deviceOnline: boolean;
  workState: boolean;
}

const Tip: React.FC = (props: MainProps) => {
  const { deviceOnline, workState } = props;

  const { deviceWashState } = useSelector(({ cloudData }: any) => cloudData);
  const [washState, setWashState] = useState({
    switch: false,
    time: '',
    repeat: 0,
    hourAndMinute: [0, 0, 0],
  });
  const dispatch = useDispatch();

  const navigation = useNavigation();

  useEffect(() => {
    setWashState(deviceWashState);
  }, [
    deviceWashState.switch,
    deviceWashState.time,
    deviceWashState.repeat,
    deviceWashState.hourAndMinute,
  ]);

  useEffect(() => {
    handleGetCloud();
  }, []);

  const handleGetCloud = async () => {
    // 用promise.all请求所有接口，返回后统一处理
    const results = await getDeviceCloudData('deviceWashState');
    if (typeof results === 'object' && Object.keys(results).length > 0) {
      setWashState(results);
      dispatch(actions.common.updateCloudData({ deviceWashState: results }));
    }
  };

  const getHint = () => {
    // !cleanType 表示清洗倒计时未逾期
    // const leftDay = getCleanDayLeft('');
    const { switch: _switch, time, repeat, hourAndMinute } = washState;
    if (!_switch || !time) {
      return (
        <TYText style={styles.text1}>
          {String.getLang('device_washing')}
          <TYText size={cx(12)} color="#FA5F5F">
            {String.getLang('go_setting')}
          </TYText>
        </TYText>
      );
    }

    const [hour, _s, minute] = hourAndMinute;
    // 用cleanReminderTime的记录的这一天，得出离今天过去了多少天
    const diffDay = moment().diff(moment(time, 'YYYY-MM-DD'), 'days');
    // 用相差的天数，对比提醒周期天数，得出是否预期
    const isOverDay = diffDay - repeat;
    // 对比当前时间是否已经过了设置的时间 cleanReminderHourAndMinute: hour、minute
    const isOverHourAndMinute = moment().isAfter(moment().set({ hour, minute }));
    const leftDay = repeat - diffDay;
    const isToday = repeat === diffDay;

    if (isToday && isOverHourAndMinute) {
      return (
        <TYText style={styles.text1}>
          {String.getLang('device_washing')}
          <TYText size={cx(12)} color="#FA5F5F">
            <TYText style={styles.text2}>{String.getLang('today_is_over')}</TYText>
          </TYText>
        </TYText>
      );
    }
    if (isOverDay > 0 && isOverHourAndMinute) {
      return (
        <TYText style={styles.text1}>
          {String.getLang('device_washing')}
          <TYText style={styles.text1}>
            {String.getLang('over_day')}
            <TYText size={cx(12)} color="#FA5F5F">{` ${isOverDay} `}</TYText>
            {String.getLang('day_unit')}
          </TYText>
        </TYText>
      );
    }
    return (
      <TYText style={styles.text1}>
        {String.getLang('device_washing')}
        <TYText style={styles.text1}>
          {String.getLang('left_days')}
          <TYText style={styles.text2}>{` ${leftDay} `}</TYText>
          {String.getLang('day_unit')}
        </TYText>
      </TYText>
    );
  };

  return (
    <View style={styles.tipView}>
      <View style={styles.fadeView}>
        <Image source={Res.p_line_2} style={styles.line} resizeMode="stretch" />
      </View>
      <View style={styles.fadeView}>
        <TouchableOpacity
          style={styles.bubble}
          activeOpacity={0.8}
          onPress={() => {
            if (!deviceOnline || workState) return;
            navigation.navigate('deviceWash');
          }}
        >
          {getHint()}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Tip;

const styles = StyleSheet.create({
  tipView: {
    flex: 1,
    position: 'absolute',
    top: cx(164),
    left: cx(26),
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
    width: cx(50),
    height: cx(40),
    marginTop: cx(-30),
  },
  bubble: {
    alignSelf: 'flex-start',
    width: cx(76),
    borderRadius: cx(15),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: cx(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    paddingHorizontal: cx(6),
    flexDirection: 'row',
  },
});
