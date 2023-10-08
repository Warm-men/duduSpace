import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { GlobalToast, TYSdk, TYText, Utils, SwitchButton, TopBar } from 'tuya-panel-kit';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Res from '@res';
import i18n from '@i18n';
import { commonColor, dpCodes } from '@config';
import TipModal from '@components/tipModal';
import { decodeCleanPlan, getRepeatStr } from '@utils';

const { convertX: cx } = Utils.RatioUtils;
const { toFixed } = Utils.CoreUtils;

const { clearPlanSwitchCode, setClearPlanCode, autoCleanCode } = dpCodes;
const SmartSettings: React.FC = (props: any) => {
  const {
    [clearPlanSwitchCode]: clearPlanSwitch,
    [setClearPlanCode]: setClearPlan,
    [autoCleanCode]: autoClean,
  } = useSelector(({ dpState }: any) => dpState);

  const list = decodeCleanPlan(setClearPlan);
  const [showTipModal, setShowTipModal] = useState(false);

  const navigation = useNavigation();
  const size = { width: cx(45), height: cx(26), activeSize: cx(21) };
  const showStatusTip = (type: string) => {
    const hintType = {
      add: i18n.getLang('add_done'),
      edit: i18n.getLang('edit_done'),
      delete: i18n.getLang('delete_done'),
    };
    if (!hintType[type]) return;
    GlobalToast.show({
      text: hintType[type],
      showIcon: false,
      contentStyle: {},
      onFinish: () => {
        GlobalToast.hide();
      },
    });
  };

  return (
    <View style={styles.flex1}>
      <TopBar
        title={i18n.getLang('scheduled_cleaning_title')}
        titleStyle={{ color: commonColor.mainText }}
        background="transparent"
        onBack={navigation.goBack}
        actions={[
          {
            source: i18n.getLang('add'),
            contentStyle: { marginRight: cx(6) },
            color: '#DFA663',
            onPress: () => {
              if (!clearPlanSwitch) {
                return setShowTipModal(true);
              }
              if (list.length >= 10) {
                return GlobalToast.show({
                  text: i18n.getLang('max_scheduled_cleaning'),
                  showIcon: false,
                  contentStyle: {},
                  onFinish: () => {
                    GlobalToast.hide();
                  },
                });
              }
              navigation.navigate('scheduledCleaningPlan', {
                isEdit: false,
                onFinished: showStatusTip,
              });
            },
          },
        ]}
      />
      <ScrollView style={styles.flex1} contentContainerStyle={{ paddingBottom: cx(20) }}>
        <View style={[styles.rowSpw, styles.itemView]}>
          <View style={[styles.justifyContentCenter, styles.flex1]}>
            <View style={[styles.row, styles.alignItemCenter]}>
              <Image source={Res.common_icon_timing} style={styles.icon} />
              <TYText style={styles.title15}>{i18n.getLang('plan_clean')}</TYText>
            </View>

            <TYText style={styles.title12Tip}>{i18n.getLang('plan_clean_tip')}</TYText>
          </View>
          <SwitchButton
            size={size}
            onValueChange={value => {
              TYSdk.device.putDeviceData({ [clearPlanSwitchCode]: value });
              setTimeout(() => {
                TYSdk.device.putDeviceData({ [autoCleanCode]: false });
              }, 600);
            }}
            value={clearPlanSwitch}
            onTintColor="#DFA663"
          />
        </View>

        <View style={styles.scheduleView}>
          {list.map((item, index) => {
            return (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('scheduledCleaningPlan', {
                    isEdit: true,
                    planItem: item,
                    index,
                    onFinished: showStatusTip,
                  });
                }}
                key={`${item.repeat}${index}`}
                disabled={!clearPlanSwitch}
                style={[styles.rowSpw, styles.scheduleItemView]}
              >
                <View style={[styles.justifyContentCenter, styles.flex1]}>
                  <TYText
                    style={[styles.title20, { color: clearPlanSwitch ? '#49362F' : '#ADA49B' }]}
                  >
                    {`${toFixed(item.hour, 2)}:${toFixed(item.minute, 2)}`}
                  </TYText>
                  <TYText
                    style={[styles.title12, { color: clearPlanSwitch ? '#49362F' : '#ADA49B' }]}
                  >
                    {getRepeatStr(item.repeat)}
                  </TYText>
                </View>
                <Image source={Res.arrow_right} style={styles.arrowImage} resizeMode="stretch" />
              </TouchableOpacity>
            );
          })}
        </View>
        {list.length === 0 ? (
          <View style={styles.emptyView}>
            <Image source={Res.common_image_timing_none} style={styles.emptyImage} />
            <TYText align="center" style={styles.emptyText}>
              {i18n.getLang('no_scheduled_cleaning')}
            </TYText>
          </View>
        ) : null}
        <TipModal
          isVisibleModal={showTipModal}
          title={i18n.getLang('warning')}
          subTitle={i18n.getLang('warning_open_schedule')}
          onConfirm={() => {
            setShowTipModal(false);
          }}
        />
      </ScrollView>
    </View>
  );
};

export default SmartSettings;

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  alignItemCenter: {
    alignItems: 'center',
  },
  justifyContentCenter: {
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  rowSpw: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  icon: {
    width: cx(15.5),
    height: cx(15.5),
    marginRight: cx(8),
  },
  title15: {
    fontSize: cx(16),
    color: '#49362F',
  },
  title20: {
    fontSize: cx(20),
    color: '#49362F',
  },
  title12Tip: {
    fontSize: cx(12),
    color: '#ADA49B',
    lineHeight: cx(18),
    marginTop: cx(6),
    width: cx(260),
  },
  title12: {
    fontSize: cx(12),
    color: '#49362F',
    lineHeight: cx(18),
  },
  itemView: {
    // height: cx(65.5),
    alignItems: 'center',
    marginHorizontal: cx(30),
    marginBottom: cx(15),
    marginTop: cx(45),
    paddingBottom: cx(30),
    borderBottomColor: '#E5E0DF',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scheduleView: {
    width: cx(345),
    marginHorizontal: cx(15),
    paddingHorizontal: cx(15),
    paddingBottom: cx(10),
  },
  scheduleItemView: {
    height: cx(65.5),
    alignItems: 'center',
  },
  arrowImage: {
    width: cx(20),
    height: cx(20),
  },
  emptyView: {
    marginTop: cx(90),
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImage: {
    width: cx(230),
    height: cx(210),
  },
  emptyText: {
    fontSize: cx(15),
    color: '#ADA49B',
  },
});
