# miniprogram-canvas-sugarjs

> 使用此组件需要依赖依赖开发者工具的 npm 构建。具体详情可查阅[微信小程序官方npm文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/npm.html)。

## 介绍

打造一个致力于微信小程序的Canvas库，类似于H5原生JS Canvas库-FabricJS

## 使用方法

1. 安装组件

```
npm install --save miniprogram-recycle-view
```

2. 在页面的js文件中引用

   ```js
   const createCanvasSugarJS = require('miniprogram-canvas-sugarjs')
   Page({
       onReady() {
           const sugar = createCanvasSugarJS({
               width: 300,
               height: 200,
               context: wx.createCanvasContext('sugarjs')
           })
       }
   })
   ```
