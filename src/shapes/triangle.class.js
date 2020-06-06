/**
 * Created by Sugar on 2020/6/6.
 */
const ObjectClass = require('./object.class')

class TriangleClass extends ObjectClass {
  constructor(options) {
    super()

    this.type = 'triangle'
    this.width = 50
    this.height = 50

    this.initialize(options)
  }

  initialize(options) {
    super.initialize(options)
  }

  _render(ctx) {
    let widthBy2 = this.width / 2
    let heightBy2 = this.height / 2

    ctx.beginPath()
    ctx.moveTo(-widthBy2, heightBy2)
    ctx.lineTo(0, -heightBy2)
    ctx.lineTo(widthBy2, heightBy2)
    ctx.closePath()

    this._renderPaintInOrder(ctx)
  }
}

module.exports = TriangleClass
