import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, TouchableOpacity, StyleSheet, Modal, Image } from 'react-native';
import { Utils, TYText, TYSdk } from 'tuya-panel-kit';
import { useSelector } from 'react-redux';
import { dpCodes } from '@config';
import Res from '@res';
import Strings from '@i18n';
import LinearGradient from '@components/LinearGradient';
import { getUploadRollerState } from '@utils';
import TipModal from '@components/tipModal';

const { convertX: cx } = Utils.RatioUtils;

const {
  faultCode,
  starRollerCode,
  uploadRollerStateCode,
  rollerStateCode,
  coerceExeCode,
} = dpCodes;
const PopUp = (props: any) => {
  const {
    [faultCode]: fault,
    [starRollerCode]: starRoller,
    [uploadRollerStateCode]: uploadRollerState,
  } = useSelector(({ dpState }: any) => dpState);

  const [isVisiblePop, setIsVisiblePop] = useState(false);
  const [isVisibleModal, setIsVisibleModal] = useState(false);
  const [showForceAction, setShowForceAction] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!uploadRollerState) return;
    const uploadRollerStateData = getUploadRollerState(uploadRollerState);

    // Data[0]:滚简模式 0-待机模式 1-手动清理 2-定时清理 3-自动清理 4-倾倒猫砂 5-平整猫砂 6--手动清理复位 7--定时清理复位 8--自动清理复位 9--倾倒猫砂复位 10-平整猫砂复位 11-其它复位(故障复位)
    // Data[1]:滚筒状态 0-待机 1-异常暂停 2-人为暂停 3-执行中 4-失败 5--完成 6-终止
    // Data[2]: 错误原因 0:正常 1:便仓未到位 2集便仓已满 3上盖异常 4猫进入 5滚筒无法到位 6猫靠近 7：马达堵转 8：计划时间冲突
    const { rollerMode, errorCode, rollerState } = uploadRollerStateData;

    // const faultList = getErrorBitmap2FaultList(errorCode);
    const doneList = [0, 4, 5]; // 0- 待机 4-失败 5--完成

    // const isError = faultList.length > 0;
    const isStandby = doneList.includes(rollerState);
    if (isStandby || rollerMode === 0) {
      // 设备异常情况，弹窗消失，Data[2]: 1：便仓未到位 2：便仓已满 3：上盖异常 5：滚筒无法到位 （显示）
      // home 故障显示设备异常信息，根据dp22值显示
      setIsVisiblePop(false);
      setIsVisibleModal(false);
      return;
    }

    const needShowState = [1, 2, 3]; // 1-异常暂停 2-人为暂停 3-执行中
    // / const needShowMode = [1, 4, 5, 6, 7, 8, 9, 10, 11]; // 1-手动清理 4-倾倒猫砂 5-平整猫砂 6--手动清理复位 9--倾倒猫砂复位 10-平整猫砂复位 11-其它复位(故障复位)
    if (needShowState.includes(rollerState)) {
      setIsVisiblePop(true);
      return;
    }
    setIsVisiblePop(false);
  }, [uploadRollerState]);

  const getErrorBitmap2FaultList = (errorCode: number) => {
    const errorCodeList = [1, 2, 3, 5, 7, 8, 9];
    // 用errorCodeList遍历errorCode获取对应位置是否有值，有值则返回对应的faultCode
    return errorCodeList
      .map((item: number) => {
        return Utils.NumberUtils.getBitValue(errorCode, item) === 1 ? item : false;
      })
      .filter((item: number) => item);
  };

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isVisiblePop ? 1 : 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [isVisiblePop]);

  const handleDpPutData = (code: string, value: string) => {
    TYSdk.device.putDeviceData({ [code]: value });
  };

  // normal, suspended, recovery_rotation, cancel_rotation: 正常、暂停、恢复转动、取消转动归位（复位） （弹窗的操作）
  const Buttons = {
    onlyPause: [
      {
        label: Strings.getLang('pause'),
        color: '#DFA663',
        onPress: () => {
          handleDpPutData(rollerStateCode, 'suspended');
        },
      },
    ],
    onlyContinue: [
      {
        label: Strings.getLang('continue'),
        color: '#DFA663',
        onPress: () => {
          handleDpPutData(rollerStateCode, 'recovery_rotation');
        },
      },
    ],
    resetAndContinue: [
      {
        label: Strings.getLang('reset'),
        color: '#ADA49B',
        onPress: () => {
          handleDpPutData(rollerStateCode, 'cancel_rotation');
        },
      },
      {
        label: Strings.getLang('continue'),
        color: '#DFA663',
        onPress: () => {
          handleDpPutData(rollerStateCode, 'recovery_rotation');
        },
      },
    ],
    resetPopAndContinue: [
      {
        label: Strings.getLang('reset'),
        color: '#ADA49B',
        onPress: () => {
          // 手动暂停-复位-二次弹窗
          setIsVisibleModal(true);
        },
      },
      {
        label: Strings.getLang('continue'),
        color: '#DFA663',
        onPress: () => {
          handleDpPutData(rollerStateCode, 'recovery_rotation');
        },
      },
    ],
    forceAction: [
      {
        label: Strings.getLang('reset'),
        color: '#ADA49B',
        onPress: () => {
          // 手动暂停-复位-二次弹窗
          setIsVisibleModal(true);
        },
      },
      {
        label: Strings.getLang('continue'),
        color: '#DFA663',
        onPress: () => {
          setShowForceAction(true);
        },
      },
    ],
  };

  const getButtons = () => {
    // Data[0]:滚简模式 0-待机模式 1-手动清理 2-定时清理 3-自动清理 4-倾倒猫砂 5-平整猫砂 6--手动清理复位 7--定时清理复位 8--自动清理复位 9--倾倒猫砂复位 10-平整猫砂复位 11-其它复位(故障复位)
    // Data[1]: 0-待机 1-异常暂停 2-人为暂停 3-执行中 4-停止失败 5-操作完成 (遇到故障暂停) (APP操作暂停) 恢复执行) (超10分钟操作停止)(10分钟内继续执行)
    // Data[2]: 错误原因 0:正常 1:便仓未到位 2集便仓已满 3上盖异常 4猫进入 5滚筒无法到位 6猫靠近 7：马达堵转 8：计划时间冲突
    const uploadRollerStateData = getUploadRollerState(uploadRollerState);
    const { rollerMode, rollerState, errorCode } = uploadRollerStateData;

    const isFault4 = Utils.NumberUtils.getBitValue(errorCode, 4) === 1;
    const isFault6 = Utils.NumberUtils.getBitValue(errorCode, 6) === 1;

    const faultList = getErrorBitmap2FaultList(errorCode); // 1, 2, 3, 5, 7, 8, 9
    const faultList22 = getErrorBitmap2FaultList(fault); // 1, 2, 3, 5, 7, 8, 9

    const isFault = faultList.length > 0 || faultList22.length > 0;
    // 设备故障，xxx已暂停，10分钟内故障清除，继续执行xxx
    const textFault =
      Strings.getLang('equipment_failure') +
      Strings.getLang(`mode_${rollerMode}`) +
      Strings.getLang('equipment_failure_stop') +
      Strings.getLang('equipment_failure_restart') +
      Strings.getLang(`mode_${rollerMode}`);

    const operationMode = [1, 2, 3, 4, 5];
    const runningText = {
      1: Strings.getLang('roller_state_desc_0_3_0'),
      2: Strings.getLang('roller_state_desc_1_3_0'),
      3: Strings.getLang('roller_state_desc_2_3_0'),
      4: Strings.getLang('roller_state_desc_3_3_0'),
      5: Strings.getLang('roller_state_desc_4_3_0'),
    };
    const pauseFault4Text = {
      1: Strings.getLang('roller_state_desc_0_1_4'),
      2: Strings.getLang('roller_state_desc_1_1_4'),
      3: Strings.getLang('roller_state_desc_2_1_4'),
      4: Strings.getLang('roller_state_desc_3_1_4'),
      5: Strings.getLang('roller_state_desc_4_1_4'),
    };
    const pauseFault6Text = {
      1: Strings.getLang('roller_state_desc_0_1_6'),
      2: Strings.getLang('roller_state_desc_1_1_6'),
      3: Strings.getLang('roller_state_desc_2_1_6'),
      4: Strings.getLang('roller_state_desc_3_1_6'),
      5: Strings.getLang('roller_state_desc_4_1_6'),
    };
    const pauseManualText = Strings.getLang('roller_state_desc_0_2_0');
    // 执行中，可暂停
    if (operationMode.includes(rollerMode) && rollerState === 3 && errorCode === 0) {
      return {
        button: Buttons.onlyPause,
        text: runningText[rollerMode],
      };
    }
    // 人为暂停
    if (operationMode.includes(rollerMode) && rollerState === 2 && errorCode === 0) {
      return {
        button: Buttons.resetPopAndContinue,
        text: pauseManualText,
      };
    }
    // 异常暂停
    if (operationMode.includes(rollerMode) && rollerState === 1) {
      if (isFault4 || isFault6) {
        // case1: 猫咪靠近、猫咪进入，可复位、继续
        return {
          button: Buttons.forceAction,
          text: isFault4 ? pauseFault4Text[rollerMode] : pauseFault6Text[rollerMode],
          disabled: false,
        };
      }
      if (isFault) {
        // case2: 其他异常，可复位、继续，异常code：1, 2, 3, 5, 7, 8, 9
        return {
          button: Buttons.resetPopAndContinue,
          text: textFault,
          disabled: true,
        };
      }
    }

    const needReset = [6, 7, 8, 9, 10, 11];
    // 复位过程
    if (needReset.includes(rollerMode) && rollerState === 3 && errorCode === 0) {
      // case1: 复位中：可暂停
      return {
        button: Buttons.onlyPause,
        text: Strings.getLang('roller_state_desc_5_3_0'),
      };
    }
    if (needReset.includes(rollerMode) && rollerState === 1) {
      // case2: 异常故障暂停，禁用按键
      return {
        button: Buttons.onlyContinue,
        text: Strings.getLang('roller_state_desc_11_1_0'),
        disabled: true,
      };
    }
    if (needReset.includes(rollerMode) && rollerState === 2 && errorCode === 0) {
      // case2: 复位已暂停：可继续
      return {
        button: Buttons.onlyContinue,
        text: Strings.getLang('roller_state_desc_5_2_0'),
      };
    }
  };

  const getForcePopText = () => {
    // Data[0]:滚简模式 0-待机模式
    // 1-手动清理 2-定时清理 3-自动清理 4-倾倒猫砂 5-平整猫砂
    // 6--手动清理复位 7--定时清理复位 8--自动清理复位 9--倾倒猫砂复位
    // 10-平整猫砂复位 11-其它复位(故障复位)
    const uploadRollerStateData = getUploadRollerState(uploadRollerState);
    const { rollerMode } = uploadRollerStateData || {};
    let index = 0;
    if ([1, 6].includes(rollerMode)) {
      index = 0;
    }
    if ([4, 9].includes(rollerMode)) {
      index = 1;
    }
    if ([5, 10].includes(rollerMode)) {
      index = 2;
    }
    return {
      title: Strings.getLang(`force_action_title_${index}`),
      confirmText: Strings.getLang(`force_action_${index}`),
    };
  };

  return (
    <Animated.View
      style={[
        {
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [300, 0],
              }),
            },
          ],
        },
        styles.popupView,
      ]}
    >
      {/* 动画视图内容 */}
      <View style={[styles.popupTextView, styles.flex1]}>
        <TYText style={styles.text1}>{getButtons()?.text}</TYText>
      </View>
      <View style={styles.popupViewButtons}>
        {getButtons()?.button.map((item: any, index: number) => {
          const disabled = getButtons()?.disabled;
          return (
            <View key={item.label} style={styles.itemView}>
              <TouchableOpacity
                style={[styles.buttonView, { opacity: disabled ? 0.5 : 1 }]}
                activeOpacity={0.8}
                onPress={item.onPress}
                key={item.label}
                disabled={disabled}
              >
                <TYText style={[styles.buttonText, { color: item.color }]}>{item.label}</TYText>
              </TouchableOpacity>
              {index === 0 && getButtons()?.button.length > 1 ? <View style={styles.line} /> : null}
            </View>
          );
        })}
      </View>
      <TipModal
        isVisibleModal={showForceAction}
        title={getForcePopText().title}
        icon={Res.home_pop_warn}
        onConfirm={() => {
          TYSdk.device.putDeviceData({ [coerceExeCode]: 'recover' });
          setShowForceAction(false);
        }}
        cancelText={Strings.getLang('keep_waiting')}
        confirmText={getForcePopText().confirmText}
        onCancel={() => {
          setShowForceAction(false);
        }}
      />
      <Modal visible={isVisibleModal} transparent={true} animationType="fade">
        <View style={styles.modalWrapper}>
          <View style={styles.modalView}>
            <Image source={Res.home_pop_warn} style={styles.iconImage} />
            <TYText style={styles.modalText}>{Strings.getLang('cancel_rotation_tip')}</TYText>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButtonView, styles.modalButtonView1]}
                activeOpacity={0.8}
                onPress={() => {
                  setIsVisibleModal(false);
                }}
              >
                <TYText style={[styles.modalButtonText]}>{Strings.getLang('cancel')}</TYText>
              </TouchableOpacity>

              <LinearGradient style={styles.modalButtonView2} width={cx(110)} height={cx(40)}>
                <TouchableOpacity
                  style={[styles.modalButtonView, { backgroundColor: 'url(#grad)' }]}
                  activeOpacity={0.8}
                  onPress={() => {
                    handleDpPutData(rollerStateCode, 'cancel_rotation');
                    setIsVisibleModal(false);
                  }}
                >
                  <TYText style={[styles.modalButtonText1]}>{Strings.getLang('confirm')}</TYText>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
};

export default PopUp;

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  popupView: {
    width: cx(375),
    height: cx(173),
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: cx(15),
    borderTopRightRadius: cx(15),
    shadowColor: '#ddd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    elevation: 4,
    shadowRadius: 4,
    paddingHorizontal: cx(30),
  },
  popupTextView: {
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E0DF',
    paddingVertical: cx(20),
  },
  text1: {
    fontSize: cx(17),
    color: '#49362F',
    lineHeight: cx(25),
  },
  buttonView: {
    width: cx(150),
    height: cx(68),
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: cx(16),
  },
  line: {
    width: StyleSheet.hairlineWidth,
    height: cx(15),
    backgroundColor: '#E5E0DF',
  },
  popupViewButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemView: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  modalWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: cx(280),
    paddingHorizontal: cx(20),
    paddingVertical: cx(20),
    backgroundColor: '#fff',
    borderRadius: cx(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: cx(50),
    height: cx(50),
    marginTop: cx(15),
    marginBottom: cx(14),
  },
  modalText: {
    fontSize: cx(17),
    color: '#49362F',
    lineHeight: cx(25),
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: cx(20),
    marginTop: cx(30),
  },
  modalButtonView: {
    width: cx(110),
    height: cx(40),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F6F0',
    borderRadius: cx(20),
  },
  modalButtonView1: {
    marginRight: cx(20),
  },
  modalButtonView2: {
    width: cx(110),
    height: cx(40),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: cx(20),
    overflow: 'hidden',
  },
  modalButtonText: {
    fontSize: cx(14),
    color: '#ADA49B',
  },
  modalButtonText1: {
    fontSize: cx(14),
    color: '#fff',
  },
});
