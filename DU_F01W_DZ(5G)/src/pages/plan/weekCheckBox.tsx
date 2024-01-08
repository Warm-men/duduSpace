/* eslint-disable react/no-array-index-key */
import { commonColor, commonStyles, cx, width } from '@config';
import i18n from '@i18n';
import Res from '@res';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Divider, Popup, TYText } from 'tuya-panel-kit';

const WEEKLIST = new Array(7).fill('1');

interface Props {
  value: string;
  onChange: (val: string) => void;
}

const WeekCheckBox: React.FC<Props> = ({ value = '0000000', onChange }) => {
  const [weeks, setWeeks] = useState(value.split(''));

  const handleAllWeeks = () => {
    const isAll = getAll();
    const newWeeks = isAll ? new Array(7).fill('0') : [...WEEKLIST];
    setWeeks(newWeeks);
  };

  const changeWeeks = (idx: number) => {
    const newWeeks = [...weeks];
    newWeeks[idx] = weeks[idx] === '1' ? '0' : '1';
    setWeeks(newWeeks);
  };

  const getAll = () => {
    let weekNum = 0;
    weeks.forEach(item => {
      +item && weekNum++;
    });

    return weeks.length === weekNum;
  };

  const handleOk = () => {
    onChange(weeks.join(''));
    Popup.close();
  };

  return (
    <View style={styles.container}>
      <View style={[commonStyles.flexRowBetween, styles.titleBox]}>
        <TYText color="#000" size={cx(18)} weight={500}>
          {i18n.getLang('repeatDate')}
        </TYText>
        <TouchableOpacity onPress={handleAllWeeks}>
          <View style={[commonStyles.flexRowCenter]}>
            <TYText color="#968E87" size={cx(14)}>
              {i18n.getLang(getAll() ? 'deselectAll' : 'selectAll')}
            </TYText>
            <Image
              source={getAll() ? Res.checkBoxed : Res.checkBox}
              style={[styles.checkImg, { marginLeft: cx(5) }]}
            />
          </View>
        </TouchableOpacity>
      </View>

      <View>
        {weeks.map((item, idx) => (
          <View key={`week${idx}`} style={[commonStyles.flexRowBetween, styles.weekItem]}>
            <TYText color={commonColor.mainText} size={cx(15)}>
              {i18n.getLang(`week${idx}`)}
            </TYText>
            <Button
              image={item === '1' ? Res.checkBoxed : Res.checkBox}
              style={styles.checkImg}
              onPress={() => changeWeeks(idx)}
            />
          </View>
        ))}
      </View>

      <View style={[commonStyles.flexRowCenter, styles.btnBox]}>
        <TouchableOpacity onPress={Popup.close} style={commonStyles.flexOne}>
          <View style={[commonStyles.flexCenter, styles.btn]}>
            <TYText size={cx(16)} color="#ADA49B">
              {i18n.getLang('cancel')}
            </TYText>
          </View>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity onPress={handleOk} style={commonStyles.flexOne}>
          <View style={[commonStyles.flexCenter, styles.btn]}>
            <TYText size={cx(16)} color={commonColor.brown}>
              {i18n.getLang('confirm')}
            </TYText>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WeekCheckBox;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: cx(15),
  },
  titleBox: {
    paddingTop: cx(29),
    paddingBottom: cx(20),
  },
  weekItem: {
    marginVertical: cx(15),
  },
  checkImg: {
    height: cx(18),
    width: cx(18),
  },
  btnBox: {
    marginTop: cx(15),
    height: cx(60),
    borderTopWidth: cx(0.5),
    borderTopColor: '#E5E0DF',
  },
  btn: {
    flex: 1,
  },
  divider: {
    width: cx(0.5),
    height: cx(15),
    backgroundColor: '#E5E0DF',
  },
});
