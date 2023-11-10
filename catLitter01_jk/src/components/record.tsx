import { ComRecord, Empty } from '@components';
import { commonColor, commonStyles, cx, width } from '@config';
import i18n from '@i18n';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TYText } from 'tuya-panel-kit';

const data = [
  {
    status: 'plan',
    info: {
      time: '23:00',
      num: 10,
    },
  },
  {
    time: '19:00',
    status: 'success',
    info: {
      num: 2,
      method: 'manual',
    },
  },
  {
    time: '16:00',
    status: 'fail',
    info: {
      plan: 12,
      num: 1,
      method: 'manual',
    },
  },
  {
    time: '12:30',
    status: 'cat',
    info: {
      minutes: '05',
      seconds: '30',
    },
  },
  {
    time: '09:00',
    status: 'success',
    info: {
      num: 2,
      method: 'plan',
    },
  },
  {
    time: '06:00',
    status: 'fail',
    info: {
      plan: 12,
      num: 3,
      method: 'plan',
    },
  },
];

const Record: React.FC = () => {
  return (
    <View style={[commonStyles.shadow, styles.container]}>
      <TYText size={cx(13)} color={commonColor.mainText} weight={500}>
        {i18n.getLang('work_record')}
      </TYText>
      <View style={[commonStyles.flexCenter, styles.content]}>
        <ComRecord data={data} />
        {/* <Empty desc={i18n.getLang('today_record_empty')} descStyle={{ marginTop: cx(-20) }} /> */}
      </View>
    </View>
  );
};

export default Record;

const styles = StyleSheet.create({
  container: {
    marginLeft: cx(12),
    marginRight: cx(17),
    paddingTop: cx(20),
    paddingHorizontal: cx(14),
    paddingBottom: cx(30),
    width: width - cx(29),
    borderRadius: cx(10),
  },
  content: {
    marginTop: cx(10),
  },
});
