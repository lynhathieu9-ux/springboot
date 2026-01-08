<template>
  <div class="monitor-dashboard">
    <header class="dashboard-header">
      <div class="header-left">
        <div class="logo-mark">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="header-title">
          <h1>智慧健康监测中心</h1>
          <span class="subtitle">Intelligent Health Monitoring Platform</span>
        </div>
      </div>
      <div class="header-right">
        <div class="status-indicator">
          <span class="dot pulse"></span> 系统运行正常
        </div>
        <div class="time-display">{{ currentTime }}</div>
      </div>
    </header>

    <div class="dashboard-grid">
      
      <aside class="grid-column left-column">
        <div class="glass-card control-card">
          <div class="card-header">
            <span class="icon">⚡</span> 监控对象选择
          </div>
          <div class="control-body">
            <div class="control-row">
              <label class="input-label">选择居民</label>
              <select v-model="currentResidentId" @change="handleResidentChange" class="modern-select">
                <option v-for="r in residents" :key="r.id" :value="r.id">
                  {{ r.name }} ({{ r.room_number }}-{{ r.bed_number }})
                </option>
              </select>
            </div>
            
            <div class="control-row">
              <label class="input-label">图表视图</label>
              <select v-model="dataType" @change="updateTrendChart" class="modern-select">
                <option value="bp">血压趋势 (72h)</option>
                <option value="temp">体温监测 (24h)</option>
              </select>
            </div>

            <button class="refresh-btn" @click="loadResidentData" :disabled="loading">
              <span v-if="!loading">↻ 刷新实时数据</span>
              <span v-else>加载中...</span>
            </button>
          </div>
        </div>

        <div class="glass-card profile-card" v-if="currentResident">
          <div class="card-header">
            <span class="icon">👤</span> 档案信息
          </div>
          <div class="profile-body">
            <div class="avatar-section">
              <div class="avatar-circle">{{ currentResident.name ? currentResident.name.substring(0,1) : '无' }}</div>
              <div class="risk-tag low">在住</div>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <label>姓名</label>
                <span>{{ currentResident.name }}</span>
              </div>
              <div class="info-item">
                <label>年龄/性别</label>
                <span>{{ currentResident.age }}岁 / {{ currentResident.gender }}</span>
              </div>
              <div class="info-item">
                <label>房间号</label>
                <span class="highlight-cyan">{{ currentResident.room_number }}房</span>
              </div>
              <div class="info-item">
                <label>床位号</label>
                <span>{{ currentResident.bed_number }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="glass-card sleep-card">
          <div class="card-header">
            <span class="icon">🌙</span> 昨夜睡眠 ({{ sleepData.sleepQuality || '--' }})
          </div>
          <div class="sleep-body" v-if="sleepData.sleepDuration">
            <div class="sleep-score">
              <span class="score-val">{{ sleepData.sleepDuration }}<small>h</small></span>
              <span class="score-label">总睡眠时长</span>
            </div>
            <div class="sleep-bars">
              <div class="bar-group">
                <div class="bar-info">
                  <span>深睡 ({{ calcPercent(sleepData.deepSleepDuration, sleepData.sleepDuration) }}%)</span>
                  <span>{{ sleepData.deepSleepDuration }}h</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill deep" :style="{ width: calcPercent(sleepData.deepSleepDuration, sleepData.sleepDuration) + '%' }"></div>
                </div>
              </div>
              <div class="bar-group">
                <div class="bar-info">
                  <span>浅睡 ({{ calcPercent(sleepData.lightSleepDuration, sleepData.sleepDuration) }}%)</span>
                  <span>{{ sleepData.lightSleepDuration }}h</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill light" :style="{ width: calcPercent(sleepData.lightSleepDuration, sleepData.sleepDuration) + '%' }"></div>
                </div>
              </div>
            </div>
            <div class="sleep-meta">
              入睡: {{ formatTimeOnly(sleepData.fallAsleepTime) }} | 醒来: {{ formatTimeOnly(sleepData.wakeUpTime) }}
            </div>
          </div>
          <div class="no-data" v-else>暂无睡眠记录</div>
        </div>
      </aside>

      <main class="grid-column center-column">
        <div class="glass-card map-card">
          <div class="card-absolute-header">
            <h3>📍 实时位置监控 (LBS)</h3>
            <div class="live-tag">LIVE</div>
          </div>
          <div ref="mapChart" class="echarts-container map-chart"></div>
          <div class="grid-overlay"></div>
        </div>

        <div class="glass-card trend-card">
          <div class="card-header transparent">
            <h3>📈 {{ dataType === 'bp' ? '72小时 血压趋势' : '24小时 体温监测' }}</h3>
          </div>
          <div ref="trendChart" class="echarts-container trend-chart"></div>
        </div>
      </main>

      <aside class="grid-column right-column">
        <div class="glass-card gauge-card">
          <div class="card-header">
            <span class="icon">💓</span> 实时体征快照
          </div>
          <div class="gauge-wrapper">
            <div class="gauge-single">
              <div ref="hrGauge" class="echarts-gauge"></div>
              <div class="gauge-meta">心率 (BPM)</div>
            </div>
            <div class="gauge-single">
              <div ref="spo2Gauge" class="echarts-gauge"></div>
              <div class="gauge-meta">血氧 (%)</div>
            </div>
          </div>
        </div>

        <div class="glass-card advice-card">
          <div class="card-header">
            <span class="icon">🤖</span> AI 护理建议
          </div>
          <div class="advice-content">
            <div class="ai-avatar">AI</div>
            <div class="ai-bubble">
              <p v-if="vitals.heartRate > 100">检测到心率偏快，建议护工巡查并安抚老人情绪。</p>
              <p v-else-if="vitals.bloodOxygen > 0 && vitals.bloodOxygen < 95">血氧饱和度略低，建议开窗通风或进行吸氧护理。</p>
              <p v-else>当前体征数据平稳，请继续保持日常护理标准。</p>
            </div>
          </div>
        </div>

        <div class="glass-card log-card">
          <div class="card-header">
            <span class="icon">🔔</span> 实时预警日志
          </div>
          <ul class="log-stream" v-if="alerts.length > 0">
            <li v-for="(log, i) in alerts" :key="i" class="stream-item" :class="log.type">
              <div class="stream-time">{{ formatTime(log.time) }}</div>
              <div class="stream-line">
                <div class="dot"></div>
                <div class="line"></div>
              </div>
              <div class="stream-content">
                <div class="log-title">{{ log.title }}</div>
                <div class="log-desc">{{ log.description }}</div>
              </div>
            </li>
          </ul>
          <div class="no-data" v-else>暂无异常预警</div>
        </div>
      </aside>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import * as echarts from 'echarts';
import request from '@/utils/request'; // 引入请求工具
import { ElMessage } from 'element-plus';

// --- 响应式数据 ---
const currentTime = ref(new Date().toLocaleString());
const loading = ref(false);
const residents = ref([]); // 居民列表
const currentResidentId = ref(null); // 当前选中的居民ID
const dataType = ref('bp'); // 图表类型：bp (血压) 或 temp (体温)

// 监测数据
const vitals = ref({ heartRate: 0, bloodOxygen: 0, bodyTemperature: 0 });
const sleepData = ref({});
const trendData = ref([]);
const alerts = ref([]);

// 选中的居民对象
const currentResident = computed(() => {
  return residents.value.find(r => r.id === currentResidentId.value) || {};
});

// DOM Refs
const mapChart = ref(null);
const trendChart = ref(null);
const hrGauge = ref(null);
const spo2Gauge = ref(null);

let charts = [];
let timer = null;
let chartInstanceTrend = null;
let chartInstanceHr = null;
let chartInstanceSpo2 = null;

// --- API交互逻辑 ---

// 1. 获取居民列表
const fetchResidents = async () => {
  try {
    const res = await request.get('/health-monitoring/residents');
    if (res.data && res.data.success && res.data.data) {
      residents.value = res.data.data;
      // 默认选中第一个
      if (residents.value.length > 0) {
        currentResidentId.value = residents.value[0].id;
        loadResidentData();
      }
    }
  } catch (error) {
    console.error('获取居民列表失败', error);
  }
};

// 2. 加载选中居民的所有数据
const loadResidentData = async () => {
  if (!currentResidentId.value) return;
  loading.value = true;
  
  try {
    const id = currentResidentId.value;
    
    // 并行请求所有数据接口
    await Promise.all([
      fetchVitals(id),
      fetchSleep(id),
      fetchTrendData(id),
      fetchAlerts()
    ]);
    
    // 更新图表
    updateGauges();
    updateTrendChart();
    
    ElMessage.success('数据已更新');
  } catch (error) {
    console.error('加载数据失败', error);
    ElMessage.error('数据加载失败');
  } finally {
    loading.value = false;
  }
};

// 获取实时体征 (心率、血氧)
const fetchVitals = async (id) => {
  const res = await request.get(`/health-monitoring/vitals-snapshot/${id}`);
  if (res.data && res.data.success) {
    vitals.value = res.data.data;
  }
};

// 获取睡眠数据
const fetchSleep = async (id) => {
  const res = await request.get(`/health-monitoring/sleep-quality/${id}`);
  if (res.data && res.data.success && res.data.data.length > 0) {
    sleepData.value = res.data.data[0];
  } else {
    sleepData.value = {};
  }
};

// 获取趋势数据 (血压或体温)
const fetchTrendData = async (id) => {
  trendData.value = []; // 清空
  if (dataType.value === 'bp') {
    const res = await request.get(`/health-monitoring/blood-pressure/${id}`);
    if (res.data && res.data.success) {
      // 取最近7条数据，并按时间排序
      trendData.value = res.data.data
        .sort((a, b) => new Date(a.measureTime) - new Date(b.measureTime))
        .slice(-10); 
    }
  } else {
    const res = await request.get(`/health-monitoring/body-temperature/${id}`);
    if (res.data && res.data.success) {
      trendData.value = res.data.data
        .sort((a, b) => new Date(a.measureTime) - new Date(b.measureTime))
        .slice(-10);
    }
  }
};

// 获取全局告警日志
const fetchAlerts = async () => {
  const res = await request.get('/health-monitoring/alerts');
  if (res.data && res.data.success) {
    alerts.value = res.data.data;
  }
};

// 切换居民事件
const handleResidentChange = () => {
  loadResidentData();
};

// --- ECharts 图表逻辑 ---

// 初始化/更新 仪表盘
const updateGauges = () => {
  if (!hrGauge.value || !spo2Gauge.value) return;

  const hrValue = vitals.value.heartRate || 0;
  const spo2Value = vitals.value.bloodOxygen || 0;

  // 心率仪表盘
  if (!chartInstanceHr) chartInstanceHr = echarts.init(hrGauge.value);
  chartInstanceHr.setOption(getGaugeOption('心率', hrValue, '#10b981', 150));

  // 血氧仪表盘
  if (!chartInstanceSpo2) chartInstanceSpo2 = echarts.init(spo2Gauge.value);
  chartInstanceSpo2.setOption(getGaugeOption('血氧', spo2Value, '#3b82f6', 100));
};

const getGaugeOption = (title, value, color, maxVal) => ({
  series: [{
    type: 'gauge',
    startAngle: 90, endAngle: -270,
    min: 0, max: maxVal,
    pointer: { show: false },
    progress: { show: true, overlap: false, roundCap: true, clip: false, itemStyle: { color: color } },
    axisLine: { lineStyle: { width: 8, color: [[1, 'rgba(255,255,255,0.1)']] } },
    splitLine: { show: false }, axisTick: { show: false }, axisLabel: { show: false },
    detail: { 
      valueAnimation: true, 
      fontSize: 24, 
      offsetCenter: [0, '0%'], 
      color: '#fff',
      formatter: '{value}'
    },
    data: [{ value: value }]
  }]
});

// 初始化/更新 趋势图
const updateTrendChart = async () => {
  if (!trendChart.value) return;
  
  // 如果是切换类型，需要重新拉取数据
  if (trendData.value.length === 0) {
    await fetchTrendData(currentResidentId.value);
  }

  if (!chartInstanceTrend) chartInstanceTrend = echarts.init(trendChart.value);

  // 准备数据
  const dates = trendData.value.map(item => {
    const d = new Date(item.measureTime);
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  });

  let series = [];
  let legendData = [];

  if (dataType.value === 'bp') {
    legendData = ['收缩压', '舒张压'];
    series = [
      {
        name: '收缩压', type: 'line', smooth: true,
        data: trendData.value.map(item => item.systolic),
        itemStyle: { color: '#f43f5e' },
        lineStyle: { width: 3 },
        areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1, [{offset:0, color:'rgba(244,63,94,0.3)'}, {offset:1, color:'rgba(0,0,0,0)'}]) }
      },
      {
        name: '舒张压', type: 'line', smooth: true,
        data: trendData.value.map(item => item.diastolic),
        itemStyle: { color: '#fbbf24' },
        lineStyle: { width: 3 }
      }
    ];
  } else {
    legendData = ['体温'];
    series = [
      {
        name: '体温', type: 'line', smooth: true,
        data: trendData.value.map(item => item.temperature),
        itemStyle: { color: '#3b82f6' },
        lineStyle: { width: 3 },
        areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1, [{offset:0, color:'rgba(59, 130, 246, 0.3)'}, {offset:1, color:'rgba(0,0,0,0)'}]) }
      }
    ];
  }

  const option = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', textStyle: { color: '#f1f5f9' } },
    legend: { data: legendData, textStyle: { color: '#94a3b8' }, top: 0, right: 0 },
    grid: { left: '10', right: '10', bottom: '0', top: '60', containLabel: true },
    xAxis: { 
      type: 'category', 
      boundaryGap: false, 
      data: dates, 
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#94a3b8' }
    },
    yAxis: { 
      type: 'value', 
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } },
      axisLabel: { color: '#64748b' },
      min: (value) => Math.floor(value.min * 0.95) // 动态Y轴
    },
    series: series
  };
  
  chartInstanceTrend.setOption(option, true); // true 表示不合并，完全重绘
};

// 初始化 LBS 地图 (保持模拟)
const initMapChart = () => {
  if (!mapChart.value) return;
  const chart = echarts.init(mapChart.value);
  charts.push(chart);

  const traceData = Array.from({length: 20}, (_, i) => [
    50 + Math.cos(i/3) * 20 + Math.random() * 5, 
    50 + Math.sin(i/3) * 20 + Math.random() * 5
  ]);

  const option = {
    backgroundColor: 'transparent',
    grid: { top: 0, bottom: 0, left: 0, right: 0 },
    xAxis: { show: false, min: 0, max: 100 },
    yAxis: { show: false, min: 0, max: 100 },
    series: [
      {
        type: 'line', smooth: true,
        data: traceData,
        lineStyle: { color: '#06b6d4', width: 3, shadowBlur: 10, shadowColor: '#06b6d4' },
        symbol: 'none'
      },
      {
        type: 'effectScatter', coordinateSystem: 'cartesian2d',
        data: [traceData[traceData.length - 1]],
        symbolSize: 24,
        rippleEffect: { brushType: 'stroke', scale: 6, color: '#22d3ee' },
        itemStyle: { color: '#0891b2', shadowBlur: 20, shadowColor: '#22d3ee' },
      }
    ]
  };
  chart.setOption(option);
};

// --- 工具函数 ---
const formatTime = (timeStr) => {
  if (!timeStr) return '--:--';
  const d = new Date(timeStr);
  return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const formatTimeOnly = (timeStr) => {
    if (!timeStr) return '--:--';
    // 后端如果返回完整 ISO 字符串，尝试截取
    if (typeof timeStr === 'string' && timeStr.includes('T')) {
        const parts = timeStr.split('T')[1].split(':');
        return `${parts[0]}:${parts[1]}`;
    }
    // 简单时间格式直接返回
    return timeStr.substring(0, 5);
}

const calcPercent = (val, total) => {
  if (!val || !total) return 0;
  return Math.round((val / total) * 100);
};

const handleResize = () => {
  [chartInstanceTrend, chartInstanceHr, chartInstanceSpo2, ...charts].forEach(c => c && c.resize());
};

// --- 生命周期 ---
onMounted(() => {
  fetchResidents(); // 启动数据加载链
  
  // 初始化不需要数据的地图
  setTimeout(() => initMapChart(), 100);

  window.addEventListener('resize', handleResize);
  timer = setInterval(() => currentTime.value = new Date().toLocaleString(), 1000);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  clearInterval(timer);
  [chartInstanceTrend, chartInstanceHr, chartInstanceSpo2, ...charts].forEach(c => c && c.dispose());
});
</script>

<style scoped>
/* --- 样式保持之前的 Modern Dashboard 风格，仅增加 input-label 样式 --- */
.monitor-dashboard {
  --bg-dark: #0f172a;
  --card-bg: rgba(30, 41, 59, 0.6);
  --card-border: rgba(255, 255, 255, 0.08);
  --text-main: #f1f5f9;
  --text-muted: #94a3b8;
  --accent-cyan: #06b6d4;
  --accent-blue: #3b82f6;
  --accent-red: #f43f5e;
  --accent-green: #10b981;
  --glass-blur: 12px;
  
  min-height: 100vh;
  background-color: var(--bg-dark);
  background-image: 
    radial-gradient(circle at 10% 10%, rgba(6, 182, 212, 0.15), transparent 40%),
    radial-gradient(circle at 90% 90%, rgba(59, 130, 246, 0.15), transparent 40%);
  color: var(--text-main);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 16px 16px 16px;
}

/* Header */
.dashboard-header {
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--card-border);
}
.header-left { display: flex; align-items: center; gap: 10px; }
.logo-mark { width: 28px; height: 28px; background: var(--accent-blue); color: white; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
.header-title h1 { font-size: 18px; margin: 0; font-weight: 600; }
.subtitle { font-size: 11px; color: var(--text-muted); opacity: 0.8; margin-left: 8px; }
.header-right { display: flex; align-items: center; gap: 16px; font-size: 13px; }
.status-indicator { display: flex; align-items: center; gap: 6px; color: var(--accent-green); background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 20px; font-size: 12px; }
.dot.pulse { width: 6px; height: 6px; background: currentColor; border-radius: 50%; animation: pulse 2s infinite; }
.time-display { font-family: monospace; color: var(--text-muted); font-size: 14px; }
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

/* Grid Layout */
.dashboard-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 240px 1fr 260px;
  gap: 16px;
  height: calc(100vh - 90px);
}
.grid-column { display: flex; flex-direction: column; gap: 16px; min-height: 0; }

/* Cards */
.glass-card {
  background: var(--card-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.2s ease;
}
.glass-card:hover { border-color: rgba(255, 255, 255, 0.2); box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.5); }
.card-header { font-size: 13px; font-weight: 600; color: var(--accent-cyan); display: flex; align-items: center; gap: 6px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
.card-header.transparent { position: absolute; top: 14px; left: 14px; z-index: 10; margin: 0; }

/* Control & Profile */
.input-label { font-size: 10px; color: var(--text-muted); margin-bottom: 4px; display: block; }
.modern-select { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--card-border); color: var(--text-main); padding: 6px 10px; border-radius: 6px; outline: none; font-size: 12px; }
.control-row { margin-bottom: 10px; }
.refresh-btn { background: var(--accent-blue); border: none; padding: 8px; border-radius: 6px; color: white; font-weight: 500; cursor: pointer; font-size: 12px; width: 100%; margin-top: 4px; }
.refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.profile-body { display: flex; align-items: center; gap: 12px; }
.avatar-circle { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-blue), var(--accent-cyan)); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; color: white; box-shadow: 0 4px 10px rgba(6, 182, 212, 0.3); }
.avatar-section { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.risk-tag { font-size: 9px; padding: 1px 6px; border-radius: 8px; background: rgba(16, 185, 129, 0.2); color: var(--accent-green); }
.info-grid { flex: 1; display: grid; grid-template-columns: 1fr; gap: 6px; }
.info-item { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed rgba(255,255,255,0.05); padding-bottom: 2px; }
.info-item label { font-size: 10px; color: var(--text-muted); }
.info-item span { font-size: 12px; font-weight: 500; }
.highlight-cyan { color: var(--accent-cyan); }

/* Sleep */
.sleep-score { text-align: center; margin-bottom: 12px; }
.score-val { font-size: 32px; font-weight: 700; color: #a78bfa; line-height: 1; }
.score-val small { font-size: 12px; color: var(--text-muted); }
.score-label { display: block; font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.bar-group { margin-bottom: 6px; }
.bar-info { display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted); margin-bottom: 2px; }
.progress-track { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 2px; }
.progress-fill.deep { background: #8b5cf6; }
.progress-fill.light { background: #60a5fa; }
.sleep-meta { font-size: 10px; color: var(--text-muted); text-align: center; margin-top: 8px; }

/* Center */
.map-card { flex: 2; overflow: hidden; padding: 0; border: 1px solid rgba(6, 182, 212, 0.2); }
.card-absolute-header { position: absolute; top: 14px; left: 14px; z-index: 10; display: flex; align-items: center; gap: 8px; }
.card-absolute-header h3 { margin: 0; font-size: 15px; color: var(--text-main); }
.live-tag { background: var(--accent-red); color: white; font-size: 9px; padding: 2px 5px; border-radius: 3px; font-weight: bold; animation: pulse 2s infinite; }
.echarts-container { width: 100%; height: 100%; }
.grid-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 40px 40px; }
.trend-card { flex: 2; }
.trend-chart { width: 100%; height: 100%; min-height: 180px; }

/* Right */
.gauge-wrapper { display: flex; gap: 4px; justify-content: space-around; padding: 8px 0; }
.gauge-single { display: flex; flex-direction: column; align-items: center; width: 48%; }
.echarts-gauge { width: 100%; height: 90px; }
.gauge-meta { font-size: 11px; color: var(--text-muted); margin-top: -8px; }

.advice-content { display: flex; gap: 10px; font-size: 12px; line-height: 1.4; color: var(--text-main); }
.ai-avatar { width: 28px; height: 28px; background: linear-gradient(135deg, #ec4899, #8b5cf6); border-radius: 6px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 10px; }
.ai-bubble { background: rgba(255,255,255,0.05); padding: 8px; border-radius: 0 10px 10px 10px; border: 1px solid var(--card-border); }
.ai-bubble p { margin: 0; }

.log-card { flex: 1; min-height: 180px; display: flex; flex-direction: column; }
.log-stream { list-style: none; padding: 0; margin: 0; overflow-y: auto; flex: 1; }
.stream-item { display: flex; gap: 10px; padding-bottom: 12px; position: relative; }
.stream-time { font-family: monospace; font-size: 10px; color: var(--text-muted); min-width: 30px; text-align: right; padding-top: 2px; }
.stream-line { display: flex; flex-direction: column; align-items: center; width: 12px; }
.stream-line .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--card-border); z-index: 2; border: 1px solid var(--bg-dark); }
.stream-line .line { width: 1px; flex: 1; background: var(--card-border); margin-top: -2px; }
.stream-content { font-size: 11px; color: var(--text-main); padding-top: 0; width: 100%; }
.log-title { font-weight: 600; color: #f43f5e; margin-bottom: 2px; }
.log-desc { color: var(--text-muted); font-size: 10px; }

.stream-item:last-child .stream-line .line { display: none; }
.stream-item.danger .dot { background: var(--accent-red); box-shadow: 0 0 6px rgba(244, 63, 94, 0.5); }
.no-data { text-align: center; color: var(--text-muted); font-size: 12px; padding: 20px; }

/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

/* Responsive */
@media (max-width: 1024px) {
  .dashboard-grid { grid-template-columns: 200px 1fr 220px; gap: 10px; }
}
@media (max-width: 768px) {
  .dashboard-grid { grid-template-columns: 1fr; height: auto; display: flex; flex-direction: column; }
  .map-card { min-height: 300px; }
  .monitor-dashboard { overflow-y: auto; }
}
</style>