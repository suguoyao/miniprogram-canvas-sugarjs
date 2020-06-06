/**
 * Created by Sugar on 2020/6/6.
 */
const ObjectClass = require('./object.class')

const piBy2 = Math.PI * 2

class EllipseClass extends ObjectClass {
  constructor(options) {
    super()

    this.type = 'ellipse'
    this.rx = 0
    this.ry = 0

    this.initialize(options)
  }

  initialize(options) {
    super.initialize(options)
    this.set('rx', options && options.rx || 0)
    this.set('ry', options && options.ry || 0)
  }

  _set(key, value) {
    super._set(key, value)
    switch (key) {
      case 'rx':
        this.rx = value
        this.set('width', value * 2)
        break;

      case 'ry':
        this.ry = value
        this.set('height', value * 2)
        break;

    }
    return this;
  }

  getRx() {
    return this.get('rx') * this.get('scaleX')
  }

  getRy() {
    return this.get('ry') * this.get('scaleY')
  }

  _render(ctx) {
    ctx.beginPath()
    ctx.save()
    ctx.transform(1, 0, 0, this.ry / this.rx, 0, 0)
    ctx.arc(
      0,
      0,
      this.rx,
      0,
      piBy2,
      false);
    ctx.restore()
    this._renderPaintInOrder(ctx)
  }
}

module.exports = EllipseClass
