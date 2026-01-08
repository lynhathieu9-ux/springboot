<template>
  <div class="resident-history-container">
    <div class="page-header">
      <h2 class="page-title">入住历史</h2>
      <p class="page-subtitle">查询老人的入住历史记录</p>
    </div>
    
    <div class="content-section">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">入住历史查询</h3>
        </div>
        
        <div class="card-body">
          <!-- 搜索和筛选 -->
          <div class="search-filter">
            <el-input
              v-model="searchParams.name"
              placeholder="按姓名搜索"
              prefix-icon="User"
              clearable
              class="search-input"
            />
            <el-input
              v-model="searchParams.bedNumber"
              placeholder="按床位搜索"
              prefix-icon="Location"
              clearable
              class="search-input"
            />
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </div>
          
          <!-- 入住历史时间轴 -->
          <div class="timeline-container">
            <el-timeline v-if="residentHistoryList.length > 0">
              <el-timeline-item
                v-for="item in residentHistoryList"
                :key="item.id"
                :timestamp="formatDate(item.entryDate)"
                type="success"
                size="large"
              >
                <el-card class="timeline-card">
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <h4 class="resident-name">{{ item.residentName }}</h4>
                      <div class="room-info">
                        <span class="room-number">房间 {{ item.roomNumber }}</span>
                        <span class="bed-number">床位 {{ item.bedNumber }}</span>
                      </div>
                    </div>
                    <div class="timeline-body">
                      <div class="event-info">
                        <div class="event-item">
                          <span class="event-label">入住时间：</span>
                          <span class="event-value">{{ formatDate(item.entryDate) }}</span>
                        </div>
                        <div class="event-item" v-if="item.exitDate">
                          <span class="event-label">退房时间：</span>
                          <span class="event-value">{{ formatDate(item.exitDate) }}</span>
                        </div>
                        <div class="event-item">
                          <span class="event-label">入住时长：</span>
                          <span class="event-value">{{ item.duration }}天</span>
                        </div>
                        <div class="event-item" v-if="item.reason">
                          <span class="event-label">退房原因：</span>
                          <span class="event-value">{{ item.reason }}</span>
                        </div>
                        <div class="event-item" v-if="item.careLevel">
                          <span class="event-label">护理级别：</span>
                          <span class="event-value">{{ item.careLevel }}</span>
                        </div>
                        <div class="event-item">
                          <span class="event-label">操作人：</span>
                          <span class="event-value">{{ item.operator }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
            <div v-else class="empty-state">
              <el-empty description="暂无入住历史记录" />
            </div>
          </div>
          
          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              background
              layout="prev, pager, next, jumper, ->, total"
              :total="total"
              :page-size="pageSize"
              :current-page="currentPage"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getResidentHistory } from '@/api/resident'

// 搜索和筛选参数
const searchParams = reactive({
  name: '',
  bedNumber: ''
})

// 表格数据
const residentHistoryList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 时间格式化函数
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 生命周期
onMounted(() => {
  fetchResidentHistory()
})

// 获取入住历史列表
const fetchResidentHistory = async () => {
  loading.value = true
  try {
    const response = await getResidentHistory({
      ...searchParams,
      page: currentPage.value,
      pageSize: pageSize.value
    })
    
    if (response.data.success) {
      residentHistoryList.value = response.data.data.list || []
      total.value = response.data.data.total || 0
    } else {
      ElMessage.error(response.data.message || '获取入住历史列表失败')
    }
  } catch (error) {
    console.error('获取入住历史列表失败:', error)
    ElMessage.error('获取入住历史列表失败，请重试')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchResidentHistory()
}

// 分页
const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchResidentHistory()
}

// 表格行样式
const tableRowClassName = ({ row, rowIndex }) => {
  return rowIndex % 2 === 0 ? 'even-row' : 'odd-row'
}
</script>

<style scoped>
.resident-history-container {
  width: 100%;
  height: 100%;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--text-primary);
}

.page-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card {
  background: var(--gradient-card);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.card-body {
  padding: 24px;
}

.search-filter {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: center;
}

.search-input {
  width: 250px;
  transition: all 0.3s ease;
}

.date-picker {
  width: 350px;
}

/* 输入框样式美化 */
:deep(.el-input) {
  --primary-color: #409eff;
  --border-radius: 8px;
}

:deep(.el-input__wrapper) {
  border-radius: var(--border-radius);
  border: 1px solid #dcdfe6;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

:deep(.el-input__wrapper:hover) {
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

:deep(.el-input__wrapper.is-focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  outline: none;
}

:deep(.el-input__inner) {
  border: none;
  background: transparent;
  font-size: 14px;
  color: #303133;
  padding: 12px 14px;
}

:deep(.el-input__prefix) {
  left: 14px;
  color: #909399;
  transition: color 0.3s ease;
}

:deep(.el-input__wrapper.is-focus .el-input__prefix),
:deep(.el-input__wrapper:hover .el-input__prefix) {
  color: var(--primary-color);
}

:deep(.el-input__suffix-inner) {
  margin-right: 8px;
}

:deep(.el-icon-user),
:deep(.el-icon-location) {
  font-size: 16px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .search-input,
  .date-picker {
    width: 100%;
  }
  
  .search-filter {
    flex-direction: column;
    align-items: stretch;
  }
}

.table-container {
  margin-bottom: 24px;
  overflow-x: auto;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.even-row {
  background-color: var(--bg-primary);
}

.odd-row {
  background-color: var(--bg-secondary);
}

/* 时间轴样式 */
.timeline-container {
  margin-bottom: 24px;
}

.timeline-card {
  border-radius: var(--border-radius);
  box-shadow: none;
  border: 1px solid var(--border-color);
  margin-bottom: 24px;
}

.timeline-content {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-primary);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.resident-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.room-info {
  display: flex;
  gap: 16px;
}

.room-number, .bed-number {
  font-size: 15px;
  color: var(--text-secondary);
}

.timeline-body {
  margin-top: 16px;
}

.event-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.event-label {
  font-weight: 500;
  color: var(--text-primary);
  min-width: 100px;
  flex-shrink: 0;
}

.event-value {
  color: var(--text-secondary);
  flex: 1;
}

/* 老年友好设计调整 */
:deep(.el-timeline-item__timestamp) {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

:deep(.el-timeline-item__node) {
  width: 16px;
  height: 16px;
}

:deep(.el-card__body) {
  padding: 20px;
}

.empty-state {
  margin: 40px 0;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .room-info {
    gap: 12px;
  }
  
  .event-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .event-label {
    min-width: unset;
  }
  
  .search-filter {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input,
  .date-picker {
    width: 100%;
  }
}
</style>