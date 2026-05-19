<script setup>
/**
   GLTFLoader 模型引入
*/


import { ref, onMounted,onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js' // 交互控制器引入
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const screenDom = ref(null);

let scene = null; // 场景
let camera = null; // 摄像机
let controls = null; // 控制器
let renderer = null;
let animationFrameId = null; // 2. 用于记录动画 ID，方便停止
// 初始化场景相机
const initSceneAndCamera = () => {
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
}

// 初始化renderer
const initRenderer = () => {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(screenDom.value.clientWidth, screenDom.value.clientHeight);
    screenDom.value.appendChild(renderer.domElement);
}

// 初始化交互控制器
const initOrbitControls = () => {
    controls = new OrbitControls(
        camera,
        renderer.domElement 
    );
} 

// 创建一个立方体，并添加到场景中
const createCube = () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1); // 创建一个立方体几何体（网格的基础形状）：
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 0.1, metalness: 0.5 });
    let cube = new THREE.Mesh(geometry, material);  // 将几何体和材质组合成网格对象
    // cube.position.set(2, 2, 2);
    // scene.add(cube);
    return cube;
}

const setLight = () => {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
    directionalLight.position.set(5, 5, 5);  // 这里设置光源的位置
    scene.add(directionalLight);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);
}

const loadingModel = (path) => {
    // let _model = null;
    // 模型加载
    const loader = new GLTFLoader();
    loader.load(
        path, // 模型的路径 (根据你实际的文件名修改)
        (gltf) => {
            // 成功回调
            const model = gltf.scene;
            
            // 可以根据模型实际大小缩放或调整位置
            // model.scale.set(1, 1, 1); 
            model.position.set(8, 0, 3);

            // ---- 3. 超高频考点：模型遍历 (traverse) ----
            // 外部模型往往由成百上千个小网格(Mesh)组合而成，我们要批量修改它们
            model.traverse((child) => {
                if (child.isMesh) {
                    // 打印看看模型内部都由什么组成
                    console.log('检测到子网格:', child.name); 
                    
                    // 示例：给模型所有部件开启接收和投射阴影
                    child.castShadow = true;
                    child.receiveShadow = true;

                    // 进阶示例（可选）：如果你想统一换成写死的新材质，可以取消注释下面这行
                    // child.material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
                }
            });

            // 将加载好的模型放入场景中
            scene.add(model);
            // _model = model;
            console.log('模型加载成功！', gltf);
        },
        (xhr) => {
            // 加载进度回调
            console.log(`模型加载进度: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
        },
        (error) => {
            // 错误回调
            console.error('模型加载失败，请检查路径或文件是否损坏', error);
        }
    );
}

onMounted(()=>{
    initSceneAndCamera();  // 初始化场景相机
    initRenderer();  // 初始化renderer
    initOrbitControls(); // 初始化交互控制器
    let cube = createCube();  // 创建一个几何物体
    cube.position.set(2, 2, 2);
    scene.add(cube);
    setLight(); // 设置光源    
    // 坐标辅助器
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    loadingModel('/models/feiji.glb'); // 加载模型
    
    autoDraw(); // 启动渲染循环，让画面动起来
    autoZoom(); // 启动窗口自适应
    
    
})

const autoDraw = () => {
    const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        controls.update(); // 让 controls 计算这一帧摄像机应该在哪
        renderer.render(scene, camera);
    }
    animate();
}

const autoZoom = () => {
    window.addEventListener('resize', () => {
        const width = screenDom.value.clientWidth;
        const height = screenDom.value.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
}


// 🌟 4. 核心：组件卸载/热更新时执行彻底清理
onBeforeUnmount(() => {
    console.log('正在清理 Three.js 资源以防止热更新残留...');

    // A. 停止动画循环，防止它一直在后台空转消耗性能
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    // B. 移除窗口自适应监听
    window.removeEventListener('resize', handleResize);

    // C. 深度遍历场景，手动释放几何体和材质（显存回收）
    if (scene) {
        scene.traverse((object) => {
            if (object.isMesh) {
                // 释放几何体内存
                if (object.geometry) object.geometry.dispose();
                
                // 释放材质内存（有些材质是数组，这里做个通用判断）
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(mat => mat.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            }
        });
    }

    // D. 销毁控制器和渲染器上下文
    if (controls) controls.dispose();
    if (renderer) {
        renderer.dispose();
        // E. 必须把 DOM 节点从页面上拔掉，否则热更新会堆积多个 canvas
        if (renderer.domElement && screenDom.value) {
            screenDom.value.removeChild(renderer.domElement);
        }
    }

    // F. 置空变量，等待垃圾回收
    scene = null;
    camera = null;
    controls = null;
    renderer = null;
});
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

