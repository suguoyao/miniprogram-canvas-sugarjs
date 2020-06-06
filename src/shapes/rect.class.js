/**
 * Created by Sugar on 2020/5/26.
 */
const ObjectClass = require('./object.class')

class RectClass extends ObjectClass {
  constructor(options) {
    super();
    this.type = 'rect'
    this.rx = 0
    this.ry = 0

    this.initialize(options)
  }

  initialize(options) {
    super.initialize(options)
    this._initRxRy()
  }

  _initRxRy() {
    if (this.rx && !this.ry) {
      this.ry = this.rx
    } else if (this.ry && !this.rx) {
      this.rx = this.ry
    }
  }

  _render(ctx) {
    console.log('绘制矩形', this)
    let rx = this.rx ? Math.min(this.rx, this.width / 2) : 0,
      ry = this.ry ? Math.min(this.ry, this.height / 2) : 0,
      w = this.width,
      h = this.height,
      x = -this.width / 2,
      y = -this.height / 2,
      isRounded = rx !== 0 || ry !== 0,
      k = 1 - 0.5522847498
    ctx.beginPath()

    ctx.moveTo(x + rx, y)

    ctx.lineTo(x + w - rx, y)
    isRounded && ctx.bezierCurveTo(x + w - k * rx, y, x + w, y + k * ry, x + w, y + ry)

    ctx.lineTo(x + w, y + h - ry)
    isRounded && ctx.bezierCurveTo(x + w, y + h - k * ry, x + w - k * rx, y + h, x + w - rx, y + h)

    ctx.lineTo(x + rx, y + h)
    isRounded && ctx.bezierCurveTo(x + k * rx, y + h, x, y + h - k * ry, x, y + h - ry)

    ctx.lineTo(x, y + ry)
    isRounded && ctx.bezierCurveTo(x, y + k * ry, x + k * rx, y, x + rx, y)

    ctx.closePath()

    this._renderPaintInOrder(ctx)
  }
}

module.exports = RectClass
