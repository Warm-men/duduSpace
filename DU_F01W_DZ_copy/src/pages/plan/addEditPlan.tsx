/* eslint-disable no-shadow */
import React, { useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  BrickButton,
  Button,
  Dialog,
  GlobalToast,
  Picker,
  Popup,
  TYSdk,
  TYText,
  TopBar,
  Utils,
} from 'tuya-panel-kit';
import _times from 'lodash/times';
import i18n from '@i18n';
import {
  IPickerValue,
  MealPlan,
  btnBackground,
  commonColor,
  commonDialogStyle,
  commonPopStyle,
  commonStyles,
  cx,
  dpCodes,
  isIos,
  width,
} from '@config';
import Res from '@res';
import { encodeMealPlan, getHourOrMinuteArr, getRepeatStr, timeStrToArr } from '@utils';
import _ from 'lodash';
import moment from 'moment';
import WeekCheckBox from './weekCheckBox';

const { meal_plan } = dpCodes;

interface Props {
  id: number;
  isEdit?: boolean;
  timer?: MealPlan;
  timerList: Array<MealPlan | undefined>;
}

const AddEditPlan: React.FC<Props> = props => {
  const { isEdit = false, timer = {}, timerList = [], is12Hours = false, loop = true } = props;
  const [repeatStr, setRepeatStr] = useState(timer.repeatStr || '1111111');
  const [parts, setParts] = useState(timer.parts || 2);
  const timerArr = timeStrToArr(timer.timeStr || moment().format('HH:mm'));
  const [hour, setHour] = useState(timerArr[0]);
  const [minute, setMinute] = useState(timerArr[1]);

  const hours = getHourOrMinuteArr('hour', is12Hours);
  const minutes = getHourOrMinuteArr('minute', is12Hours);

  // 添加/编辑计划
  const onSave = () => {
    const newTimerList = isEdit ? timerList.filter(item => item.id !== timer.id) : [...timerList];
    const newTimeStr = `${_.padStart(hour, 2, '0')}:${_.padStart(minute, 2, '0')}`;
    console.log(newTimeStr);
    const repeatStrArr = repeatStr.split('');
    // 校验周期和时间重复，需提示
    const isExitTimer = newTimerList.find(item => {
      if (item?.timeStr !== newTimeStr) return false;
      const itemRepeatArr = item?.repeatStr.split('');
      let repeatNum = 0;
      repeatStrArr.forEach((elem, idx) => elem === itemRepeatArr[idx] && repeatNum++);
      return repeatNum > 0;
    });

    if (isExitTimer) {
      const { commonStyle, contentStyle } = commonDialogStyle;
      return Dialog.custom({
        ...commonStyle,
        content: (
          <View>
            <View style={[commonStyles.flexCenter, contentStyle.contentBox]}>
              <TYText style={contentStyle.contentText}>{i18n.getLang('repeatTips')}</TYText>
            </View>
            <View style={commonStyles.flexCenter}>
              <BrickButton
                text={i18n.getLang('confirm')}
                wrapperStyle={contentStyle.contentBtn}
                type="primaryGradient"
                textStyle={[contentStyle.contentBtnText, { color: '#fff' }]}
                background={btnBackground}
                onPress={() => {
                  Dialog.close();
                }}
              />
            </View>
          </View>
        ),
      });
    }

    const newTimer = {
      id: isEdit ? timer.id : timerList.length + 1,
      repeatStr,
      timeStr: newTimeStr,
      parts,
      switchValue: true,
    };

    newTimerList.push(newTimer);

    const plans = newTimerList.sort((a, b) => {
      const aTimeArr = a?.timeStr.split(':');
      const bTimeArr = b?.timeStr.split(':');
      const aTimeVal = moment().hours(aTimeArr[0]).minutes(aTimeArr[1]).valueOf();
      const bTimeVal = moment().hours(bTimeArr[0]).minutes(bTimeArr[1]).valueOf();
      return aTimeVal - bTimeVal;
    });

    console.log('mealPlan----', plans);

    const mealPlanStr = encodeMealPlan(plans);
    TYSdk.device.putDeviceData({ [meal_plan]: mealPlanStr }).then(({ success }) => {
      if (success) {
        TYSdk.Navigator.pop();
        GlobalToast.show({
          text: i18n.getLang(isEdit ? 'edit_success' : 'add_success'),
          showIcon: false,
        });
      }
    });
  };

  // 删除计划
  const deletePlan = () => {
    const data = timerList.filter(item => item.id !== timer.id);
    const mealPlanStr = encodeMealPlan(data);
    TYSdk.device.putDeviceData({ [meal_plan]: mealPlanStr }).then(({ success }) => {
      if (success) {
        TYSdk.Navigator.pop();
        GlobalToast.show({
          text: i18n.getLang('delete_success'),
          showIcon: false,
        });
      }
    });
  };

  // 删除计划弹窗
  const handleDeletePop = () => {
    const { commonStyle, contentStyle } = commonDialogStyle;

    Dialog.custom({
      ...commonStyle,
      content: (
        <View>
          <View style={[commonStyles.flexCenter, contentStyle.contentBox]}>
            <Image source={Res.deleteIcon} style={contentStyle.contentImg} />
            <TYText style={contentStyle.contentText}>{i18n.getLang('delteTips')}</TYText>
          </View>
          <View style={commonStyles.flexRowBetween}>
            <Button
              text={i18n.getLang('cancel')}
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
                deletePlan();
                Dialog.close();
              }}
            />
          </View>
        </View>
      ),
    });
  };

  // 设置周期
  const handleRepeat = () => {
    Popup.custom({
      ...commonPopStyle,
      title: '',
      titleWrapperStyle: { height: 0, paddingTop: 0 },
      footerWrapperStyle: {
        height: 0,
        marginTop: 0,
        paddingBottom: 0,
        borderTopWidth: 0,
        display: 'none',
      },
      onMaskPress: () => Popup.close(),
      content: <WeekCheckBox value={repeatStr} onChange={value => setRepeatStr(value)} />,
    });
  };

  // 设置份数
  const handleParts = () => {
    const dataSource = new Array(15).fill(0).map((item, idx) => ({
      label: `${idx + 1}`,
      value: idx + 1,
    }));

    Popup.picker({
      ...commonPopStyle,
      dataSource,
      title: i18n.getLang('feedPortion'),
      cancelText: i18n.getLang('cancel'),
      confirmText: i18n.getLang('confirm'),
      value: parts,
      label: i18n.getLang('unit_copies'),
      labelOffset: cx(60),
      pickerFontColor: commonColor.mainText,
      pickerUnitColor: commonColor.mainText,
      theme: { fontSize: cx(18), fontColor: commonColor.mainText },
      onConfirm: (value, idx) => {
        setParts(value);
        Popup.close();
      },
      onCancel: Popup.close,
    });
  };

  const renderPickerView = ({
    style,
    values,
    value,
    onValueChange,
    loop,
  }: {
    style?: StyleProp<ViewStyle>;
    values: IPickerValue[];
    value: number | 'AM' | 'PM' | '';
    onValueChange?: (value: string | 'AM' | 'PM') => void;
    loop?: boolean;
  }) => {
    if (values.length === 0) {
      return null;
    }
    return (
      <Picker
        selectedValue={value}
        onValueChange={onValueChange}
        contentContainerStyle={commonStyles.flexOne}
        selectedItemTextColor={commonColor.mainText}
        itemTextColor={commonColor.mainText}
        textSize={cx(18)}
        itemStyle={[
          { color: commonColor.mainText, backgroundColor: 'transparent', fontSize: cx(18) },
        ]}
        style={[
          {
            flex: 1,
            height: isIos ? cx(250) : cx(180),
            backgroundColor: 'transparent',
            justifyContent: 'center',
          },
          style,
        ]}
        loop={loop}
        visibleItemCount={5}
      >
        {values.map((d, k) => (
          <Picker.Item key={d.value} value={d.value} label={d.label} />
        ))}
      </Picker>
    );
  };

  return (
    <View style={commonStyles.flexOne}>
      <TopBar
        title={i18n.getLang(isEdit ? 'editPlan' : 'addPlan')}
        titleStyle={{ color: commonColor.mainText }}
        background="transparent"
        actions={
          isEdit
            ? [
              {
                source: i18n.getLang('delete'),
                color: commonColor.red,
                onPress: handleDeletePop,
                contentStyle: { fontSize: cx(14) },
              },
            ]
            : []
        }
        onBack={TYSdk.Navigator.pop}
      />
      <ScrollView style={commonStyles.flexOne} showsVerticalScrollIndicator={false}>
        <View style={[commonStyles.flexRowCenter, styles.timeBox, isIos && { marginBottom: 0 }]}>
          {renderPickerView({
            values: [],
            value: '',
          })}
          {renderPickerView({
            values: hours,
            value: hour,
            onValueChange: value => setHour(value),
            loop,
          })}
          {renderPickerView({
            values: minutes,
            value: minute,
            onValueChange: value => setMinute(value),
            loop,
          })}
          {renderPickerView({
            values: [],
            value: '',
          })}
        </View>

        <View style={[commonStyles.shadow, styles.actionBox]}>
          <View style={[commonStyles.flexRowBetween, styles.actionItem]}>
            <TYText style={styles.actionTitle}>{i18n.getLang('repeat')}</TYText>
            <TouchableOpacity onPress={handleRepeat}>
              <View style={commonStyles.flexRow}>
                <TYText color="#ADA49B" size={cx(15)} style={{ maxWidth: cx(200), }}>
                  {getRepeatStr(repeatStr)}
                </TYText>
                <Image source={Res.arrowRight} />
              </View>
            </TouchableOpacity>
          </View>
          <View style={[commonStyles.flexRowBetween, styles.actionItem]}>
            <TYText style={styles.actionTitle}>{i18n.getLang('feedPortion')}</TYText>
            <TouchableOpacity onPress={handleParts}>
              <View style={commonStyles.flexRow}>
                <TYText color="#ADA49B" size={cx(15)}>
                  {i18n.formatValue('feed_copies', parts)}
                </TYText>
                <Image source={Res.arrowRight} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <BrickButton
        text={i18n.getLang('save')}
        type="primaryGradient"
        background={btnBackground}
        style={styles.btnBox}
        wrapperStyle={styles.btn}
        textStyle={{ fontSize: cx(15) }}
        onPress={onSave}
      />
    </View>
  );
};

export default AddEditPlan;

const styles = StyleSheet.create({
  timeBox: {
    margin: cx(15),
  },
  actionBox: {
    marginHorizontal: cx(15),
    padding: cx(15),
    width: width - cx(30),
    borderRadius: cx(10),
  },
  actionItem: {
    height: cx(44),
  },
  actionTitle: {
    fontSize: cx(15),
    color: commonColor.mainText,
    fontWeight: '500',
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
