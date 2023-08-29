import i18n from '@i18n';
import Res from '@res';
import React, { useState } from 'react';
import { Image, ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Button, TYText, Popup, Toast } from 'tuya-panel-kit';
import { commonStyles, cx } from '@config';
import _ from 'lodash';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const WeekCheck: React.FC<Props> = props => {
  const { value } = props;
  const [repeatArr, setRepeatStr] = useState(value.split(''));
  const [show, setShow] = useState(false);
  const isAllSelected = repeatArr.every(item => !!+item);
  return (
    <View style={styles.popWrapper}>
      <View style={[commonStyles.flexRowBetween, styles.titleView]}>
        <TYText size={cx(18)} color="#000000">
          {i18n.getLang('repeatDate')}
        </TYText>
        <TouchableOpacity
          onPress={() => {
            const newValueArr = _.cloneDeep(repeatArr);
            newValueArr.fill('1');
            setRepeatStr(newValueArr);
            const newValue = newValueArr.join('');
            props.onChange(newValue);
          }}
          style={commonStyles.flexCenter}
        >
          <View style={[commonStyles.flexRowCenter]}>
            <TYText size={cx(15)} color="#49362F" style={styles.text1}>
              {i18n.getLang('selectAll')}
            </TYText>
            <Image source={isAllSelected ? Res.checkBoxed : Res.checkBox} />
          </View>
        </TouchableOpacity>
      </View>
      <ScrollView style={{ marginBottom: cx(10) }}>
        {repeatArr.map((item, idx) => {
          const isSelect = !!+item;
          return (
            <View key={`week${idx}`} style={[commonStyles.flexRowBetween, styles.itemView]}>
              <TYText>{i18n.getLang(`week${idx}`)}</TYText>
              <Button
                image={isSelect ? Res.checkBoxed : Res.checkBox}
                onPress={() => {
                  const newItem = `${+!isSelect}`;
                  const newValueArr = _.cloneDeep(repeatArr);
                  newValueArr[idx] = newItem;
                  setRepeatStr(newValueArr);
                }}
              />
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.footerView}>
        <TouchableOpacity
          style={[commonStyles.flexOne, commonStyles.flexCenter]}
          onPress={() => {
            Popup.close();
          }}
        >
          <TYText color="#ADA49B" size={cx(16)}>
            {i18n.getLang('cancel')}
          </TYText>
        </TouchableOpacity>
        <View style={styles.line} />
        <TouchableOpacity
          style={[commonStyles.flexOne, commonStyles.flexCenter]}
          onPress={() => {
            const newValue = repeatArr.join('');
            // 如果周循环都没选中，则提示至少选择一天
            if (+newValue === 0) {
              setShow(true);
              return;
            }
            props.onChange(newValue);
            Popup.close();
          }}
        >
          <TYText color="#DFA663" size={cx(16)}>
            {i18n.getLang('confirm')}
          </TYText>
        </TouchableOpacity>
      </View>
      <Toast show={show} text={i18n.getLang('less_one_day')} onFinish={() => setShow(false)} />
    </View>
  );
};

export default WeekCheck;

const styles = StyleSheet.create({
  popWrapper: {
    overflow: 'hidden',
  },
  titleView: {
    marginTop: cx(20),
    marginBottom: cx(0),
  },
  itemView: {
    marginTop: cx(27),
  },
  text1: {
    marginRight: cx(4),
  },
  footerView: {
    height: cx(60),
    flexDirection: 'row',
    alignItems: 'center',
    borderTopColor: '#E5E0DF',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: cx(10),
  },
  line: {
    width: StyleSheet.hairlineWidth,
    height: cx(15),
    backgroundColor: '#E5E0DF',
  },
});
