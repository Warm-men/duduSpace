interface IChartDataItem {
  time: string;
  temp: number;
}

export const renderLine = (dataSource: IChartDataItem[]) => {
  return `
    const data = ${JSON.stringify(dataSource)};

    chart.source(data, {
      time: {
        range: [0.05, 0.95]
      },
      tem: {
        tickCount: 4,
        min: 0,
      }
    });

    chart.axis('time', {
      label: function label(text, index, total) {
        var textCfg = {};
        if (index === 0) {
          textCfg.textAlign = 'left';
        } else if (index === total - 1) {
          textCfg.textAlign = 'right';
        }
        textCfg.color = 'rgba(0, 0, 0, 0.3)';
        return textCfg;
      },
      line: null,
    });
    chart.axis('tem', {
      label: null,
      grid: {
        lineDash: [3, 3],
        stroke: 'rgba(0, 0, 0, 0.05)',
      }
    })
    chart.tooltip(false);

    chart.line().position('time*tem').shape('smooth').color('#0D99FF');
    chart.area().position('time*tem').shape('smooth').color('l(90) 0:#0D99FF 1:#fff');
    chart.point().position('time*tem').shape('smooth').color('#0D99FF');

    data.forEach(obj => {
      chart.guide().text({
        position: [obj.time, obj.tem],
        content: obj.tem,
        style: {
          fill: 'rgba(0, 0, 0, 0.5)',
          textAlign: 'center'
        },
        offsetY: -10
      });
    })

    chart.render();
  `;
};

export const renderBasicLine = (dataSource: IChartDataItem[]) => {
  return `
    const data = ${JSON.stringify(dataSource)};
    chart.source(data, {
      time: {
        range: [0, 1]
      },
      tem: {
        tickCount: 4,
        min: 0,
      }
    });

    chart.axis('time', {
      label: function label(text, index, total) {
        var textCfg = {};
        if (index === 0) {
          textCfg.textAlign = 'left';
        } else if (index === total - 1) {
          textCfg.textAlign = 'right';
        }
        textCfg.color = 'rgba(0, 0, 0, 0.3)';
        return textCfg;
      },
      line: null,
      grid: {
        lineDash: [3, 3],
        stroke: 'rgba(0, 0, 0, 0.05)',
      }
    });
    chart.axis('tem', {
      label: function label(text, index, total) {
        var textCfg = {};
        textCfg.color = 'rgba(0, 0, 0, 0.3)';
        textCfg.text = text + '℃';
        return textCfg;
      },
      grid: {
        lineDash: [3, 3],
        stroke: 'rgba(0, 0, 0, 0.05)',
      }
    });

    chart.tooltip({
      custom: true,
      showCrosshairs: true,
      crosshairsStyle: {
        stroke: '#0D99FF',
        lineDash: [3, 3],
      },
      onChange: (ev) => {
        var currentData = ev.items;
        window.postMessage(JSON.stringify(currentData));
      },
      onHide: (ev) => {
        var currentData = ev.items;
        window.postMessage(false);
      },
    });

    chart.line().position('time*tem').shape('smooth').color('#0D99FF');
    chart.point().position('time*tem').shape('smooth').color('#0D99FF');

    chart.render();
  `;
};
