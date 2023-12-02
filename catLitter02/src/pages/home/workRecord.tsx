import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import moment from 'moment';
import { Utils, TYText } from 'tuya-panel-kit';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Res from '@res';
import String from '@i18n';
import DashedLine from '@components/dashedLine';
import { commonStyles } from '@config';

const { toFixed } = Utils.CoreUtils;
const { convertX: cx } = Utils.RatioUtils;

interface IProps {
  toiletRecordList: any[]; // 厕所记录列表
  workRecordList: any[]; // 工作记录列表
}
const WorkRecord: React.FC = (props: IProps) => {
  const navigation = useNavigation();
  const { toiletRecordList, workRecordList } = props;
  const [allRecordList, setAllRecordList] = useState<any[]>([]);
  const { deviceOnline } = useSelector(({ devInfo }: any) => devInfo);

  useEffect(() => {
    mergeRecordList();
  }, [toiletRecordList.length, workRecordList.length]);

  // 平整列表时间：将toiletRecordList、workRecordList合并成一个数组，按时间排序
  const mergeRecordList = () => {
    const list = [...toiletRecordList];
    // 找出127列表中存在如厕时间的item（匹配106），判断依据是年份数据是否为空，如果为空就不存在106的时间戳
    const workRecordListHasToiletData = workRecordList.filter(item => {
      return +item.value.year !== 0 && +item.value.month !== 0 && +item.value.day !== 0;
    });
    // 找出127列表中不存在如厕时间的item（匹配106），判断依据是年份数据是否为空，如果为空就不存在106的时间戳
    const workRecordListNoToiletData = workRecordList.filter(item => {
      return +item.value.year === 0 && +item.value.month === 0 && +item.value.day === 0;
    });
    // 把workRecordListNoToiletData匹配到list中，根据时间戳匹配
    workRecordListHasToiletData.forEach(item => {
      const timeStr = `20${toFixed(item.value.year, 2)}-${toFixed(item.value.month, 2)}-${toFixed(
        item.value.day,
        2
      )} ${toFixed(item.value.hour, 2)}:${toFixed(item.value.minute, 2)}:${toFixed(
        item.value.second,
        2
      )}`;
      const index = list.findIndex(i => {
        return i.timeStr === timeStr;
      });
      if (index !== -1) {
        // 关联dp127的数据
        const isExist =
          list[index].extraDpValue &&
          list[index].extraDpValue.find(i => {
            return i.timeStr === timeStr;
          });
        if (isExist) return;
        if (list[index].extraDpValue) {
          list[index].extraDpValue.push(item);
        } else {
          list[index].extraDpValue = [item];
        }
        // list[index].extraDpValue = item;
      }
    });

    const newList = [...list, ...workRecordListNoToiletData];
    // 过滤dp127的待机状态数据、106的时间值为空的数据
    const validList = newList.filter(item => {
      if (item.dpId === 127 && item.value.mode === 0) return false;
      if (item.dpId === 106 && !item.value.minute && !item.value.second) return false;
      return true;
    });

    validList.sort((a, b) => {
      return new Date(b.timeStr).getTime() - new Date(a.timeStr).getTime();
    });
    setAllRecordList(validList);
  };
  // 获取时分文本：根据入参time："2023-06-03 16:49:05" 返回"16:49"
  const getTimeText = (time: string) => {
    return moment(time).format('HH:mm');
  };

  // Data[0]:滚简模式 0-待机模式 1-手动清理 2-定时清理 3-自动清理 4-倾倒猫砂 5-平整猫砂 6--手动清理复位 7--定时清理复位 8--自动清理复位 9--倾倒猫砂复位 10-平整猫砂复位 11-其它复位(故障复位) 12-猫如厕模式
  // Data[1]:滚筒状态 0-待机、1-异常暂停、2-人为暂停、3-执行中、4-停止失败、5-操作完成、6-人为强制暂停、7-强制执行、8-强制执行停止失败、9-强制执行操作完成
  // Data[2]: 错误原因 0:正常 1:便仓未到位 2集便仓已满 3上盖异常 4猫进入 5滚筒无法到位 6猫靠近 7：马达堵转 8：计划时间冲突
  // Dat[3]--Dat[8] 是猫如厕的时间，如果是非自动清理模式，则填充0 （以记录型的DP上报）
  // 根据item的dpId返回对应的icon
  const getIcon = (item: any) => {
    const icon = {
      cat: Res.cat_small,
      done: Res.done,
      fail: Res.fail,
    };
    if (item.dpId === 106) return icon.cat;
    if (item.dpId === 127) {
      const isFault4 = Utils.NumberUtils.getBitValue(item.value.error, 4) === 1;
      const isFault6 = Utils.NumberUtils.getBitValue(item.value.error, 6) === 1;
      if ((isFault4 || isFault6) && item.value.mode === 0) return icon.cat; // 000004:猫咪进入 000006: 猫咪靠近
      const doneStatus = [5, 9];
      const resetStatus = [6, 7, 8, 9, 10, 11];
      if (doneStatus.includes(item.value.status) && !resetStatus.includes(item.value.mode))
        return icon.done;
      if (item.value.error !== 0) return icon.fail; // 故障

      const failStatus = [4, 8];
      if (resetStatus.includes(item.value.mode)) return icon.fail; // 复位
      if (failStatus.includes(item.value.status)) return icon.fail; // 失败
      return icon.done; // 正常
    }
    return icon.cat;
  };
  // Data[0]:滚简模式 0-待机模式 1-手动清理 2-定时清理 3-自动清理 4-倾倒猫砂 5-平整猫砂 6--手动清理复位 7--定时清理复位 8--自动清理复位 9--倾倒猫砂复位 10-平整猫砂复位 11-其它复位(故障复位) 12-猫如厕模式
  // Data[1]:滚筒状态 0-待机、1-异常暂停、2-人为暂停、3-执行中、4-停止失败、5-操作完成、6-人为强制暂停、7-强制执行、8-强制执行停止失败、9-强制执行操作完成
  // Data[2]: 错误原因 0:正常 1:便仓未到位 2集便仓已满 3上盖异常 4猫进入 5滚筒无法到位 6猫靠近 7：马达堵转 8：计划时间冲突
  // Dat[3]--Dat[8] 是猫如厕的时间，如果是非自动清理模式，则填充0 （以记录型的DP上报）
  // 返回描述文本：106dp文本格式：猫咪停留 xx 分 xx 秒；127dp文本格式：模式+状态+错误原因（失败情况下才携带失败原因）
  const getLabel = (item: any) => {
    if (item.dpId === 106) {
      const { minute = 0, second = 0 } = item.value;
      if (minute === 0) {
        const label = String.formatValue('toilet_record_in_second', second);
        return { label, errorText: '' };
      }
      const label = String.formatValue('toilet_record_in_day', minute, second);
      return { label, errorText: '' };
    }

    if (item.dpId === 127) {
      const isFault4 = Utils.NumberUtils.getBitValue(item.value.error, 4) === 1;
      const isFault6 = Utils.NumberUtils.getBitValue(item.value.error, 6) === 1;
      if (item.mode === 0 && item.status === 0 && (isFault4 || isFault6)) {
        // 4:猫咪进入 6: 猫咪靠近
        return item.value.error === 4 ? String.getLang('cat_enter') : String.getLang('cat_near');
      }
      const resetStatus = [6, 7, 8, 9, 10, 11];
      const { mode } = item.value;

      if (resetStatus.includes(mode)) {
        return getRestLabel(item);
      }
      return getGeneralLabel(item);
    }
    return '';
  };

  const getGeneralLabel = item => {
    // 模式：1～5
    // 状态：5
    // 等于：xx已完成

    // 模式：1～5
    // 状态：9
    // 故障：xxx
    // 等于：强行xx已完成，xx故障

    // 模式：1～5
    // 状态：4
    // 故障：xxx
    // 等于：模式失败，xxx

    // 模式：1～5
    // 状态：8
    // 故障：xxx
    // 等于：强行XX模式失败，xxx
    const { mode, status, error } = item.value;

    const modeText = String.getLang(`mode_${mode}`);
    let statusText = String.getLang(`status_${status}`);

    const faultList = getErrorBitmap2FaultList(error);
    // const faultIndex = faultList.length > 0 ? faultList[0] : 1;
    // 将faultList的故障连接成字符串
    const errorListText = faultList
      .map(item => {
        return item ? String.getLang(`error_${item}`) : '';
      })
      .filter(item => item)
      .join(', ');
    const errorText = error !== 0 ? errorListText : '';

    if ([5].includes(status)) {
      statusText = String.getLang(`status_5`);
    }
    if ([4].includes(status)) {
      statusText = String.getLang(`status_4`);
    }
    if ([8, 9].includes(status)) {
      let forced = '';

      if (status === 8) {
        const textList = {
          1: String.getLang('forced_fail_1'),
          2: String.getLang('forced_fail_2'),
          3: String.getLang('forced_fail_3'),
          4: String.getLang('forced_fail_4'),
          5: String.getLang('forced_fail_5'),
        };
        forced = textList[mode];
      }

      if (status === 9) {
        const textList = {
          1: String.getLang('forced_done_1'),
          2: String.getLang('forced_done_2'),
          3: String.getLang('forced_done_3'),
          4: String.getLang('forced_done_4'),
          5: String.getLang('forced_done_5'),
        };
        forced = textList[mode];
      }
      return { label: forced, errorText };
    }

    return { label: modeText + statusText, errorText };
  };

  const getRestLabel = item => {
    // 模式：6～11
    // 状态：4、8
    // 故障：xxx
    // 等于：模式失败，xxx

    // 模式：6～11
    // 状态：5、9
    // 故障：xxx
    // 等于：模式已被终止，xxx

    const { mode, status, error } = item.value;
    let modeText = String.getLang(`mode_${mode}`);
    let statusText = String.getLang(`status_${status}`);
    const reset2Mode = {
      6: 1,
      7: 2,
      8: 3,
      9: 4,
      10: 5,
      11: 11,
    };

    modeText = String.getLang(`mode_${reset2Mode[mode]}`);

    if ([4, 8].includes(status)) {
      statusText = String.getLang(`status_4`);
    }

    if ([5, 9].includes(status)) {
      // 模式复位完成、，标记为模式终止
      statusText = String.getLang(`status_6`);
    }
    const faultList = getErrorBitmap2FaultList(error);
    // const faultIndex = faultList.length > 0 ? faultList[0] : 1;
    // 将faultList的故障连接成字符串
    const errorListText = faultList
      .map(item => {
        return item ? String.getLang(`error_${item}`) : '';
      })
      .filter(item => item)
      .join(', ');
    const errorText = error !== 0 ? errorListText : '';

    return { label: modeText + statusText, errorText };
  };

  const getErrorBitmap2FaultList = (errorCode: number) => {
    const errorCodeList = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    // 用errorCodeList遍历errorCode获取对应位置是否有值，有值则返回对应的faultCode
    return errorCodeList
      .map((item: number) => {
        return Utils.NumberUtils.getBitValue(errorCode, item) === 1 ? item : false;
      })
      .filter((item: number) => item);
  };

  const getSubStatus = (item: any) => {
    const statusColor = {
      end: '#FA5F5F',
      fail: '#FA5F5F',
      done: '#44B74A',
    };
    // Data[1]:滚筒状态 0-待机、1-异常暂停、2-人为暂停、3-执行中、4-停止失败、5-操作完成、6-人为强制暂停、7-强制执行、8-强制执行停止失败、9-强制执行操作完成
    if ([4, 8].includes(item.value.status)) return statusColor.fail;
    if ([5, 9].includes(item.value.status)) return statusColor.done;
    // if (item.value.status === 6) return statusColor.end;
    return statusColor.done;
  };

  const renderHorizontalDashView = () => {
    return (
      <DashedLine
        width={cx(19)}
        height={cx(1)}
        isColumn={false}
        color="#DFDED9"
        style={styles.line}
      />
    );
  };

  const renderSubItem = (extraDpList: any) => {
    if (!extraDpList || !extraDpList.length) return null;
    const sunLen = extraDpList.length;
    return (
      <View style={styles.subView}>
        <DashedLine
          width={cx(1)}
          height={cx(48 + sunLen * 26)}
          isColumn={true}
          color="#DFDED9"
          style={styles.columnLine}
        />
        {extraDpList.map((item: any, index: number) => {
          const subItemStatusColor = getSubStatus(item);
          const subTimeText = getTimeText(item.timeStr);
          const subItemLabel = getLabel(item);
          return (
            <View style={styles.label1} key={index}>
              <TYText style={styles.labeText1}>{subTimeText}</TYText>
              <View style={styles.circleView}>
                <View style={[styles.circle, { backgroundColor: subItemStatusColor }]} />
                {renderHorizontalDashView()}
              </View>
              <View>
                <TYText style={[styles.labeText, { color: '#7C7269' }]}>
                  {subItemLabel.label}
                </TYText>
                {subItemLabel.errorText ? (
                  <TYText style={styles.labeText}>{subItemLabel.errorText}</TYText>
                ) : null}
              </View>
            </View>
          );
        })}
        <View style={styles.line1} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[commonStyles.flexRow, commonStyles.flexBetween]}>
        <TYText style={styles.titleText}>{String.getLang('work_record')}</TYText>
        <TouchableOpacity
          hitSlop={{ left: cx(10), right: cx(10), top: cx(10), bottom: cx(10) }}
          onPress={() => {
            navigation.navigate('weekWorkRecord', { allRecordList });
          }}
          disabled={!deviceOnline}
        >
          <Image source={Res.arrow_right} style={styles.moreIcon} resizeMode="stretch" />
        </TouchableOpacity>
      </View>
      <View style={styles.listView}>
        {allRecordList.length === 0 && (
          <View style={commonStyles.flexCenter}>
            <Image source={Res.common_image_timing_none} style={styles.noRecord} />
            <TYText style={styles.noRecordText}>{String.getLang('no_record_today')}</TYText>
          </View>
        )}
        {allRecordList.map((item, index) => {
          const timeText = getTimeText(item.timeStr);
          const icon = getIcon(item);
          const labelData = getLabel(item);
          const isLast = index === allRecordList.length - 1;
          const hasSub = item.extraDpValue;
          const isFail = labelData.errorText;
          const LineH1 = isFail ? cx(60) : cx(46);
          return (
            <View key={`${timeText}${index}`}>
              <View style={styles.listItemTop}>
                <TYText style={styles.itemText}>{timeText}</TYText>
                <Image source={icon} style={styles.icon} resizeMode="stretch" />
                <View>
                  <TYText style={styles.itemText1}>{labelData.label}</TYText>
                  {isFail ? <TYText style={styles.itemText2}>{labelData.errorText}</TYText> : null}
                </View>
              </View>
              {hasSub ? (
                renderSubItem(item.extraDpValue)
              ) : !isLast ? (
                <View style={styles.subView}>
                  <View style={styles.line1} />
                  <DashedLine
                    width={cx(1)}
                    height={LineH1}
                    isColumn={true}
                    color="#DFDED9"
                    style={[styles.columnLine, { top: isFail ? cx(-15) : cx(0) }]}
                  />
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default WorkRecord;

const styles = StyleSheet.create({
  container: {
    marginTop: cx(15),
    width: cx(345),
    marginHorizontal: cx(15),
    borderRadius: cx(10),
    backgroundColor: '#fff',
    shadowColor: '#ddd',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    elevation: 4,
    shadowRadius: 4,
    paddingHorizontal: cx(15),
    paddingVertical: cx(20),
    marginBottom: cx(46),
  },
  titleText: {
    fontSize: cx(13),
    color: '#49362F',
    fontWeight: 'bold',
  },
  listView: {
    marginTop: cx(18),
  },
  listItemTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: cx(2),
  },
  itemText: {
    fontSize: cx(14),
    color: '#7C7269',
    marginRight: cx(10),
    width: cx(40),
  },
  icon: {
    width: cx(16),
    height: cx(16),
  },
  itemText1: {
    fontSize: cx(14),
    color: '#7C7269',
    marginLeft: cx(14.5),
    width: cx(200),
  },
  itemText2: {
    fontSize: cx(12),
    color: '#ADA49B',
    marginLeft: cx(14.5),
    width: cx(200),
    marginTop: cx(8),
  },
  circle: {
    width: cx(5),
    height: cx(5),
    borderRadius: cx(2.5),
    marginRight: cx(2),
    zIndex: 1,
  },
  subView: {
    marginVertical: cx(2),
    marginLeft: cx(0),
  },
  label1: {
    marginTop: cx(14),
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  labeText: {
    fontSize: cx(13),
    color: '#ADA49B',
    width: cx(200),
    lineHeight: cx(18),
  },
  labeText1: {
    fontSize: cx(12),
    color: '#ADA49B',
    width: cx(42),
    lineHeight: cx(18),
    marginRight: cx(6.9),
    marginLeft: cx(6),
    textAlign: 'center',
  },
  circleView: {
    flexDirection: 'row',
    alignItems: 'center',
    height: cx(20),
  },
  line: {
    marginHorizontal: cx(2.5),
  },
  line1: {
    width: cx(232.5),
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E0DF',
    marginLeft: cx(84),
    marginVertical: cx(25),
  },
  columnLine: {
    position: 'absolute',
    top: 0,
    left: cx(57),
  },
  moreIcon: {
    width: cx(20),
    height: cx(20),
  },
  noRecord: {
    width: cx(180),
    height: cx(164),
  },
  noRecordText: {
    fontSize: cx(14),
    color: '#ADA49B',
    marginTop: cx(0),
  },
});
