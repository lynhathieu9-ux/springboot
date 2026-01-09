<template>
  <div class="health-dashboard-container">
    <Header />
    <div class="dashboard-content">
      <!-- 左侧老人列表 -->
      <div class="left-panel">
        <Panel height="100%">
          <PatientList @select-patient="handleSelectPatient" />
        </Panel>
      </div>
      
      <!-- 主内容区 -->
      <div class="main-panel">
        <!-- 第一行：体征仪表盘 -->
        <div class="row">
          <div class="col col-3">
            <Panel title="血氧饱和度" height="280px">
              <GaugeChart 
                :value="selectedPatient?.latestHealth.oxygen || 95" 
                label="血氧" 
                :min="70" 
                :max="100" 
                unit="%" 
              />
            </Panel>
          </div>
          <div class="col col-3">
            <Panel title="体温" height="280px" borderColor="#3ba272">
              <GaugeChart 
                :value="selectedPatient?.latestHealth.temp || 36.5" 
                label="体温" 
                :min="35" 
                :max="38" 
                unit="°C" 
                :color="['#52c41a', '#faad14', '#f5222d']"
              />
            </Panel>
          </div>
          <div class="col col-3">
            <Panel title="血压" height="280px" borderColor="#ee6666">
              <GaugeChart 
                :value="selectedPatient?.latestHealth.bp.systolic || 120" 
                label="收缩压" 
                :min="80" 
                :max="200" 
                unit="mmHg" 
                :color="['#52c41a', '#faad14', '#f5222d']"
              />
            </Panel>
          </div>
          <div class="col col-3">
            <Panel title="血糖" height="280px" borderColor="#fac858">
              <GaugeChart 
                :value="selectedPatient?.latestHealth.sugar.level || 5.5" 
                label="血糖" 
                :min="3" 
                :max="15" 
                unit="mmol/L" 
                :color="['#52c41a', '#faad14', '#f5222d']"
              />
            </Panel>
          </div>
        </div>
        
        <!-- 第二行：趋势图和健康评估 -->
        <div class="row">
          <div class="col col-8">
            <Panel title="体征趋势图" height="400px">
              <BioChart :data="historicalData" />
            </Panel>
          </div>
          <div class="col col-4">
            <Panel title="健康综合评估" height="400px">
              <RadarChart :data="radarData" />
            </Panel>
          </div>
        </div>
        
        <!-- 第三行：3D楼层和位置地图 -->
        <div class="row">
          <div class="col col-6">
            <Panel title="3D楼层可视化" height="500px">
              <BuildingScene :residents="residents" />
            </Panel>
          </div>
          <div class="col col-6">
            <Panel title="老人实时位置" height="500px">
              <LocationMap :residents="residents" />
            </Panel>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import Header from '../components/Layout/Header.vue';
import Panel from '../components/Layout/Panel.vue';
import PatientList from '../components/PatientList.vue';
import GaugeChart from '../components/Charts/GaugeChart.vue';
import BioChart from '../components/Charts/BioChart.vue';
import RadarChart from '../components/Charts/RadarChart.vue';
import BuildingScene from '../components/3D/BuildingScene.vue';
import LocationMap from '../components/GIS/LocationMap.vue';
import { getActiveResidentsData, generateHistoricalData } from '../mock/database';
import { useSocket } from '../hooks/useSocket';
import { useResize } from '../hooks/useResize';

// 大屏适配
useResize();

// 初始数据
const residents = ref([]);
const selectedPatient = ref(null);
const historicalData = ref([]);

// 获取初始数据
const loadInitialData = () => {
  residents.value = getActiveResidentsData();
  if (residents.value.length > 0) {
    selectedPatient.value = residents.value[0];
  }
  historicalData.value = generateHistoricalData(7);
};

// 处理老人选择
const handleSelectPatient = (patient) => {
  selectedPatient.value = patient;
};

// 雷达图数据计算
const radarData = computed(() => {
  if (!selectedPatient.value) {
    return {
      name: '健康评分',
      values: [80, 75, 85, 70, 90, 85]
    };
  }
  
  const health = selectedPatient.value.latestHealth;
  
  // 计算各项健康评分（简化）
  const bpScore = health.bp.systolic < 140 && health.bp.diastolic < 90 ? 90 : 70;
  const sugarScore = health.sugar.level < 7 ? 90 : 70;
  const oxygenScore = health.oxygen > 95 ? 95 : health.oxygen;
  const tempScore = health.temp >= 36 && health.temp <= 37 ? 95 : 75;
  const hrScore = health.hr >= 60 && health.hr <= 100 ? 90 : 70;
  const sleepScore = 85; // 简化处理
  
  return {
    name: selectedPatient.value.name + '健康评分',
    values: [bpScore, sugarScore, oxygenScore, tempScore, hrScore, sleepScore]
  };
});

// 初始化
onMounted(() => {
  loadInitialData();
});
</script>

<style scoped>
.health-dashboard-container {
  width: 100%;
  height: 100vh;
  background: #333;
  overflow: hidden;
}

.dashboard-content {
  display: flex;
  height: calc(100vh - 60px);
  padding: 20px;
  gap: 20px;
  overflow: hidden;
}

.left-panel {
  width: 320px;
  height: 100%;
  overflow: hidden;
}

.main-panel {
  flex: 1;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 10px;
}

/* 自定义滚动条 */
.main-panel::-webkit-scrollbar {
  width: 8px;
}

.main-panel::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.main-panel::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.main-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: stretch;
}

.col {
  flex: 1;
  min-height: 0;
}

.col-2 { flex: 2; }
.col-3 { flex: 3; }
.col-4 { flex: 4; }
.col-6 { flex: 6; }
.col-8 { flex: 8; }
</style>
