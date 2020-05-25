const createCanvasSugarJS = require('../../components/canvas-sugarjs.js')
const {windowWidth} = wx.getSystemInfoSync()

Page({
  data: {
    width: windowWidth,
    height: 500,
  },
  onReady() {
    this.sugar = createCanvasSugarJS({
      // id: 'sugarjs',
      width: this.data.width,
      height: this.data.height,
      context: wx.createCanvasContext('sugarjs'),
      page: this
    })
  },
  addRect() {
    this.sugar.add()
  },
  addText() {
    // const textbox = new sugar.Textbox('这是一段文字', {
    //   left: 50,
    //   top: 50,
    //   width: 150,
    //   fontSize: 20,
    //   fontWeight: 800,
    //   hasControls: false,
    //   borderColor: '#ff8d23',
    //   editingBorderColor: '#ff8d23',
    // });
    // this.sugar.add(textbox)
    // this.sugar.add(textbox).setActiveObject(textbox)
  },
  addImage() {

  },
})
