import { StyleSheet, View, ScrollView } from 'react-native';
import { SwitchButton, TYText } from 'tuya-panel-kit';
import { commonColor, commonStyles, cx, width } from '@config';
import i18n from '@i18n';
import React from 'react';

const Notice: React.FC = () => {
  const deviceData = [
    {
      title: 'warehouse_notice',
      value: false,
    },
    {
      title: 'clean_notice',
      value: false,
    },
    {
      title: 'toilet_record_notice',
      value: false,
    },
    {
      title: 'clean_record_notice',
      value: false,
    },
  ];

  const materialData = [
    {
      title: 'cat_litter_loss_notice',
      value: true,
    },
    {
      title: 'deodorizing_block_notice',
      value: true,
    },
  ];

  const renderNotice = ({ title, value }) => {
    return (
      <View key={title} style={[commonStyles.flexRowBetween, { height: cx(65) }]}>
        <View style={styles.textBox}>
          <TYText color={commonColor.mainText} size={cx(15)} weight={500}>
            {i18n.getLang(title)}
          </TYText>
          <TYText style={styles.textDesc} color="#ADA49B" size={cx(12)}>
            {i18n.getLang(`${title}_tip`)}
          </TYText>
        </View>
        <SwitchButton
          value={value}
          theme={{ width: cx(45), height: cx(26), thumbSize: cx(21) }}
          onTintColor={commonColor.brown}
          tintColor="#ECEBE8"
        />
      </View>
    );
  };

  return (
    <ScrollView style={commonStyles.flexOne}>
      <View style={styles.container}>
        <TYText style={styles.title}>{i18n.getLang('device_notice')}</TYText>
        <View style={[commonStyles.shadow, styles.content]}>
          {deviceData.map(item => renderNotice(item))}
        </View>
      </View>
      <View style={styles.container}>
        <TYText style={styles.title}>{i18n.getLang('consumable_notification')}</TYText>
        <View style={[commonStyles.shadow, styles.content]}>
          {materialData.map(item => renderNotice(item))}
        </View>
      </View>
    </ScrollView>
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
  textDesc: {
    marginTop: cx(8),
  },
});
