import { ref, onMounted, onUnmounted } from 'vue';
import { generateRealTimeData } from '../mock/database';

/**
 * 模拟WebSocket钩子，用于生成实时数据
 * @param {Object} options - 配置选项
 * @param {number} options.interval - 数据更新间隔（毫秒），默认3000
 * @param {Array} options.initialData - 初始数据数组
 * @returns {Object} 包含实时数据和连接状态
 */
export const useSocket = (options = {}) => {
  const {
    interval = 3000,
    initialData = []
  } = options;

  const isConnected = ref(false);
  const realTimeData = ref([...initialData]);
  let timer = null;

  // 模拟WebSocket连接
  const connect = () => {
    // 模拟连接延迟
    setTimeout(() => {
      isConnected.value = true;
      startDataSimulation();
    }, 500);
  };

  // 断开连接
  const disconnect = () => {
    isConnected.value = false;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  // 开始模拟数据更新
  const startDataSimulation = () => {
    if (timer) {
      clearInterval(timer);
    }

    timer = setInterval(() => {
      // 更新每条数据
      realTimeData.value = realTimeData.value.map(item => {
        return generateRealTimeData(item);
      });
    }, interval);
  };

  // 发送消息（模拟）
  const sendMessage = (message) => {
    if (!isConnected.value) {
      console.warn('WebSocket not connected');
      return;
    }
    console.log('Sending message:', message);
    // 模拟发送成功
    return Promise.resolve({ success: true });
  };

  // 初始化连接
  onMounted(() => {
    connect();
  });

  // 组件卸载时断开连接
  onUnmounted(() => {
    disconnect();
  });

  return {
    isConnected,
    realTimeData,
    connect,
    disconnect,
    sendMessage
  };
};

/**
 * 用于单条数据的实时更新钩子
 * @param {Object} options - 配置选项
 * @param {number} options.interval - 数据更新间隔（毫秒），默认3000
 * @param {Object} options.initialData - 初始数据
 * @returns {Object} 包含实时数据和连接状态
 */
export const useSingleSocketData = (options = {}) => {
  const {
    interval = 3000,
    initialData = {}
  } = options;

  const isConnected = ref(false);
  const data = ref({ ...initialData });
  let timer = null;

  const connect = () => {
    setTimeout(() => {
      isConnected.value = true;
      startDataSimulation();
    }, 500);
  };

  const disconnect = () => {
    isConnected.value = false;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  const startDataSimulation = () => {
    if (timer) {
      clearInterval(timer);
    }

    timer = setInterval(() => {
      data.value = generateRealTimeData(data.value);
    }, interval);
  };

  onMounted(() => {
    connect();
  });

  onUnmounted(() => {
    disconnect();
  });

  return {
    isConnected,
    data,
    connect,
    disconnect
  };
};
