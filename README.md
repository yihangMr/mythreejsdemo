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

