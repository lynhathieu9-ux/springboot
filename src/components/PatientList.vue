<template>
  <div class="patient-list-container">
    <div class="list-header">
      <h3>在住老人列表</h3>
      <div class="header-stats">
        <span class="stat-item">
          <el-tag type="success" size="small">{{ totalResidents }}</el-tag>
          总人数
        </span>
        <span class="stat-item">
          <el-tag type="danger" size="small">{{ highRiskCount }}</el-tag>
          高危
        </span>
      </div>
    </div>
    <div class="search-box">
      <el-input
        v-model="searchQuery"
        placeholder="搜索老人姓名或房间号"
        clearable
        size="small"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>
    <div class="list-content">
      <div
        v-for="patient in filteredPatients"
        :key="patient.id"
        class="patient-item"
        :class="{ active: selectedPatientId === patient.id }"
        @click="selectPatient(patient)"
      >
        <div class="patient-avatar">
          <img :src="patient.photo" :alt="patient.name" />
          <div class="risk-indicator" :class="patient.risk_level"></div>
        </div>
        <div class="patient-info">
          <div class="info-main">
            <h4 class="patient-name">{{ patient.name }}</h4>
            <div class="patient-basic">
              <span class="age">{{ patient.age }}岁</span>
              <span class="gender">{{ patient.gender }}</span>
            </div>
          </div>
          <div class="patient-detail">
            <div class="room-info">
              <el-icon><HomeFilled /></el-icon>
              {{ patient.room_number }}-{{ patient.bed_number }}
            </div>
            <div class="health-brief">
              <div class="health-item">
                <span class="label">血压</span>
                <span class="value">{{ patient.latestHealth.bp.systolic }}/{{ patient.latestHealth.bp.diastolic }}</span>
              </div>
              <div class="health-item">
                <span class="label">心率</span>
                <span class="value">{{ patient.latestHealth.hr }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Search, HomeFilled } from '@element-plus/icons-vue';
import { getActiveResidentsData } from '../mock/database';

const emit = defineEmits(['select-patient']);

const patients = ref([]);
const searchQuery = ref('');
const selectedPatientId = ref(null);

const totalResidents = computed(() => patients.value.length);
const highRiskCount = computed(() => {
  return patients.value.filter(p => p.risk_level === 'high').length;
});

const filteredPatients = computed(() => {
  if (!searchQuery.value) {
    return patients.value;
  }
  const query = searchQuery.value.toLowerCase();
  return patients.value.filter(patient => {
    return (
      patient.name.toLowerCase().includes(query) ||
      patient.room_number.toLowerCase().includes(query) ||
      patient.bed_number.toLowerCase().includes(query)
    );
  });
});

const loadPatients = () => {
  patients.value = getActiveResidentsData();
  if (patients.value.length > 0) {
    selectPatient(patients.value[0]);
  }
};

const selectPatient = (patient) => {
  selectedPatientId.value = patient.id;
  emit('select-patient', patient);
};

onMounted(() => {
  loadPatients();
});
</script>

<style scoped>
.patient-list-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.list-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.header-stats {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.search-box {
  margin-bottom: 16px;
}

.list-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

/* 自定义滚动条 */
.list-content::-webkit-scrollbar {
  width: 6px;
}

.list-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.list-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.list-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.patient-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 12px;
  background: #fafafa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.patient-item:hover {
  background: #f0f7ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.patient-item.active {
  background: #e6f4ff;
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.patient-avatar {
  position: relative;
  margin-right: 12px;
}

.patient-avatar img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.risk-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #fff;
}

.risk-indicator.high {
  background: #f56c6c;
}

.risk-indicator.medium {
  background: #e6a23c;
}

.risk-indicator.low {
  background: #67c23a;
}

.patient-info {
  flex: 1;
  min-width: 0;
}

.info-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.patient-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.patient-basic {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.patient-detail {
  font-size: 12px;
  color: #666;
}

.room-info {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.health-brief {
  display: flex;
  gap: 16px;
}

.health-item {
  display: flex;
  flex-direction: column;
}

.health-item .label {
  color: #999;
  font-size: 10px;
}

.health-item .value {
  color: #333;
  font-weight: 500;
}
</style>
