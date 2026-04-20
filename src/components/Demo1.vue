<script setup>
/**
    基础的场景，相机，物体，渲染器，光源，材质
*/


import { ref, onMounted } from 'vue';
import * as THREE from 'three';
const screenDom = ref(null);


onMounted(()=>{
    // --- 2. 初始化场景 ---
    const scene = new THREE.Scene(); 
    // --- 3. 初始化相机 ---
    // 参数：视野角度, 宽高比, 近裁剪面, 远裁剪面
    const camera = new THREE.PerspectiveCamera( 
        75, 
        screenDom.value.clientWidth / screenDom.value.clientHeight, 
        0.1, 
        1000
    );
    camera.position.z = 5;
    // --- 4. 初始化渲染器 ---
    /**
     * antialias 开启抗锯齿
     * alpha 启用透明背景，渲染器的背景将是透明的，可以看到下方的页面内容
     */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(screenDom.value.clientWidth, screenDom.value.clientHeight);
    // 将渲染器的 canvas 添加到 DOM 中
    screenDom.value.appendChild(renderer.domElement);
    // --- 5. 添加一个简单的物体（如：正方体） ---
    const geometry = new THREE.BoxGeometry(1, 1, 1); // 创建一个立方体几何体（网格的基础形状）：
    
    // 标准材质 roughness粗糙度，metalness金属度
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 0.1, metalness: 0.5 });
    const cube = new THREE.Mesh(geometry, material);  // 将几何体和材质组合成网格对象

    // 光源
    const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
    directionalLight.position.set(5, 5, 5);  // 这里设置光源的位置
    scene.add(directionalLight);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    scene.add(cube);

    // --- 6. 动画渲染循环 ---
    const animate = () => {
        requestAnimationFrame(animate);    
        // 让方块转动起来
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        renderer.render(scene, camera);
    };

    animate();

    // --- 7. 监听窗口大小变化 ---
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

<style scoped>
.three_view{
    width: 100%;
    height: 100%;
    background-color: #000; /* 通常 3D 场景背景设为黑色或透明 */
}
</style>>

