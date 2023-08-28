import { StyleSheet } from 'react-native';
import { Utils } from 'tuya-panel-kit';

export const {
  convertX: cx,
  convertY: cy,
  width,
  height,
  isIos,
  isIphoneX,
  topBarHeight,
} = Utils.RatioUtils;

const commonStyles = {
  flexOne: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexRowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flexCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexBetween: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shadow: {
    shadowColor: '#999',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4, // 关键, 设置值跟shadowRadius一致
    backgroundColor: '#fff',
  },
};

const commonColor = {
  mainText: '#49362F',
  subText: '#968E87',
  green: '#44B74A',
  red: '#FA5F5F',
  brown: '#DFA663',
  white: '#fff',
};

const commonPopStyle = {
  maskStyle: { backgroundColor: 'rgba(0, 0, 0, .1)' },
  wrapperStyle: {
    marginHorizontal: cx(15),
    width: width - cx(30),
    marginBottom: cx(15),
    borderTopLeftRadius: cx(24),
    borderTopRightRadius: cx(24),
    borderBottomLeftRadius: cx(24),
    borderBottomRightRadius: cx(24),
    paddingHorizontal: cx(30),
    backgroundColor: '#fff',
  },
  titleTextStyle: { color: '#000', fontSize: cx(18) },
  titleWrapperStyle: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    height: cx(66),
    paddingTop: cx(30),
    paddingLeft: 0,
    paddingRight: 0,
  },
  showTitleDivider: false,
  footerWrapperStyle: {
    marginTop: cx(19),
    paddingBottom: cx(0),
    height: cx(61),
    borderTopWidth: cx(0.5),
    borderTopColor: '#E5E0DF',
    borderBottomLeftRadius: cx(24),
    borderBottomRightRadius: cx(24),
  },
  cancelTextStyle: { color: '#ADA49B', fontSize: cx(16) },
  confirmTextStyle: { color: commonColor.brown, fontSize: cx(16) },
};

const commonPopStyleTimePiker = {
  maskStyle: { backgroundColor: 'rgba(0, 0, 0, .1)' },
  wrapperStyle: {
    marginHorizontal: cx(15),
    width: width - cx(30),
    marginBottom: cx(15),
    paddingHorizontal: cx(10),
    borderTopLeftRadius: cx(24),
    borderTopRightRadius: cx(24),
    borderBottomLeftRadius: cx(24),
    borderBottomRightRadius: cx(24),
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  titleTextStyle: { color: '#000', fontSize: cx(18), marginLeft: cx(15) },
  titleWrapperStyle: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: cx(30),
  },
  showTitleDivider: false,
  footerWrapperStyle: {
    marginTop: cx(19),
    paddingBottom: cx(0),
    height: cx(60),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E0DF',
    borderBottomLeftRadius: cx(24),
    borderBottomRightRadius: cx(24),
    marginHorizontal: cx(20),
  },
  cancelTextStyle: { color: '#ADA49B', fontSize: cx(16) },
  confirmTextStyle: { color: commonColor.brown, fontSize: cx(16) },
};

export { commonStyles, commonColor, commonPopStyle, commonPopStyleTimePiker };
