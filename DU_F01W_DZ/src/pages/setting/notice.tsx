import { commonColor, commonStyles, cx, dpCodes, width } from '@config';
import i18n from '@i18n';
import { useSelector } from '@models';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SwitchButton, TYSdk, TYText } from 'tuya-panel-kit';

const {
  notice_feed_report,
  notice_food_jam,
  notice_food_shortage,
  notice_low_battery,
  notice_cat_close,
  notice_desiccant,
  notice_moto_jam,
  enter_sleep,
} = dpCodes;

const Notice: React.FC = () => {
  const dpState = useSelector(state => state.dpState);
  const enterSleep = dpState[enter_sleep];
  const deviceData = [
    // {
    //   code: notice_feed_report,
    // },
    {
      code: notice_food_jam,
    },
    {
      code: notice_food_shortage,
    },
    {
      code: notice_low_battery,
    },
    // {
    //   code: notice_cat_close,
    // },
    {
      code: notice_moto_jam,
    },
  ];

  const materialData = [
    {
      code: notice_desiccant,
    },
  ];

  const renderNotice = ({ code }) => {
    return (
      <View key={code} style={[commonStyles.flexRowBetween, { height: cx(65) }]}>
        <View style={styles.textBox}>
          <TYText color={commonColor.mainText} size={cx(15)} weight={500}>
            {i18n.getDpLang(code)}
          </TYText>
          <TYText color="#ADA49B" size={cx(12)}>
            {i18n.getLang(`dp_${code}_desc`)}
          </TYText>
        </View>
        <SwitchButton
          value={dpState[code]}
          theme={{ width: cx(45), height: cx(26), thumbSize: cx(21) }}
          onTintColor={commonColor.brown}
          tintColor="#ECEBE8"
          onValueChange={val => TYSdk.device.putDeviceData({ [code]: val })}
          disabled={enterSleep}
        />
      </View>
    );
  };

  return (
    <View style={commonStyles.flexOne}>
      <View style={styles.container}>
        <TYText style={styles.title}>{i18n.getLang('deviceNotice')}</TYText>
        <View style={[commonStyles.shadow, styles.content]}>
          {deviceData.map(item => renderNotice(item))}
        </View>
      </View>
      {/* <View style={styles.container}>
        <TYText style={styles.title}>{i18n.getLang('deviceNotice')}</TYText>
        <View style={[commonStyles.shadow, styles.content]}>
          {materialData.map(item => renderNotice(item))}
        </View>
      </View> */}
    </View>
  );
};

export default Notice;

const styles = StyleSheet.create({
  container: {
    marginVertical: cx(15),
    paddingHorizontal: cx(15),
  },
  title: {
    marginLeft: cx(15),
    color: '#ADA49B',
    fontSize: cx(12),
  },
  content: {
    marginTop: cx(15),
    paddingVertical: cx(13),
    paddingHorizontal: cx(13.5),
    borderRadius: cx(10),
  },
  textBox: {
    width: '70%',
  },
});
