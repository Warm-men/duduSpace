import React from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { TYText, Utils } from 'tuya-panel-kit';
import Res from '@res';
import i18n from '@i18n';
import { styles as commonStyles } from '@utils/commonStyles';
import { useSelector } from 'react-redux';
import { dpCodes } from '@config';

const { faultCode } = dpCodes;
const { convertX: cx } = Utils.RatioUtils;
const WarehouseStatus: React.FC = (props: any) => {
  const { [faultCode]: fault } = useSelector(({ dpState }: any) => ({
    [faultCode]: dpState[faultCode],
  }));

  const fault1 = Utils.NumberUtils.getBitValue(fault, 1) === 1;
  const fault2 = Utils.NumberUtils.getBitValue(fault, 2) === 1;

  const TIPS = [
    {
      key: 'warehouse_illustrate_0',
    },
    {
      key: 'warehouse_illustrate_1',
    },
    {
      key: 'warehouse_illustrate_2',
    },
  ];
  const IMAGE = [Res.cat_icon_sufficient, Res.cat_icon_insufficient, Res.cat_icon_insufficient];
  const DESC = [
    i18n.getLang('warehouse_desc_0'),
    i18n.getLang('warehouse_desc_1'),
    i18n.getLang('warehouse_desc_2'),
  ];
  const title = [
    i18n.getLang('warehouse_0'),
    i18n.getLang('warehouse_1'),
    i18n.getLang('warehouse_2'),
  ];

  const getData = () => {
    if (fault1) {
      return { image: IMAGE[1], title: title[1], desc: DESC[1] };
    }
    if (fault2) {
      return { image: IMAGE[2], title: title[2], desc: DESC[2] };
    }
    return { image: IMAGE[0], title: title[0], desc: DESC[0] };
  };

  return (
    <ScrollView style={styles.flex1}>
      <View style={[commonStyles.viewShadow, styles.viewBox]}>
        <View style={styles.center}>
          <View style={[styles.row, styles.center]}>
            <Image source={getData().image} style={styles.statusImage} />
            <TYText style={styles.title30}>{getData().title}</TYText>
          </View>
          <TYText style={styles.text12}>{getData().desc}</TYText>
        </View>
        <View style={styles.descView}>
          {TIPS.map((item: any) => {
            return (
              <TYText key={item.key} style={styles.descItem}>
                {i18n.getLang(item.key)}
              </TYText>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

export default WarehouseStatus;

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  viewBox: {
    width: cx(345),
    marginHorizontal: cx(15),
    marginVertical: cx(20),
    borderRadius: cx(10),
    backgroundColor: '#fff',
    paddingHorizontal: cx(15),
    paddingTop: cx(60),
  },
  statusImage: {
    width: cx(30),
    height: cx(30),
    marginRight: cx(10),
  },
  title30: {
    fontSize: cx(30),
    color: '#49362F',
    fontWeight: 'bold',
  },
  text12: {
    fontSize: cx(12),
    color: '#ADA49B',
    marginTop: cx(10),
    marginBottom: cx(40),
  },
  descItem: {
    fontSize: cx(14),
    color: '#7C7269',
    lineHeight: cx(22),
    marginBottom: cx(16),
  },
  descView: {
    marginBottom: cx(40),
  },
});
