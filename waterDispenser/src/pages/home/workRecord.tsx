import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import String from '@i18n';
import F2Chart from '@components/f2-chart-1';
import { getFeedLogMaxValue } from '@utils';

const { convertX: cx } = Utils.RatioUtils;

interface MainProps {
  data: any;
}
const WorkRecord: React.FC = (props: MainProps) => {
  const { data } = props;

  const renderChart = (data: []) => {
    console.log('传进来的data', data);
    return `
    chart.source(${JSON.stringify(data)}, ${JSON.stringify(getDefs(data))});
    chart.axis('time',  {
      labelOffset: 10,
      position:'bottom',
      tickLine:{
        length:1,
      },
      label: (text, index, total) => {
        const cfg = {
          textAlign: 'center'
        };
      
        return cfg;
      },
      line: {
        lineWidth: 2,
        stroke: '#DFDED9'
      },
    })
    chart.axis('value', {
      labelOffset: 15,
      position:'left',
      tickLine:{
        length:1,
      },
    });
    chart.tooltip(false);
    ${renderGuide(data)}
    chart.area().position('time*value').color('l(90) 0:#FCF6EF 1:#ffffff').style({fillOpacity:1});
    chart.line().position('time*value').color('#DFA663');
    chart.interaction('pan');
    chart.interaction('swipe', {
      speed: 15
    });
    chart.point()
      .position('time*value')
      .color('#DFA663')
      .size(3);
    chart.render();
    `;
  };

  const renderGuide = data => {
    let guideStr = '';
    data.forEach((item, index) => {
      if (item.tem) {
        guideStr += `chart.guide().html({
          position: [${index}, ${item.value}],
          html: '<span style="font-size:12px;color:#DFA663">${item.value}</span>',
          offsetY: 0,
          alignX: 'center',
        });`;
      }
    });
    return guideStr;
  };

  const getDefs = data => {
    console.log('传进来的data', data);

    const value = {
      range: [0, 1],
      min: 0,
    };

    const maxValue = getFeedLogMaxValue(data);
    console.log('最大值', maxValue);
    // maxValue < 5 && Object.assign(value, { tickInterval: 1 }); // 最大值小于5会出现小数
    return {
      time: {
        range: [0, 1],
        tickCount: 7,
      },
      value,
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleView}>
        <TYText style={styles.titleText}>{String.getLang('work_record_title_1')}</TYText>
      </View>
      <View style={styles.listView}>
        <F2Chart width={cx(335)} height={cx(263)} data={data} renderer={renderChart} />
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
    shadowRadius: 4,
    elevation: 4,
    paddingVertical: cx(20),
  },
  titleView: {
    alignItems: 'flex-start',
    paddingHorizontal: cx(15),
  },
  titleText: {
    fontSize: cx(14),
    color: '#49362F',
    fontWeight: 'bold',
  },
  listView: {
    marginTop: cx(18),
    paddingLeft: cx(6),
  },
});
