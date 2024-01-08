/* eslint-disable react/no-array-index-key */
import { commonColor, commonStyles, cx } from '@config';
import i18n from '@i18n';
import Res from '@res';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import DashedLine from './dashedLine';

const IMGS = {
  fail: Res.workFail,
  success: Res.workSuccess,
  plan: Res.workPlan,
  cat: Res.workCat,
};

interface Props {
  data: any[];
}

const ComRecord: React.FC<Props> = props => {
  const { data = [] } = props;

  const renderContent = (status, info = {}) => {
    if (status === 'plan') {
      return (
        <View style={commonStyles.flexOne}>
          <TYText style={styles.mainText}>
            {i18n.formatValue('work_record_plan', info.time, info.num)}
          </TYText>
          <TYText style={styles.descTYText}>{i18n.getLang('work_record_plan_desc')}</TYText>
        </View>
      );
    }

    if (status === 'success') {
      return (
        <View style={commonStyles.flexOne}>
          <TYText style={styles.mainText}>
            {`${i18n.getLang('work_record_success')} `}
            <TYText style={[styles.mainText, { color: commonColor.green }]}>{info.num}</TYText>
            {` ${i18n.getLang('unit_copies')}`}
          </TYText>
          <TYText style={styles.descTYText}>{i18n.getLang(`${info.method}_feed`)}</TYText>
        </View>
      );
    }

    if (status === 'fail') {
      return (
        <View style={commonStyles.flexOne}>
          <TYText style={styles.mainText}>
            {`${i18n.getLang('work_record_fail00')} `}
            <TYText style={[styles.mainText, { color: commonColor.red }]}>{info.plan}</TYText>
            {` ${i18n.getLang('work_record_fail1')} `}
            <TYText style={[styles.mainText, { color: commonColor.green }]}>{info.num}</TYText>
            {` ${i18n.getLang('work_record_fail2')}`}
          </TYText>
          <View style={[commonStyles.flexRow, { flexWrap: 'wrap' }]}>
            <TYText style={[styles.descTYText, { marginRight: cx(10) }]}>
              {i18n.getLang(`${info.method}_feed`)}
            </TYText>
            {!!info.fault && <TYText style={styles.descTYText}>{info.fault}</TYText>}
          </View>
        </View>
      );
    }

    if (status === 'cat') {
      return (
        <View style={commonStyles.flexOne}>
          <TYText style={styles.mainText}>
            {i18n.formatValue('work_record_cat', info.minutes, info.seconds)}
          </TYText>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.stepBox}>
      {data.map((item, idx) => (
        <View
          key={item.time + idx}
          style={[styles.stepItem, idx + 1 >= data.length && { minHeight: cx(31) }]}
        >
          {/* 左侧时间展示 */}
          <View style={styles.stepTime}>
            <TYText color="#7C7269" size={cx(14)}>
              {item.time || '--:--'}
            </TYText>
          </View>
          {/* 中间进入步骤 */}
          <View style={styles.stepindicator}>
            <Image source={IMGS[`${item.status || 'fail'}`]} style={styles.stepImg} />
            {idx + 1 < data.length && (
              <DashedLine
                style={styles.stepLine}
                width={cx(2)}
                height={i18n.language === 'zh' ? cx(63) : cx(80)}
              />
            )}
          </View>
          {/* 右侧主要内容 */}
          <View style={commonStyles.flexOne}>
            {renderContent(item.status, item.info)}
            {idx + 1 < data.length && <View style={styles.divider} />}
          </View>
        </View>
      ))}
    </View>
  );
};

export default ComRecord;

const styles = StyleSheet.create({
  stepBox: {
    width: '100%',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // paddingTop: cx(3),
    minHeight: cx(84.5),
  },
  stepTime: {
    width: '13%',
    height: '100%',
  },
  stepindicator: {
    marginLeft: cx(11),
    marginRight: cx(17),
    height: '100%',
  },
  stepImg: {
    marginBottom: cx(3),
    width: cx(16),
    height: cx(16),
  },
  stepLine: {
    marginLeft: cx(7.5),
  },
  mainText: {
    color: '#7C7269',
    fontSize: cx(14),
  },
  descTYText: {
    marginTop: cx(4),
    color: '#ADA49B',
    fontSize: cx(12),
  },
  divider: {
    marginTop: cx(25),
    marginBottom: cx(24.5),
    width: '100%',
    height: cx(0.5),
    backgroundColor: '#E5E0DF',
    borderRadius: cx(0.25),
  },
});
