/* eslint-disable no-shadow */
/* eslint-disable camelcase */
import { getLogByIdAndTime } from '@api';
import { ComRecord, Empty } from '@components';
import { commonColor, commonStyles, cx, dpCodes, width } from '@config';
import i18n from '@i18n';
import { actions, useSelector } from '@models';
import { decodeEatResult, decodeMealPlan, formatEatTime, getFaultStrings } from '@utils';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { TYText } from 'tuya-panel-kit';

const { meal_plan, manual_feed_report, cat_close_time, plan_feed_report, fault } = dpCodes;

const Record: React.FC = () => {
  const dispatch = useDispatch();
  const schema = useSelector(state => state.devInfo.schema);
  const mealPlan = useSelector(state => state.dpState[meal_plan]);
  const recordList = useSelector(state => state.record.recordList);
  const todayNextMeal = useSelector(state => state.record.todayNextMeal);

  useEffect(() => {
    getNextPlan();
    let timer = setInterval(() => {
      getNextPlan();
    }, 1000 * 10);

    return () => {
      clearInterval(timer);
      timer = null;
    };
  }, [mealPlan]);

  useEffect(() => {
    getData();
    let timer = setInterval(() => {
      getData();
    }, 1000 * 10);

    return () => {
      clearInterval(timer);
      timer = null;
    };
  }, []);

  // 获取一次距离当前时间最近的喂食计划
  const getNextPlan = () => {
    const plan = decodeMealPlan(mealPlan);
    let planArr = [];
    if (plan.length > 0) {
      const day = moment().day();
      plan.forEach(item => {
        if (item.repeatStr[day] && item.switchValue) {
          const timeArr = item.timeStr.split(':');
          const timeStamp =
            moment()
              .hours(+timeArr[0])
              .minutes(+timeArr[1])
              .valueOf() - moment().valueOf();
          // 与当前时间相比，时间戳<0，则计划已经失效了，需要+1天计算
          if (timeStamp > 0) {
            // timeStamp =
            //   moment()
            //     .add(1, 'days')
            //     .hours(+timeArr[0])
            //     .minutes(+timeArr[1])
            //     .valueOf() - moment().valueOf();

            planArr.push({
              timeStamp,
              status: 'plan',
              info: {
                time: item.timeStr,
                num: item.parts,
              },
            });
          }
        }
      });

      planArr = planArr.sort((a, b) => a.timeStamp - b.timeStamp);
    }

    dispatch(
      actions.common.updateRecord({ todayNextMeal: planArr.length > 0 ? [planArr[0]] : [] })
    );
  };

  // 获取最近7天数据
  const getNext7Arr = () => {
    const arr = new Array(7).fill(0).map((item, idx) => ({
      date: moment().add(-idx, 'days').format('YYYY-MM-DD'),
      list: [],
    }));

    return arr;
  };

  const getData = async () => {
    const dpIdArr = [manual_feed_report, plan_feed_report].map(item => schema[item].id);
    const data = getNext7Arr();

    const params = {
      dpIds: dpIdArr.join(','),
      startTime: moment().add(-6, 'days').startOf('day').valueOf(),
      endTime: moment().endOf('day').valueOf(),
    };

    getLogByIdAndTime(params).then(res => {
      if (res.dps.length > 0) {
        const logs = res.dps;

        logs.forEach(item => {
          let dataItem = {};
          // 格式化数据
          // if (+item.dpId === +dpIdArr[0]) {
          //   const times = item.value;
          //   const minutes = Math.floor(times / 60);
          //   const seconds = times - minutes * 60;
          //   dataItem = {
          //     time: moment(item.timeStr).format('HH:mm'),
          //     status: 'cat',
          //     info: { minutes, seconds },
          //   };
          // } else {
          const eatInfo = decodeEatResult(item.value);
          dataItem = {
            time: moment(item.timeStr).format('HH:mm'),
            status: eatInfo.parts === eatInfo.planParts ? 'success' : 'fail',
            info: {
              plan: eatInfo.planParts,
              num: eatInfo.parts,
              method: +item.dpId === +dpIdArr[0] ? 'manual' : 'plan',
              fault: getFaultStrings(fault, eatInfo.fault),
            },
          };
          // }

          // 对每天数据进行分组
          const logTime = moment(item.timeStr).format('YYYY-MM-DD');
          const dataArrItem = data.find((item, idx) => item.date === logTime) || {};
          dataArrItem.list && dataArrItem.list.push(dataItem);
        });
      }
      console.log('data=====', data);
      dispatch(actions.common.updateRecord({ recordList: data }));
    });
  };

  // 获取今天的工作记录和待执行计划展示
  const getDataSource = () => {
    if (recordList.length === 0 && todayNextMeal.length === 0) {
      return [];
    }

    const records = recordList[0]?.list || [];
    const list = [...todayNextMeal, ...records];
    return list;
  };
  const dataSource = getDataSource();

  return (
    <View style={[commonStyles.shadow, styles.container]}>
      <TYText size={cx(13)} color={commonColor.mainText} weight={500}>
        {i18n.getLang('work_record')}
      </TYText>
      <View style={[commonStyles.flexCenter, styles.content]}>
        {dataSource.length > 0 ? (
          <ComRecord data={dataSource} />
        ) : (
          <Empty desc={i18n.getLang('today_record_empty')} descStyle={{ marginTop: cx(-20) }} />
        )}
      </View>
    </View>
  );
};

export default Record;

const styles = StyleSheet.create({
  container: {
    marginLeft: cx(12),
    marginRight: cx(17),
    paddingTop: cx(20),
    paddingHorizontal: cx(14),
    paddingBottom: cx(30),
    width: width - cx(29),
    borderRadius: cx(10),
  },
  content: {
    marginTop: cx(20),
  },
});
