<script setup>
/**
   动效系统的双线并进  Blender 骨骼动画/内嵌动画提取    粒子系统与科幻背景
*/

import { ref, onMounted,onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js' // 交互控制器引入
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// 🌟 1. 核心：引入专门的 EXR 场景环境加载器
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';


// 🌟 1. 引入后处理核心指挥官
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// 🌟 2. 引入渲染通道（后处理的第一步：必须先把原始场景画到幕布上）
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// 🌟 3. 引入科技感的灵魂：辉光通道（让发光物体真正泛光）
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
// 🌟 4. 引入抗锯齿通道（解决后处理带来的“狗牙”锯齿问题）
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';


import { gsap } from 'gsap';

const clock = new THREE.Clock();


const textureLoader = new THREE.TextureLoader();

// 基础颜色贴图
const colorTex = textureLoader.load('/textures/PavingStones104_1K-JPG_Color.jpg');
// 法线贴图（必选，二选一）
const normalTex = textureLoader.load('/textures/PavingStones104_1K-JPG_NormalGL.jpg'); 
// 粗糙度贴图（必选）
const roughnessTex = textureLoader.load('/textures/PavingStones104_1K-JPG_Roughness.jpg');
// 环境光遮蔽贴图（建议带上）
const aoTex = textureLoader.load('/textures/PavingStones104_1K-JPG_AmbientOcclusion.jpg');


// 2. 核心细节：只有颜色图需要开启 sRGB 色彩空间
colorTex.colorSpace = THREE.SRGBColorSpace;

// 3. 完美的 PBR 材质组装
const pavingMaterial = new THREE.MeshStandardMaterial({
    map: colorTex,
    
    normalMap: normalTex,
    normalScale: new THREE.Vector2(1.2, 1.2), // 可以微调这个数值，控制砖缝的立体感深浅
    
    roughnessMap: roughnessTex,
    roughness: 1.0, // 保持基础系数为 1，完全由贴图的黑白像素精准控制各处粗糙度
    
    aoMap: aoTex,
    aoMapIntensity: 1.5, // 增强砖缝里的固有阴影，让石块更有立体感

    // emissive: new THREE.Color(0x00ffff),    // 1. 发光颜色：青色高亮线条/表面
    // emissiveIntensity: 2.0,                 // 2. 发光强度：配合上面的 bloomPass
});


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
let animateObjects = []; // 👈 专门存放当前正在旋转的物体
// 🌟 新增：动态播放队列，专门用来装当前“正在跑”的播放器
let activeMixers = new Set();


// 后处理相关变量
// 定义全局变量，方便后续更新和销毁
let composer = null;      // 效果合成器
let bloomPass = null;     // 辉光通道
let fxaaPass = null;      // 抗锯齿通道

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

    // 🌟 注入灵魂：开启电影级 ACES 曝光映射，瞬间驯服暴走的光线
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5; // 曝光系数，可以根据需要微调（0.8 ~ 1.2）

    screenDom.value.appendChild(renderer.domElement);
}

// 🌟 核心：初始化后处理系统
const initPostProcessing = () => {
    // 1. 创建总指挥官 Composer，并把当前的渲染器传给它
    composer = new EffectComposer(renderer);
    // 2. 第一道关卡：RenderPass（把原始场景作为底色渲染出来）
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    // 3. 第二道关卡：UnrealBloomPass（添加赛博朋克辉光）
    // 参数含义：new UnrealBloomPass( 视口大小, 辉光强度, 辉光半径, 辉光阈值 )
    bloomPass = new UnrealBloomPass(
        new THREE.Vector2(screenDom.value.clientWidth, screenDom.value.clientHeight), 
        0.01,  // 强度 (Strength)：数值越大，发光越刺眼。企业项目推荐 1.0 ~ 2.0
        0.1,  // 半径 (Radius)：光晕扩散的范围
        0.9  // 阈值 (Threshold)：亮度超过多少的物体才允许发光。数值越低，发光的范围越广
    );
    composer.addPass(bloomPass);
    // 4. 第三道关卡：FXAA 抗锯齿（解决后处理的边缘粗糙问题）
    fxaaPass = new ShaderPass(FXAAShader);
    // 配置 FXAA 的像素比例（公式固定，背下来即可）
    const pixelRatio = renderer.getPixelRatio();
    fxaaPass.material.uniforms['resolution'].value.x = 1 / (screenDom.value.clientWidth * pixelRatio);
    fxaaPass.material.uniforms['resolution'].value.y = 1 / (screenDom.value.clientHeight * pixelRatio);
    composer.addPass(fxaaPass);
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
    // 🌟 核心：直接把拼装好的铺路石材质传给 Mesh
    let cube = new THREE.Mesh(geometry, pavingMaterial);
    return cube;
}

const setLight = () => {
    // const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
    // directionalLight.position.set(5, 5, 5);  // 这里设置光源的位置
    // scene.add(directionalLight);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);
}

const loadingModel = (path,key,useGruop) => {
    // 模型加载
    const loader = new GLTFLoader();

    
    loader.load(path,(gltf) => {
            // 成功回调
            const model = gltf.scene;
            // const tempBox = new THREE.Box3().setFromObject(model);
            // const modelSize = new THREE.Vector3();
            // tempBox.getSize(modelSize);
            console.log(1);
            console.log(model);
            console.log(gltf);
            // console.log(`🧱 【核心数据】${key} 模型的真实尺寸是:`, modelSize);
            if(useGruop){
                 // 模型锚点修正
                // 1. 创建一个绝对干净的空外壳（Group）
                const wrapperGroup = new THREE.Group();
                console.log(wrapperGroup);
                scene.add(wrapperGroup);
                // 2. 🌟 核心：计算飞机模型的几何中心
                const box = new THREE.Box3().setFromObject(model);
                const center = new THREE.Vector3();
                box.getCenter(center); // 获取飞机肉眼可见的中心点坐标
                // 3. 把飞机的身体往反方向平移，让它的几何中心强行和外壳的 (0,0,0) 重合
                model.position.sub(center); 
                // 4. 把飞机塞进外壳里
                wrapperGroup.add(model);
                wrapperGroup.position.set(5, 2, -3);
                const m = gltf.animations.length > 0 ? new THREE.AnimationMixer(model) : null;
                const a = m ? m.clipAction(gltf.animations[0]) : null;
                if (a && m) {
                    // 1. 操控 Action 遥控器：告诉这盘磁带只允许放一次
                    a.loop = THREE.LoopOnce;
                    // 2. 操控 Action 遥控器：播完后卡在最后一帧，不要突兀地闪回第一帧
                    a.clampWhenFinished = true;

                    // 3. 给播放器绑定结束事件：一旦这台录音机把磁带放完了，就会触发这个回调
                    m.addEventListener('finished', (e) => {
                        console.log(`🎬 动画播放完毕，触发完全重置归零。`);
                        
                        // 操控 Action 遥控器：让磁带强制倒带回第 0 帧，并彻底停下（还原初始姿态）
                        e.action.stop(); 
                        e.action.paused = false;
                        // 性能优化：既然动画彻底放完了，把它从动态更新队列里移出
                        activeMixers.delete(m);
                    });
                }
                modelsGroup[wrapperGroup.uuid] = {
                    models:wrapperGroup,
                    gltf:gltf,
                    mixer: m,   // 🌟 存起来
                    action: a,  // 🌟 存起来
                };
                // 可以根据模型实际大小缩放或调整位置
                // 5. 以后你移动、或者旋转，全部操作这个 wrapperGroup！
                // wrapperGroup.position.set(8, 0, 3); // 随便放哪
                // 把外壳存起来用于后续点击和旋转
                model.scale.set(1, 1, 1);
            }else{
                model.position.set(8, 2, 3);
                model.scale.set(150, 150, 150);
                const m = gltf.animations.length > 0 ? new THREE.AnimationMixer(model) : null;
                const a = m ? m.clipAction(gltf.animations[0]) : null;
                if (a && m) {
                    // 1. 操控 Action 遥控器：告诉这盘磁带只允许放一次
                    a.loop = THREE.LoopOnce;
                    // 2. 操控 Action 遥控器：播完后卡在最后一帧，不要突兀地闪回第一帧
                    a.clampWhenFinished = true;

                    // 3. 给播放器绑定结束事件：一旦这台录音机把磁带放完了，就会触发这个回调
                    m.addEventListener('finished', (e) => {
                        console.log(`🎬 动画播放完毕，触发完全重置归零。`);
                        
                        // 操控 Action 遥控器：让磁带强制倒带回第 0 帧，并彻底停下（还原初始姿态）
                        e.action.stop(); 
                        e.action.paused = false;
                        // 性能优化：既然动画彻底放完了，把它从动态更新队列里移出
                        activeMixers.delete(m);
                    });
                }
                modelsGroup[model.uuid] = {
                    models: model,
                    gltf: gltf,
                    mixer: m,   // 🌟 存起来
                    action: a,  // 🌟 存起来
                };
                scene.add(model);
            }
            // ---- 3. 超高频考点：模型遍历 (traverse) ----
            // 外部模型往往由成百上千个小网格(Mesh)组合而成，我们要批量修改它们
            model.traverse((child) => {
                if (child.isMesh) {
                    // 示例：给模型所有部件开启接收和投射阴影
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
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
            return;
        }
        // 2. 🌟 核心【寻亲逻辑】：沿着 parent 一路向上找
        // 目标：找到那个直接挂在 scene 之下，或者属于你模型的顶级父节点
        let topParent = targetMesh;
        
        // 循环向上找，直到它的父节点是 scene (或者你可以判断 topParent 是否等于你的飞机模型变量)
        // 这样就能确保我们抓到的是“整架飞机”，而不是一个“零件”
        while (topParent.parent && topParent.parent !== scene) {
            topParent = topParent.parent;
        }
        // 3. 让整个模型开始旋转（这里先用最基础的帧动画做测试）
        // 后面我们会用更优雅的 GSAP 动画库来实现
        if (topParent) {
            let modelData = modelsGroup[topParent.uuid];
            if (!modelData) return;
            let action = modelData.action; // 直接拿到提前做好的磁带
            let mixer = modelData.mixer; // 直接拿到提前做好的播放器
            if (action && mixer){
                if (!action.isRunning()) {
                    // 【情况 A】动画当前没有在跑（比如刚加载完，或者之前已经播完触发了 stop() 归零了）
                    action.paused = false;
                    action.play();            // 让遥控器按下播放键
                    activeMixers.add(mixer);      // 塞进帧循环队列，开始通电驱动
                    console.log('▶️ 动画开始初次/重新播放');
                    gsap.killTweensOf(camera.position);
                    const targetPos = topParent.position;
                    gsap.to(camera.position, {
                        x: targetPos.x,
                        y: targetPos.y + 7,
                        z: targetPos.z + 4,
                        duration: 1.8,
                        ease: "power3.out",
                        onUpdate: () => {
                            controls.target.copy(targetPos);
                            controls.update(); 
                        }
                    });
                } else {
                    // 【情况 B】动画当前正在运行，用户又点了一下它
                    // 我们直接修改 Action 遥控器的 paused 属性（取反切换状态）
                    action.paused = !action.paused;
                    
                    if (action.paused) {
                        console.log('⏸️ 凌空暂停！Action.paused 设为 true');
                        // 既然被按了暂停，帧循环就没必要每帧去更新它了，移出更新队列
                        activeMixers.delete(mixer);
                    } else {
                        console.log('▶️ 原地继续！Action.paused 设为 false');
                        // 🌟 严谨：确保由于各种机制可能断电的播放器重新通电
                        action.play(); 
                        activeMixers.add(mixer);
                    }
                }
            }
        }

    } else {
        console.log('你射向了虚无');
    }
}


// 🌟 核心：初始化 HDR (EXR) 环境贴图
const initHDREnvironment = () => {
    const exrLoader = new EXRLoader();
    // 路径指向你放在 public 下的资源
    exrLoader.load('/HDR/hdr1.exr', (texture) => {
        // 1. 设置贴图的映射方式为“等距柱状投影球体”（类似把图片完整包裹在球体内部）
        texture.mapping = THREE.EquirectangularReflectionMapping;
        // 2. 🌟 将贴图直接作为场景的背景（肉眼能看见摄影棚）
        scene.background = texture;
        // 3. 🌟 灵魂一步：将贴图作为场景所有物体的环境光照（模型会自动反射出摄影棚的高光）
        scene.environment = texture;
        // console.log('EXR 环境贴图加载并应用成功！');
    }, (xhr) => {
        // 进度回调
    }, (error) => {
        console.error('EXR 加载失败，请检查路径是否正确', error);
    });
}


const creatFloor = () => {
    // 2. 🌟 新增：创建一个大地面来完美展示你的铺路石贴图
    const floorGeo = new THREE.PlaneGeometry(10, 10); // 10x10 的平面
    const floor = new THREE.Mesh(floorGeo, pavingMaterial);
    floor.rotation.x = -Math.PI / 2; // 🌟 核心：默认平面是立着的，必须绕X轴转-90度贴在地上
    floor.position.y = 0;            // 贴在水平面
    return floor;
}


onMounted(()=>{
    initSceneAndCamera();  // 初始化场景相机
    initRenderer();        // 初始化renderer
    initOrbitControls();   // 初始化交互控制器
    initPostProcessing();  // 激活后处理

    // 1. 创建并添加地砖立方体
    let cube = createCube();  
    cube.position.set(0, 2, 0); // 让立方体稍微往上抬一点，坐在地面上
    scene.add(cube);

    let floor = creatFloor(); // 创建地面
    scene.add(floor);

    // 3. 🌟 增强光源：PBR 材质没有强光，法线贴图就没有任何凹凸效果！
    setLight(); 
    // 额外加一盏有角度的主光源（斜着照下来，砖缝阴影最明显）
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);
    
    // 坐标辅助器
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    
    loadingModel('/models/feiji.glb',"飞机",true); // 加载模型
    loadingModel('/models/angel.glb',"天使");
    autoDraw(); // 启动渲染循环
    
    // 4. 绑定自适应事件
    window.addEventListener('resize', onWindowResize);
    
    initRaycaster();
    window.addEventListener('click', onPointerClick);
    initHDREnvironment();  // 加载环境贴图
})

const autoDraw = () => {
    const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        if (controls) controls.update();
        const delta = clock.getDelta(); // 时钟差
        activeMixers.forEach(mixer => {
            mixer.update(delta);
        });
        if (composer) {
            composer.render();
        }
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
        if (composer) {
            composer.setSize(width, height);
            const pixelRatio = renderer.getPixelRatio();
            fxaaPass.material.uniforms['resolution'].value.x = 1 / (width * pixelRatio);
            fxaaPass.material.uniforms['resolution'].value.y = 1 / (height * pixelRatio);
        }
    });
}


// 声明一个具体的 resize 处理函数，方便在 onBeforeUnmount 中彻底销毁
const onWindowResize = () => {
    if (!screenDom.value || !renderer) return;
    const width = screenDom.value.clientWidth;
    const height = screenDom.value.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    if (composer) {
        composer.setSize(width, height);
        const pixelRatio = renderer.getPixelRatio();
        fxaaPass.material.uniforms['resolution'].value.x = 1 / (width * pixelRatio);
        fxaaPass.material.uniforms['resolution'].value.y = 1 / (height * pixelRatio);
    }
};

// 🌟 4. 核心：组件卸载/热更新时执行彻底清理
onBeforeUnmount(() => {
    // A. 停止动画循环，防止它一直在后台空转消耗性能
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    window.removeEventListener('resize', onWindowResize);
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
    if (composer) {
        composer.dispose();
    }
    composer = null;
    bloomPass = null;
    fxaaPass = null;
    window.removeEventListener('click', onPointerClick);
    // F. 置空变量，等待垃圾回收
    scene = null;
    camera = null;
    controls = null;
    renderer = null;
    animateObjects = [];
    // 🌟 释放贴图显存和置空数组
    if (scene && scene.background) {
        scene.background.dispose();
        scene.environment.dispose();
    }
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

