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

  const fault1 = Utils.NumberUtils.getBitValue(fault, 1) === 1;
  const fault2 = Utils.NumberUtils.getBitValue(fault, 2) === 1;
  const getLabel = () => {
    // 1.便仓异常 2.便仓满
    if (fault1) {
      return String.getLang('abnormal');
    }
    if (fault2) {
      return String.getLang('full');
    }
    return String.getLang('regular');
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
            navigation.navigate('warehouseStatus');
          }}
          disabled={!deviceOnline}
        >
          <TYText style={styles.text1}>
            {String.getLang('warehouse')}
            <TYText style={[styles.text2, { color: fault1 || fault2 ? '#FA5F5F' : '#44B74A' }]}>
              {getLabel()}
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
    top: cx(102),
    left: cx(12),
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
    color: '#FA5F5F',
    lineHeight: cx(16),
  },
  line: {
    width: cx(82),
    height: cx(26.5),
    marginTop: cx(26),
  },
  bubble: {
    alignSelf: 'flex-start',
    width: cx(90),
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
