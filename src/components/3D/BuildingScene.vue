<template>
  <div class="building-scene-container">
    <div ref="sceneRef" class="scene"></div>
    <div class="scene-controls">
      <el-button size="small" @click="toggleFloor">
        <el-icon><SwitchButton /></el-icon>
        {{ currentFloor === 1 ? '切换到2楼' : currentFloor === 2 ? '切换到3楼' : '切换到1楼' }}
      </el-button>
      <el-button size="small" @click="resetCamera">
        <el-icon><RefreshRight /></el-icon>
        重置视角
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { SwitchButton, RefreshRight } from '@element-plus/icons-vue';

const props = defineProps({
  residents: {
    type: Array,
    default: () => []
  }
});

const sceneRef = ref(null);
const currentFloor = ref(3);

let scene, camera, renderer, controls;
let floors = [];
let residentMarkers = [];
let animationId = null;

// 初始化Three.js场景
const initScene = () => {
  if (!sceneRef.value) return;

  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    sceneRef.value.clientWidth / sceneRef.value.clientHeight,
    0.1,
    1000
  );
  camera.position.set(10, 8, 10);
  camera.lookAt(0, 0, 0);

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(sceneRef.value.clientWidth, sceneRef.value.clientHeight);
  renderer.shadowMap.enabled = true;
  sceneRef.value.appendChild(renderer.domElement);

  // 添加轨道控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 5;
  controls.maxDistance = 30;
  controls.maxPolarAngle = Math.PI / 2 - 0.1;

  // 添加灯光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 20, 5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // 添加网格辅助线
  const gridHelper = new THREE.GridHelper(20, 20, 0xcccccc, 0xffffff);
  scene.add(gridHelper);

  // 创建楼层
  createFloors();

  // 创建老人标记
  updateResidentMarkers();

  // 开始动画循环
  animate();

  // 监听窗口大小变化
  window.addEventListener('resize', onWindowResize);
};

// 创建楼层
const createFloors = () => {
  // 清除现有楼层
  floors.forEach(floor => {
    scene.remove(floor);
  });
  floors = [];

  // 1楼
  const floor1 = createFloor(0, '1楼', 0x87CEEB);
  scene.add(floor1);
  floors.push(floor1);

  // 2楼
  const floor2 = createFloor(2, '2楼', 0xFFB6C1);
  scene.add(floor2);
  floors.push(floor2);

  // 3楼
  const floor3 = createFloor(3, '3楼', 0x98FB98);
  scene.add(floor3);
  floors.push(floor3);

  // 初始显示当前楼层
  toggleFloorVisibility();
};

// 创建单个楼层
  const createFloor = (height, label, color) => {
    const floorGroup = new THREE.Group();

    // 楼层平面
    const floorGeometry = new THREE.PlaneGeometry(15, 15);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: color, 
      opacity: 0.8, 
      transparent: true,
      side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = height;
    floor.receiveShadow = true;
    floorGroup.add(floor);

    // 楼层标签
    const labelCanvas = document.createElement('canvas');
    const ctx = labelCanvas.getContext('2d');
    labelCanvas.width = 256;
    labelCanvas.height = 64;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(0, 0, labelCanvas.width, labelCanvas.height);
    ctx.fillStyle = '#333';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, labelCanvas.width / 2, labelCanvas.height / 2 + 10);
    
    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    const labelMaterial = new THREE.SpriteMaterial({ map: labelTexture });
    const labelSprite = new THREE.Sprite(labelMaterial);
    labelSprite.position.set(0, height + 0.1, 0);
    labelSprite.scale.set(3, 0.75, 1);
    floorGroup.add(labelSprite);

    // 根据楼层高度计算楼层号：height为0是1楼，height为2是2楼，height为3是3楼
    const floorNumber = height === 0 ? 1 : height === 2 ? 2 : 3;
    
    // 创建房间，根据楼层号动态生成房间号
    const rooms = [
      { x: -5, z: -5, width: 4, depth: 4, number: `${floorNumber}01` },
      { x: 1, z: -5, width: 4, depth: 4, number: `${floorNumber}02` },
      { x: -5, z: 1, width: 4, depth: 4, number: `${floorNumber}03` },
      { x: 1, z: 1, width: 4, depth: 4, number: `${floorNumber}04` }
    ];

    rooms.forEach(room => {
      const roomGroup = new THREE.Group();
      
      // 房间墙壁
      const wallHeight = 2.5;
      const wallThickness = 0.1;
      
      // 后墙
      const backWall = createWall(
        room.x + room.width / 2, 
        height + wallHeight / 2, 
        room.z - room.depth / 2, 
        room.width, 
        wallHeight, 
        wallThickness
      );
      roomGroup.add(backWall);
      
      // 左墙
      const leftWall = createWall(
        room.x - room.width / 2, 
        height + wallHeight / 2, 
        room.z, 
        wallThickness, 
        wallHeight, 
        room.depth
      );
      roomGroup.add(leftWall);
      
      // 右墙
      const rightWall = createWall(
        room.x + room.width / 2, 
        height + wallHeight / 2, 
        room.z, 
        wallThickness, 
        wallHeight, 
        room.depth
      );
      roomGroup.add(rightWall);
      
      // 房间号码
      const roomNumberCanvas = document.createElement('canvas');
      const roomNumberCtx = roomNumberCanvas.getContext('2d');
      roomNumberCanvas.width = 128;
      roomNumberCanvas.height = 64;
      
      roomNumberCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      roomNumberCtx.fillRect(0, 0, roomNumberCanvas.width, roomNumberCanvas.height);
      roomNumberCtx.fillStyle = '#333';
      roomNumberCtx.font = 'bold 24px Arial';
      roomNumberCtx.textAlign = 'center';
      roomNumberCtx.fillText(room.number, roomNumberCanvas.width / 2, roomNumberCanvas.height / 2 + 8);
      
      const roomNumberTexture = new THREE.CanvasTexture(roomNumberCanvas);
      const roomNumberMaterial = new THREE.SpriteMaterial({ map: roomNumberTexture });
      const roomNumberSprite = new THREE.Sprite(roomNumberMaterial);
      roomNumberSprite.position.set(room.x, height + 2, room.z - room.depth / 2 - 0.5);
      roomNumberSprite.scale.set(1, 0.5, 1);
      roomGroup.add(roomNumberSprite);
      
      floorGroup.add(roomGroup);
    });

    return floorGroup;
  };

// 创建墙壁
const createWall = (x, y, z, width, height, depth) => {
  const wallGeometry = new THREE.BoxGeometry(width, height, depth);
  const wallMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    opacity: 0.9, 
    transparent: true
  });
  const wall = new THREE.Mesh(wallGeometry, wallMaterial);
  wall.position.set(x, y, z);
  wall.castShadow = true;
  wall.receiveShadow = true;
  return wall;
};

// 更新老人标记
const updateResidentMarkers = () => {
  // 清除现有标记
  residentMarkers.forEach(marker => {
    scene.remove(marker);
  });
  residentMarkers = [];

  // 添加新标记
  props.residents.forEach(resident => {
    // 只显示当前楼层的老人
    const roomFloor = parseInt(resident.room_number?.split('')[0] || '1');
    if (roomFloor !== currentFloor.value) return;

    const markerGroup = new THREE.Group();

    // 老人位置（简化为房间中心）
    // 获取房间号后两位来确定位置，忽略楼层号前缀
    const roomSuffix = resident.room_number?.slice(-2) || '01';
    const roomX = roomSuffix === '01' ? -3 : 
                 roomSuffix === '02' ? 3 :
                 roomSuffix === '03' ? -3 : 3;
    const roomZ = roomSuffix === '01' ? -3 : 
                 roomSuffix === '02' ? -3 :
                 roomSuffix === '03' ? 3 : 3;
    // 根据当前楼层设置高度：1楼height=0，2楼height=2，3楼height=3
    const height = currentFloor.value === 1 ? 0 : currentFloor.value === 2 ? 2 : 3;

    // 标记底座
    const baseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x409eff });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(roomX, height + 0.1, roomZ);
    markerGroup.add(base);

    // 标记顶部
    const topGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const riskColor = resident.risk_level === 'high' ? 0xf56c6c : 
                      resident.risk_level === 'medium' ? 0xe6a23c : 0x67c23a;
    const topMaterial = new THREE.MeshStandardMaterial({ color: riskColor });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.set(roomX, height + 0.4, roomZ);
    top.castShadow = true;
    markerGroup.add(top);

    // 老人姓名标签
    const nameCanvas = document.createElement('canvas');
    const nameCtx = nameCanvas.getContext('2d');
    nameCanvas.width = 128;
    nameCanvas.height = 32;
    
    nameCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    nameCtx.fillRect(0, 0, nameCanvas.width, nameCanvas.height);
    nameCtx.fillStyle = '#333';
    nameCtx.font = '14px Arial';
    nameCtx.textAlign = 'center';
    nameCtx.fillText(resident.name, nameCanvas.width / 2, 20);
    
    const nameTexture = new THREE.CanvasTexture(nameCanvas);
    const nameMaterial = new THREE.SpriteMaterial({ map: nameTexture });
    const nameSprite = new THREE.Sprite(nameMaterial);
    nameSprite.position.set(roomX, height + 0.7, roomZ);
    nameSprite.scale.set(1, 0.25, 1);
    markerGroup.add(nameSprite);

    scene.add(markerGroup);
    residentMarkers.push(markerGroup);
  });
};

// 切换楼层
const toggleFloor = () => {
  // 循环切换楼层：1→2→3→1
  currentFloor.value = currentFloor.value === 1 ? 2 : currentFloor.value === 2 ? 3 : 1;
  toggleFloorVisibility();
  updateResidentMarkers();
};

// 切换楼层可见性
const toggleFloorVisibility = () => {
  floors.forEach((floor, index) => {
    floor.visible = index === (currentFloor.value === 1 ? 0 : currentFloor.value === 2 ? 1 : 2);
  });
};

// 重置相机位置
const resetCamera = () => {
  camera.position.set(10, 8, 10);
  camera.lookAt(0, currentFloor.value, 0);
  controls.reset();
};

// 窗口大小变化处理
const onWindowResize = () => {
  if (!sceneRef.value || !camera || !renderer) return;
  
  camera.aspect = sceneRef.value.clientWidth / sceneRef.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(sceneRef.value.clientWidth, sceneRef.value.clientHeight);
};

// 动画循环
const animate = () => {
  animationId = requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};

// 监听老人数据变化
watch(() => props.residents, () => {
  updateResidentMarkers();
}, { deep: true });

// 初始化
onMounted(() => {
  initScene();
});

// 清理资源
onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  window.removeEventListener('resize', onWindowResize);
  if (controls) {
    controls.dispose();
  }
  if (renderer) {
    renderer.dispose();
  }
  if (sceneRef.value && sceneRef.value.children.length > 0) {
    sceneRef.value.innerHTML = '';
  }
});
</script>

<style scoped>
.building-scene-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.scene {
  width: 100%;
  height: 100%;
}

.scene-controls {
  position: absolute;
  bottom: 16px;
  left: 16px;
  display: flex;
  gap: 8px;
  z-index: 10;
}

.scene-controls .el-button {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid #dcdfe6;
}
</style>
