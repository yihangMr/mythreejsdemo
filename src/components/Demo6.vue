<script setup>
/**
   Raycaster（用鼠标点击模型） 与交互  模型锚点修正
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
let raycaster = null; // 光线投射器
let pointer = null;   // 存储鼠标标准二维坐标
let handleResize = null;
let modelsGroup = {};

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

const loadingModel = (path,key) => {
    // 模型加载
    const loader = new GLTFLoader();
    loader.load(path,(gltf) => {
            // 成功回调
            const model = gltf.scene;

            // 模型锚点修正
            // 1. 创建一个绝对干净的空外壳（Group）
            const wrapperGroup = new THREE.Group();
            scene.add(wrapperGroup);
            // 2. 🌟 核心：计算飞机模型的几何中心
            const box = new THREE.Box3().setFromObject(model);
            const center = new THREE.Vector3();
            box.getCenter(center); // 获取飞机肉眼可见的中心点坐标

            // 3. 把飞机的身体往反方向平移，让它的几何中心强行和外壳的 (0,0,0) 重合
            model.position.sub(center); 

            // 4. 把飞机塞进外壳里
            wrapperGroup.add(model);

            // 5. 以后你移动、或者旋转，全部操作这个 wrapperGroup！
            // wrapperGroup.position.set(8, 0, 3); // 随便放哪
            
            // 把外壳存起来用于后续点击和旋转
            modelsGroup[key || path] = wrapperGroup;
            
            // 可以根据模型实际大小缩放或调整位置
            model.scale.set(1, 1, 1);

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
            // modelsGroup[key || path] = model;
            // 将加载好的模型放入场景中
            // scene.add(model);
            // _model = model;
            console.log('模型加载成功！', gltf);
        },
        (xhr) => {
            // 加载进度回调
            // console.log(`模型加载进度: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
        },
        (error) => {
            // 错误回调
            console.error('模型加载失败，请检查路径或文件是否损坏', error);
        }
    );
} 
// 初始化Raycaster和Pointer  激光枪
const initRaycaster = () => {
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();
}
// 点击事件
const onPointerClick = (event) => {
    if (!screenDom.value || !camera || !scene) return;

    // 计算标准化设备坐标 (NDC)
    const rect = screenDom.value.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // 更新射线
    raycaster.setFromCamera(pointer, camera);

    // 计算交点（依然传入 true 递归检测子物体，这样才能射中它）
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
        // 1. 先拿到最底层的子 Mesh
        let targetMesh = intersects[0].object;
        
        // ❌ 这里要过滤掉坐标轴辅助器（AxesHelper），避免误触
        if (targetMesh.type === "AxesHelper" || targetMesh.parent?.type === "AxesHelper") {
            console.log('点中了坐标辅助器，不作处理');
            return;
        }

        console.log('射线直接射中的底层子网格:', targetMesh.name || '未命名Mesh');

        // 2. 🌟 核心【寻亲逻辑】：沿着 parent 一路向上找
        // 目标：找到那个直接挂在 scene 之下，或者属于你模型的顶级父节点
        let topParent = targetMesh;
        
        // 循环向上找，直到它的父节点是 scene (或者你可以判断 topParent 是否等于你的飞机模型变量)
        // 这样就能确保我们抓到的是“整架飞机”，而不是一个“零件”
        while (topParent.parent && topParent.parent !== scene) {
            topParent = topParent.parent;
        }

        console.log('🎯 成功找到它的顶级父模型（整架飞机）:', topParent);

        // 3. 让整个模型开始旋转（这里先用最基础的帧动画做测试）
        // 后面我们会用更优雅的 GSAP 动画库来实现
        if (topParent) {
            // 给这个顶级父节点加上一个自定义的旋转标记，让我们在 animate 循环里去让它转
            topParent.isRotating = !topParent.isRotating; 
            // console.log(topParent.isRotating ? '开始旋转整架飞机' : '停止旋转整架飞机');
        }

    } else {
        console.log('你射向了虚无');
    }
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
    loadingModel('/models/feiji.glb',"飞机"); // 加载模型
    autoDraw(); // 启动渲染循环，让画面动起来
    autoZoom(); // 启动窗口自适应
    initRaycaster();
    window.addEventListener('click', onPointerClick);
})

const autoDraw = () => {
    const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        controls.update();

        // 🌟 遍历场景中的物体，如果有旋转标记，就让它转动
        scene.traverse((child) => {
            // 只要是设置了 isRotating 的顶级节点，每帧就转一下
            if (child.isRotating) {
                child.rotation.y += 0.02; // 让它绕著 Y 轴旋转
            }
        });

        renderer.render(scene, camera);
    }
    animate();
}

const autoZoom = () => {
    handleResize = window.addEventListener('resize', () => {
        const width = screenDom.value.clientWidth;
        const height = screenDom.value.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
}


// 🌟 4. 核心：组件卸载/热更新时执行彻底清理
onBeforeUnmount(() => {
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
    window.removeEventListener('click', onPointerClick);
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

