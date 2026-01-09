<template>
  <div class="location-map-container">
    <div ref="mapRef" class="map"></div>
    <div class="map-legend">
      <div class="legend-item">
        <span class="legend-marker high"></span>
        <span class="legend-label">高危老人</span>
      </div>
      <div class="legend-item">
        <span class="legend-marker medium"></span>
        <span class="legend-label">中危老人</span>
      </div>
      <div class="legend-item">
        <span class="legend-marker low"></span>
        <span class="legend-label">低危老人</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  residents: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: '老人实时位置监测'
  }
});

const mapRef = ref(null);
let mapInstance = null;

// 模拟地图数据（简化为社区平面图）
const mapData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: '养老院主楼' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [100, 100], [200, 100], [200, 200], [100, 200], [100, 100]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: '花园' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [200, 100], [300, 100], [300, 200], [200, 200], [200, 100]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: '活动中心' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [100, 200], [200, 200], [200, 300], [100, 300], [100, 200]
        ]]
      }
    }
  ]
};

// 初始化地图
const initMap = () => {
  if (!mapRef.value) return;

  mapInstance = echarts.init(mapRef.value);
  
  // 注册地图
  echarts.registerMap('nursingHome', mapData);
  
  updateMap();

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    mapInstance?.resize();
  });
};

// 更新地图
const updateMap = () => {
  if (!mapInstance) return;

  // 生成老人位置数据
  const residentLocations = props.residents.map(resident => {
    // 模拟位置（简化为随机分布在地图上）
    const randomX = 150 + Math.random() * 100;
    const randomY = 150 + Math.random() * 100;
    
    return {
      name: resident.name,
      value: [randomX, randomY, resident.age],
      riskLevel: resident.risk_level,
      roomNumber: resident.room_number,
      bedNumber: resident.bed_number
    };
  });

  const option = {
    title: {
      text: props.title,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        if (params.dataType === 'geo') {
          return `
            <div style="padding: 10px;">
              <div style="font-weight: bold; margin-bottom: 5px;">${params.name}</div>
              <div>年龄：${params.value[2]}岁</div>
              <div>房间号：${params.data.roomNumber}</div>
              <div>床位号：${params.data.bedNumber}</div>
              <div>风险等级：${params.data.riskLevel === 'high' ? '高危' : params.data.riskLevel === 'medium' ? '中危' : '低危'}</div>
            </div>
          `;
        }
        return params.name;
      }
    },
    geo: {
      map: 'nursingHome',
      roam: true,
      zoom: 1.5,
      center: [150, 150],
      label: {
        show: true,
        color: '#333',
        fontSize: 12
      },
      itemStyle: {
        areaColor: '#f0f9eb',
        borderColor: '#67c23a',
        borderWidth: 2
      },
      emphasis: {
        itemStyle: {
          areaColor: '#e1f3d8'
        }
      },
      regions: [
        {
          name: '养老院主楼',
          itemStyle: {
            areaColor: '#e6f4ff'
          }
        },
        {
          name: '花园',
          itemStyle: {
            areaColor: '#f0f9eb'
          }
        },
        {
          name: '活动中心',
          itemStyle: {
            areaColor: '#fffbe6'
          }
        }
      ]
    },
    series: [
      {
        type: 'scatter',
        coordinateSystem: 'geo',
        data: residentLocations,
        symbolSize: function(val) {
          return 15 + val[2] / 10;
        },
        label: {
          show: true,
          formatter: '{b}',
          position: 'top',
          fontSize: 10,
          color: '#333'
        },
        itemStyle: {
          color: function(params) {
            const riskColorMap = {
              high: '#f56c6c',
              medium: '#e6a23c',
              low: '#67c23a'
            };
            return riskColorMap[params.data.riskLevel] || '#409eff';
          },
          opacity: 0.8,
          borderColor: '#fff',
          borderWidth: 2
        },
        emphasis: {
          itemStyle: {
            opacity: 1,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut'
      }
    ]
  };

  mapInstance.setOption(option, true);
};

// 监听老人数据变化
watch(() => props.residents, () => {
  updateMap();
}, { deep: true });

// 初始化
onMounted(() => {
  initMap();
});

// 清理资源
onUnmounted(() => {
  window.removeEventListener('resize', () => {
    mapInstance?.resize();
  });
  mapInstance?.dispose();
});
</script>

<style scoped>
.location-map-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.map {
  width: 100%;
  height: 100%;
}

.map-legend {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  font-size: 12px;
  z-index: 10;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.legend-item:last-child {
  margin-bottom: 0;
}

.legend-marker {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.legend-marker.high {
  background: #f56c6c;
}

.legend-marker.medium {
  background: #e6a23c;
}

.legend-marker.low {
  background: #67c23a;
}

.legend-label {
  color: #333;
}
</style>
