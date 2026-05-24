<script setup>
/**
   THREE.LOD —— 解决“单模型面数过高、视距过远”的卡顿。LOD与InstancedMesh结合实现大量的lod模型绘制
*/

import { ref, onMounted,onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js' // 交互控制器引入
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// 🌟 1. 核心：引入专门的 EXR 场景环境加载器
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';


// 🌟 1. 引入后处理核心指挥官
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// 🌟 2. 引入渲染通道（后处理的第一步：必须先把原始场景画到幕布上）
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// 🌟 3. 引入科技感的灵魂：辉光通道（让发光物体真正泛光）
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
// 🌟 4. 引入抗锯齿通道（解决后处理带来的“狗牙”锯齿问题）
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import {controlAnimation} from "@/utils/tool.js"


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
let labelRenderer = null; // 全局声明 CSS2D 渲染器
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


// 🌟 1. 定义实例化的总数量（比如直接上 5000 个，传统 Mesh 这样搞必卡，我们用实例化稳如狗）
const count = 5000;
let instancedMesh;


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

    // 2. 🌟 核心新增：初始化 CSS2D 渲染器
    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(screenDom.value.clientWidth, screenDom.value.clientHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';
    screenDom.value.appendChild(labelRenderer.domElement);
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
const setLight = () => {
    // const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
    // directionalLight.position.set(5, 5, 5);  // 这里设置光源的位置
    // scene.add(directionalLight);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);
}


const loadingModel = (path,key,useGruop) => {
    const loader = new GLTFLoader();
    loader.load(path,(gltf) => {
            const model = gltf.scene;
            if(useGruop){
                 // 模型锚点修正
                const wrapperGroup = new THREE.Group();
                console.log(wrapperGroup);
                scene.add(wrapperGroup);
                const box = new THREE.Box3().setFromObject(model);
                const center = new THREE.Vector3();
                box.getCenter(center);
                model.position.sub(center); 
                wrapperGroup.add(model);
                wrapperGroup.position.set(5, 2, -3);
                const m = gltf.animations.length > 0 ? new THREE.AnimationMixer(model) : null;
                const a = m ? m.clipAction(gltf.animations[0]) : null;
                if (a && m) {
                    a.loop = THREE.LoopOnce;
                    a.clampWhenFinished = true;
                    m.addEventListener('finished', (e) => {
                        controlAnimation(e.action, m, activeMixers, 'stop');
                    });
                }
                modelsGroup[wrapperGroup.uuid] = {
                    models:wrapperGroup,
                    gltf:gltf,
                    mixer: m,   // 🌟 存起来
                    action: a,  // 🌟 存起来
                };
                model.scale.set(1, 1, 1);
            }else{
                model.position.set(8, 2, 3);
                model.scale.set(150, 150, 150);
                const m = gltf.animations.length > 0 ? new THREE.AnimationMixer(model) : null;
                const a = m ? m.clipAction(gltf.animations[0]) : null;
                if (a && m) {
                    a.loop = THREE.LoopOnce;
                    a.clampWhenFinished = true;
                    m.addEventListener('finished', (e) => {
                        controlAnimation(e.action, m, activeMixers, 'stop');
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
            model.traverse((child) => {
                if (child.isMesh) {
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
            if (!modelData || !modelData.action) return;
            if (modelData.action.paused) {
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
            }
            controlAnimation(modelData.action, modelData.mixer, activeMixers, 'toggle');
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
let daisyLOD = null;
const loadDaisyLOD = () => {
    daisyLOD = new THREE.LOD();
    const loader = new GLTFLoader();

    loader.load('/models/lod.glb', (gltf) => {
        let lod0Mesh = null;
        let lod1Mesh = null;
        let lod2Mesh = null;
        // 1. 遍历模型里的所有零件
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                if (child.name.includes('Daisy_1_LOD0') && !lod0Mesh) lod0Mesh = child.clone();
                if (child.name.includes('Daisy_1_LOD1') && !lod1Mesh) lod1Mesh = child.clone();
                if (child.name.includes('Daisy_1_LOD2') && !lod2Mesh) lod2Mesh = child.clone();
            }
        });
        if (lod0Mesh && lod1Mesh && lod2Mesh) {
            // 🌟 3. 规范做法：子网格全部在内部归零，消除建模可能自带的位移偏差
            lod0Mesh.position.set(0, 0, 0);
            lod1Mesh.position.set(0, 0, 0);
            lod2Mesh.position.set(0, 0, 0);
            // 4. 将不同精度的衣服，登记到对应的视距控制线上
            daisyLOD.addLevel(lod0Mesh, 0);   // 0 到 5 米（贴近看）：完美高精
            daisyLOD.addLevel(lod1Mesh, 5);   // 5 到 15 米（中景）：中等精度
            daisyLOD.addLevel(lod2Mesh, 15);  // 15 米开外（远景）：突变成纸片
            // 🌟 5. 要移动或者放大，统一对【总容器】进行操作
            daisyLOD.position.set(3, 0, 0);   // 让整套 LOD 系统呆在 (3,0,0)
            daisyLOD.scale.set(5, 5, 5);      // 整体放大 5 倍、
            daisyLOD.rotation.x = -Math.PI / 2;
            scene.add(daisyLOD);
        } 
    });
};


// 顶层变量声明
let instanceCount = 1000; // 长出 1000 棵草
let highInstance, midInstance, lowInstance;
let grassPositions = []; // 储存所有草的原始位置数据，用于每帧算距离
const loadDaisyInstances = () => {
  const loader = new GLTFLoader();

  loader.load('/models/lod.glb', (gltf) => {
    let lod0Mesh = null;
    let lod1Mesh = null;
    let lod2Mesh = null;

    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        if (child.name.includes('Daisy_1_LOD0') && !lod0Mesh) lod0Mesh = child;
        if (child.name.includes('Daisy_1_LOD1') && !lod1Mesh) lod1Mesh = child;
        if (child.name.includes('Daisy_1_LOD2') && !lod2Mesh) lod2Mesh = child;
      }
    });

    if (lod0Mesh && lod1Mesh && lod2Mesh) {
      const geo0 = lod0Mesh.geometry.clone();
      const geo1 = lod1Mesh.geometry.clone();
      const geo2 = lod2Mesh.geometry.clone();

      highInstance = new THREE.InstancedMesh(geo0, lod0Mesh.material, instanceCount);
      midInstance = new THREE.InstancedMesh(geo1, lod1Mesh.material, instanceCount);
      lowInstance = new THREE.InstancedMesh(geo2, lod2Mesh.material, instanceCount);

      highInstance.count = 0;
      midInstance.count = 0;
      lowInstance.count = 0;

      // 3. 随机生成 1000 棵草的世界坐标并【赋予旋转参数】
      for (let i = 0; i < instanceCount; i++) {
        grassPositions.push({
          x: (Math.random() - 0.5) * 100,
          y: 0, 
          z: (Math.random() - 0.5) * 100,
          scale: 5 + Math.random() * 2, // 保持你之前放大的倍数习惯
          
          // 🌟 核心：基础 Pitch 为 -90度 (-Math.PI / 2) 让它站起来
          pitch: -Math.PI / 2,
          // 🌟 进阶：偏航角 Yaw 360度随机，让草的方向各不相同，更逼真
          yaw: Math.random() * Math.PI * 2,
          roll: 0
        });
      }

      scene.add(highInstance);
      scene.add(midInstance);
      scene.add(lowInstance);
      
      console.log("1000棵草丛群落实例化初始化成功！");
    }
  });
};

onMounted(()=>{
    initSceneAndCamera();  // 初始化场景相机
    initRenderer();        // 初始化renderer
    initOrbitControls();   // 初始化交互控制器
    initPostProcessing();  // 激活后处理
    // 1. 创建并添加地砖立方体
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
    loadDaisyLOD();
    loadDaisyInstances();
    autoDraw(); // 启动渲染循环
    // 4. 绑定自适应事件
    window.addEventListener('resize', onWindowResize);
    
    initRaycaster();
    window.addEventListener('click', onPointerClick);
    initHDREnvironment();  // 加载环境贴图
    
})
// 🌟 在函数外部定义一个全局复用的虚拟工具人，拒绝每帧 new
const instanceDummy = new THREE.Object3D(); 

const autoDraw = () => {
    const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        if (controls) controls.update();
        const delta = clock.getDelta();
        activeMixers.forEach(mixer => { mixer.update(delta); });
        
        if (composer) { composer.render(); }
        if (labelRenderer) { labelRenderer.render(scene, camera); }
        if (daisyLOD && camera) { daisyLOD.update(camera); }
        
        // 🌟 动态分流与旋转应用逻辑
        if (highInstance && midInstance && lowInstance && camera) {
            
            let hCount = 0;
            let mCount = 0;
            let lCount = 0;

            const camPos = camera.position;

            for (let i = 0; i < instanceCount; i++) {
                const grass = grassPositions[i];
                
                // 计算平面距离
                const dx = grass.x - camPos.x;
                const dz = grass.z - camPos.z;
                const dist = Math.sqrt(dx * dx + dz * dz);

                // 🌟 配置复用 dummy 的空间姿态
                instanceDummy.position.set(grass.x, grass.y, grass.z);
                
                // 🌟 核心：注入 -90 度的 Pitch 旋转，并使用 'YXZ' 规避死锁
                instanceDummy.rotation.set(grass.pitch, grass.yaw, grass.roll, 'YXZ');
                
                instanceDummy.scale.set(grass.scale, grass.scale, grass.scale);
                instanceDummy.updateMatrix();

                // 距离分流
                if (dist < 15) {
                    highInstance.setMatrixAt(hCount, instanceDummy.matrix);
                    hCount++;
                } else if (dist >= 15 && dist < 40) {
                    midInstance.setMatrixAt(mCount, instanceDummy.matrix);
                    mCount++;
                } else {
                    lowInstance.setMatrixAt(lCount, instanceDummy.matrix);
                    lCount++;
                }
            }

            // 更新实际渲染计数
            highInstance.count = hCount;
            midInstance.count = mCount;
            lowInstance.count = lCount;

            // 提交 GPU 更新
            highInstance.instanceMatrix.needsUpdate = true;
            midInstance.instanceMatrix.needsUpdate = true;
            lowInstance.instanceMatrix.needsUpdate = true;
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
    if (labelRenderer) labelRenderer.setSize(width, height);
};

// 🌟 4. 核心：组件卸载/热更新时执行彻底清理
onBeforeUnmount(() => {
    // A. 停止动画循环，防止它一直在后台空转消耗性能
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    if (instancedMesh) {
        instancedMesh.geometry.dispose();
        instancedMesh.material.dispose();
    }
    if (labelRenderer && labelRenderer.domElement && screenDom.value) {
        screenDom.value.removeChild(labelRenderer.domElement);
    }
    labelRenderer = null;
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
.global-labels-wrapper{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;       /* 🌟 让它跟 3D 画布一模一样大 */
    height: 100%;      /* 🌟 这样它里面的 left/top 像素点就跟 3D 窗口完美重合了 */
    pointer-events: none; 
    z-index: 10;       /* 确保 Vue 标签层漂浮在 Three.js 画布 <canvas> 的正上方 */
}
.gis-panel-absolute {
    position: absolute;
    transform: translate(-50%, -100%); 
    will-change: top, left; 
    pointer-events: auto;
}

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
    width: 100%;         /* 故意设为非满屏，比如占个半屏，测试它也绝对不会错位 */
    height: 100%;      /* 固定高度 */
    background-color: #000; /* 通常 3D 场景背景设为黑色或透明 */
    position: relative;
    overflow: hidden;   /* 遮住超出容器的标签 */
}
</style>>

