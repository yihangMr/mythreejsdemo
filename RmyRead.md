第一阶段（立刻学）
1. GLTFLoader（最重要）
模型引入
模型遍历（超级高频）

第二阶段（立刻学）
2. Raycaster（超重要）
“点击模型”

第三阶段（立刻学）
3. GSAP（非常重要）
企业动画系统。


第四阶段（马上学）
4. HDR 环境贴图

第五阶段（必须）
5. 后处理 EffectComposer
这是：“科技感”来源。
Bloom 泛光
Outline 高亮
FXAA 抗锯齿



📅 Three.js 进阶
🧱 第六阶段：材质的质感升华与高级控制
Demo9：PBR 材质四大核心贴图与金属质感

学习 Map（颜色）、RoughnessMap（粗糙度）、MetalnessMap（金属度）的组合拳。

掌握 NormalMap（法线贴图） 的底层原理：如何用一张 2D 图片让平面模型呈现出极其逼真的凹凸物理细节。

深度掌握 Emissive（自发光通道）：让模型的某些特定零件（如飞机尾喷口、科幻方块线条）自己发光，完美激活你今天刚学的 UnrealBloomPass 辉光特效。

🎬 第七阶段：动效系统的双线并进
Demo10：Blender 骨骼动画/内嵌动画提取

学习 AnimationMixer（动画混合器）、AnimationAction 的企业级标准用法。

实战：如何把美术在 Blender 里做好的飞机螺旋桨转动、或机器人走动动画，在网页端精准提取、播放、暂停、以及切换。

Demo11：THREE.Points 粒子系统与科幻背景

学习粒子矩阵的数学原理。

实战：用纯粒子（而不是 Mesh）低消耗渲染出智慧城市飞线、漫天星空背景、或者科技感数字沙盘。

🔮 第八阶段：着色器 Shader 敲门砖（拉开薪资差距的底牌）
Demo12：ShaderMaterial 自定义着色器入门

搞懂面试高频词：什么是顶点着色器（Vertex Shader）和片元着色器（Fragment Shader）。

实战：不聊高深数学，亲手用 GLSL 语言写一个“科技感流动光带效果”或“圆形雷达扫描动效”。

⚡ 第九阶段：企业级极限性能优化
Demo13：InstancedMesh（实例化网格）与 Draco 模型压缩

掌握 InstancedMesh：如何用一个绘制调用（Draw Call）流畅渲染一万个一模一样的高精物体（如森林、大屏矩阵）。

落地：如何在 Vue3 中引入 Draco 解压器，让 50MB 的模型瞬间压缩到 5MB，实现网页秒开。