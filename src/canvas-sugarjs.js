/**
 * Created by Sugar on 2020/5/25.
 */
const canvasId = 'canvas-sugarjs'

class CanvasSugarJS {
  constructor({id, context, page}) {
    // this.id = id
    this.page = page
    const {pixelRatio: dpr} = wx.getSystemInfoSync()
    this.dpr = dpr

    this.ctx = context

    if (!this.ctx) {
      throw new Error(`canvas not found`)
    }
  }


  add() {
    let ctx = this.ctx
    ctx.rect(0, 0, 50, 50)
    ctx.setFillStyle('red')
    ctx.fill()
    ctx.draw()
  }
}


module.exports = function (options) {
  return new CanvasSugarJS(options)
}
