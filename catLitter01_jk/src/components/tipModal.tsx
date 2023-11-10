import React from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, Image } from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import Res from '@res';
import Strings from '@i18n';
import LinearGradient from '@components/LinearGradient';

const { convertX: cx } = Utils.RatioUtils;
interface PopProps {
  isVisibleModal: boolean;
  title: string;
  subTitle: string;
  icon?: any;
  onConfirm?: () => void;
  onCancel?: () => void;
  cancelText?: string;
  confirmText?: string;
}

const PopUp = (props: PopProps) => {
  const {
    isVisibleModal = false,
    title = '',
    subTitle = '',
    onCancel,
    onConfirm,
    icon,
    cancelText,
    confirmText,
  } = props;
  return (
    <Modal visible={isVisibleModal} transparent={true} animationType="fade">
      <View style={styles.modalWrapper}>
        <View style={styles.modalView}>
          <Image source={icon || Res.home_pop_warn} style={styles.iconImage} />
          <TYText align="center" style={styles.modalText}>
            {title}
          </TYText>
          <TYText align="center" style={styles.modalText1}>
            {subTitle}
          </TYText>
          <View style={styles.modalButtons}>
            {onCancel ? (
              <TouchableOpacity
                style={[styles.modalButtonView, styles.modalButtonView1]}
                activeOpacity={0.8}
                onPress={onCancel}
              >
                <TYText style={[styles.modalButtonText]}>
                  {cancelText || Strings.getLang('cancel')}
                </TYText>
              </TouchableOpacity>
            ) : null}

            <LinearGradient
              style={!onCancel ? styles.modalButtonView2 : styles.modalButtonView2Small}
              width={!onCancel ? cx(240) : cx(110)}
              height={cx(40)}
            >
              <TouchableOpacity
                style={[
                  styles.modalButtonView,
                  { backgroundColor: 'url(#grad)', width: !onCancel ? cx(240) : cx(110) },
                ]}
                activeOpacity={0.8}
                onPress={() => {
                  onConfirm && onConfirm();
                }}
              >
                <TYText style={[styles.modalButtonText1]}>
                  {confirmText || Strings.getLang('confirm')}
                </TYText>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PopUp;

const styles = StyleSheet.create({
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
  modalText1: {
    fontSize: cx(14),
    lineHeight: cx(20),
    color: '#7C7269',
    marginTop: cx(10),
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
    width: cx(240),
    height: cx(40),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: cx(20),
    overflow: 'hidden',
  },
  modalButtonView2Small: {
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
