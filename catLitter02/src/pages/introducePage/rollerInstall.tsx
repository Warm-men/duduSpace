import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import { commonColor, commonStyles, cx } from '@config';
import i18n from '@i18n';
import Res from '@res';

const RollerInstall: React.FC = props => {
  return (
    <View style={commonStyles.flexOne}>
      <ScrollView style={commonStyles.flexOne}>
        <View style={[commonStyles.shadow, styles.container]}>
          <View style={[styles.center, styles.productBox]}>
            <Image source={Res.roller} style={styles.image} />
          </View>
          <View style={styles.productTipsBox}>
            <TYText
              size={cx(14)}
              color={commonColor.mainText}
              weight={500}
              style={{ marginBottom: cx(10) }}
            >
              {i18n.getLang('roller_install_tip_1')}
            </TYText>
            <TYText style={styles.tips}>{i18n.getLang('roller_install_desc_1')}</TYText>
          </View>
          <View style={[styles.productTipsBox, { marginTop: cx(15) }]}>
            <TYText
              size={cx(14)}
              color={commonColor.mainText}
              weight={500}
              style={{ marginBottom: cx(10) }}
            >
              {i18n.getLang('roller_install_tip_2')}
            </TYText>
            <TYText style={styles.tips}>{i18n.getLang('roller_install_desc_2')}</TYText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default RollerInstall;

const styles = StyleSheet.create({
  container: {
    marginTop: cx(16),
    marginHorizontal: cx(15),
    paddingHorizontal: cx(15),
    paddingTop: cx(30),
    paddingBottom: cx(15),
    borderRadius: cx(10),
  },
  productBox: {
    marginBottom: cx(13.5),
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  productTipsBox: {
    marginBottom: cx(15),
  },
  tips: {
    marginTop: cx(5),
    color: '#ADA49B',
    fontSize: cx(12),
    lineHeight: cx(19),
  },
  image: {
    width: cx(120),
    height: cx(120),
  },
});
