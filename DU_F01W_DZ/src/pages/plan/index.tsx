import { Empty } from '@components';
import {
  MealPlan,
  TIMER_CONFIG,
  btnBackground,
  commonColor,
  commonDialogStyle,
  commonStyles,
  cx,
  dpCodes,
  width,
} from '@config';
import i18n from '@i18n';
import { useSelector } from '@models';
import Res from '@res';
import { decodeMealPlan, encodeMealPlan, getRepeatStr } from '@utils';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  BrickButton,
  Button,
  Dialog,
  GlobalToast,
  Popup,
  Swipeout,
  SwitchButton,
  TYSdk,
  TYText,
} from 'tuya-panel-kit';

const { meal_plan, enter_sleep } = dpCodes;

const Plan: React.FC = () => {
  const { [meal_plan]: mealPlan, [enter_sleep]: enterSleep } = useSelector(state => state.dpState);
  const deviceOnline = useSelector(state => state.devInfo.deviceOnline);
  const [dataSource, setDataSource] = useState([]);
  const [deleteIdx, setDeleteIdx] = useState([]);

  useEffect(() => {
    getMealPlan();
  }, [mealPlan]);

  // 获取喂食计划
  const getMealPlan = () => {
    const mealPlanList = decodeMealPlan(mealPlan);
    console.log('mealPlanList======', mealPlanList);
    setDataSource(mealPlanList);
  };

  // 新增/编辑喂食计划
  const pushToAdd = (isEdit?: boolean, timer?: any) => {
    if (isEdit) {
      return TYSdk.Navigator.push({
        id: 'addEditPlan',
        isEdit,
        timer,
        timerList: dataSource,
        ...TIMER_CONFIG,
      });
    }

    return TYSdk.Navigator.push({
      id: 'addEditPlan',
      timerList: dataSource,
      ...TIMER_CONFIG,
    });
  };

  // 关闭计划
  const switchChange = (value: boolean, id: number) => {
    const data = [];
    dataSource.forEach((item: MealPlan) => {
      const dataItem = { ...item };
      if (item.id === id) {
        dataItem.switchValue = !item.switchValue;
      }
      data.push(dataItem);
    });

    const mealPlanStr = encodeMealPlan(data);
    TYSdk.device.putDeviceData({ [meal_plan]: mealPlanStr });
  };

  // 删除计划
  const deletePlan = (id: number) => {
    const data = dataSource.filter(item => item.id !== id);

    const mealPlanStr = encodeMealPlan(data);
    TYSdk.device.putDeviceData({ [meal_plan]: mealPlanStr }).then(({ success }) => {
      if (success) {
        setDeleteIdx([]);
        GlobalToast.show({
          text: i18n.getLang('delete_success'),
          showIcon: false,
        });
      }
    });
  };

  // 删除计划弹窗
  const handleDeletePop = (id: number, index: number) => {
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
                setDeleteIdx([index]);
                deletePlan(id);
                Dialog.close();
              }}
            />
          </View>
        </View>
      ),
    });
  };

  // 长按删除计划--安卓
  const onPlanLongPress = (id: number) => {
    if (Platform.OS !== 'android') return;
    handleDeletePop(id);
  };

  const renderPlan = ({ item, index }) => {
    const { id, timeStr, repeatStr, switchValue, parts } = item;
    const isRepeat = repeatStr !== '0000000';
    const timeCell = (
      <View style={[commonStyles.shadow, styles.timeContent]}>
        <TouchableOpacity
          style={{ height: '100%' }}
          onLongPress={() => onPlanLongPress(id)}
          onPress={() => pushToAdd(true, item)}
          disabled={enterSleep || !deviceOnline}
        >
          <View style={[commonStyles.flexRowBetween, { height: '100%' }]}>
            <View style={[{ justifyContent: 'center', height: '100%', width: width - cx(105) }]}>
              <TYText size={cx(40)} color={commonColor.mainText}>
                {timeStr}
              </TYText>
              <TYText style={styles.timeText}>
                {`${i18n.formatValue('feed_copies', parts)}, `}
                {isRepeat ? `${i18n.getLang('repeat')}, ` : ''}
                {getRepeatStr(repeatStr)}
              </TYText>
            </View>
            <SwitchButton
              value={switchValue}
              theme={{ width: cx(45), height: cx(26), thumbSize: cx(21) }}
              onTintColor={commonColor.brown}
              tintColor="#ECEBE8"
              onValueChange={value => switchChange(value, id)}
              disabled={enterSleep || !deviceOnline}
            />
          </View>
        </TouchableOpacity>
      </View>
    );

    return (
      <View style={[commonStyles.shadow, styles.timeBox]}>
        {Platform.OS === 'ios' ? (
          <Swipeout
            disabled={enterSleep || !deviceOnline}
            close={deleteIdx.includes(index)}
            accessibilityLabel={`Timer_Swipeout${index}`}
            backgroundColor="transparent"
            onOpen={() => {
              const delIdx = [];
              dataSource.forEach((elem, idx) => idx !== index && delIdx.push(idx));
              setDeleteIdx(delIdx);
            }}
            right={[
              {
                text: i18n.getLang('delete'),
                onPress: () => handleDeletePop(id, index),
                type: 'delete',
                fontStyle: { color: '#fff', fontSize: cx(15) },
              },
            ]}
          >
            {timeCell}
          </Swipeout>
        ) : (
          timeCell
        )}
      </View>
    );
  };

  return (
    <View style={commonStyles.flexOne}>
      {dataSource.length > 0 ? (
        <FlatList
          keyExtractor={item => `timer_${item.id}`}
          data={dataSource}
          renderItem={renderPlan}
          showsVerticalScrollIndicator={false}
          style={{ marginTop: cx(15) }}
        />
      ) : (
        <View style={[commonStyles.flexOne, commonStyles.flexCenter]}>
          <Empty desc={i18n.getLang('noPlan')} />
        </View>
      )}

      <View style={[commonStyles.flexCenter, styles.timeBtn]}>
        <TYText size={cx(12)} color="#ADA49B">
          {i18n.getLang(dataSource.length >= 10 ? 'planLimitTips' : 'addPlanTips')}
        </TYText>
        {dataSource.length < 10 && (
          <BrickButton
            text={i18n.getLang('addPlan')}
            type="primaryGradient"
            background={btnBackground}
            style={{ marginTop: cx(10) }}
            wrapperStyle={styles.btn}
            textStyle={{ fontSize: cx(15) }}
            onPress={() => pushToAdd()}
            disabled={enterSleep || !deviceOnline}
          />
        )}
      </View>
    </View>
  );
};

export default Plan;

const styles = StyleSheet.create({
  timeBox: {
    marginBottom: cx(16),
    marginHorizontal: cx(15),
    width: width - cx(30),
    height: cx(115),
    borderRadius: cx(10),
    overflow: 'hidden',
  },
  timeContent: {
    paddingLeft: cx(13),
    paddingRight: cx(15),
  },
  timeText: {
    fontSize: cx(15),
    color: '#ADA49B',
  },
  timeBtn: {
    paddingBottom: cx(44),
    paddingHorizontal: cx(30),
  },
  btn: {
    width: width - cx(60),
    height: cx(49),
    borderRadius: cx(25.5),
  },
});
