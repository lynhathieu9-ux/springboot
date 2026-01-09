<template>
  <div class="profile-container">
    <div class="profile-header">
      <h2>个人信息管理</h2>
      <p>查看并更新您的基础档案与健康数据</p>
    </div>

    <el-card shadow="hover" class="profile-card">
      <el-tabs v-model="activeTab" type="card" class="profile-tabs">
        
        <el-tab-pane label="基础信息" name="basic">
          <el-form
            ref="personalInfoFormRef"
            :model="personalInfoForm"
            :rules="personalInfoRules"
            label-width="120px"
            size="large"
          >
            <div class="form-row">
              <el-form-item label="老人姓名" prop="name" class="form-item">
                <el-input v-model="personalInfoForm.name" placeholder="请输入老人姓名" />
              </el-form-item>
              <el-form-item label="身份证号" prop="idCard" class="form-item">
                <el-input v-model="personalInfoForm.idCard" placeholder="请输入身份证号" />
              </el-form-item>
            </div>
            
            <div class="form-row">
              <el-form-item label="性别" prop="gender" class="form-item">
                <el-select v-model="personalInfoForm.gender" placeholder="请选择性别" style="width: 100%">
                  <el-option label="男" value="男" />
                  <el-option label="女" value="女" />
                </el-select>
              </el-form-item>
              <el-form-item label="年龄" prop="age" class="form-item">
                <el-input v-model="personalInfoForm.age" type="number" placeholder="请输入年龄" />
              </el-form-item>
            </div>
            
            <div class="form-row">
              <el-form-item label="联系电话" prop="phone" class="form-item">
                <el-input v-model="personalInfoForm.phone" placeholder="请输入联系电话" />
              </el-form-item>
              <el-form-item label="紧急联系人" prop="emergencyContact" class="form-item">
                <el-input v-model="personalInfoForm.emergencyContact" placeholder="请输入紧急联系人" />
              </el-form-item>
            </div>
            
            <div class="form-row">
              <el-form-item label="紧急联系电话" prop="emergencyPhone" class="form-item">
                <el-input v-model="personalInfoForm.emergencyPhone" placeholder="请输入紧急联系电话" />
              </el-form-item>
              <el-form-item label="入住日期" prop="entryDate" class="form-item">
                <el-date-picker
                  v-model="personalInfoForm.entryDate"
                  type="date"
                  placeholder="选择入住日期"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </div>
            
            <div class="form-row">
              <el-form-item label="房间号" prop="roomNumber" class="form-item">
                <el-select v-model="personalInfoForm.roomNumber" placeholder="请选择房间号" @change="handleRoomChange" style="width: 100%">
                  <el-option
                    v-for="room in roomList"
                    :key="room.roomNumber"
                    :label="room.roomNumber"
                    :value="room.roomNumber"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="床位号" prop="bedNumber" class="form-item">
                <el-select v-model="personalInfoForm.bedNumber" placeholder="请选择床位号" style="width: 100%">
                  <el-option
                    v-for="bed in availableBeds"
                    :key="bed.bedNumber"
                    :label="bed.bedNumber"
                    :value="bed.bedNumber"
                  />
                </el-select>
              </el-form-item>
            </div>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="健康信息" name="health">
          <el-form
            :model="personalInfoForm"
            label-width="120px"
            size="large"
          >
            <div class="form-row">
              <el-form-item label="身高(cm)" class="form-item">
                <el-input v-model="personalInfoForm.height" type="number" placeholder="请输入身高" />
              </el-form-item>
              <el-form-item label="体重(kg)" class="form-item">
                <el-input v-model="personalInfoForm.weight" type="number" placeholder="请输入体重" />
              </el-form-item>
              <el-form-item label="血型" class="form-item">
                <el-select v-model="personalInfoForm.bloodType" placeholder="请选择血型" style="width: 100%">
                  <el-option label="A型" value="A型" />
                  <el-option label="B型" value="B型" />
                  <el-option label="AB型" value="AB型" />
                  <el-option label="O型" value="O型" />
                  <el-option label="其他" value="其他" />
                </el-select>
              </el-form-item>
            </div>
            <el-form-item label="既往病史">
              <el-input
                v-model="personalInfoForm.medicalHistory"
                type="textarea"
                :rows="3"
                placeholder="无"
              />
            </el-form-item>
            <el-form-item label="过敏史">
              <el-input
                v-model="personalInfoForm.allergyHistory"
                type="textarea"
                :rows="3"
                placeholder="无"
              />
            </el-form-item>
            <el-form-item label="健康状况">
              <el-input
                v-model="personalInfoForm.healthStatus"
                type="textarea"
                :rows="3"
                placeholder="例如：行动不便，需轮椅辅助"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="护理服务" name="nursing">
          <div class="nursing-service-container">
            <div class="service-intro">
              <h3>护理服务套餐</h3>
              <p>为您提供个性化的护理服务</p>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('basic')
const personalInfoFormRef = ref(null)

// 模拟数据
const roomList = ref([
  { roomNumber: '101' },
  { roomNumber: '102' },
  { roomNumber: '103' },
  { roomNumber: '201' },
  { roomNumber: '202' }
])

const availableBeds = ref([
  { bedNumber: '1' },
  { bedNumber: '2' }
])

// 个人信息表单
const personalInfoForm = reactive({
  name: '',
  idCard: '',
  gender: '',
  age: '',
  phone: '',
  emergencyContact: '',
  emergencyPhone: '',
  entryDate: '',
  roomNumber: '',
  bedNumber: '',
  height: '',
  weight: '',
  bloodType: '',
  medicalHistory: '',
  allergyHistory: '',
  healthStatus: ''
})

// 表单验证规则
const personalInfoRules = {
  name: [
    { required: true, message: '请输入老人姓名', trigger: 'blur' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  age: [
    { required: true, message: '请输入年龄', trigger: 'blur' },
    { type: 'number', min: 1, max: 150, message: '年龄必须在1-150之间', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' }
  ],
  emergencyContact: [
    { required: true, message: '请输入紧急联系人', trigger: 'blur' }
  ],
  emergencyPhone: [
    { required: true, message: '请输入紧急联系电话', trigger: 'blur' }
  ],
  entryDate: [
    { required: true, message: '请选择入住日期', trigger: 'change' }
  ],
  roomNumber: [
    { required: true, message: '请选择房间号', trigger: 'change' }
  ],
  bedNumber: [
    { required: true, message: '请选择床位号', trigger: 'change' }
  ]
}

// 处理房间变更
const handleRoomChange = (roomNumber) => {
  // 这里可以根据房间号动态获取可用床位
  // 现在使用模拟数据
  availableBeds.value = [
    { bedNumber: '1' },
    { bedNumber: '2' }
  ]
  personalInfoForm.bedNumber = ''
}

onMounted(() => {
  // 从本地存储获取用户信息
  const name = localStorage.getItem('name')
  const username = localStorage.getItem('username')
  
  if (name) {
    personalInfoForm.name = name
  }
  if (username) {
    personalInfoForm.phone = username
  }
})
</script>

<style scoped>
.profile-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.profile-header {
  margin-bottom: 30px;
  text-align: center;
}

.profile-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.profile-header p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.profile-card {
  margin-bottom: 30px;
}

.profile-tabs {
  margin-top: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-item {
  flex: 1;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
  
  .profile-container {
    padding: 10px;
  }
  
  .profile-header h2 {
    font-size: 24px;
  }
}
</style>