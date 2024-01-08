import { saveDeviceCloudData } from '@api';
import {
  btnBackground,
  commonColor,
  commonDialogStyle,
  commonPopStyle,
  commonStyles,
  cx,
  dpCodes,
  width,
  DRY_KEY,
  isIos,
} from '@config';
import i18n from '@i18n';
import { useSelector } from '@models';
import Res from '@res';
import { decodeDry, encodeDry } from '@utils';
import _ from 'lodash';
import moment from 'moment';
import React, { useState } from 'react';
import {
  DeviceEventEmitter,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { $CombinedState } from 'redux';
import { BrickButton, Button, Dialog, Popup, TYSdk, TYText } from 'tuya-panel-kit';

const { desiccant: desiccantCode, enter_sleep } = dpCodes;

const DryAgent: React.FC = () => {
  const dryAgent = useSelector(state => state.record.dryAgent);
  const desiccant = useSelector(state => state.dpState[desiccantCode]);
  const enterSleep = useSelector(state => state.dpState[enter_sleep]);

  const [dryInfo, setDryInfo] = useState(decodeDry(dryAgent.dryData));
  const isFirstSet = Object.keys(dryAgent).length === 0;

  const handlePeriod = () => {
    const dataSource = new Array(30).fill(0).map((item, idx) => ({
      label: `${idx + 1}`,
      value: idx + 1,
    }));

    Popup.picker({
      ...commonPopStyle,
      dataSource,
      title: i18n.getLang('replaceCycle'),
      cancelText: i18n.getLang('cancel'),
      confirmText: i18n.getLang('confirm'),
      value: dryInfo.period,
      label: i18n.getLang('unit_day'),
      labelOffset: cx(60),
      pickerFontColor: commonColor.mainText,
      pickerUnitColor: commonColor.mainText,
      theme: { fontSize: cx(18), fontColor: commonColor.mainText },
      onConfirm: (value, idx) => {
        const data = { ...dryInfo, period: value };
        setDryInfo(data);
        Popup.close();
      },
      onCancel: Popup.close,
    });
  };

  const handleTime = () => {
    const hourList = new Array(24).fill(0).map((item, idx) => ({
      label: _.padStart(idx + 1, 2, '0'),
      value: idx + 1,
    }));
    const minuteList = new Array(60).fill(0).map((item, idx) => ({
      label: _.padStart(idx, 2, '0'),
      value: idx,
    }));

    Popup.picker({
      ...commonPopStyle,
      dataSource: [hourList, minuteList],
      title: i18n.getLang('reminderTime'),
      cancelText: i18n.getLang('cancel'),
      confirmText: i18n.getLang('confirm'),
      singlePicker: false,
      value: [dryInfo.time.hours, dryInfo.time.minutes],
      label: [':'],
      labelOffset: cx(105),
      pickerFontColor: commonColor.mainText,
      pickerUnitColor: commonColor.mainText,
      theme: { fontSize: cx(18), fontColor: commonColor.mainText },
      onConfirm: (value, idx) => {
        const data = { ...dryInfo, time: { hours: value[0], minutes: value[1] } };
        setDryInfo(data);
        Popup.close();
      },
      onCancel: Popup.close,
    });
  };

  const handleFinish = () => {
    const dryData = encodeDry(dryInfo);
    // TYSdk.device.putDeviceData({ [desiccantCode]: dryData });
    console.log('dryInfo===', dryInfo, dryData);
    const time = moment().startOf().format('YYYY-MM-DD HH:mm:ss');
    saveDeviceCloudData(DRY_KEY, { time, dryData }).then(() => {
      DeviceEventEmitter.emit(DRY_KEY);
    });
  };

  const handleReset = () => {
    const { commonStyle, contentStyle } = commonDialogStyle;

    Dialog.custom({
      ...commonStyle,
      content: (
        <View>
          <View style={[commonStyles.flexCenter, contentStyle.contentBox]}>
            <Image source={Res.reset} style={contentStyle.contentImg} />
            <TYText style={contentStyle.contentText}>{i18n.getLang('resetTitle')}</TYText>
            <TYText
              size={cx(14)}
              color="#7C7269"
              style={{ marginTop: cx(14), textAlign: 'center' }}
            >
              {i18n.getLang('resetTips')}
            </TYText>
          </View>
          <View style={commonStyles.flexRowBetween}>
            <Button
              text={i18n.getLang('thinkAgain')}
              style={contentStyle.contentBtn}
              background="#F7F6F0"
              textStyle={contentStyle.contentBtnText}
              onPress={Dialog.close}
            />
            <BrickButton
              text={i18n.getLang('confirm')}
              wrapperStyle={contentStyle.contentBtn}
              type="primaryGradient"
              textStyle={[contentStyle.contentBtnText, { color: '#fff' }]}
              background={btnBackground}
              onPress={() => {
                handleFinish();
                Dialog.close();
              }}
            />
          </View>
        </View>
      ),
    });
  };

  return (
    <View style={commonStyles.flexOne}>
      <ScrollView style={commonStyles.flexOne} showsVerticalScrollIndicator={false}>
        <View style={[commonStyles.shadow, styles.container]}>
          <View style={[commonStyles.flexCenter, styles.productBox]}>
            {Object.keys(dryAgent).length > 0 && (
              <View style={styles.productTips}>
                <View style={[commonStyles.flexCenter, styles.productTextBox]}>
                  <TYText size={cx(14)} color="#7C7269">
                    {`${i18n.getLang(dryAgent.isOverdue ? 'overdueTime1' : 'remainTime1')} `}
                    <TYText
                      size={cx(14)}
                      color={dryAgent.isOverdue ? commonColor.red : commonColor.green}
                    >
                      {dryAgent.day}
                    </TYText>
                    {` ${i18n.getLang(dryInfo.isOverdue ? 'overdueTime2' : 'remainTime2')}`}
                  </TYText>
                </View>
                <Image
                  source={Res.Angle}
                  style={[styles.productAngle, isIos && { marginTop: cx(-2) }]}
                />
              </View>
            )}
            <Image source={Res.dryProduct} style={{ width: cx(120), height: cx(120) }} />
          </View>
          <View style={styles.productTipsBox}>
            <TYText
              size={cx(14)}
              color={commonColor.mainText}
              weight={500}
              style={{ marginBottom: cx(10) }}
            >
              {i18n.getLang('tips')}
            </TYText>
            <TYText style={styles.tips}>{i18n.getLang('dryAgentDesc1')}</TYText>
            <TYText style={styles.tips}>{i18n.getLang('dryAgentDesc2')}</TYText>
          </View>
        </View>

        <View style={[commonStyles.shadow, styles.container]}>
          <View style={[commonStyles.flexRowBetween, styles.optionBox]}>
            <TYText style={styles.optionTitle}>{i18n.getLang('replaceCycle')}</TYText>
            <TouchableOpacity onPress={handlePeriod}>
              <View style={commonStyles.flexRowCenter}>
                <TYText style={styles.optionValue}>
                  {`${dryInfo.period} ${i18n.getLang('unit_day')}`}
                </TYText>
                <Image source={Res.arrowRight} />
              </View>
            </TouchableOpacity>
          </View>
          <View style={[commonStyles.flexRowBetween, styles.optionBox]}>
            <TYText style={styles.optionTitle}>{i18n.getLang('reminderTime')}</TYText>
            <TouchableOpacity onPress={handleTime}>
              <View style={commonStyles.flexRowCenter}>
                <TYText style={styles.optionValue}>
                  {`${_.padStart(dryInfo.time.hours, 2, '0')}:${_.padStart(
                    dryInfo.time.minutes,
                    2,
                    '0'
                  )}`}
                </TYText>
                <Image source={Res.arrowRight} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <BrickButton
        text={isFirstSet ? i18n.getLang('finishSet') : i18n.getLang('reset')}
        type="primaryGradient"
        background={btnBackground}
        style={styles.btnBox}
        wrapperStyle={styles.btn}
        textStyle={{ fontSize: cx(15) }}
        onPress={isFirstSet ? handleFinish : handleReset}
        disabled={enterSleep}
      />
    </View>
  );
};

export default DryAgent;

const styles = StyleSheet.create({
  container: {
    marginTop: cx(16),
    marginHorizontal: cx(15),
    padding: cx(15),
    borderRadius: cx(10),
  },
  productBox: {
    position: 'relative',
    marginBottom: cx(13.5),
    paddingTop: cx(49),
  },
  productTips: {
    position: 'absolute',
    top: cx(15),
    left: width / 2 - cx(15),
  },
  productAngle: {
    marginLeft: cx(30),
    marginTop: cx(-1.5),
  },
  productTextBox: {
    paddingHorizontal: cx(10),
    paddingVertical: cx(5),
    borderWidth: cx(0.5),
    borderColor: commonColor.mainText,
    borderRadius: cx(6),
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
  optionBox: {
    height: cx(44),
  },
  optionTitle: {
    color: commonColor.mainText,
    fontSize: cx(15),
    fontWeight: '500',
  },
  optionValue: {
    color: '#ADA49B',
    fontSize: cx(15),
  },
  btnBox: {
    marginBottom: cx(44),
    marginHorizontal: cx(30),
  },
  btn: {
    width: width - cx(60),
    height: cx(49),
    borderRadius: cx(25.5),
  },
});
