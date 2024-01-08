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
    shadowColor: '#888',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: .1,
    shadowRadius: 10,
    elevation: 1, // 关键, 设置值跟shadowRadius一致
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
  titleTextStyle: { color: '#49362', fontSize: cx(18), fontWeight: 'bold' },
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

const commonDialogStyle = {
  commonStyle: {
    style: {
      borderRadius: cx(20),
      padding: cx(20),
      width: cx(300),
    },
    headerStyle: {
      height: 0,
      borderBottomWidth: 0,
    },
    footerWrapperStyle: { height: 0, borderTopWidth: 0 },
  },
  contentStyle: {
    contentBox: {
      marginBottom: cx(35),
      paddingTop: cx(15),
      paddingHorizontal: cx(18),
    },
    contentImg: {
      marginBottom: cx(19),
      width: cx(50),
      height: cx(50),
    },
    contentText: {
      color: commonColor.mainText,
      fontSize: cx(17),
      lineHeight: cx(25),
      textAlign: 'center',
    },
    contentBtn: {
      width: cx(110),
      height: cx(40),
      borderRadius: cx(20),
    },
    contentBtnText: {
      fontSize: cx(14),
      color: '#ADA49B',
    },
  },
};

const btnBackground = {
  x1: '0%',
  y1: '0%',
  x2: '100%',
  y2: '0%',
  stops: {
    '0%': '#E6B26A',
    '100%': '#D49157',
  },
};

export { commonStyles, commonColor, commonPopStyle, commonDialogStyle, btnBackground };
