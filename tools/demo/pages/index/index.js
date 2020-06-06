const sugar = require('../../components/sugarjs')
const {windowWidth} = wx.getSystemInfoSync()

const randomNumInRange = (min, max) => {
  let range = max - min
  return Math.round(Math.random() * range) + min
}

Page({
  data: {
    width: windowWidth,
    height: 500,
    selectObj: null,
    dataUrl: null,
  },
  onReady() {
    // this.sugar = createCanvasSugarJS({
    //   width: this.data.width,
    //   height: this.data.height,
    //   context: wx.createCanvasContext('sugarjs')
    // })

    // const ctx = wx.createCanvasContext('sugarjs')
    // this.canvas = new sugar.Canvas(ctx)

    const query = wx.createSelectorQuery()
    query.select(`#sugarjs`)
      .fields({node: true, size: true})
      .exec(res => {
        const canvas = res[0].node
        this.sugar = new sugar.Canvas({
          canvas: canvas,
          width: this.data.width,
          height: this.data.height,
          backgroundColor: 'skyblue'
        })
        // this.sugar.preserveObjectStacking = true // 禁止选中图层时自动置于顶部

        console.log('sugar.Canvas初始化', this.sugar)
        // this.sugar.setBackgroundImage('http://g.hiphotos.baidu.com/zhidao/pic/item/6a600c338744ebf844eebc72d9f9d72a6159a7e4.jpg', this.sugar.renderAll.bind(this.sugar), {
        //   width: this.data.width,
        //   height: this.data.height
        // })

        sugar.Image.fromURL('https://desk-fd.zol-img.com.cn/t_s1024x768c5/g5/M00/02/09/ChMkJlbKzvWIBEvXABxtIglgbHoAALJQAOMI70AHG06059.jpg', (img) => {
          img.set({
            scaleX: this.data.width / img.width,
            scaleY: this.data.height / img.height
          })
          this.sugar.setBackgroundImage(img, this.sugar.renderAll.bind(this.sugar))
        })

        this.sugar.on('selection:created', (e) => {
          console.log('触发canvas事件selection:created', e.target)
          // this.setData({selectObj: e.target})
        })
        this.sugar.on('selection:updated', (e) => {
          console.log('触发canvas事件selection:updated', e.target)
          // this.setData({selectObj: e.target})
        })
        this.sugar.on('selection:cleared', (e) => {
          console.log('触发canvas事件selection:cleared')
          // this.setData({selectObj: null})
        })
        this.sugar.on('object:added', (e) => {
          console.log('触发canvas事件object:added', e)
        })
        this.sugar.on('object:removed', (e) => {
          console.log('触发canvas事件object:removed', e)
        })
      })
  },
  addText() {
    const text = new sugar.Text('Sugar苏\n换行', {
      left: randomNumInRange(0, 200),
      top: randomNumInRange(0, 400),
      fontSize: 50,
      fill: 'yellow'
    })
    this.sugar.add(text).setActiveObject(text)
  },
  addImage1() {
    sugar.Image.fromURL('https://sugars.oss-cn-shenzhen.aliyuncs.com/diy/decorate/decorate1.png', (img) => {
      img.set({
        left: randomNumInRange(0, this.data.width - 80),
        top: randomNumInRange(0, this.data.height - 80),
      })
      this.sugar.add(img).setActiveObject(img)
    })
  },
  addImage2() {
    sugar.Image.fromURL('https://sugars.oss-cn-shenzhen.aliyuncs.com/diy/decorate/decorate9.png', (img) => {
      img.set({
        left: randomNumInRange(0, this.data.width - 202),
        top: randomNumInRange(0, this.data.height - 170),
      })
      this.sugar.add(img).setActiveObject(img)
    })
  },
  selectImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        sugar.Image.fromURL(tempFilePath, (img) => {
          img.set({
            scaleX: 0.5,
            scaleY: 0.5,
            left: 0,
            top: 0
          })
          this.sugar.add(img).setActiveObject(img)
        })
      }
    })
  },
  getCanvasObject() {
    console.log(this.sugar)
  },
  rotate() {
    const activeObject = this.sugar.getActiveObject()
    if (!activeObject) return
    activeObject.rotate(activeObject.angle === 360 ? 90 : activeObject.angle + 90)
    this.sugar.renderAll()
  },
  flip() {
    const activeObject = this.sugar.getActiveObject()
    if (!activeObject) return
    activeObject.set({
      scaleX: -activeObject.scaleX
    })
    this.sugar.renderAll()
  },
  zoomUp() {
    const activeObject = this.sugar.getActiveObject()
    if (!activeObject) return
    activeObject.set({
      scaleX: activeObject.scaleX * 1.1,
      scaleY: activeObject.scaleY * 1.1
    })
    this.sugar.renderAll()
  },
  zoomOut() {
    const activeObject = this.sugar.getActiveObject()
    if (!activeObject) return
    activeObject.set({
      scaleX: activeObject.scaleX * 0.9,
      scaleY: activeObject.scaleY * 0.9
    })
    this.sugar.renderAll()
  },
  addRect() {
    const rect = new sugar.Rect({
      left: 100,
      top: 100,
      fill: 'green',
      width: 100,
      height: 100
    })

    this.sugar.add(rect)
  },
  addPolygon() {
    const points = [{
      x: 3, y: 4
    }, {
      x: 16, y: 3
    }, {
      x: 30, y: 5
    }, {
      x: 25, y: 55
    }, {
      x: 19, y: 44
    }, {
      x: 15, y: 30
    }, {
      x: 15, y: 55
    }, {
      x: 9, y: 55
    }, {
      x: 6, y: 53
    }, {
      x: -2, y: 55
    }, {
      x: -4, y: 40
    }, {
      x: 0, y: 20
    }]
    const polygon = new sugar.Polygon(points, {
      left: 100,
      top: 50,
      // scaleX: 4,
      // scaleY: 4,
      fill: '#D81B60'
    })

    this.sugar.add(polygon)
  },
  addTriangle() {
    const triangle = new sugar.Triangle({
      left: 55,
      top: 100,
      fill: 'pink',
      width: 80,
      height: 120
    })

    this.sugar.add(triangle)
  },
  addCircle() {
    const circle = new sugar.Circle({
      fill: '#0c32a0',
      radius: 50,
      top: 200,
      left: 200
    })

    this.sugar.add(circle)
  },
  addEllipse() {
    const ellipse = new sugar.Ellipse({
      fill: '#440250',
      rx: 50,
      ry: 100,
      top: 166,
      left: 166
    })

    this.sugar.add(ellipse)
  },
  deleteObject() {
    const activeObject = this.sugar.getActiveObject()
    if (!activeObject) return
    this.sugar.remove(activeObject)
    this.sugar.renderAll()
  },
  toDataURL() {
    this.setData({
      dataUrl: this.sugar.toDataURL()
    })
  },
  preview() {
    wx.previewImage({
      urls: [this.data.dataUrl]
    })
  },
  touchstart(e) {
    this.sugar.touchstart(e)
    // console.log('小程序touchstart', e)
  },
  touchmove(e) {
    this.sugar.touchmove(e)
    // console.log('小程序touchmove', e)
  },
  touchend(e) {
    this.sugar.touchend(e)
    // console.log('小程序touchend', e)
  },
  touchcancel(e) {
    // console.log('小程序touchcancel', e)
  },
  longtap(e) {
    this.sugar.longtap(e)
    // console.log('小程序longtap', e)
  },
})
