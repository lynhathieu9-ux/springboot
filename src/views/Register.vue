<template>
  <div class="login-container">
    <div class="login-left">
      <img
        src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=1920&auto=format&fit=crop"
        alt="温馨养老"
      />
      <div class="image-overlay">
        <h2>加入东软颐养</h2>
        <p>为您的家人开启专业照护之旅</p>
      </div>
    </div>

    <div class="login-right">
      <div class="right-content-container">
        
        <div class="login-header">
           <el-icon :size="40" color="#7D9D86"><HomeFilled /></el-icon>
           <span class="app-name">智慧养老</span>
        </div>

        <div class="form-card">
          <div class="welcome-text">
            <h3>创建账号</h3>
            <p>请填写以下信息完成注册</p>
          </div>

          <el-form ref="registerFormRef" :model="registerForm" :rules="rules" size="large">
            <el-form-item prop="name">
              <el-input
                v-model="registerForm.name"
                placeholder="请输入老人姓名"
                prefix-icon="User"
              />
            </el-form-item>

            <el-form-item prop="username">
              <el-input
                v-model="registerForm.username"
                placeholder="请输入手机号"
                prefix-icon="Iphone"
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="设置密码"
                show-password
                prefix-icon="Lock"
              />
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请再次确认密码"
                show-password
                prefix-icon="Lock"
              />
            </el-form-item>

            <el-button type="primary" class="login-btn" @click="handleRegister" :loading="loading">
              立即注册
            </el-button>
            
            <div class="form-footer-links" style="justify-content: center;">
                <span style="color: #999; margin-right: 5px;">已有账号？</span>
                <el-link type="primary" :underline="false" @click="goToLogin">直接登录</el-link>
            </div>
          </el-form>
        </div>

        <div class="login-footer">
          <p>注册遇到问题？</p>
          <p class="phone">
            <el-icon><Phone /></el-icon> 24小时服务热线：400-888-9999
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Iphone, Lock, HomeFilled, Phone, User } from '@element-plus/icons-vue'
import request from '@/utils/request'

const router = useRouter()
const loading = ref(false)
const registerFormRef = ref(null)

const registerForm = reactive({
  name: '',
  username: '',
  password: '',
  confirmPassword: ''
})

// 校验两次密码是否一致
const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const rules = {
  name: [
    { required: true, message: '请输入老人姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validatePass2, trigger: 'blur' }
  ]
}

const handleRegister = () => {
  registerFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      
      // 构造发送给后端的数据（包含老人姓名）
      const dataToSend = {
          name: registerForm.name,
          username: registerForm.username,
          password: registerForm.password,
          role: 'elder' // 默认为家属/老人端注册，如果后端自动判定可不传
      }

      // 假设后端注册接口为 /auth/register
      request.post('/auth/register', dataToSend).then(res => {
        if (res.data && res.data.success) {
          ElMessage.success('注册成功，请登录')
          // 注册成功后跳转回登录页
          router.push('/login')
        } else {
          ElMessage.error(res.msg || '注册失败')
        }
      }).catch(err => {
         console.error(err)
         ElMessage.error(err.response?.data?.msg || '注册服务异常')
      }).finally(() => {
        loading.value = false
      })
    }
  })
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
/* 这里完全复用 Login.vue 的样式，保持视觉统一 */
.login-container { display: flex; height: 100vh; width: 100vw; overflow: hidden; }
.login-left { flex: 1.5; position: relative; background-color: #f0f0f0; }
.login-left img { width: 100%; height: 100%; object-fit: cover; }
.image-overlay { position: absolute; bottom: 10%; left: 10%; color: white; text-shadow: 0 2px 10px rgba(0,0,0,0.3); }
.image-overlay h2 { font-size: 3rem; margin-bottom: 10px; font-weight: 300; }
.image-overlay p { font-size: 1.2rem; opacity: 0.9; }

.login-right { flex: 1; background-color: #FAF9F6; display: flex; justify-content: center; align-items: center; position: relative; }
.right-content-container { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 40px; box-sizing: border-box; }

.login-header { position: absolute; top: 40px; right: 40px; display: flex; align-items: center; gap: 10px; opacity: 0.8; }
.app-name { font-size: 18px; font-weight: bold; color: #5a5a5a; letter-spacing: 1px; }

.form-card { width: 100%; max-width: 420px; background: #FFFFFF; padding: 50px 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04); }

.welcome-text { text-align: center; margin-bottom: 30px; }
.welcome-text h3 { font-size: 26px; color: #333; margin-bottom: 8px; font-weight: 600; }
.welcome-text p { color: #999; font-size: 14px; }

.form-footer-links { display: flex; justify-content: flex-end; margin-top: 15px; padding: 0 5px; }

.login-footer { position: absolute; bottom: 30px; text-align: center; color: #909399; font-size: 13px; }
.login-footer .phone { color: #7D9D86; font-weight: bold; font-size: 16px; margin-top: 5px; display: flex; align-items: center; gap: 5px; justify-content: center; }

:deep(.el-input__wrapper) { border-radius: 8px; background-color: #F0F0F0; box-shadow: none; padding: 10px 15px; }
:deep(.el-input__wrapper.is-focus) { box-shadow: 0 0 0 1px #7D9D86; }

.login-btn { width: 100%; margin-top: 20px; height: 50px; font-size: 16px; border-radius: 8px; background-color: #7D9D86; border-color: #7D9D86; font-weight: bold; letter-spacing: 1px; }
.login-btn:hover { background-color: #6C8A75; border-color: #6C8A75; }
</style>