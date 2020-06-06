# miniprogram-canvas-sugarjs

[![](https://img.shields.io/npm/v/miniprogram-canvas-sugarjs)](https://www.npmjs.com/package/miniprogram-canvas-sugarjs)

> 使用此组件需要依赖依赖开发者工具的 npm 构建。具体详情可查阅[微信小程序官方npm文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/npm.html)。

## 介绍

打造一个致力于微信小程序的Canvas库，类似于H5原生JS Canvas库 - [FabricJS](http://fabricjs.com/)

<p align="center" style="text-align: center;">
  <img width="400" src="https://sugars.oss-cn-shenzhen.aliyuncs.com/mp-canvas-sugarjs/sugarjs-demo.png?x-oss-process=style/quality" style="display:inline-block;">
</p>

## 开发进度

开发中...

## 使用方法

1. 安装组件

```
npm install --save miniprogram-canvas-sugarjs
```

2. .wxml

```html
<canvas id="sugarjs"
        type="2d"
        disable-scroll="true"
        bindtouchstart="touchstart"
        bindtouchmove="touchmove"
        bindtouchend="touchend"
        style='width: {{width}}px; height: {{height}}px;'>
</canvas>
```

3. 在.js文件中引用

```js
const sugar = require('miniprogram-canvas-sugarjs')

Page({
  data: {
    width: windowWidth,
    height: 500,
  },
  onReady() {
    const query = wx.createSelectorQuery()
    query.select(`#sugarjs`).fields({node: true, size: true}).exec(res => {
      const canvas = res[0].node
      this.sugar = new sugar.Canvas({
        canvas: canvas,
        width: this.data.width,
        height: this.data.height,
        backgroundColor: 'skyblue'
      })
    })
  }
})
```



### 功能清单

1. canvas主体
- [x] 初始化（宽高、背景）
- [ ] 其他...

2. 图层类
- [x] 基类ObjectClass
- [x] 图片ImageClass
- [x] 文本TextClass
- [x] 矩形RectClass
- [x] 三角形TriangleClass
- [x] 多边形PolygonClass
- [x] 圆CircleClass
- [x] 椭圆EllipseClass
- [ ] 直线LineClass
- [ ] 群组GroupClass
- [ ] 其他...


3. 操作
- [x] 增删
- [x] 点击图层进入选中状态（显示图层边框控件）
- [x] 拖动
- [x] 缩放
- [x] 旋转
- [x] 翻转
- [ ] 图层层级管理（上移、下移、置顶、置底）
- [ ] 文本内容编辑
- [ ] 其他...

4. 事件监听
- [x] canvas初始化周期事件
- [x] 手指触摸事件
- [ ] 清单3中的操作事件的监听
- [ ] 其他...

5. 拓展、增强功能
- [ ] 状态存储（撤销undo、恢复redo）
- [ ] 导入、导出canvas数据
- [x] toDataURL生成图片
- [ ] 手势缩放、旋转
- [ ] 动画
- [ ] 其他...

