import { Empty } from '@components';
import { commonStyles, cx, height, topBarHeight } from '@config';
import i18n from '@i18n';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from '@models';
import { TYText } from 'tuya-panel-kit';
import RecordItem from './recordItem';

const Record: React.FC = () => {
  const dataSource = useSelector(state => state.record.recordList);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    let count = 0;
    dataSource.forEach(item => item.list.length > 0 && count++);
    setIsEmpty(count <= 0);
  }, [dataSource]);

  return (
    <ScrollView
      style={[commonStyles.flexOne, styles.container]}
      showsVerticalScrollIndicator={false}
    >
      {isEmpty ? (
        <Empty
          desc={i18n.getLang('norecord')}
          containerStyle={{ height: height - topBarHeight }}
          imgStyle={{ width: cx(230), height: cx(210) }}
        />
      ) : (
        <>
          {dataSource.map((item, idx) => (
            <RecordItem key={item.date} record={item} recordIdx={idx} />
          ))}
          <View style={{ width: '100%', height: cx(65) }} />
        </>
      )}
    </ScrollView>
  );
};

export default Record;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: cx(15),
  },
});
