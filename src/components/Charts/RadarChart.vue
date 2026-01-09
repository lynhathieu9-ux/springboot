<template>
  <div class="radar-chart-container">
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      name: '健康评分',
      values: [80, 75, 85, 70, 90, 85]
    })
  },
  indicators: {
    type: Array,
    default: () => [
      { name: '血压', max: 100 },
      { name: '血糖', max: 100 },
      { name: '血氧', max: 100 },
      { name: '体温', max: 100 },
      { name: '心率', max: 100 },
      { name: '睡眠质量', max: 100 }
    ]
  },
  title: {
    type: String,
    default: '健康综合评估'
  }
});

const chartRef = ref(null);
let chartInstance = null;

const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value);
    updateChart();
  }
};

const updateChart = () => {
  if (!chartInstance) return;

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
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: [props.data.name]
    },
    radar: {
      indicator: props.indicators,
      radius: '65%',
      splitNumber: 5,
      axisName: {
        color: '#333',
        fontSize: 12
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(255, 255, 255, 0.9)', 'rgba(240, 240, 240, 0.9)', 'rgba(220, 220, 220, 0.9)', 'rgba(200, 200, 200, 0.9)', 'rgba(180, 180, 180, 0.9)']
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.2)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.3)'
        }
      }
    },
    series: [
      {
        name: props.title,
        type: 'radar',
        data: [
          {
            value: props.data.values,
            name: props.data.name,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(64, 158, 255, 0.8)'
                },
                {
                  offset: 1,
                  color: 'rgba(64, 158, 255, 0.2)'
                }
              ])
            },
            lineStyle: {
              color: '#409eff',
              width: 2
            },
            itemStyle: {
              color: '#409eff',
              borderColor: '#fff',
              borderWidth: 2
            }
          }
        ]
      }
    ]
  };

  chartInstance.setOption(option, true);
};

const handleResize = () => {
  chartInstance?.resize();
};

watch(() => props.data, () => {
  updateChart();
}, { deep: true });

watch(() => props.indicators, () => {
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
.radar-chart-container {
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
