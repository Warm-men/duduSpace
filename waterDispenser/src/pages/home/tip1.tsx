import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Res from '@res';
import String from '@i18n';
import { dpCodes } from '@config';

const { convert: c, convertX: cx, convertY: cy } = Utils.RatioUtils;

const { faultCode } = dpCodes;
interface MainProps {
  deviceOnline: boolean;
}
const Tip: React.FC = (props: MainProps) => {
  const { deviceOnline } = props;
  const { [faultCode]: fault } = useSelector(({ dpState }: any) => ({
    [faultCode]: dpState[faultCode],
  }));
  const navigation = useNavigation();

  const handleOnPress = () => {
    // navigation.navigate('introduce') // TODO: 跳转到安装说明页面
  };
  // 3.水量异常
  const isFault = Utils.NumberUtils.getBitValue(fault, 4) === 1;
  return (
    <View style={styles.tipView}>
      <View style={styles.fadeView}>
        <Image source={Res.p_line_1} style={styles.line} resizeMode="contain" />
      </View>
      <View style={styles.fadeView}>
        <TouchableOpacity onPress={() => handleOnPress} style={styles.bubble} activeOpacity={0.8}>
          <TYText style={styles.text1}>
            {String.getLang('amount_of_water')}
            <TYText style={[styles.text2, { color: isFault ? '#FA5F5F' : '#44B74A' }]}>
              {!isFault ? String.getLang('normal') : String.getLang('water_shortage')}
            </TYText>
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
    top: cx(76),
    left: cx(22),
    flexDirection: 'row-reverse',
  },
  fadeView: {
    height: cx(130),
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
    width: cx(65),
    height: cx(38.5),
    marginTop: cx(38),
  },
  bubble: {
    alignSelf: 'flex-start',
    width: cx(80),
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
    paddingHorizontal: cx(8),
    flexDirection: 'row',
  },
});
