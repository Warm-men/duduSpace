import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, TouchableOpacity, StyleSheet, Modal, Image } from 'react-native';
import { Utils, TYText, TYSdk } from 'tuya-panel-kit';
import { useSelector, useDispatch } from 'react-redux';
import { dpCodes } from '@config';
import Res from '@res';
import Strings from '@i18n';
import LinearGradient from '@components/LinearGradient';
import { getUploadRollerState } from '@utils';

const { convertX: cx } = Utils.RatioUtils;

const { faultCode, sartRollerCode, uploadRollerStateCode, rollerStateCode } = dpCodes;

const PopUp = (props: any) => {
  const dispatch = useDispatch();
  const {
    [faultCode]: fault,
    [sartRollerCode]: sartRoller,
    [uploadRollerStateCode]: uploadRollerState,
  } = useSelector(({ dpState }: any) => dpState);

  const [isVisiblePop, setIsVisiblePop] = useState(false);
  const [isVisibleModal, setIsVisibleModal] = useState(false);
  const [rollerMode, setRollerMode] = useState(0); // Data[0]:滚筒模式 0-手动清理 1-定时清理 2-自动清理 3-倾倒猫砂 4-平整猫砂 5-复位
  const [rollerState, setRollerState] = useState(0); // Data[1]: 0-待机 1-异常暂停 2-人为暂停 3-执行中 4-失败 5--完成
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!uploadRollerState) return;
    const uploadRollerStateData = getUploadRollerState(uploadRollerState);
    // Data[2]:错误原因 0：正常 1：便仓未到位 2：便仓已满 3：上盖异常 4：猫进入 5：滚筒无法到位 6：猫靠近 7： 计划时间冲突

    const errorCodeList = [1, 2, 3, 5, 7];

    // 01 01 4a 00 00 00 00 00 00
    const { errorCode, rollerState } = uploadRollerStateData;
    if (errorCodeList.includes(errorCode)) {
      // 设备异常情况，弹窗消失，Data[2]: 1：便仓未到位 2：便仓已满 3：上盖异常 5：滚筒无法到位
      // home 故障显示设备异常信息，根据dp22值显示
      setIsVisiblePop(false);
      setIsVisibleModal(false);
      return;
    }
    const doneList = [4, 5];
    if (doneList.includes(rollerState)) {
      // 4-失败 5--完成
      setIsVisiblePop(false);
      setIsVisibleModal(false);
      return;
    }
    // 待机状态
    if (rollerState === 0) {
      return setIsVisiblePop(false);
    }
    const needShow = [1, 2, 3];
    if (needShow.includes(rollerState)) {
      setIsVisiblePop(true);
    }
  }, [uploadRollerState]);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isVisiblePop ? 1 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [isVisiblePop]);

  // normal, suspended, recovery_rotation, cancel_rotation: 正常、暂停、恢复转动、取消转动归位（复位） （弹窗的操作）
  const Buttons = {
    onlyPause: [
      {
        label: Strings.getLang('pause'),
        color: '#DFA663',
        onPress: () => {
          TYSdk.device.putDeviceData({ [rollerStateCode]: 'suspended' });
        },
      },
    ],
    onlyContinue: [
      {
        label: Strings.getLang('continue'),
        color: '#DFA663',
        onPress: () => {
          TYSdk.device.putDeviceData({ [rollerStateCode]: 'recovery_rotation' });
        },
      },
    ],

    resetAndContinue: [
      {
        label: Strings.getLang('reset'),
        color: '#ADA49B',
        onPress: () => {
          TYSdk.device.putDeviceData({ [rollerStateCode]: 'cancel_rotation' });
        },
      },
      {
        label: Strings.getLang('continue'),
        color: '#DFA663',
        onPress: () => {
          TYSdk.device.putDeviceData({ [rollerStateCode]: 'recovery_rotation' });
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
          TYSdk.device.putDeviceData({ [rollerStateCode]: 'recovery_rotation' });
        },
      },
    ],
  };

  const getButtons = () => {
    // Data[0]: 滚筒模式 0-手动清理 1-定时清理 2-自动清理 3-倾倒猫砂 4-平整猫砂 5-复位
    // Data[1]: 0-待机 1-异常暂停 2-人为暂停 3-执行中 4-失败 5--完成
    // Data[2]:错误原因 0：正常 1：便仓未到位 2：便仓已满 3：上盖异常 4：猫进入 5：滚筒无法到位 6：猫靠近 7： 计划时间冲突
    const uploadRollerStateData = getUploadRollerState(uploadRollerState);
    const { rollerMode, rollerState, errorCode } = uploadRollerStateData;
    // 手动清理
    if (rollerMode === 0 && rollerState === 3 && errorCode === 0) {
      // case1: 手动清理执行中，可暂停
      return {
        button: Buttons.onlyPause,
        text: Strings.getLang('roller_state_desc_0_3_0'),
      };
    }
    if (rollerMode === 0 && rollerState === 1 && [4, 6].includes(errorCode)) {
      // case2: 手动清理异常暂停：猫咪靠近、猫咪进入，可复位、继续
      return {
        button: Buttons.resetPopAndContinue,
        text:
          errorCode === 4
            ? Strings.getLang('roller_state_desc_0_1_4')
            : Strings.getLang('roller_state_desc_0_1_6'),
      };
    }
    if (rollerMode === 0 && rollerState === 2 && errorCode === 0) {
      // case3: 手动清理人为暂停：手动暂停，可复位、继续
      return {
        button: Buttons.resetPopAndContinue,
        text: Strings.getLang('roller_state_desc_0_2_0'),
      };
    }

    // 复位过程
    if (rollerMode === 5 && rollerState === 3 && errorCode === 0) {
      // case1: 复位中：可暂停
      return {
        button: Buttons.onlyPause,
        text: Strings.getLang('roller_state_desc_5_3_0'),
      };
    }
    if (rollerMode === 5 && [1, 2].includes(rollerState) && errorCode === 0) {
      // case2: 复位已暂停：可继续
      return {
        button: Buttons.onlyContinue,
        text: Strings.getLang('roller_state_desc_5_2_0'),
      };
    }

    // 倾倒猫砂
    if (rollerMode === 3 && rollerState === 3 && errorCode === 0) {
      // case1: 倾倒猫砂执行中，可暂停
      return {
        button: Buttons.onlyPause,
        text: Strings.getLang('roller_state_desc_3_3_0'),
      };
    }
    if (rollerMode === 3 && rollerState === 1 && [4, 6].includes(errorCode)) {
      // case2: 倾倒猫砂异常暂停：猫咪靠近、猫咪进入，可复位、继续
      return {
        button: Buttons.resetPopAndContinue,
        text:
          errorCode === 4
            ? Strings.getLang('roller_state_desc_3_1_4')
            : Strings.getLang('roller_state_desc_3_1_6'),
      };
    }
    if (rollerMode === 3 && rollerState === 2 && errorCode === 0) {
      // case3: 倾倒猫砂人为暂停：手动暂停，可复位、继续
      return {
        button: Buttons.resetPopAndContinue,
        text: Strings.getLang('roller_state_desc_3_2_0'),
      };
    }

    // 平整猫砂
    if (rollerMode === 4 && rollerState === 3 && errorCode === 0) {
      // case1: 平整猫砂执行中，可暂停
      return {
        button: Buttons.onlyPause,
        text: Strings.getLang('roller_state_desc_4_3_0'),
      };
    }
    if (rollerMode === 4 && rollerState === 1 && [4, 6].includes(errorCode)) {
      // case2: 平整猫砂异常暂停：猫咪靠近、猫咪进入，可复位、继续
      return {
        button: Buttons.resetPopAndContinue,
        text:
          errorCode === 4
            ? Strings.getLang('roller_state_desc_4_1_4')
            : Strings.getLang('roller_state_desc_4_1_6'),
      };
    }
    if (rollerMode === 4 && rollerState === 2 && errorCode === 0) {
      // case3: 平整猫砂人为暂停：手动暂停，可复位、继续
      return {
        button: Buttons.resetPopAndContinue,
        text: Strings.getLang('roller_state_desc_3_2_0'),
      };
    }
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
          return (
            <View key={item.label} style={styles.itemView}>
              <TouchableOpacity
                style={[styles.buttonView]}
                activeOpacity={0.8}
                onPress={item.onPress}
                key={item.label}
              >
                <TYText style={[styles.buttonText, { color: item.color }]}>{item.label}</TYText>
              </TouchableOpacity>
              {index === 0 && getButtons()?.button.length > 1 ? <View style={styles.line} /> : null}
            </View>
          );
        })}
      </View>
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

              <LinearGradient style={styles.modalButtonView2}>
                <TouchableOpacity
                  style={[styles.modalButtonView, { backgroundColor: 'url(#grad)' }]}
                  activeOpacity={0.8}
                  onPress={() => {
                    TYSdk.device.putDeviceData({ [rollerStateCode]: 'cancel_rotation' });
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
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
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
