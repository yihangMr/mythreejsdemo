<script setup>
/**
   物体变换系统  position  rotation  scale
                位置      旋转       缩放
*/


import { ref, onMounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js' // 交互控制器引入
const screenDom = ref(null);

let scene = null; // 场景
let camera = null; // 摄像机
let controls = null; // 控制器
let cube = null; // 物体 Mesh  网格对象
onMounted(()=>{
    scene = new THREE.Scene(); 
    camera = new THREE.PerspectiveCamera( 
        75, 
        screenDom.value.clientWidth / screenDom.value.clientHeight, 
        0.1, 
        1000
    );
    camera.position.z = 5;
    // camera.position.x = 5;
    camera.position.y = 5;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(screenDom.value.clientWidth, screenDom.value.clientHeight);
    screenDom.value.appendChild(renderer.domElement);
    controls = new OrbitControls(
        camera,
        renderer.domElement 
    );
    const geometry = new THREE.BoxGeometry(1, 1, 1); // 创建一个立方体几何体（网格的基础形状）：
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 0.1, metalness: 0.5 });
    cube = new THREE.Mesh(geometry, material);  // 将几何体和材质组合成网格对象
    const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
    directionalLight.position.set(5, 5, 5);  // 这里设置光源的位置
    scene.add(directionalLight);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);
    cube.position.set(2, 2, 2);
    scene.add(cube);
    // 坐标辅助器
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    const animate = () => {
        requestAnimationFrame(animate);
        // 旋转动画  rotation
        // cube.rotation.x += 0.01;
        // cube.rotation.y += 0.01;
        // cube.rotation.z += 0.01;
        // 位置的动画position
        // cube.position.y = Math.sin(Date.now() * 0.001);
        //缩放相关的
        const t = Date.now() * 0.001;
        const s = Math.sin(t) * 0.5 + 2;
        cube.scale.set(s, s, s);

        controls.update(); // 让 controls 计算这一帧摄像机应该在哪
        renderer.render(scene, camera);
    }
    animate();
    window.addEventListener('resize', () => {
        const width = screenDom.value.clientWidth;
        const height = screenDom.value.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
})
</script>
<template>
    <div class="three_view" ref="screenDom">

    </div>
</template>

<style scoped lang="less">
.btn_view{
    position: fixed;
    top: 10px;
    background-color: aqua;
    .btn{
        cursor: pointer;
        user-select: none;
    }
}   
.btn_view_2{
    position: fixed;
    top: 10px;
    left: 100px;
    background-color: aqua;
    .btn{
        cursor: pointer;
        user-select: none;
    }
}
.three_view{
    width: 100%;
    height: 100%;
    background-color: #000; /* 通常 3D 场景背景设为黑色或透明 */
}
</style>>

