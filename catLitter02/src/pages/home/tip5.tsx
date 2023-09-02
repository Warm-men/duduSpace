import React from 'react';
import { StyleSheet } from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import String from '@i18n';
import { dpCodes } from '@config';
import TipPop from '@components/tip';

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

  const renderPopTip = () => {
    return (
      <TYText style={styles.text1}>
        {String.getLang('warehouse')}
        <TYText style={[styles.text2, { color: fault1 || fault2 ? '#FA5F5F' : '#44B74A' }]}>
          {getLabel()}
        </TYText>
      </TYText>
    );
  };

  return (
    <TipPop
      style={{ position: 'absolute', bottom: cx(26), right: cx(0), width: cx(100) }}
      boxStyle={{ flexDirection: 'column' }}
      subTitleStyle={{ color: 'red' }}
      onPress={() => {
        navigation.navigate('warehouseStatus');
      }}
      lineStyle={{
        position: 'absolute',
        bottom: cx(40),
        right: cx(90),
        width: cx(60),
        height: cx(60),
      }}
      isHDirect={false}
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
    color: '#FA5F5F',
    lineHeight: cx(16),
  },
});
