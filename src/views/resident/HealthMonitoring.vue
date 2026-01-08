<template>
  <div class="health-monitoring-container">
    <div class="page-header">
      <h2 class="page-title">健康监测</h2>
      <p class="page-subtitle">实时记录和监测老人的健康数据</p>
    </div>
    
    <div class="content-section">
      <!-- 健康数据录入卡片 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">日常健康数据录入</h3>
        </div>
        
        <div class="card-body">
          <el-tabs v-model="activeTab" class="health-tabs">
            <!-- 血压记录 -->
            <el-tab-pane label="血压记录" name="bloodPressure">
              <div class="tab-content">
                <el-form :model="bloodPressureForm" label-width="150px" class="health-form">
                  <el-form-item label="老人姓名" required>
                    <el-select v-model="bloodPressureForm.residentId" placeholder="请选择老人姓名" style="width: 200px;">
                      <el-option
                        v-for="resident in residentsList"
                        :key="resident.id"
                        :label="resident.name"
                        :value="resident.id"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="收缩压(mmHg)" required>
                    <el-input-number v-model="bloodPressureForm.systolic" :min="60" :max="200" style="width: 150px;"></el-input-number>
                  </el-form-item>
                  <el-form-item label="舒张压(mmHg)" required>
                    <el-input-number v-model="bloodPressureForm.diastolic" :min="40" :max="120" style="width: 150px;"></el-input-number>
                  </el-form-item>
                  <el-form-item label="测量时间">
                    <el-date-picker v-model="bloodPressureForm.measureTime" type="datetime" format="YYYY-MM-DD HH:mm" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择测量时间" placement="bottom"></el-date-picker>
                  </el-form-item>
                  <el-form-item label="测量备注">
                    <el-input v-model="bloodPressureForm.notes" type="textarea" :rows="3" placeholder="请输入备注信息"></el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="saveBloodPressure">保存记录</el-button>
                  </el-form-item>
                </el-form>
                
                <!-- 血压记录列表 -->
                <div class="record-list">
                  <h4>近期记录</h4>
                  <el-table :data="bloodPressureRecords" stripe style="width: 100%;" max-height="300">
                    <el-table-column prop="measureTime" label="测量时间" width="180" />
                    <el-table-column label="血压值" width="150">
                      <template #default="scope">
                        <span :class="getBloodPressureClass(scope.row)">{{ scope.row.systolic }}/{{ scope.row.diastolic }} mmHg</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="notes" label="备注" />
                  </el-table>
                </div>
              </div>
            </el-tab-pane>
            
            <!-- 血糖记录 -->
            <el-tab-pane label="血糖记录" name="bloodSugar">
              <div class="tab-content">
                <el-form :model="bloodSugarForm" label-width="150px" class="health-form">
                  <el-form-item label="老人姓名" required>
                    <el-select v-model="bloodSugarForm.residentId" placeholder="请选择老人姓名" style="width: 200px;">
                      <el-option
                        v-for="resident in residentsList"
                        :key="resident.id"
                        :label="resident.name"
                        :value="resident.id"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="血糖值(mmol/L)" required>
                    <el-input-number v-model="bloodSugarForm.level" :min="2" :max="30" :step="0.1" style="width: 150px;"></el-input-number>
                  </el-form-item>
                  <el-form-item label="测量时间">
                    <el-date-picker v-model="bloodSugarForm.measureTime" type="datetime" format="YYYY-MM-DD HH:mm" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择测量时间" placement="bottom"></el-date-picker>
                  </el-form-item>
                  <el-form-item label="测量状态">
                    <el-radio-group v-model="bloodSugarForm.status">
                      <el-radio label="空腹" />
                      <el-radio label="餐后" />
                      <el-radio label="随机" />
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="测量备注">
                    <el-input v-model="bloodSugarForm.notes" type="textarea" :rows="3" placeholder="请输入备注信息"></el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="saveBloodSugar">保存记录</el-button>
                  </el-form-item>
                </el-form>
                
                <!-- 血糖记录列表 -->
                <div class="record-list">
                  <h4>近期记录</h4>
                  <el-table :data="bloodSugarRecords" stripe style="width: 100%;" max-height="300">
                    <el-table-column prop="measureTime" label="测量时间" width="180" />
                    <el-table-column label="血糖值" width="120">
                      <template #default="scope">
                        <span :class="getBloodSugarClass(scope.row)">{{ scope.row.level }} mmol/L</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="status" label="测量状态" width="100" />
                    <el-table-column prop="notes" label="备注" />
                  </el-table>
                </div>
              </div>
            </el-tab-pane>
            
            <!-- 心率记录 -->
            <el-tab-pane label="心率记录" name="heartRate">
              <div class="tab-content">
                <el-form :model="heartRateForm" label-width="150px" class="health-form">
                  <el-form-item label="老人姓名" required>
                    <el-select v-model="heartRateForm.residentId" placeholder="请选择老人姓名" style="width: 200px;">
                      <el-option
                        v-for="resident in residentsList"
                        :key="resident.id"
                        :label="resident.name"
                        :value="resident.id"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="心率值(次/分)" required>
                    <el-input-number v-model="heartRateForm.rate" :min="40" :max="200" style="width: 150px;"></el-input-number>
                  </el-form-item>
                  <el-form-item label="测量时间">
                    <el-date-picker v-model="heartRateForm.measureTime" type="datetime" format="YYYY-MM-DD HH:mm" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择测量时间" placement="bottom"></el-date-picker>
                  </el-form-item>
                  <el-form-item label="测量备注">
                    <el-input v-model="heartRateForm.notes" type="textarea" :rows="3" placeholder="请输入备注信息"></el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="saveHeartRate">保存记录</el-button>
                  </el-form-item>
                </el-form>
                
                <!-- 心率记录列表 -->
                <div class="record-list">
                  <h4>近期记录</h4>
                  <el-table :data="heartRateRecords" stripe style="width: 100%;" max-height="300">
                    <el-table-column prop="measureTime" label="测量时间" width="180" />
                    <el-table-column label="心率值" width="120">
                      <template #default="scope">
                        <span :class="getHeartRateClass(scope.row)">{{ scope.row.rate }} 次/分</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="notes" label="备注" />
                  </el-table>
                </div>
              </div>
            </el-tab-pane>
            

          </el-tabs>
        </div>
      </div>
      
      <!-- 异常预警卡片 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">健康异常预警</h3>
          <el-button type="success" @click="checkAllHealthData">
            <el-icon><Refresh /></el-icon>
            检查所有数据
          </el-button>
        </div>
        
        <div class="card-body">
          <div class="alerts-container">
            <div v-if="healthAlerts.length === 0" class="no-alerts">
              <el-empty description="暂无健康异常预警" />
            </div>
            <el-alert
              v-for="(alert, index) in healthAlerts"
              :key="index"
              :type="alert.type === 'danger' ? 'danger' : 'warning'"
              :title="alert.title"
              :description="alert.description"
              show-icon
              :closable="true"
              @close="removeAlert(index)"
              class="health-alert"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
// 导入健康监测相关API
import {
  getBloodPressureRecords,
  addBloodPressureRecord,
  getBloodSugarRecords,
  addBloodSugarRecord,
  getHeartRateRecords,
  addHeartRateRecord,
  getHealthAlerts,
  getAllResidents
} from '@/api/resident'

// 标签页切换
const activeTab = ref('bloodPressure')

// 老人列表
const residentsList = ref([])

// 血压记录表单
const bloodPressureForm = reactive({
  residentId: '',
  systolic: 0,
  diastolic: 0,
  measureTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
  notes: ''
})

// 血糖记录表单
const bloodSugarForm = reactive({
  residentId: '',
  level: 0,
  measureTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
  status: '空腹',
  notes: ''
})

// 心率记录表单
const heartRateForm = reactive({
  residentId: '',
  rate: 0,
  measureTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
  notes: ''
})

// 健康记录列表
const bloodPressureRecords = ref([])
const bloodSugarRecords = ref([])
const heartRateRecords = ref([])

// 健康异常预警
const healthAlerts = ref([])

// 获取血压记录
const fetchBloodPressureRecords = async () => {
  try {
    // 添加residentId参数，与健康监测可视化组件保持一致
    const response = await getBloodPressureRecords({ residentId: '' })
    if (response.data.success) {
      bloodPressureRecords.value = response.data.data || []
    } else {
      console.warn('获取血压记录失败:', response.data.message)
      // 不显示错误消息，只在控制台输出
      bloodPressureRecords.value = []
    }
  } catch (error) {
    console.error('获取血压记录失败:', error)
    // 不显示错误消息，只在控制台输出
    bloodPressureRecords.value = []
  }
}

// 获取血糖记录
const fetchBloodSugarRecords = async () => {
  try {
    // 添加residentId参数，与健康监测可视化组件保持一致
    const response = await getBloodSugarRecords({ residentId: '' })
    if (response.data.success) {
      bloodSugarRecords.value = response.data.data || []
    } else {
      console.warn('获取血糖记录失败:', response.data.message)
      // 不显示错误消息，只在控制台输出
      bloodSugarRecords.value = []
    }
  } catch (error) {
    console.error('获取血糖记录失败:', error)
    // 不显示错误消息，只在控制台输出
    bloodSugarRecords.value = []
  }
}

// 获取心率记录
const fetchHeartRateRecords = async () => {
  try {
    // 添加residentId参数，与健康监测可视化组件保持一致
    const response = await getHeartRateRecords({ residentId: '' })
    if (response.data.success) {
      heartRateRecords.value = response.data.data || []
    } else {
      console.warn('获取心率记录失败:', response.data.message)
      // 不显示错误消息，只在控制台输出
      heartRateRecords.value = []
    }
  } catch (error) {
    console.error('获取心率记录失败:', error)
    // 不显示错误消息，只在控制台输出
    heartRateRecords.value = []
  }
}

// 获取老人列表
const fetchResidentsList = async () => {
  try {
    const response = await getAllResidents()
    if (response.data.success) {
      // 过滤出当前入住的老人
      residentsList.value = (response.data.data || []).filter(resident => resident.status === '入住')
    } else {
      console.warn('获取老人列表失败:', response.data.message)
      // 不显示错误消息，只在控制台输出
      residentsList.value = []
    }
  } catch (error) {
    console.error('获取老人列表失败:', error)
    // 不显示错误消息，只在控制台输出
    residentsList.value = []
  }
}

// 获取健康预警
const fetchHealthAlerts = async () => {
  try {
    // 添加residentId参数，与健康监测可视化组件保持一致
    const response = await getHealthAlerts({ residentId: '' })
    if (response.data.success) {
      healthAlerts.value = response.data.data || []
    } else {
      console.warn('获取健康预警失败:', response.data.message)
      // 不显示错误消息，只在控制台输出
      healthAlerts.value = []
    }
  } catch (error) {
    console.error('获取健康预警失败:', error)
    // 不显示错误消息，只在控制台输出
    healthAlerts.value = []
  }
}

// 保存血压记录
const saveBloodPressure = async () => {
  if (!bloodPressureForm.residentId || !bloodPressureForm.systolic || !bloodPressureForm.diastolic) {
    ElMessage.warning('请填写完整的血压记录信息')
    return
  }
  
  try {
    const response = await addBloodPressureRecord(bloodPressureForm)
    if (response.data.success) {
      ElMessage.success(response.data.message || '血压记录保存成功')
      fetchBloodPressureRecords()
      fetchHealthAlerts()
      
      // 重置表单
      Object.assign(bloodPressureForm, {
        residentId: '',
        systolic: 0,
        diastolic: 0,
        measureTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        notes: ''
      })
    } else {
      ElMessage.error(response.data.message || '血压记录保存失败')
    }
  } catch (error) {
    ElMessage.error('血压记录保存失败')
    console.error('保存血压记录失败:', error)
  }
}

// 保存血糖记录
const saveBloodSugar = async () => {
  if (!bloodSugarForm.residentId || !bloodSugarForm.level) {
    ElMessage.warning('请填写完整的血糖记录信息')
    return
  }
  
  try {
    const response = await addBloodSugarRecord(bloodSugarForm)
    if (response.data.success) {
      ElMessage.success(response.data.message || '血糖记录保存成功')
      fetchBloodSugarRecords()
      fetchHealthAlerts()
      
      // 重置表单
      Object.assign(bloodSugarForm, {
        residentId: '',
        level: 0,
        measureTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        status: '空腹',
        notes: ''
      })
    } else {
      ElMessage.error(response.data.message || '血糖记录保存失败')
    }
  } catch (error) {
    ElMessage.error('血糖记录保存失败')
    console.error('保存血糖记录失败:', error)
  }
}

// 保存心率记录
const saveHeartRate = async () => {
  if (!heartRateForm.residentId || !heartRateForm.rate) {
    ElMessage.warning('请填写完整的心率记录信息')
    return
  }
  
  try {
    const response = await addHeartRateRecord(heartRateForm)
    if (response.data.success) {
      ElMessage.success(response.data.message || '心率记录保存成功')
      fetchHeartRateRecords()
      fetchHealthAlerts()
      
      // 重置表单
      Object.assign(heartRateForm, {
        residentId: '',
        rate: 0,
        measureTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        notes: ''
      })
    } else {
      ElMessage.error(response.data.message || '心率记录保存失败')
    }
  } catch (error) {
    ElMessage.error('心率记录保存失败')
    console.error('保存心率记录失败:', error)
  }
}

// 获取血压值样式
const getBloodPressureClass = (row) => {
  if (row.systolic > 140 || row.diastolic > 90) {
    return 'blood-pressure-high'
  } else if (row.systolic < 90 || row.diastolic < 60) {
    return 'blood-pressure-low'
  }
  return 'blood-pressure-normal'
}

// 获取血糖值样式
const getBloodSugarClass = (row) => {
  if ((row.status === '空腹' && row.level > 7.0) || 
      (row.status === '餐后' && row.level > 10.0)) {
    return 'blood-sugar-high'
  } else if (row.level < 3.9) {
    return 'blood-sugar-low'
  }
  return 'blood-sugar-normal'
}

// 获取心率值样式
const getHeartRateClass = (row) => {
  if (row.rate > 100) {
    return 'heart-rate-high'
  } else if (row.rate < 60) {
    return 'heart-rate-low'
  }
  return 'heart-rate-normal'
}

// 检查所有健康数据
const checkAllHealthData = async () => {
  try {
    await fetchHealthAlerts()
    ElMessage.success('健康数据检查完成')
  } catch (error) {
    ElMessage.error('健康数据检查失败')
    console.error('检查健康数据失败:', error)
  }
}

// 移除预警
const removeAlert = (index) => {
  healthAlerts.value.splice(index, 1)
}



// 组件挂载时获取数据
onMounted(() => {
  fetchResidentsList()
  fetchBloodPressureRecords()
  fetchBloodSugarRecords()
  fetchHeartRateRecords()
  fetchHealthAlerts()
})
</script>

<style scoped>
.health-monitoring-container {
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  background-color: #f5f7fa;
}

.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #303133;
}

.page-subtitle {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background-color: white;
  border-bottom: 1px solid #e4e7ed;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #303133;
}

.card-body {
  padding: 24px;
}

.health-tabs {
  width: 100%;
}

.tab-content {
  display: flex;
  gap: 24px;
  margin-top: 20px;
}

.health-form {
  flex: 1;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.health-form:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

/* 表单项目样式 */
:deep(.health-form .el-form-item) {
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

:deep(.health-form .el-form-item__label) {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  line-height: 1;
  vertical-align: middle;
}

:deep(.health-form .el-form-item__label::before) {
  content: '';
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
  margin-top: 1px;
}

/* 选择框样式 */
:deep(.health-form .el-select) {
  width: 100%;
  max-width: 280px;
}

:deep(.health-form .el-select__wrapper) {
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.health-form .el-select__wrapper:hover) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

:deep(.health-form .el-select__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

/* 输入数字框样式 */
:deep(.health-form .el-input-number) {
  width: 100%;
  max-width: 280px;
}

:deep(.health-form .el-input-number__wrapper) {
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.health-form .el-input-number__wrapper:hover) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

:deep(.health-form .el-input-number__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

:deep(.health-form .el-input-number__decrease),
:deep(.health-form .el-input-number__increase) {
  background: #f3f4f6;
  border: none;
  border-radius: 0;
  transition: all 0.3s ease;
}

:deep(.health-form .el-input-number__decrease:hover),
:deep(.health-form .el-input-number__increase:hover) {
  background: #e5e7eb;
  color: #667eea;
}

/* 日期选择器样式 */
:deep(.health-form .el-date-editor) {
  width: 100%;
  max-width: 280px;
}

:deep(.health-form .el-date-editor__wrapper) {
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.health-form .el-date-editor__wrapper:hover) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

:deep(.health-form .el-date-editor__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

/* 日期选择器弹窗样式 */
:deep(.health-form .el-picker-panel) {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  background: white;
}

/* 日期选择器头部 */
:deep(.health-form .el-date-picker__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  text-align: center;
}

:deep(.health-form .el-date-picker__header-label) {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

/* 日期选择器导航按钮 */
:deep(.health-form .el-date-picker__prev-btn),
:deep(.health-form .el-date-picker__next-btn) {
  color: white;
  transition: all 0.3s ease;
}

:deep(.health-form .el-date-picker__prev-btn:hover),
:deep(.health-form .el-date-picker__next-btn:hover) {
  color: rgba(255, 255, 255, 0.8);
  transform: scale(1.1);
}

/* 日期选择器表格 */
:deep(.health-form .el-picker-body) {
  padding: 16px;
}

:deep(.health-form .el-date-table) {
  width: 100%;
  border-collapse: separate;
  border-spacing: 8px;
}

/* 星期标题 */
:deep(.health-form .el-date-table th) {
  color: #6b7280;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 0;
  text-align: center;
}

/* 日期单元格 */
:deep(.health-form .el-date-table td) {
  padding: 0;
  text-align: center;
}

:deep(.health-form .el-date-table__row td) {
  padding: 0;
}

/* 日期单元格内容 */
:deep(.health-form .el-date-table__cell) {
  width: 36px;
  height: 36px;
  line-height: 36px;
  border-radius: 50%;
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}

:deep(.health-form .el-date-table__cell:hover) {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #374151;
  transform: scale(1.05);
}

/* 选中日期 */
:deep(.health-form .el-date-table__cell.is-selected) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 今天日期 */
:deep(.health-form .el-date-table__cell.is-today) {
  font-weight: 600;
  color: #667eea;
}

/* 禁用日期 */
:deep(.health-form .el-date-table__cell.is-disabled) {
  color: #9ca3af;
  cursor: not-allowed;
}

:deep(.health-form .el-date-table__cell.is-disabled:hover) {
  background: transparent;
  transform: none;
}

/* 底部按钮 */
:deep(.health-form .el-picker-panel__footer) {
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

:deep(.health-form .el-button--text) {
  color: #667eea;
  font-weight: 600;
  transition: all 0.3s ease;
}

:deep(.health-form .el-button--text:hover) {
  color: #5a6fd8;
  background: rgba(102, 126, 234, 0.05);
}

:deep(.health-form .el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

:deep(.health-form .el-button--primary:hover) {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a418a 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/* 文本域样式 */
:deep(.health-form .el-textarea__inner) {
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  padding: 12px;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.health-form .el-textarea__inner:hover) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

:deep(.health-form .el-textarea__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  outline: none;
}

/* 按钮样式 */
:deep(.health-form .el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

:deep(.health-form .el-button--primary:hover) {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a418a 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

:deep(.health-form .el-button--primary:active) {
  transform: translateY(0);
  box-shadow: 0 3px 8px rgba(102, 126, 234, 0.3);
}

/* 单选框样式 */
:deep(.health-form .el-radio__input.is-checked .el-radio__inner) {
  border-color: #667eea;
  background: #667eea;
}

:deep(.health-form .el-radio__input.is-checked+.el-radio__label) {
  color: #667eea;
}

/* 标签页样式 */
:deep(.health-tabs .el-tabs__nav-wrap) {
  background: white;
  border-radius: 8px 8px 0 0;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.health-tabs .el-tabs__nav) {
  margin: 0;
}

:deep(.health-tabs .el-tabs__item) {
  font-size: 14px;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 6px;
  transition: all 0.3s ease;
  margin: 0 4px;
}

:deep(.health-tabs .el-tabs__item:hover) {
  color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

:deep(.health-tabs .el-tabs__item.is-active) {
  color: #374151;
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.health-tabs .el-tabs__active-bar) {
  display: none;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .health-form {
    padding: 16px;
  }
  
  :deep(.health-form .el-form-item) {
    margin-bottom: 16px;
  }
  
  :deep(.health-form .el-select),
  :deep(.health-form .el-input-number),
  :deep(.health-form .el-date-editor) {
    max-width: 100%;
  }
}

.record-list {
  flex: 1;
}

.record-list h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.alerts-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.no-alerts {
  text-align: center;
  padding: 40px 0;
}

.health-alert {
  width: 100%;
}

/* 健康数据样式 */
.blood-pressure-normal {
  color: #67c23a;
  font-weight: bold;
}

.blood-pressure-high {
  color: #f56c6c;
  font-weight: bold;
}

.blood-pressure-low {
  color: #e6a23c;
  font-weight: bold;
}

.blood-sugar-normal {
  color: #67c23a;
  font-weight: bold;
}

.blood-sugar-high {
  color: #f56c6c;
  font-weight: bold;
}

.blood-sugar-low {
  color: #e6a23c;
  font-weight: bold;
}

.heart-rate-normal {
  color: #67c23a;
  font-weight: bold;
}

.heart-rate-high {
  color: #f56c6c;
  font-weight: bold;
}

.heart-rate-low {
  color: #e6a23c;
  font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .tab-content {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .health-monitoring-container {
    padding: 10px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .card-body {
    padding: 16px;
  }
  
  .card-header {
    padding: 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>