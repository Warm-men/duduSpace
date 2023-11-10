import { StyleSheet } from 'react-native';
import { Utils } from 'tuya-panel-kit';

const { convert: c, convertX: cx, convertY: cy, isIphoneX } = Utils.RatioUtils;

const styles = StyleSheet.create({
  viewShadow: {
    shadowColor: '#999',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    elevation: 4, // 关键, 设置值跟shadowRadius一致
    shadowRadius: 4,
  },
});

export { c, cx, cy, isIphoneX, styles };
