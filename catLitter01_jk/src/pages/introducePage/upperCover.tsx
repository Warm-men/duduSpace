import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import { commonColor, commonStyles, cx } from '@config';
import i18n from '@i18n';
import Res from '@res';

const UpperCover: React.FC = props => {
  return (
    <View style={commonStyles.flexOne}>
      <ScrollView style={commonStyles.flexOne}>
        <View style={[commonStyles.shadow, styles.container]}>
          <View style={[styles.center, styles.productBox]}>
            <Image source={Res.dryProduct} style={styles.image} />
          </View>
          <View style={styles.productTipsBox}>
            <TYText
              size={cx(14)}
              color={commonColor.mainText}
              weight={500}
              style={{ marginBottom: cx(10) }}
            >
              {i18n.getLang('upper_cover_tips')}
            </TYText>
            <TYText style={styles.tips}>{i18n.getLang('upper_cover_desc')}</TYText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default UpperCover;

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
