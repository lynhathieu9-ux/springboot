<template>
  <div class="login-container">
    <div class="login-left">
      <img
        src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=1920&auto=format&fit=crop"
        alt="温馨养老"
      />
      <div class="image-overlay">
        <h2>东软颐养中心</h2>
        <p>专业照护 · 温暖如家 · 安享晚年</p>
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
            <h3>欢迎回来</h3>
            <p>请登录您的账号以继续服务</p>
          </div>

          <el-form ref="loginFormRef" :model="loginForm" :rules="rules" size="large">
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入手机号/账号"
                prefix-icon="User"
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
                prefix-icon="Lock"
              />
            </el-form-item>

            <el-button type="primary" class="login-btn" @click="handleLogin" :loading="loading">
              立即进入
            </el-button>
            
            <div class="form-footer-links">
                <el-link type="primary" :underline="false" @click="goToRegister">注册家属账号</el-link>
            </div>
          </el-form>
        </div>

        <div class="login-footer">
          <p>登录遇到问题？</p>
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
import { User, Lock, HomeFilled, Phone } from '@element-plus/icons-vue'
// 假设你有一个封装好的 request 工具，如果没有，请替换为你自己的 axios 调用方式
import request from '@/utils/request'

const router = useRouter()
const loading = ref(false)
const loginFormRef = ref(null)

const loginForm = reactive({
  username: '',
  password: ''
})

// 自定义校验规则
const validateAccount = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请输入账号'))
  }
  const isPhone = /^1[3-9]\d{9}$/.test(value)
  if (value === 'admin' || isPhone) {
    callback()
  } else {
    callback(new Error('请输入正确的手机号或admin'))
  }
}

const rules = {
  username: [{ validator: validateAccount, trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = () => {
  loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      // 发送登录请求
      request.post('/auth/login', loginForm).then(res => {
        if (res.data && res.data.success) {
          ElMessage.success('登录成功')
          
          // 存储 Token 和用户信息
          localStorage.setItem('token', res.data.data.token)
          localStorage.setItem('username', res.data.data.username)
          localStorage.setItem('name', res.data.data.name || '')
          localStorage.setItem('role', res.data.data.role || 'admin')
          localStorage.setItem('userType', res.data.data.role || 'admin')
          localStorage.setItem('userId', res.data.data.id || '')

          // 核心逻辑：根据角色跳转
          const role = res.data.data.role || 'admin'
          if (role === 'admin') {
            router.push('/rooms') // 管理端路径
          } else if (role === 'elder') {
            router.push('/elder/home')      // 老人端路径
          } else {
            // 默认跳转
            router.push('/')
          }
        } else {
          ElMessage.error(res.msg || '登录失败')
        }
      }).catch(err => {
        console.error('登录失败:', err)
        // 尝试从错误响应中获取具体的错误信息
        let errorMsg = '登录失败，请重试'
        if (err.response?.data?.message) {
          errorMsg = err.response.data.message
        } else if (err.response?.data?.msg) {
          errorMsg = err.response.data.msg
        } else if (err.response?.data?.success === false && err.response?.data?.message) {
          errorMsg = err.response.data.message
        } else if (err.response?.data) {
          errorMsg = JSON.stringify(err.response.data)
        } else if (err.message) {
          errorMsg = err.message
        }
        ElMessage.error(errorMsg)
      }).finally(() => {
        loading.value = false
      })
    }
  })
}

// 跳转到注册页面
const goToRegister = () => {
  // 修改为：跳转到路由配置好的 /register 路径
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/* 左侧样式 */
.login-left {
  flex: 1.5; /* 占比 60% */
  position: relative;
  background-color: #f0f0f0;
}

.login-left img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  bottom: 10%;
  left: 10%;
  color: white;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.image-overlay h2 {
  font-size: 3rem;
  margin-bottom: 10px;
  font-weight: 300;
}

.image-overlay p {
  font-size: 1.2rem;
  opacity: 0.9;
}

/* 右侧整体布局：改为 Flex 列布局，撑满高度 */
.login-right {
  flex: 1; /* 占比 40% */
  background-color: #FAF9F6; /* 米色背景 */
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative; /* 为绝对定位做准备 */
}

.right-content-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center; /* 垂直居中 */
  align-items: center;
  padding: 40px;
  box-sizing: border-box;
}

/* 1. 顶部 Header 样式 */
.login-header {
  position: absolute;
  top: 40px;
  right: 40px; /* 放在右上角，或者居中都可以 */
  display: flex;
  align-items: center;
  gap: 10px;
  opacity: 0.8;
}

.app-name {
  font-size: 18px;
  font-weight: bold;
  color: #5a5a5a;
  letter-spacing: 1px;
}

/* 2. 中间卡片样式 (核心修改) */
.form-card {
  width: 100%;
  max-width: 420px;
  background: #FFFFFF; /* 纯白背景 */
  padding: 50px 40px;
  border-radius: 20px; /* 大圆角 */
  /* 柔和的投影，制造悬浮感 */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
}

.welcome-text {
  text-align: center; /* 居中对齐 */
  margin-bottom: 30px;
}

.welcome-text h3 {
  font-size: 26px; /* 字号加大 */
  color: #333;
  margin-bottom: 8px;
  font-weight: 600;
}

.welcome-text p {
  color: #999;
  font-size: 14px;
}

.form-footer-links {
    display: flex;
    justify-content: flex-end;
    margin-top: 15px;
    padding: 0 5px;
}

/* 3. 底部 Footer 样式 */
.login-footer {
  position: absolute;
  bottom: 30px;
  text-align: center;
  color: #909399;
  font-size: 13px;
}

.login-footer .phone {
  color: #7D9D86; /* 使用主色调 */
  font-weight: bold;
  font-size: 16px;
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
  justify-content: center;
}

/* 覆盖 Element UI 默认样式，使其更温馨 */
:deep(.el-input__wrapper) {
  border-radius: 8px;
  background-color: #F0F0F0; /* 浅灰底色 */
  box-shadow: none;
  padding: 10px 15px;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #7D9D86; /* 聚焦时的莫兰迪绿 */
}

.login-btn {
  width: 100%;
  margin-top: 20px;
  height: 50px;
  font-size: 16px;
  border-radius: 8px;
  background-color: #7D9D86; /* 主色调：莫兰迪绿 */
  border-color: #7D9D86;
  font-weight: bold;
  letter-spacing: 1px;
}

.login-btn:hover {
  background-color: #6C8A75;
  border-color: #6C8A75;
}
</style>