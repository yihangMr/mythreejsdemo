# Gemini推荐路线

### 1. 核心概念（3D 世界的“老三样”）

在写第一行代码前，你需要理解 Three.js 的基本逻辑，就像拍电影一样：

- **Scene（场景）：** 你的 3D 空间，所有的物体、灯光都要丢进这里。
- **Camera（相机）：** 你的眼睛。最常用的是 **PerspectiveCamera**（透视相机，符合近大远小的规律）。
- **Renderer（渲染器）：** 最终的幕后功臣，它负责把 3D 场景里的东西画到 HTML 的 `<canvas>` 标签上。

### 2. 必备的数学基础

你不需要成为数学家，但要对以下概念有直观认识：

- **坐标系：** 记住 Three.js 使用的是右手坐标系（X 向右，Y 向上，Z 向前/向外）。
- **单位：** Three.js 中的单位是抽象的。你可以把 1 单位看作 1 米，也可以看作 1 厘米，只要你的项目内部保持统一。

### 3. 学习路线推荐

建议按照以下顺序进阶：

1. **Hello Cube：** 亲手渲染一个旋转的立方体（包含几何体 `Geometry` 和材质 `Material`）。
2. **动画循环：** 学习 `requestAnimationFrame` 如何驱动物体动起来。
3. **灯光与阴影：** 给场景加上点光源或环境光，感受 3D 的真实感。
4. **外部模型导入：** 学习如何加载 `.gltf` 或 `.glb` 文件（这是目前 3D 网页的主流标准）。
5. **交互：** 学习 `Raycaster`（光线投射），实现点击 3D 物体触发事件。

### 4. 推荐资源

- **官方文档 (threejs.org)：** 最权威的 API 参考，尤其是他们的 **Examples** 页面，是寻找灵感的宝库。
- **Three.js Journey (Bruno Simon)：** 被公认为目前市面上最好的付费课程，如果预算允许，非常推荐。
- **中文社区：** [Three.js 中文网](https://www.google.com/search?q=http://www.webgl-lin.com/) 有很多翻译好的教程和实例。



# Gemini基础文档

### 1. 场景 (Scene) —— “摄影棚”

场景就像是一个空的摄影棚，它是所有物体的容器。

- **作用：** 你需要把灯光、物体、背景等统统 `scene.add()` 进去。
- **注意：** 如果你创建了一个物体但没有把它加入场景，它是不会被显示出来的。

### 2. 相机 (Camera) —— “导演的眼睛”

场景里有东西了，但我们需要一个视角去观察它。最常用的是 **透视相机 (PerspectiveCamera)**。

- **核心参数：**
  - **FOV (Field of View):** 视野角度。角度越大，看的东西越多，但边缘变形也越厉害（类似鱼眼）。
  - **Aspect Ratio:** 宽高比。通常设为容器的宽除以高。
  - **Near/Far:** 近/远裁剪面。只有在这个范围内的物体才会被看到。
- **注意：** 相机默认在坐标原点 $(0,0,0)$，所以你通常需要设置 `camera.position.z = 5` 往后退一点，否则你可能就在物体“肚子”里。

### 3. 物体 (Mesh) —— “道具”

在 Three.js 中，一个看得见的物体被称为 **Mesh（网格）**。它由两部分组成：

> **Mesh = Geometry（几何体） + Material（材质）**

- **Geometry (形状)：** 决定物体的“骨架”。比如 `BoxGeometry`（立方体）、`SphereGeometry`（球体）。
- **Material (材质)：** 决定物体的“外表”。
  - `MeshBasicMaterial`: 基础材质，不受光照影响（就像自己会发光）。
  - `MeshStandardMaterial`: 标准材质，能产生真实的阴影和反光，**但必须有灯光才能看见**。

### 4. 渲染器 (Renderer) —— “底片/屏幕”

渲染器的作用是将“相机拍摄到的场景”画到 HTML 的 `<canvas>` 标签上。

- 它负责处理所有的数学计算，把你定义的 3D 世界转化为 2D 的像素点。

欢迎来到 Three.js 的世界！既然你已经成功跑通了第一个旋转的正方体，现在正是建立**系统化认知**的最佳时机。

Three.js 的核心逻辑其实是在模拟**现实世界的摄影棚**。你可以通过下面这四个核心概念来理解它的运作方式：

------

### 1. 场景 (Scene) —— “摄影棚”

场景就像是一个空的摄影棚，它是所有物体的容器。

- **作用：** 你需要把灯光、物体、背景等统统 `scene.add()` 进去。
- **注意：** 如果你创建了一个物体但没有把它加入场景，它是不会被显示出来的。

### 2. 相机 (Camera) —— “导演的眼睛”

场景里有东西了，但我们需要一个视角去观察它。最常用的是 **透视相机 (PerspectiveCamera)**。

- **核心参数：**
  - **FOV (Field of View):** 视野角度。角度越大，看的东西越多，但边缘变形也越厉害（类似鱼眼）。
  - **Aspect Ratio:** 宽高比。通常设为容器的宽除以高。
  - **Near/Far:** 近/远裁剪面。只有在这个范围内的物体才会被看到。
- **注意：** 相机默认在坐标原点 $(0,0,0)$，所以你通常需要设置 `camera.position.z = 5` 往后退一点，否则你可能就在物体“肚子”里。

### 3. 物体 (Mesh) —— “道具”

在 Three.js 中，一个看得见的物体被称为 **Mesh（网格）**。它由两部分组成：

> **Mesh = Geometry（几何体） + Material（材质）**

- **Geometry (形状)：** 决定物体的“骨架”。比如 `BoxGeometry`（立方体）、`SphereGeometry`（球体）。
- **Material (材质)：** 决定物体的“外表”。
  - `MeshBasicMaterial`: 基础材质，不受光照影响（就像自己会发光）。
  - `MeshStandardMaterial`: 标准材质，能产生真实的阴影和反光，**但必须有灯光才能看见**。

### 4. 渲染器 (Renderer) —— “底片/屏幕”

渲染器的作用是将“相机拍摄到的场景”画到 HTML 的 `<canvas>` 标签上。

- 它负责处理所有的数学计算，把你定义的 3D 世界转化为 2D 的像素点。

------

### 5. 必须掌握的“进阶”知识点

除了上面四个基础，开发时你很快就会遇到以下三位：

#### A. 灯光 (Light)

如果你不用 `MeshBasicMaterial`（基础材质），场景就是全黑的。你需要添加灯光：

- **AmbientLight:** 环境光，均匀照射所有物体，没有阴影。
- **DirectionalLight:** 平行光，类似太阳光，可以产生阴影。
- **PointLight:** 点光源，类似灯泡。

#### B. 坐标系 (Coordinates)

Three.js 使用的是 **右手坐标系**：

- **X 轴：** 正值向右。
- **Y 轴：** 正值向上。
- **Z 轴：** 正值向屏幕外（朝向你）。

#### C. 动画循环 (The Animation Loop)

由于 3D 场景是动态的，我们需要一个每秒执行 60 次左右的函数。

JavaScript

```
const animate = () => {
    requestAnimationFrame(animate); // 核心：循环调用自己
    // 在这里改变物体的 position、rotation
    renderer.render(scene, camera); // 每一帧都要重新渲染一次
};
```

##### requestAnimationFrame原理详解

```
requestAnimationFrame的含义是 告诉浏览器：下一次刷新屏幕前，请帮我运行一个回调
函数运行完，这个预约就结束了。
所以在函数内部，我们再次调用 requestAnimationFrame(animate)，就是预约下下一次。
```

requestAnimationFrame会智能的匹配当前浏览器画面的刷新率，浏览器后台关闭时，requestAnimationFrame不会运行。并且requestAnimationFrame必须上一帧执行完毕后才会执行下一帧，不会导致画面撕裂卡顿。

requestAnimationFrame它会向浏览器请求：“请在下一次准备好绘制屏幕的时候，调用我这个函数。”这意味着你的代码执行与屏幕的物理刷新节奏**完美契合**。

# three.js中文网

```
http://www.webgl3d.cn/pages/aac9ab/
```

# 安装

```
# 安装 Three.js 核心库
npm install three

# 安装类型定义文件（这一步是为了你要求的“代码自动补全”）
npm install --save-dev @types/three
```









# 个人学习文档

## 关于three的渲染

three的渲染并不是保存式的，而是绘画式的，你创建了一个物体，创建了一个场景，把物体加入到场景里边，它并不会自动渲染。
你必须要调用renderer.render(scene, camera)让three引擎主动的画出来这个东西。

其实就想react的手动挡一样，想要什么，必须自己画。而不是浏览器那种，你定义了一个div，他就一定显示出来

three的每一帧都是暴力渲染重新绘制所有的物体。这样反而性能更好。

## 坐标

```
y
|
|
|—————————— x轴    z轴朝向屏幕外边，朝向自己
```



## 基础的场景，物品，材质，渲染定义

在app.vue中定义了一个场景，一个物品，一个材质，把物品和材质合并为一个网格对象，把网格对象加入到场景，绘制。

```
<script setup>
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
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }); // 创建基础材质（不受光照影响，始终显示纯色）：
    const cube = new THREE.Mesh(geometry, material);  // 将几何体和材质组合成网格对象
    scene.add(cube); // 将立方体添加到场景中，使其可以被渲染器渲染。

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
```

### object3d属性rotation

| 属性              | 含义              | 旋转轴             |
| :---------------- | :---------------- | :----------------- |
| `cube.rotation.x` | 绕 X 轴旋转的弧度 | 水平轴（左右方向） |
| `cube.rotation.y` | 绕 Y 轴旋转的弧度 | 垂直轴（上下方向） |
| `cube.rotation.z` | 绕 Z 轴旋转的弧度 | 深度轴（前后方向） |

## 材质

### 普通材质

```
MeshBasicMaterial
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }); // 创建基础材质（不受光照影响，始终显示纯色）：

这是一个普通的材质，它不会受到光源的影响，可以设置自己发光
```

### 标准材质

```
MeshStandardMaterial
// 标准材质 roughness粗糙度，metalness金属度
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 0.5, metalness: 0.5 });
```

保准材质需要配合光源使用

#### 光源

##### 环境光和方向光

**环境光 (AmbientLight)**：

- **作用：** 它不分方向，强行给场景里的所有物体加一层“亮度”。
- **缺点：** 非常假。如果只用环境光，物体会看起来像平面的，没有立体感（没有明暗面）。
- **用途：** 用来提升场景的“底色”，避免背光面漆黑一片。

**方向光 (DirectionalLight)**：

- **作用：** 光线是平行的。就像太阳离我们非常远，光线打到地球上时，几乎都是平行的。
- **特点：** position属性的意思是，从这个点朝着原点方向照射，像太阳光一样，所有的光平行照射，无差别覆盖。不会发散。
- **用途：** 模拟太阳、模拟从窗户射进来的光。

**点光源 (PointLight)**：

- **作用：** 从空间中某一点向四面八方发光。
- **特点：** 它有**衰减 (Decay)**，离得越远越暗。如果你把它放得离方块很近，方块表面会非常亮；离得远，方块就会变暗。
- **用途：** 模拟灯泡、台灯、手电筒、蜡烛。

```
// 添加环境光（提供基础照明）  参数1是颜色，参数2是强度
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// 添加方向光（模拟太阳光，产生明暗效果）  参数1是颜色，参数2是强度
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);  // 这里设置光源的位置
scene.add(directionalLight);

。。。。

renderer.render(scene, camera);  // 绘制场景，绘制相机。场景里的东西就会被绘制出来。
```

##### 点光源

```
 // 1. 创建一盏白色的点光源
    const pointLight = new THREE.PointLight(0xffffff, 2); 
    scene.add(pointLight);
    
    
    // --- 6. 动画渲染循环 ---
    const animate = () => {
        requestAnimationFrame(animate);
        // 控制点光源变化
        const time = Date.now() * 0.002;
        // 让灯光在 x 轴上左右摆动
        pointLight.position.x = Math.sin(time) * 3;
        // 让灯光在 z 轴上前后移动
        pointLight.position.z = Math.cos(time) * 3;
        // 让灯光的高度也变一下
        pointLight.position.y = Math.sin(time * 0.5) * 2;
        // 让灯光的亮度像呼吸一样忽明忽暗
        pointLight.intensity = 1 + Math.sin(time * 2);
            
        // 让方块转动起来
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        renderer.render(scene, camera);
    };
```







## 交互控制器OrbitControls

### 代码

**引入**

```
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
```

创建

```
const controls = new OrbitControls(
    camera,
    renderer.domElement
);
```

**帧渲染**

注意，每一帧的时候必须要设置controls.update();

```
const animate = () => {
    requestAnimationFrame(animate);
    controls.update(); // 让 controls 计算这一帧摄像机应该在哪
    renderer.render(scene, camera);
}
animate();
```

### 注意

OrbitControls与鼠标的交互逻辑是：
OrbitControls会让摄像机朝向一个目标点。
鼠标左键是围绕着这个目标点旋转。
鼠标右键是同时移动目标点和摄像机的位置

滚轮是拉近或者拉远 摄像机与目标点的距离。





## position  rotation  scale

 位置    旋转    缩放

### 弧度

```
这里  旋转 需要特殊说明

// cube.rotation.x += 0.01;
// cube.rotation.y += 0.01;
// cube.rotation.z += 0.01;

每一个轴的旋转方向都是  相对于对应的轴   逆时针旋转。


同时  有关旋转的参数 都是 弧度
PI / 2   是 90度
PI   是 180度

弧度的本质就是
“圆弧长度 / 半径”
```

实际开发中我们可以直接

```
THREE.MathUtils.degToRad(90) // 获取 90 度的弧度

cube.rotation.y = THREE.MathUtils.degToRad(90);
```





## GLTFLoader  外部3D资源

### 文件类型

```
glTF   3D世界里的 jpg/png


glTF 与 glb
格式	特点
.gltf	json + 外部资源
.glb	二进制打包版（最常用）
```



### 加载外部资源

```
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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
```





### 模型点击事件

three.js的触发点击事件逻辑是，当你点击3d视图的时候，从摄像机坐标发射一个射线，这个射线会检测到他遇到的object然后收集起来，收集到的是一个数组，数组的第一项就是第一个触碰到的物体。



当我们相对点击的模型进行操作的时候，可以先把点击得到的模型对象收集起来，然后在animate每一帧中遍历收集到的对象，对这些对象进行对应的操作

```
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
            // 检查数组里是否已经有它了
            const index = rotatingObjects.indexOf(topParent);
            
            if (index === -1) {
                // 1. 如果不在队列里，说明要开始转，塞进去
                rotatingObjects.push(topParent);
                console.log('加入旋转队列');
            } else {
                // 2. 如果已经在队列里了，说明要停止，把它拔掉
                rotatingObjects.splice(index, 1);
                console.log('移出旋转队列');
            }
        }

    } else {
        console.log('你射向了虚无');
    }
}
```





### 模型锚点，自转

3d模型在美工导出的时候会自带一个锚点，这个锚点不一定就是模型视图，包围盒的中心点，因此让模型围绕着某个轴旋转的时候，实际上是围绕着这个锚点旋转，会导致模型并不是自转。

我们可以在前端使用包围盒计算中心点。

原理是



```
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



const autoDraw = () => {
    const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        controls.update();

        // 🌟 抛弃 scene.traverse！只遍历处于激活状态的旋转物体
        rotatingObjects.forEach((obj) => {
            obj.rotation.y += 0.02; 
        });

        renderer.render(scene, camera);
    }
    animate();
}
```











## HDR 环境贴图

Poly Haven (原 HDRI Haven)

**网址**：https://polyhaven.com/hdris

`.exr`，它和 `.hdr` 本质上都是高动态范围图像

RGBELoader加载`.hdr`

**`EXRLoader`**  加载`.exr`，

```
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';


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
        console.log('EXR 环境贴图加载并应用成功！');
    }, (xhr) => {
        // 进度回调
    }, (error) => {
        console.error('EXR 加载失败，请检查路径是否正确', error);
    });
}
```









## 后处理（Post-Processing）

### 1. Bloom Pass（辉光/泛光Pass）—— 💡【科技感的灵魂】

- **效果**：让场景中原本发光的物体（比如飞机的探照灯、科幻线条、荧光材质）真正**向外散发出耀眼、朦胧的光晕**。
- **应用场景**：赛博朋克霓虹灯、能量护盾、激光、智慧城市中发光的建筑线条。

### 2. Outline Pass（高亮边框Pass）—— 🎯【工业交互的刚需】

- **效果**：当你用鼠标划过或者点击某个模型时，在模型的边缘生成一圈**发光的呼吸高亮外轮廓线条**。
- **应用场景**：物联网（IoT）设备故障报警、选中某个厂房时让厂房闪烁高亮。

### 3. FXAA / SMAA Pass（抗锯齿Pass）—— 📐【画质拯救者】

- **效果**：当你开启后处理后，Three.js 自带的 `antialias: true` 会失效。模型边缘会出现极其难看的“狗牙（锯齿）”。我们必须加入一个抗锯齿 Pass，强行把边缘修平整，恢复电影级的细腻画质。



```

// 🌟 1. 引入后处理核心指挥官
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// 🌟 2. 引入渲染通道（后处理的第一步：必须先把原始场景画到幕布上）
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// 🌟 3. 引入科技感的灵魂：辉光通道（让发光物体真正泛光）
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
// 🌟 4. 引入抗锯齿通道（解决后处理带来的“狗牙”锯齿问题）
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';



// 后处理相关变量
// 定义全局变量，方便后续更新和销毁
let composer = null;      // 效果合成器
let bloomPass = null;     // 辉光通道
let fxaaPass = null;      // 抗锯齿通道



// 初始化renderer   开启曝光映射，防止后处理的超级闪光弹
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

// 我们可以关闭掉太阳光，只使用场景光
const setLight = () => {
    // const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
    // directionalLight.position.set(5, 5, 5);  // 这里设置光源的位置
    // scene.add(directionalLight);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);
}


// render的时候就不能使用 renderer了  要使用composer
const autoDraw = () => {
    const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        controls.update();

        // 🌟 抛弃 scene.traverse！只遍历处于激活状态的旋转物体
        rotatingObjects.forEach((obj) => {
            obj.rotation.y += 0.02; 
        });

        if (composer) {
            composer.render();
        }
    }
    animate();
}


// autoZoom的时候不仅仅要改变renderer还要改变composer
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

```



