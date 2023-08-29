import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Res from '@res';
import String from '@i18n';
import { dpCodes } from '@config';
import { getCleanDayLeft } from '@utils';

const { convert: c, convertX: cx, convertY: cy } = Utils.RatioUtils;
const { cleanTimeCode, cleanTypeCode } = dpCodes;
interface MainProps {
  deviceOnline: boolean;
  workState: boolean;
}

const Tip: React.FC = (props: MainProps) => {
  const { deviceOnline, workState } = props;
  const { [cleanTimeCode]: cleanTime, [cleanTypeCode]: cleanType } = useSelector(
    ({ dpState }: any) => dpState
  );

  const navigation = useNavigation();

  const getHint = () => {
    // !cleanType 表示清洗倒计时未逾期
    const leftDay = getCleanDayLeft(cleanTime);
    if (!leftDay.isOverTimer) {
      return (
        <TYText style={[styles.text2]}>
          {String.getLang('device_washing_left')}
          <TYText size={cx(12)} color="#44B74A">
            {leftDay.leftDay}
          </TYText>
          {String.getLang('device_washing_unit')}
        </TYText>
      );
    }
    return (
      <TYText style={[styles.text2]}>
        {String.getLang('over_day')}
        <TYText size={cx(12)} color="#FA5F5F">
          {leftDay.leftDay}
        </TYText>
        {String.getLang('device_washing_unit')}
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
          <TYText style={styles.text1}>
            {String.getLang('device_washing')}
            {getHint()}
          </TYText>
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
    color: '#968E87',
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
