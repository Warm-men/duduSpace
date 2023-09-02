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

  // 3.滚筒无法到位
  const isFault = Utils.NumberUtils.getBitValue(fault, 5) === 1;
  const getLabel = () => {
    // 1.便仓异常 2.便仓满
    if (isFault) {
      return String.getLang('roller_fault');
    }
    return String.getLang('regular');
  };

  const renderPopTip = () => {
    return (
      <TYText style={styles.text1}>
        {String.getLang('roller')}
        <TYText style={[styles.text2, { color: isFault ? '#FA5F5F' : '#44B74A' }]}>
          {getLabel()}
        </TYText>
      </TYText>
    );
  };

  return (
    <TipPop
      style={{ position: 'absolute', top: cx(18), right: cx(0), width: cx(100) }}
      boxStyle={{ flexDirection: 'column' }}
      subTitleStyle={{ color: 'red' }}
      onPress={() => {
        navigation.navigate('warehouseStatus');
      }}
      lineStyle={{
        position: 'absolute',
        top: cx(33),
        right: cx(90),
        width: cx(70),
        height: cx(40),
      }}
      isHDirect={false}
      isVDirect={true}
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
