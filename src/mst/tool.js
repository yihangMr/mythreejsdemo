// 1. 接入地形服务（骨骼：自带起伏）
viewer.terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl("你的地形服务URL");

// 2. 接入底图或 WCS 影像服务（皮肤：自动贴在骨骼上）
const wcsImageryProvider = new Cesium.WebMapServiceImageryProvider({
  url: "你的WCS或WMS服务URL",
  layers: "图层名"
});
viewer.imageryLayers.addImageryProvider(wcsImageryProvider);

// 3. 接入业务矢量数据（设置贴地）
viewer.entities.add({
  polygon: {
    hierarchy: Cesium.Cartesian3.fromDegreesArray([/* 经纬度坐标 */]),
    material: Cesium.Color.RED.withAlpha(0.5),
    clampToGround: true // <--- 关键：让这个面跟着地形一起起伏，防止穿模
  }
});