import { ComPopBox } from '@components';
import { FEED_STATE, commonColor, commonPopStyle, commonStyles, cx, dpCodes, width } from '@config';
import i18n from '@i18n';
import { useSelector } from '@models';
import Res from '@res';
import React, { useEffect } from 'react';
import { Image, ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Battery, GlobalToast, Modal, Popup, TYSdk, TYText } from 'tuya-panel-kit';

const { manual_feed, feed_state, battery_percentage, enter_sleep } = dpCodes;

const ControlBtn: React.FC = () => {
  const dpState = useSelector(state => state.dpState);
  const deviceOnline = useSelector(state => state.devInfo.deviceOnline);

  const {
    [feed_state]: feedState,
    [battery_percentage]: batteryPercentage,
    [manual_feed]: manualFeed,
    [enter_sleep]: enterSleep,
  } = dpState;

  useEffect(() => {
    if (feedState === FEED_STATE.failed || feedState === FEED_STATE.done) {
      GlobalToast.show({
        text: i18n.getDpLang(feed_state, feedState),
        showIcon: false,
        contentStyle: {},
        onFinish: () => {
          GlobalToast.hide();
        },
      });
    }
  }, [feedState]);

  const handleLowPower = () => {
    Popup.custom({
      ...commonPopStyle,
      footerType: 'singleCancel',
      cancelText: i18n.getLang('cancel'),
      onCancel: Popup.close,
      onMaskPress: () => Popup.close(),
      title: i18n.getLang('lowPower'),
      content: (
        <View>
          <TYText size={cx(15)} color="#7C7269" style={{ lineHeight: cx(21) }}>
            {i18n.getLang('lowPowerTips')}
          </TYText>
        </View>
      ),
    });
  };

  const handleFeed = () => {
    const dataSource = new Array(15).fill(0).map((item, idx) => ({
      label: `${idx + 1}`,
      value: idx + 1,
    }));

    Popup.picker({
      ...commonPopStyle,
      dataSource,
      title: i18n.getLang('immediate_feed'),
      cancelText: i18n.getLang('cancel'),
      confirmText: i18n.getLang('confirm'),
      value: 2,
      label: i18n.getLang('unit_copies'),
      labelOffset: cx(60),
      pickerFontColor: commonColor.mainText,
      pickerUnitColor: commonColor.mainText,
      theme: { fontSize: cx(18), fontColor: commonColor.mainText },
      onConfirm: (value, idx) => {
        TYSdk.device.putDeviceData({ [manual_feed]: value });
        Popup.close();
      },
      onCancel: Popup.close,
    });
  };

  const handleCenterBtn = () => {
    if (!enterSleep) return handleFeed();
    handleLowPower();
  };

  return (
    <View style={styles.container}>
      <View>
        <Image source={Res.tabBg} style={styles.bgImg} />
        <View style={styles.bgBox} />
      </View>
      <View style={[commonStyles.flexRowCenter, styles.btnBox]}>
        <View style={commonStyles.flexOne}>
          <TouchableOpacity onPress={() => TYSdk.Navigator.push({ id: 'plan' })}>
            <View style={[commonStyles.flexCenter]}>
              <Image source={Res.plan} style={styles.img} />
              <TYText style={styles.text}>{i18n.getLang('feed_plan')}</TYText>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleCenterBtn}
          disabled={feedState === FEED_STATE.feeding || !deviceOnline}
        >
          <ImageBackground
            source={!deviceOnline ? Res.btnBgDis : Res.btnBg}
            style={[commonStyles.flexCenter, styles.btn]}
          >
            {enterSleep ? (
              <View
                style={{
                  transform: [{ rotate: '90deg' }],
                  height: cx(34),
                }}
              >
                <Battery
                  value={batteryPercentage}
                  size={cx(14)}
                  highColor={commonColor.brown}
                  middleColor={commonColor.brown}
                  lowColor={commonColor.red}
                  batteryColor={commonColor.mainText}
                />
              </View>
            ) : (
              <Image source={!deviceOnline ? Res.feedDis : Res.feed} style={styles.img} />
            )}
            <TYText style={styles.text}>
              {i18n.getLang(
                enterSleep
                  ? 'lowPower'
                  : feedState === FEED_STATE.feeding
                    ? 'feed_feeding'
                    : 'immediate_feed'
              )}
            </TYText>
          </ImageBackground>
        </TouchableOpacity>

        <View style={commonStyles.flexOne}>
          <TouchableOpacity onPress={() => TYSdk.Navigator.push({ id: 'record' })}>
            <View style={[commonStyles.flexCenter]}>
              <Image source={Res.record} style={styles.img} />
              <TYText style={styles.text}>{i18n.getLang('feed_record')}</TYText>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ControlBtn;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: cx(125),
    width,
  },
  bgImg: {
    width,
    height: cx(46.5),
  },
  bgBox: {
    width,
    height: cx(78.5),
    backgroundColor: '#fff',
  },
  btnBox: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: cx(14.5),
    paddingHorizontal: cx(15),
  },
  img: {
    width: cx(34),
    height: cx(34),
  },
  text: {
    marginTop: cx(3),
    fontSize: cx(11),
    color: '#7C7269',
    textAlign: 'center',
  },
  btn: {
    marginHorizontal: cx(15),
    width: cx(91),
    height: cx(91),
  },
});
