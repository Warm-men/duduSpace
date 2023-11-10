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
const Tip: React.FC = () => {
  const { [faultCode]: fault } = useSelector(({ dpState }: any) => ({
    [faultCode]: dpState[faultCode],
  }));
  const { deviceOnline } = useSelector(({ devInfo }: any) => devInfo);
  const navigation = useNavigation();

  const handleOnPress = () => {
    navigation.navigate('upperCover'); // 跳转到安装说明页面
  };
  // 3.上盖异常
  const isFault = Utils.NumberUtils.getBitValue(fault, 3) === 1;
  return (
    <View style={styles.tipView}>
      <View style={styles.fadeView}>
        <Image source={Res.p_line_1} style={styles.line} resizeMode="stretch" />
      </View>
      <View style={styles.fadeView}>
        <TouchableOpacity
          onPress={handleOnPress}
          style={styles.bubble}
          activeOpacity={0.8}
          disabled={!deviceOnline}
        >
          <TYText style={styles.text1}>
            {String.getLang('upper_cover')}
            <TYText style={[styles.text2, { color: isFault ? '#FA5F5F' : '#44B74A' }]}>
              {!isFault ? String.getLang('regular') : String.getLang('abnormal')}
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
    top: cx(-30),
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
    width: cx(31.5),
    height: cx(58.6),
    marginTop: cx(57),
  },
  bubble: {
    alignSelf: 'flex-start',
    width: cx(84),
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
