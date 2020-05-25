const {compareVersion} = require('./utils/index')

const canvasId = 'canvas-sugarjs'

Component({
  properties: {
    width: {
      type: Number,
      value: 400
    },
    height: {
      type: Number,
      value: 300
    },
  },
  data: {
    use2dCanvas: false, // 2.9.0 后可用canvas 2d 接口
  },
  lifetimes: {
    attached() {
      // const {SDKVersion, pixelRatio: dpr} = wx.getSystemInfoSync()
      // const use2dCanvas = compareVersion(SDKVersion, '2.9.0') >= 0
      // this.dpr = dpr
      // this.setData({use2dCanvas}, () => {
      //   if (use2dCanvas) {
      //     const query = this.createSelectorQuery()
      //     query.select(`#${canvasId}`)
      //       .fields({node: true, size: true})
      //       .exec(res => {
      //         const canvas = res[0].node
      //         const ctx = canvas.getContext('2d')
      //         canvas.width = res[0].width * dpr
      //         canvas.height = res[0].height * dpr
      //         // 在调用后，之后创建的路径其横纵坐标会被缩放。多次调用倍数会相乘。
      //         ctx.scale(dpr, dpr)
      //         this.ctx = ctx
      //         this.canvas = canvas
      //       })
      //   } else {
      //     this.ctx = wx.createCanvasContext(canvasId, this)
      //   }
      // })
    }
  },
  methods: {}
})
