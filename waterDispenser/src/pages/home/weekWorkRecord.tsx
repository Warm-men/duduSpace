import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import moment from 'moment';
import { Utils, TYText } from 'tuya-panel-kit';
import Res from '@res';
import String from '@i18n';
import { base64ListToUIList } from '@utils';
import DashedLine from '@components/dashedLine';
import { getLogInSpecifiedTime } from '../../api';

const { toFixed } = Utils.CoreUtils;
const { convertX: cx } = Utils.RatioUtils;

interface IProps {
  // toiletRecordList: any[]; // 厕所记录列表
  // workRecordList: any[]; // 工作记录列表
  // route: any;
}
const WeekWorkRecord: React.FC = (props: IProps) => {
  const [allRecordList, setAllRecordList] = useState<any[]>([]);
  const timer = useRef<any>(null);

  useEffect(() => {
    getWeekRecordList();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      timer.current = setInterval(() => {
        getWeekRecordList();
      }, 12000);
    }, 1000);
    return () => {
      clearInterval(timer.current);
    };
  }, []);

  // 获取一周的记录列表
  const getWeekRecordList = async () => {
    const { startTime, endTime } = getWeekTime();
    const res = await getLogInSpecifiedTime({ dpIds: '102,106', startTime, endTime });
    if (!res || !res?.dps.length) return;
    const dpsData = res.dps;
    // 根据dp点选出对应列表数据
    const list102 = dpsData.filter((item: any) => item.dpId === 102);
    const list106 = dpsData.filter((item: any) => item.dpId === 106);
    // 将base64转换为16进制
    try {
      const list102Hex = base64ListToUIList(list102, 102);
      const list106Hex = base64ListToUIList(list106, 106);
      mergeRecordList(list102Hex, list106Hex);
    } catch (error) {
      console.log('🚀 ~ file: index.tsx:102 ~ getDpLog ~ error:', error);
    }
  };

  const getWeekTime = () => {
    // 通过moment获取近7天的开始时间 startTimer 和结束时间 endTimer
    const now = moment();
    const startTime = now.clone().subtract(6, 'days').valueOf();
    const endTime = now.valueOf();
    return {
      startTime,
      endTime,
    };
  };

  // 平整列表时间：将toiletRecordList、workRecordList合并成一个数组，按时间排序
  const mergeRecordList = (workRecordList: any[], toiletRecordList: any[]) => {
    try {
      const list = [...toiletRecordList];
      // 找出102列表中存在如厕时间的item（匹配106），判断依据是年份数据是否为空，如果为空就不存在106的时间戳
      const workRecordListHasToiletData = workRecordList.filter(item => {
        return +item.value.year !== 0 && +item.value.month !== 0 && +item.value.day !== 0;
      });
      // 找出102列表中不存在如厕时间的item（匹配106），判断依据是年份数据是否为空，如果为空就不存在106的时间戳
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
          // 关联dp102的数据
          list[index].extraDpValue = item;
        }
      });

      const newList = [...list, ...workRecordListNoToiletData];

      newList.sort((a, b) => {
        return new Date(b.timeStr).getTime() - new Date(a.timeStr).getTime();
      });
      // 将newList按timeStr分组，每一天组成一个数据
      const groupList = groupByTimeStr(newList);
      console.log('🚀 ~ file: weekWorkRecord.tsx:105 ~ mergeRecordList ~ groupList:', groupList);
      setAllRecordList(groupList);
    } catch (error) {
      setAllRecordList([]);
    }
  };

  // 根据timeStr分组
  const groupByTimeStr = (list: any[]) => {
    const groupList: any[] = [];
    list.forEach(item => {
      // 在item的timeStr取到月日， timeStr: "2023-06-03 22:51:14" => "06-03"
      const _timeStr = moment(item.timeStr).format('YYYY-MM-DD');
      const index = groupList.findIndex(i => i.timeStr === _timeStr);
      if (index === -1) {
        groupList.push({
          timeStr: _timeStr,
          list: [item],
        });
      } else {
        groupList[index].list.push(item);
      }
    });
    return groupList;
  };

  // 获取时分文本：根据入参time："2023-06-03 16:49:05" 返回"16:49"
  const getTimeText = (time: string) => {
    return moment(time).format('HH:mm');
  };

  // Data[0]:滚简模式 0-待机模式 1-手动清理 2-定时清理 3-自动清理 4-倾倒猫砂 5-平整猫砂 6--手动清理复位 7--定时清理复位 8--自动清理复位 9--倾倒猫砂复位 10-平整猫砂复位 11-其它复位(故障复位)
  // Data[1]: 0-待机 1-异常暂停 2-人为暂停 3-执行中 4-停止失败 5-操作完成 (遇到故障暂停) (APP操作暂停) 恢复执行) (超10分钟操作停止)(10分钟内继续执行)
  // Data[2]: 错误原因 0:正常 1:便仓未到位 2便仓已满 3上盖异常 4猫进入 5滚筒无法到位 6猫靠近 7:计划时间冲突
  // Dat[3]--Dat[8] 是猫如厕的时间，如果是非自动清理模式，则填充0 （以记录型的DP上报）
  // 根据item的dpId返回对应的icon
  const getIcon = (item: any) => {
    const icon = {
      cat: Res.cat_small,
      done: Res.done,
      fail: Res.fail,
    };
    if (item.dpId === 106) return icon.cat;
    if (item.dpId === 102) {
      if ([4, 6].includes(item.value.error)) return icon.cat; // 000004:猫咪进入 000006: 猫咪靠近
      if (item.value.error !== 0) return icon.fail; // 故障
      return icon.done; // 正常
    }
    return icon.cat;
  };
  // Data[0]:滚简模式 0-待机模式 1-手动清理 2-定时清理 3-自动清理 4-倾倒猫砂 5-平整猫砂 6--手动清理复位 7--定时清理复位 8--自动清理复位 9--倾倒猫砂复位 10-平整猫砂复位 11-其它复位(故障复位)
  // Data[1]: 0-待机 1-异常暂停 2-人为暂停 3-执行中 4-失败 5-完成 (遇到故障暂停) (APP操作暂停) 恢复执行) (超10分钟操作停止)(10分钟内继续执行) 6-终止
  // Data[2]: 错误原因 0:正常 1:便仓未到位 2便仓已满 3上盖异常 4猫进入 5滚筒无法到位 6猫靠近 7:计划时间冲突
  // Dat[3]--Dat[8] 是猫如厕的时间，如果是非自动清理模式，则填充0 （以记录型的DP上报）
  // 返回描述文本：106dp文本格式：猫咪停留 xx 分 xx 秒；102dp文本格式：模式+状态+错误原因（失败情况下才携带失败原因）
  const getLabel = (item: any) => {
    if (item.dpId === 106)
      return String.formatValue('toilet_record_in_day', item.value.minute, item.value.second);
    if (item.dpId === 102) {
      if (item.mode === 0 && item.status === 0 && [4, 6].includes(item.value.error)) {
        // 4:猫咪进入 6: 猫咪靠近
        return item.value.error === 4 ? String.getLang('cat_enter') : String.getLang('cat_near');
      }
      const modeText = String.getLang(`mode_${item.value.mode}`);
      const statusText = String.getLang(`status_${item.value.status}`);
      const errorText = item.value.error !== 0 ? String.getLang(`error_${item.value.error}`) : '';
      return modeText + statusText + errorText;
    }
    return '';
  };

  const getSubStatus = (item: any) => {
    const statusColor = {
      end: '#FA5F5F',
      fail: '#FA5F5F',
      done: '#44B74A',
    };
    if (item.value.status === 4) return statusColor.fail;
    if (item.value.status === 5) return statusColor.done;
    if (item.value.status === 6) return statusColor.end;
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

  const renderDayRecord = (item: any, index: number) => {
    return (
      <View style={styles.container} key={`${item.timeStr}${index}`}>
        <TYText style={styles.titleText}>{item.timeStr}</TYText>
        <View style={styles.listView}>
          {item.list.map((record, recordIndex) => {
            const timeText = getTimeText(record.timeStr);
            const icon = getIcon(record);
            const label = getLabel(record);
            const subItemStatusColor = record.extraDpValue
              ? getSubStatus(record.extraDpValue)
              : '#fff';
            const subTimeText = record.extraDpValue ? getTimeText(record.extraDpValue.timeStr) : '';
            const subItemLabel = record.extraDpValue ? getLabel(record.extraDpValue) : '';
            const isLast = recordIndex === item.list.length - 1;
            const hasSub = record.extraDpValue;
            return (
              <View key={timeText}>
                <View style={styles.listItemTop}>
                  <TYText style={styles.itemText}>{timeText}</TYText>
                  <Image source={icon} style={styles.icon} resizeMode="stretch" />
                  <TYText style={styles.itemText1}>{label}</TYText>
                </View>
                {hasSub ? (
                  <View style={styles.subView}>
                    <View style={styles.label1}>
                      {renderHorizontalDashView()}
                      <View style={[styles.circle, { backgroundColor: subItemStatusColor }]} />
                      <TYText style={styles.labeText}>{`${subTimeText}  ${subItemLabel}`}</TYText>
                    </View>
                    <View style={styles.line1} />
                    <DashedLine
                      width={cx(1)}
                      height={hasSub ? cx(79) : cx(46)}
                      isColumn={true}
                      color="#DFDED9"
                      style={styles.columnLine}
                    />
                  </View>
                ) : !isLast ? (
                  <View style={styles.subView}>
                    <View style={styles.line1} />
                    <DashedLine
                      width={cx(1)}
                      height={hasSub ? cx(79) : cx(46)}
                      isColumn={true}
                      color="#DFDED9"
                      style={styles.columnLine}
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

  return allRecordList.length === 0 ? (
    <TYText style={styles.titleText}>{String.getLang('no_record')}</TYText>
  ) : (
    <ScrollView
      contentContainerStyle={{ paddingBottom: cx(20), paddingTop: cx(16) }}
      showsVerticalScrollIndicator={false}
    >
      {allRecordList.map((item, index) => {
        return renderDayRecord(item, index);
      })}
    </ScrollView>
  );
};

export default WeekWorkRecord;

const styles = StyleSheet.create({
  container: {
    marginTop: cx(16),
    width: cx(345),
    marginHorizontal: cx(15),
    borderRadius: cx(10),
    backgroundColor: '#fff',
    shadowColor: '#ddd',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    paddingHorizontal: cx(15),
    paddingVertical: cx(20),
    marginBottom: cx(16),
  },
  titleText: {
    fontSize: cx(13),
    color: '#49362F',
  },
  listView: {
    marginTop: cx(18),
  },
  listItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  circle: {
    width: cx(5),
    height: cx(5),
    borderRadius: cx(2.5),
    marginRight: cx(5),
  },
  subView: {
    marginVertical: cx(2),
    marginLeft: cx(58),
  },
  label1: {
    marginTop: cx(14),
    flexDirection: 'row',
    alignItems: 'center',
  },
  labeText: {
    fontSize: cx(14),
    color: '#ADA49B',
  },
  line: {
    marginHorizontal: cx(2.5),
  },
  line1: {
    width: cx(232.5),
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E0DF',
    marginLeft: cx(26),
    marginVertical: cx(25),
  },
  columnLine: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
