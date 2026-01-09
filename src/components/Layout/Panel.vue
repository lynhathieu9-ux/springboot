<template>
  <div class="panel-container" :style="customStyle">
    <div class="panel-header" v-if="title">
      <h3 class="panel-title">{{ title }}</h3>
      <slot name="header-extra"></slot>
    </div>
    <div class="panel-body">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: 'auto'
  },
  borderColor: {
    type: String,
    default: '#409eff'
  }
});

const customStyle = computed(() => {
  return {
    height: props.height,
    '--border-color': props.borderColor
  };
});
</script>

<style scoped>
.panel-container {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color, #409eff);
  overflow: hidden;
  transition: all 0.3s ease;
}

.panel-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--border-color, #409eff), transparent);
}

.panel-container:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--border-color, #409eff);
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.panel-body {
  position: relative;
  width: 100%;
  height: calc(100% - 50px);
  overflow: hidden;
}
</style>
