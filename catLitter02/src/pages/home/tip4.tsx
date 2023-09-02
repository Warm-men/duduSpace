import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Utils, TYText, TYSdk } from 'tuya-panel-kit';
import { useSelector } from 'react-redux';
import String from '@i18n';
import { dpCodes } from '@config';
import TipPop from '@components/tip';

const { convert: c, convertX: cx, convertY: cy } = Utils.RatioUtils;
const { childLockCode } = dpCodes;
const Tip: React.FC = () => {
  const { [childLockCode]: childLock } = useSelector(({ dpState }: any) => ({
    [childLockCode]: dpState[childLockCode],
  }));
  const { deviceOnline } = useSelector(({ devInfo }: any) => devInfo);

  const getLabel = () => {
    if (childLock) {
      return String.getLang('lock_on');
    }
    return String.getLang('lock_off');
  };

  const renderPopTip = () => {
    return (
      <View>
        <TYText style={styles.text1}>{String.getLang('lock')}</TYText>
        <TYText style={[styles.text2]}>{getLabel()}</TYText>
      </View>
    );
  };

  return (
    <TipPop
      style={{ position: 'absolute', top: cx(136), right: cx(0), width: cx(90) }}
      boxStyle={{ flexDirection: 'column' }}
      subTitleStyle={{ color: 'red' }}
      onPress={() => {
        TYSdk.device.putDeviceData({
          [childLockCode]: !childLock,
        });
      }}
      lineStyle={{
        position: 'absolute',
        top: cx(132),
        right: cx(78),
        width: cx(44),
        height: cx(20),
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
    color: 'rgba(124, 114, 105, 1)',
    lineHeight: cx(16),
  }
});
