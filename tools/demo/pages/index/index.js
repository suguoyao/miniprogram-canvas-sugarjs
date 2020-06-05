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
  addRect() {
    // this.sugar.add()
  },
  addText() {
    const text = new sugar.Text('Sugar苏', {
      left: randomNumInRange(0, 200),
      top: randomNumInRange(0, 400),
      fontSize: 50,
      fill: '#409EFF'
    })
    this.sugar.add(text).setActiveObject(text)
  },
  addImage1() {
    sugar.Image.fromURL('https://sugars.oss-cn-shenzhen.aliyuncs.com/diy/decorate/decorate1.png', (img) => {
      img.set({
        width: 80,
        height: 80,
        left: randomNumInRange(0, this.data.width - 80),
        top: randomNumInRange(0, this.data.height - 80),
        opacity: 0.5
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
  getCanvasObject() {
    console.log(this.sugar)
  },
  deleteObject() {
    const activeObject = this.sugar.getActiveObject()
    if (!activeObject) return
    this.sugar.remove(activeObject)
    // this.sugar.renderAll()
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
