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
        this.sugar.setBackgroundImage('http://g.hiphotos.baidu.com/zhidao/pic/item/6a600c338744ebf844eebc72d9f9d72a6159a7e4.jpg', this.sugar.renderAll.bind(this.sugar), {
          width: this.data.width,
          height: this.data.height
        });

        // sugar.Image.fromURL('https://sugars.oss-cn-shenzhen.aliyuncs.com/diy/template/1.jpg', (img) => {
        //   console.log('load image fromURL', img);
        //   // img.set({width: this.sugar.width, height: this.sugar.height});
        //   this.sugar.setBackgroundImage(img, this.sugar.renderAll.bind(this.sugar));
        // });
      })
  },
  addRect() {
    // this.sugar.add()
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
  getCanvasObject() {
    console.log(this.sugar);
  }
})
