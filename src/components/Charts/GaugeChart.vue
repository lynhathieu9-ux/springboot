<template>
  <div class="gauge-chart-container">
    <div ref="chartRef" class="chart"></div>
    <div class="chart-info" v-if="showInfo">
      <div class="info-value">{{ formatValue(value) }}</div>
      <div class="info-label">{{ label }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  value: {
    type: Number,
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  unit: {
    type: String,
    default: ''
  },
  color: {
    type: Array,
    default: () => ['#52c41a', '#faad14', '#f5222d']
  },
  showInfo: {
    type: Boolean,
    default: true
  }
});

const chartRef = ref(null);
let chartInstance = null;

const formatValue = (val) => {
  if (typeof val === 'number') {
    return val.toFixed(1);
  }
  return val;
};

const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value);
    updateChart();
  }
};

const updateChart = () => {
  if (!chartInstance) return;

  const option = {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        radius: '100%',
        min: props.min,
        max: props.max,
        splitNumber: 8,
        axisLine: {
          lineStyle: {
            width: 20,
            color: [
              [0.3, props.color[0]],
              [0.7, props.color[1]],
              [1, props.color[2]]
            ]
          }
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '80%',
          width: 15,
          offsetCenter: [0, '-20%'],
          itemStyle: {
            color: '#fff'
          }
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: 'auto',
            width: 2
          }
        },
        splitLine: {
          length: 20,
          lineStyle: {
            color: 'auto',
            width: 5
          }
        },
        axisLabel: {
          color: '#666',
          fontSize: 14,
          distance: -60,
          formatter: function (value) {
            if (value === props.min || value === props.max) {
              return '';
            }
            return value;
          }
        },
        detail: {
          valueAnimation: true,
          formatter: function(params) {
            return params.value.toFixed(1) + props.unit;
          },
          fontSize: 30,
          offsetCenter: [0, '0%'],
          color: '#333'
        },
        data: [
          {
            value: props.value,
            name: props.label
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

watch(() => props.value, () => {
  updateChart();
});

watch(() => [props.min, props.max, props.color, props.label, props.unit], () => {
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
.gauge-chart-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.chart {
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.chart-info {
  position: absolute;
  bottom: 20px;
  text-align: center;
  pointer-events: none;
}

.info-value {
  font-size: 32px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.info-label {
  font-size: 14px;
  color: #666;
}
</style>
