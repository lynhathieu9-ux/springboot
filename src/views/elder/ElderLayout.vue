<template>
  <div class="elder-layout">
    <!-- 侧边栏 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h2>东软颐养中心</h2>
      </div>

      <div class="sidebar-menu">
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          background-color="#fff"
          text-color="#333"
          active-text-color="#7D9D86"
          router
          @select="handleMenuSelect"
        >
          <el-menu-item index="/elder/home">
            <el-icon class="menu-icon"><House /></el-icon>
            <span>首页</span>
          </el-menu-item>

          <el-menu-item index="/elder/profile">
            <el-icon class="menu-icon"><UserFilled /></el-icon>
            <span>个人信息</span>
          </el-menu-item>

          <el-menu-item index="/elder/service/packages">
            <el-icon class="menu-icon"><ShoppingCart /></el-icon>
            <span>护理服务订购</span>
          </el-menu-item>

          <el-menu-item index="/elder/diet-calendar">
            <el-icon class="menu-icon"><Calendar /></el-icon>
            <span>膳食日历</span>
          </el-menu-item>

          <!-- ✅ 唯一 AI 入口 -->
          <el-menu-item index="/elder/ai-chat">
            <el-icon class="menu-icon"><ChatLineRound /></el-icon>
            <span>智慧助手</span>
          </el-menu-item>

          <el-sub-menu index="/elder/health-monitoring">
            <template #title>
              <el-icon class="menu-icon"><DataAnalysis /></el-icon>
              <span>每日健康指标</span>
            </template>
            <el-menu-item index="/elder/health-monitoring/daily">
              日常健康检测
            </el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="/elder/nursing">
            <template #title>
              <el-icon class="menu-icon"><Bell /></el-icon>
              <span>护理与服务管理</span>
            </template>
            <el-menu-item index="/elder/nursing/levels">护理等级</el-menu-item>
            <el-menu-item index="/elder/nursing/contents">护理内容</el-menu-item>
            <el-menu-item index="/elder/nursing/records">护理记录</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="/elder/service">
            <template #title>
              <el-icon class="menu-icon"><ShoppingCart /></el-icon>
              <span>生活服务管理</span>
            </template>
            <el-menu-item index="/elder/service/packages">
              服务套餐
            </el-menu-item>
            <el-menu-item index="/elder/service/purchase">
              购买记录
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>

      <div class="sidebar-footer">
        <el-button type="primary" plain class="logout-btn" @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          <span>退出登录</span>
        </el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <div class="top-nav">
        <div class="nav-left">
        </div>

        <div class="nav-right">
          <div class="avatar-container">
            <span class="user-greeting">
              {{ timeState }}，{{ userName }}
            </span>
            
            <el-dropdown class="avatar-wrapper" trigger="click" @command="handleCommand">
              <div class="avatar-box">
                <el-avatar size="30" icon="UserFilled" />
                <el-icon class="el-icon--right"><CaretBottom /></el-icon>
              </div>
              <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
            </el-dropdown>
          </div>
        </div>
      </div>

      <div class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  House,
  UserFilled,
  DataAnalysis,
  Bell,
  ShoppingCart,
  ArrowDown,
  SwitchButton,
  Calendar,
  ChatLineRound,
  CaretBottom
} from '@element-plus/icons-vue'

// 定义当前时间对应的问候语
const timeState = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 17) return '下午好'
  if (hour < 19) return '傍晚好'
  return '晚上好'
})

// 获取用户姓名
const userName = ref('用户')

onMounted(() => {
  // 1. 尝试获取真实姓名
  const name = localStorage.getItem('name')
  // 2. 获取账号（手机号）
  const username = localStorage.getItem('username')
  
  // 3. 优先显示姓名，如果没有姓名才显示手机号
  // 注意：这里必须保证你在 Login.vue 里存了 'name'
  userName.value = name && name !== 'null' ? name : (username || '用户')
})

const router = useRouter()
const route = useRoute()

const activeMenu = ref('/elder/home')
const userInitial = computed(() => userName.value.charAt(0))

const handleMenuSelect = (key) => {
  activeMenu.value = key
}

const handleLogout = () => {
  localStorage.clear()
  router.push('/login')
}

const handleCommand = (command) => {
  if (command === 'logout') {
    handleLogout()
  }
}

watch(
  () => route.path,
  (newPath) => {
    activeMenu.value = newPath
  },
  { immediate: true }
)


</script>

<style scoped>
.elder-layout {
  display: flex;
  height: 100vh;
}
.sidebar {
  width: 240px;
  background: #ffffff;
  border-right: 1px solid #eee;
}
.sidebar-header {
  padding: 20px;
  text-align: center;
}
.menu-icon {
  margin-right: 10px;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.top-nav {
  height: 60px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}
.content {
  flex: 1;
  padding: 20px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 顶部导航栏样式 */
.avatar-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-greeting {
  margin-right: 15px;
  font-size: 16px;
  color: #333;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}

.avatar-wrapper {
  cursor: pointer;
}

.avatar-box {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
}

.el-icon--right {
  font-size: 14px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
</style>
