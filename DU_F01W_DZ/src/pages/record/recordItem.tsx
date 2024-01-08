import { ComRecord } from '@components';
import { commonColor, commonStyles, cx } from '@config';
import i18n from '@i18n';
import { useSelector } from '@models';
import Res from '@res';
import moment from 'moment';
import React, { useRef } from 'react';
import { Animated, Image, StyleSheet, View, TouchableOpacity } from 'react-native';
import { TYText } from 'tuya-panel-kit';

interface Props {
  record: any;
  recordIdx: number;
}

const RecordItem: React.FC<Props> = props => {
  const { record, recordIdx } = props;
  const todayNextMeal = useSelector(state => state.record.todayNextMeal);
  const recordAnim = useRef(new Animated.Value(1)).current;
  const recordList = recordIdx === 0 ? [...todayNextMeal, ...record.list] : record.list;

  const recordCollapsible = () => {
    Animated.timing(recordAnim, {
      toValue: recordAnim._value === 0 ? 1 : 0,
      duration: 800,
    }).start();
  };

  const height = recordAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, cx(99999999999999999)],
  });

  const arrow = recordAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '0deg'],
  });

  const renderDate = (date: string) => {
    const today = moment();
    if (date === today.format('YYYY-MM-DD')) return i18n.getLang('today');
    if (date === today.add(-1, 'days').format('YYYY-MM-DD')) return i18n.getLang('yesterday');
    return moment(date).format('MM-DD');
  };

  return (
    <View style={[commonStyles.shadow, styles.record]}>
      <View style={[commonStyles.flexRowBetween, styles.recordTop]}>
        <TYText color={commonColor.mainText} size={cx(15)}>
          {renderDate(record.date)}
        </TYText>
        {record.list.length > 0 ? (
          <TouchableOpacity onPress={recordCollapsible}>
            <Animated.Image
              source={Res.arrowTop}
              style={[styles.img, { transform: [{ rotate: arrow }] }]}
            />
          </TouchableOpacity>
        ) : (
          <TYText color="#ADA49B" size={cx(15)}>
            {i18n.getLang('norecord')}
          </TYText>
        )}
      </View>
      <Animated.View style={{ maxHeight: height }}>
        {recordList.length > 0 && <ComRecord data={recordList} />}
        {recordList.length > 0 && <View style={{ width: '100%', height: cx(30) }} />}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  record: {
    marginTop: cx(15),
    paddingHorizontal: cx(15),
    width: '100%',
    borderRadius: cx(10),
    overflow: 'hidden',
  },
  recordTop: {
    height: cx(74),
  },
  img: {
    width: cx(20),
    height: cx(20),
  },
});

export default RecordItem;
