import React from 'react';
import { ScrollView, View } from 'react-native';
import { TYSdk, TopBar } from 'tuya-panel-kit';
import Res from '@res';
import { useSelector } from '@models';
import { commonColor, commonStyles, cx } from '@config';
import ControlBtn from './controlBtn';
import Content from './content';
import Record from './record';

const Home: React.FC = () => {
  const deviceOnline = useSelector(state => state.devInfo.deviceOnline);

  return (
    <View style={commonStyles.flexOne}>
      <TopBar
        title={TYSdk.devInfo.name || ''}
        titleStyle={{ color: commonColor.mainText }}
        background="transparent"
        actions={[
          {
            source: Res.edit,
            style: { marginLeft: cx(30) },
            color: commonColor.mainText,
            onPress: () => TYSdk.native.showDeviceMenu(),
          },
          {
            source: Res.setting,
            contentStyle: { marginRight: cx(13) },
            color: commonColor.mainText,
            onPress: () => TYSdk.Navigator.push({ id: 'setting' }),
            disabled: !deviceOnline,
          },
        ]}
        onBack={() => TYSdk.mobile.back()}
      />
      <ScrollView style={commonStyles.flexOne} showsVerticalScrollIndicator={false}>
        <Content />
        <Record />
        <View style={{ width: '100%', height: cx(135) }} />
      </ScrollView>
      <ControlBtn />
    </View>
  );
};

export default Home;
