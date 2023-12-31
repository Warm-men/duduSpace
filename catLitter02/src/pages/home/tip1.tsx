import React from 'react';
import { StyleSheet } from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import String from '@i18n';
import { dpCodes } from '@config';
import TipPop from '@components/tip';

const { convertX: cx } = Utils.RatioUtils;

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

  const _renderText = () => {
    return (
      <TYText style={styles.text1}>
        {String.getLang('upper_cover')}
        <TYText style={[styles.text2, { color: isFault ? '#FA5F5F' : '#44B74A' }]}>
          {!isFault ? String.getLang('regular') : String.getLang('abnormal')}
        </TYText>
      </TYText>
    );
  };
  return (
    <TipPop
      style={{ position: 'absolute', top: cx(18), left: cx(16) }}
      boxStyle={{ flexDirection: 'column' }}
      subTitleStyle={{ color: 'red' }}
      onPress={handleOnPress}
      lineStyle={{
        position: 'absolute',
        top: cx(33),
        left: cx(84),
        width: cx(54),
        height: cx(60),
      }}
      isHDirect={true}
      isVDirect={true}
      renderText={_renderText}
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
});
