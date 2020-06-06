/**
 * Created by Sugar on 2020/6/6.
 */
const ObjectClass = require('./object.class')

const pi = Math.PI

class CircleClass extends ObjectClass {
  constructor(options) {
    super()

    this.type = 'circle'
    this.radius = 0
    this.startAngle = 0
    this.endAngle = pi * 2

    this.initialize(options)
  }

  initialize(options) {
    super.initialize(options)
  }

  _set(key, value) {
    super._set(key, value)

    if (key === 'radius') {
      this.setRadius(value)
    }

    return this
  }

  _render(ctx) {
    ctx.beginPath()
    ctx.arc(
      0,
      0,
      this.radius,
      this.startAngle,
      this.endAngle, false)
    this._renderPaintInOrder(ctx)
  }

  getRadiusX() {
    return this.get('radius') * this.get('scaleX')
  }

  /**
   * 返回对象的垂直半径（根据对象的缩放比例）
   */
  getRadiusY() {
    return this.get('radius') * this.get('scaleY')
  }

  /**
   * 设置对象的半径（并更新宽度）
   */
  setRadius(value) {
    this.radius = value
    return this.set('width', value * 2).set('height', value * 2)
  }
}

module.exports = CircleClass
