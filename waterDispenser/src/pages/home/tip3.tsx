import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Utils, TYText, TYSdk } from 'tuya-panel-kit';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import Res from '@res';
import { getDeviceCloudData } from '@api';
import String from '@i18n';
import { actions } from '@models';
import { useDispatch, useSelector } from 'react-redux';
import { commonColor } from '@config';

const { convertX: cx } = Utils.RatioUtils;

interface MainProps {
  deviceOnline: boolean;
  workState: boolean;
}
const Tip: React.FC = (props: MainProps) => {
  const { deviceOnline, workState } = props;
  const navigation = useNavigation();

  const dispatch = useDispatch();

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

  useEffect(() => {
    if (_switch && time) {
      setFilterSwitch(_switch);
      setFilterTime(time);
      setFilterRepeat(repeat);
      setFilterHourAndMinute(hourAndMinute);
    }
  }, [_switch, time, repeat, hourAndMinute]);

  useEffect(() => {
    handleGetCloud();
  }, []);

  const handleGetCloud = async () => {
    // 用promise.all请求所有接口，返回后统一处理
    const results = await getDeviceCloudData('filterState');
    if (typeof results === 'object' && Object.keys(results).length > 0) {
      const { switch: _switch_, time, repeat, hourAndMinute } = results;
      setFilterSwitch(_switch_);
      setFilterTime(time);
      setFilterRepeat(repeat);
      setFilterHourAndMinute(hourAndMinute);

      dispatch(actions.common.updateCloudData({ filterState: results }));
    }
  };

  const renderPopTip = () => {
    // 未设置干燥剂提醒
    if (!filterSwitch) return <TYText style={styles.text1}>{String.getLang('go_setting')}</TYText>;

    const [hour, _s, minute] = filterHourAndMinute;
    // 用cleanReminderTime的记录的这一天，得出离今天过去了多少天
    const diffDay = moment().diff(moment(filterTime, 'YYYY-MM-DD'), 'days');
    // 用相差的天数，对比提醒周期天数，得出是否预期
    const isOverDay = diffDay - filterRepeat;
    // 对比当前时间是否已经过了设置的时间 cleanReminderHourAndMinute: hour、minute
    const isOverHourAndMinute = moment().isAfter(moment().set({ hour, minute }));
    const leftDay = filterRepeat - diffDay;
    const isToday = filterRepeat === diffDay;
    if (isToday && isOverHourAndMinute) {
      return (
        <TYText style={styles.text1}>
          {String.getLang('filter_replace')}
          <TYText style={styles.text1} color={commonColor.red}>
            <TYText style={styles.text2}>{String.getLang('today_is_over')}</TYText>
          </TYText>
        </TYText>
      );
    }
    if (isOverDay > 0 && isOverHourAndMinute) {
      return (
        <TYText style={styles.text1}>
          {String.getLang('filter_replace')}
          <TYText style={styles.text1}>
            {String.getLang('over_day')}
            <TYText style={styles.text2} color={commonColor.red}>{` ${isOverDay} `}</TYText>
            {String.getLang('day_unit')}
          </TYText>
        </TYText>
      );
    }
    return (
      <TYText style={styles.text1}>
        {String.getLang('filter_replace')}
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
        <TouchableOpacity
          style={styles.bubble}
          activeOpacity={0.8}
          onPress={() => {
            if (!deviceOnline || workState) return;
            navigation.navigate('filterElement');
          }}
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
    top: cx(-10),
    right: cx(16),
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
    width: cx(52),
    height: cx(56),
    marginTop: cx(58),
  },
  bubble: {
    alignSelf: 'flex-start',
    width: cx(88),
    borderRadius: cx(15),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: cx(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    paddingHorizontal: cx(8),
    flexDirection: 'row',
  },
});
