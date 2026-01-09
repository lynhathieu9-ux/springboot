import { ref, onMounted, onUnmounted } from 'vue';

/**
 * 大屏适配钩子
 * @param {Object} options - 配置选项
 * @param {number} options.designWidth - 设计稿宽度，默认1920
 * @param {number} options.designHeight - 设计稿高度，默认1080
 * @param {string} options.containerSelector - 容器选择器，默认body
 * @returns {Object} 包含缩放比例和重置方法
 */
export const useResize = (options = {}) => {
  const {
    designWidth = 1920,
    designHeight = 1080,
    containerSelector = 'body'
  } = options;

  const scale = ref(1);
  let container = null;
  let resizeObserver = null;

  // 计算缩放比例
  const calculateScale = () => {
    if (!container) return;

    const clientWidth = window.innerWidth;
    const clientHeight = window.innerHeight;

    // 计算宽高缩放比例
    const scaleX = clientWidth / designWidth;
    const scaleY = clientHeight / designHeight;

    // 取较小值，保证内容完整显示
    const newScale = Math.min(scaleX, scaleY);
    scale.value = newScale;

    // 应用缩放变换
    container.style.transform = `scale(${newScale})`;
    container.style.transformOrigin = 'top left';

    // 调整容器大小，使其内容居中
    container.style.width = `${designWidth}px`;
    container.style.height = `${designHeight}px`;
  };

  // 初始化
  const init = () => {
    container = document.querySelector(containerSelector);
    if (!container) return;

    // 设置容器样式
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.style.margin = '0 auto';

    // 初始计算
    calculateScale();

    // 使用ResizeObserver监听窗口大小变化
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(calculateScale);
      resizeObserver.observe(document.body);
    } else {
      // 兼容不支持ResizeObserver的浏览器
      window.addEventListener('resize', calculateScale);
    }
  };

  // 清除监听
  const cleanup = () => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    } else {
      window.removeEventListener('resize', calculateScale);
    }

    if (container) {
      container.style.transform = '';
      container.style.transformOrigin = '';
      container.style.width = '';
      container.style.height = '';
      container.style.position = '';
      container.style.overflow = '';
      container.style.margin = '';
      container = null;
    }
  };

  onMounted(() => {
    init();
  });

  onUnmounted(() => {
    cleanup();
  });

  return {
    scale,
    reset: calculateScale
  };
};
