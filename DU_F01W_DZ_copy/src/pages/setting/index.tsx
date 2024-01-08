import { commonColor, commonStyles, cx, dpCodes, width } from '@config';
import i18n from '@i18n';
import { useSelector } from '@models';
import Res from '@res';
import { getIsFault } from '@utils';
import React, { useRef } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SwitchButton, TYSdk, TYText } from 'tuya-panel-kit';

const {
  power_mode,
  battery_percentage,
  led_ctrl,
  auto_lock_enable,
  child_lock,
  enter_sleep,
  fault: faultCode,
} = dpCodes;

const Setting: React.FC = props => {
  const dpState = useSelector(state => state.dpState);
  const {
    [power_mode]: powerMode,
    [battery_percentage]: batteryPercentage,
    [led_ctrl]: ledCtrl,
    [auto_lock_enable]: autoLockEnable,
    [enter_sleep]: enterSleep,
    [faultCode]: fault,
  } = dpState;
  const dryAgent = useSelector(state => state.record.dryAgent);
  const childLockLoading = useRef(false);

  const data1 = [
    {
      icon: Res.powerType,
      title: i18n.getDpLang(power_mode),
      value: i18n.getDpLang(power_mode, powerMode),
    },
    {
      icon: Res.dryAgent,
      title: i18n.getLang('dryAgent'),
      value:
        Object.keys(dryAgent).length > 0
          ? `${i18n.getLang(dryAgent.isOverdue ? 'overdueTime1' : 'remainTime1')} ${dryAgent.day
          } ${i18n.getLang(dryAgent.isOverdue ? 'overdueTime2' : 'remainTime2')}`
          : i18n.getLang('noDry'),
      onPress: () => TYSdk.Navigator.push({ id: 'dryAgent' }),
    },
  ];
  const data2 = [
    {
      icon: Res.light,
      title: i18n.getDpLang(led_ctrl),
      value: ledCtrl,
      onPress: () => TYSdk.device.putDeviceData({ [led_ctrl]: !ledCtrl }),
      isBool: true,
      disabled: enterSleep,
    },
    {
      icon: Res.childLock,
      title: i18n.getDpLang(auto_lock_enable),
      desc: i18n.getLang('dp_child_lock_desc'),
      value: autoLockEnable,
      onPress: () => {
        if (childLockLoading.current) return;
        childLockLoading.current = true;
        TYSdk.device.putDeviceData({ [auto_lock_enable]: !autoLockEnable });

        setTimeout(() => {
          TYSdk.device.putDeviceData({ [child_lock]: !autoLockEnable }).then(({ success }) => {
            if (success) {
              childLockLoading.current = false;
            }
          });
        }, 500);
      },
      isBool: true,
      disabled: enterSleep,
    },
    {
      icon: Res.instrution,
      title: i18n.getLang('instruction'),
      onPress: () => { },
    },
    {
      icon: Res.inform,
      title: i18n.getLang('notice'),
      onPress: () => TYSdk.Navigator.push({ id: 'notice' }),
    },
  ];

  const batteryStatus = getIsFault(faultCode, fault, 'battery_low');
  !powerMode &&
    // data1.splice(1, 0, {
    //   icon: Res.batteryStatus,
    //   title: i18n.getLang('battery_status'),
    //   value: batteryPercentage < 10 ? i18n.getLang('battery_low') : i18n.getLang('battery_normal'),
    //   color: batteryPercentage < 10 ? commonColor.red : '#ADA49B',
    // });
    data1.splice(1, 0, {
      icon: Res.batteryStatus,
      title: i18n.getLang('battery_status'),
      value: batteryStatus ? i18n.getLang('battery_low') : i18n.getLang('battery_normal'),
      color: batteryStatus ? commonColor.red : '#ADA49B',
    });

  const renderItem = ({ icon, title, desc, color, value, onPress, isBool, disabled = false }) => {
    return (
      <View key={title} style={[commonStyles.flexRowBetween, styles.setBox]}>
        <View style={[commonStyles.flexRowCenter, { justifyContent: 'flex-start', flex: 1 }]}>
          <Image source={icon} style={styles.img} />
          <View style={commonStyles.flexOne}>
            <TYText color={commonColor.mainText} size={cx(15)} weight={500}>
              {title}
            </TYText>
            {!!desc && (
              <TYText color="#ADA49B" size={cx(12)}>
                {desc}
              </TYText>
            )}
          </View>
        </View>
        {!onPress && (
          <TYText color={color || '#ADA49B'} size={cx(15)} weight={500}>
            {value}
          </TYText>
        )}
        {!!onPress && (
          <View>
            {isBool ? (
              <SwitchButton
                value={value}
                theme={{ width: cx(45), height: cx(26), thumbSize: cx(21) }}
                onTintColor={commonColor.brown}
                tintColor="#ECEBE8"
                onValueChange={onPress}
                disabled={disabled}
              />
            ) : (
              <TouchableOpacity onPress={onPress} disabled={disabled}>
                <View
                  style={[
                    commonStyles.flexRowCenter,
                    { minWidth: cx(50), height: cx(60), justifyContent: 'flex-end' },
                  ]}
                >
                  {!!value && (
                    <TYText color="#ADA49B" size={cx(15)} weight={500}>
                      {value}
                    </TYText>
                  )}
                  <Image source={Res.arrowRight} />
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={commonStyles.flexOne}>
      <View style={[commonStyles.shadow, styles.container]}>
        {data1.map(item => renderItem(item))}
      </View>
      <View style={[commonStyles.shadow, styles.container]}>
        {data2.map(item => renderItem(item))}
      </View>
    </View>
  );
};

export default Setting;

const styles = StyleSheet.create({
  container: {
    marginTop: cx(15),
    marginHorizontal: cx(15),
    padding: cx(15),
    width: width - cx(30),
    borderRadius: cx(10),
  },
  setBox: {
    height: cx(60),
  },
  img: {
    marginRight: cx(16),
    width: cx(30),
    height: cx(30),
  },
});
