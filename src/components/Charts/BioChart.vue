<template>
  <div class="bio-chart-container">
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  metrics: {
    type: Array,
    default: () => ['bp.systolic', 'bp.diastolic', 'hr', 'sugar', 'oxygen', 'temp']
  },
  title: {
    type: String,
    default: '体征趋势图'
  }
});

const chartRef = ref(null);
let chartInstance = null;

const metricConfig = {
  'bp.systolic': { name: '收缩压', unit: 'mmHg', color: '#5470c6', yAxisIndex: 0 },
  'bp.diastolic': { name: '舒张压', unit: 'mmHg', color: '#91cc75', yAxisIndex: 0 },
  'hr': { name: '心率', unit: '次/分', color: '#fac858', yAxisIndex: 0 },
  'sugar': { name: '血糖', unit: 'mmol/L', color: '#ee6666', yAxisIndex: 1 },
  'oxygen': { name: '血氧', unit: '%', color: '#73c0de', yAxisIndex: 1 },
  'temp': { name: '体温', unit: '°C', color: '#3ba272', yAxisIndex: 1 }
};

const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value);
    updateChart();
  }
};

const updateChart = () => {
  if (!chartInstance || !props.data.length) return;

  const dates = props.data.map(item => item.date);
  const series = [];
  const yAxis = [
    {
      type: 'value',
      name: '血压/心率',
      axisLabel: {
        formatter: '{value}'
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    {
      type: 'value',
      name: '血糖/血氧/体温',
      axisLabel: {
        formatter: '{value}'
      },
      splitLine: {
        show: false
      }
    }
  ];

  // 生成系列数据
  props.metrics.forEach(metric => {
    const config = metricConfig[metric];
    if (!config) return;

    const data = props.data.map(item => {
      const value = metric.split('.').reduce((obj, key) => obj[key], item);
      return typeof value === 'number' ? value : 0;
    });

    series.push({
      name: config.name,
      type: 'line',
      yAxisIndex: config.yAxisIndex,
      data: data,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        width: 3,
        color: config.color
      },
      itemStyle: {
        color: config.color
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: config.color + '80'
          },
          {
            offset: 1,
            color: config.color + '10'
          }
        ])
      },
      emphasis: {
        focus: 'series'
      }
    });
  });

  const option = {
    title: {
      text: props.title,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        let result = params[0].name + '<br/>';
        params.forEach(param => {
          const config = Object.values(metricConfig).find(c => c.name === param.seriesName);
          result += `${param.marker}${param.seriesName}: ${param.value}${config?.unit || ''}<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: series.map(s => s.name),
      bottom: 10,
      type: 'scroll',
      textStyle: {
        fontSize: 12
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: {
        rotate: 30,
        fontSize: 10
      }
    },
    yAxis: yAxis,
    series: series
  };

  chartInstance.setOption(option, true);
};

const handleResize = () => {
  chartInstance?.resize();
};

watch(() => props.data, () => {
  updateChart();
}, { deep: true });

watch(() => props.metrics, () => {
  updateChart();
}, { deep: true });

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  chartInstance?.dispose();
});
</script>

<style scoped>
.bio-chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.chart {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>
