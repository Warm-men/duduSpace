import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BrickButton, Picker, Popup, TYSdk, TYText, TopBar, Utils } from 'tuya-panel-kit';
import _times from 'lodash/times';
import moment from 'moment';
import _get from 'lodash/get';
import _isNumber from 'lodash/isNumber';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import i18n from '@i18n';
import { commonColor, commonPopStyle, commonStyles, cx, width, dpCodes } from '@config';
import Res from '@res';
import { getRepeatStr, encodeCleanPlan, decodeCleanPlan } from '@utils';
import TipModal from '@components/tipModal';
import _ from 'lodash';
import WeekCheck from './weekCheck';

const { toFixed } = Utils.CoreUtils;

interface IPickerValue {
  value: number | string;
  label: string;
}

interface Props {
  isEdit?: boolean;
  data: any;
  is12Hours?: boolean;
  loop?: boolean;
}

const { setClearPlanCode } = dpCodes;
const AddEditPlan: React.FC<Props> = props => {
  const { route } = props;
  // 当前时间：小时
  const currentHour = moment().hour();
  // 当前时间：分钟
  const currentMinute = moment().minute();
  const { isEdit, planItem = {}, index, onFinished } = _get(route, 'params', {});
  const { [setClearPlanCode]: setClearPlan } = useSelector(({ dpState }: any) => dpState);

  const navigation = useNavigation();
  const _hour = _isNumber(planItem.hour) ? planItem.hour : currentHour;
  const _minute = _isNumber(planItem.minute) ? planItem.minute : currentMinute;
  const { is12Hours = false, loop = true } = props;
  const [repeatStr, setRepeatStr] = useState(planItem.repeat || '1111111');
  const [hour, setHour] = useState(_hour);
  const [minute, setMinute] = useState(_minute);
  const [showExistedTip, setShowExistedTip] = useState(false);
  const [showLess10Tip, setShowLess10Tip] = useState(false);
  const [showDeleteTip, setShowDeleteTip] = useState(false);

  const hours: IPickerValue[] = is12Hours
    ? _times(12, n => ({
        value: n,
        label: toFixed(n === 0 ? 12 : n, 2),
      }))
    : _times(24, n => ({
        value: n,
        label: toFixed(n, 2),
      }));

  const minutes: IPickerValue[] = _times(60, n => ({
    value: n,
    label: toFixed(n, 2),
  }));

  const handleOnChangeWeek = (value: string) => {
    setRepeatStr(value);
  };

  const handleRepeat = () => {
    Popup.custom({
      ...commonPopStyle,
      titleWrapperStyle: { height: 0 },
      footerWrapperStyle: { height: 0 },
      cancelText: '',
      confirmText: '',
      cancelTextStyle: { height: 0 },
      confirmTextStyle: { height: 0 },
      footer: <View />,
      onMaskPress: ({ close }) => close(),
      content: (
        <WeekCheck
          value={repeatStr}
          onChange={value => {
            handleOnChangeWeek(value);
          }}
        />
      ),
    });
  };

  const renderPickView = ({
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
        itemStyle={[
          { color: commonColor.mainText, backgroundColor: 'transparent', fontSize: cx(18) },
        ]}
        style={[
          {
            flex: 1,
            height: cx(250),
            backgroundColor: 'transparent',
            justifyContent: 'center',
          },
          style,
        ]}
        loop={loop}
      >
        {values.map((d, k) => (
          <Picker.Item key={k} value={d.value} label={d.label} />
        ))}
      </Picker>
    );
  };

  // 查重3: 查询两个周循环是否存在重复的天，提示该定时已存在；
  const isRepeatDay = (repeatStr1: string, repeatStr2: string) => {
    const arr1 = repeatStr1.split('');
    const arr2 = repeatStr2.split('');
    const isRepeat = arr1.some((item, index) => item === '1' && arr2[index] === '1');
    return isRepeat;
  };

  const onSave = () => {
    const planData = {
      repeat: repeatStr,
      hour,
      minute,
    };
    const list = decodeCleanPlan(setClearPlan);
    let dpData = '';

    if (isEdit) {
      // 如果是编辑，先判断list定时数据是否相同，相同则不提示，不同则提示

      const preItem = list[index];
      const isSame = _.isEqual(preItem, planData);
      if (isSame) {
        return navigation.goBack();
      }
    }
    // 查重1：重复定时不可以添加（同一周循环、同一时间点），提示该定时已存在；
    const isRepeat = list.some((item, itemIndex) => {
      if (itemIndex === index) {
        return false;
      }
      return (
        item.repeat === planData.repeat &&
        item.hour === planData.hour &&
        item.minute === planData.minute
      );
    });
    if (isRepeat) {
      setShowExistedTip(true);
      return;
    }

    // 查重2：两个定时之间的时间间隔不可以小于10分钟，提示定时时间间隔不可小于10分钟；
    const isLessThan10 = list.some((item, itemIndex) => {
      if (itemIndex === index) {
        return false;
      }
      return (
        isRepeatDay(item.repeat, planData.repeat) &&
        item.hour === planData.hour &&
        Math.abs(item.minute - planData.minute) <= 10
      );
    });
    if (isLessThan10) {
      setShowLess10Tip(true);
      return;
    }

    if (isEdit) {
      list[index] = planData;
      dpData = encodeCleanPlan(list);
    } else {
      dpData = encodeCleanPlan([...list, planData]);
    }
    TYSdk.device.putDeviceData({
      [setClearPlanCode]: dpData,
    });
    navigation.goBack();
    onFinished && onFinished(isEdit ? 'edit' : 'add');
  };

  const handleDelete = () => {
    setShowDeleteTip(true);
  };

  const deleteItem = () => {
    const list = decodeCleanPlan(setClearPlan);
    list.splice(index, 1);
    const dpData = encodeCleanPlan(list);
    TYSdk.device.putDeviceData({
      [setClearPlanCode]: dpData,
    });
    navigation.goBack();
    onFinished && onFinished('delete');
  };

  return (
    <View style={commonStyles.flexOne}>
      <TopBar
        title={i18n.getLang(isEdit ? 'editPlan' : 'addPlan')}
        titleStyle={{ color: commonColor.mainText }}
        background="transparent"
        onBack={navigation.goBack}
        actions={
          isEdit
            ? [
                {
                  source: i18n.getLang('delete'),
                  color: commonColor.red,
                  onPress: handleDelete,
                  contentStyle: { fontSize: cx(14) },
                },
              ]
            : []
        }
      />
      <ScrollView style={commonStyles.flexOne}>
        <View style={[commonStyles.flexRowCenter, styles.timeBox]}>
          {renderPickView({
            values: hours,
            value: hour,
            onValueChange: value => {
              setHour(value);
            },
            loop,
          })}
          {renderPickView({
            values: minutes,
            value: minute,
            onValueChange: value => {
              setMinute(value);
            },
            loop,
          })}
        </View>

        <View style={[commonStyles.shadow, styles.actionBox]}>
          <View style={[commonStyles.flexRowBetween, styles.actionItem]}>
            <TYText style={styles.actionTitle}>{i18n.getLang('repeat')}</TYText>
            <TouchableOpacity onPress={handleRepeat}>
              <View style={commonStyles.flexRow}>
                <TYText color="#ADA49B" size={cx(15)}>
                  {getRepeatStr(repeatStr)}
                </TYText>
                <Image source={Res.arrow_right} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <BrickButton
        text={i18n.getLang('save')}
        type="primaryGradient"
        background={{
          x1: '0%',
          y1: '0%',
          x2: '100%',
          y2: '0%',
          stops: {
            '0%': '#E6B26A',
            '100%': '#D49157',
          },
        }}
        style={styles.btnBox}
        wrapperStyle={styles.btn}
        textStyle={{ fontSize: cx(15) }}
        onPress={onSave}
      />
      <TipModal
        isVisibleModal={showExistedTip}
        title={i18n.getLang('warning')}
        subTitle={i18n.getLang('repeat_plan')}
        onConfirm={() => {
          setShowExistedTip(false);
        }}
      />
      <TipModal
        isVisibleModal={showLess10Tip}
        title={i18n.getLang('warning')}
        subTitle={i18n.getLang('less_than_10_minute')}
        onConfirm={() => {
          setShowLess10Tip(false);
        }}
      />
      <TipModal
        isVisibleModal={showDeleteTip}
        title={i18n.getLang('sure_delete')}
        subTitle=""
        icon={Res.common_icon_del}
        onCancel={() => {
          setShowDeleteTip(false);
        }}
        onConfirm={() => {
          setShowDeleteTip(false);
          deleteItem();
        }}
      />
    </View>
  );
};

export default AddEditPlan;

const styles = StyleSheet.create({
  timeBox: {
    padding: cx(15),
    paddingBottom: 0,
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
