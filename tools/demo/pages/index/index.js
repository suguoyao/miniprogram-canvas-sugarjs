const sugar = require('../../components/sugarjs')
const {windowWidth} = wx.getSystemInfoSync()

Page({
  data: {
    width: windowWidth,
    height: 500,
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

        this.sugar.on('object:added', (e) => {
          console.log('object:added')
        })
        this.sugar.on('object:removed', (e) => {
          console.log('object:removed')
        })
      })
  },
  addRect() {
    // this.sugar.add()
  },
  addText() {
    const text = new sugar.Text('Sugar苏', {
      left: 100,
      top: 200,
      fontSize: 50,
      // fontWeight: 800,
      fill: 'blue'
    })
    this.sugar.add(text)
    // this.sugar.add(textbox).setActiveObject(textbox)
  },
  addImage1() {
    sugar.Image.fromURL('https://sugars.oss-cn-shenzhen.aliyuncs.com/diy/decorate/decorate1.png', (img) => {
      img.set({
        // width: 750,
        // height: 500,
        left: 100,
        top: 100,
        opacity: 0.5
      })
      this.sugar.add(img)
    })
  },
  addImage2() {
    sugar.Image.fromURL('https://sugars.oss-cn-shenzhen.aliyuncs.com/diy/decorate/decorate9.png', (img) => {
      img.set({
        // width: 750,
        // height: 500,
      })
      this.sugar.add(img)
    })
  },
  getCanvasObject() {
    console.log(this.sugar)
  },

  touchstart(e) {
    console.log('小程序touchstart', e)
  },
  touchmove(e) {
    console.log('小程序touchmove', e)
  },
  touchend(e) {
    console.log('小程序touchend', e)
  },
  touchcancel(e) {
    console.log('小程序touchcancel', e)
  },
  longtap(e) {
    console.log('小程序longtap', e)
  },
})
