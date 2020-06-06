/**
 * Created by Sugar on 2020/6/7.
 */
const ObjectClass = require('./object.class')
const {
  min,
  max,
} = require('../utils/index')

class PolygonClass extends ObjectClass {
  constructor(points, options) {
    super()

    this.type = 'polygon'
    this.points = null

    this.initialize(points, options)
  }

  initialize(points, options) {
    options = options || {}
    this.points = points || []
    super.initialize(options)
    this._setPositionDimensions(options)
  }

  _setPositionDimensions(options) {
    let calcDim = this._calcDimensions(options), correctLeftTop
    this.width = calcDim.width
    this.height = calcDim.height
    if (!options.fromSVG) {
      correctLeftTop = this.translateToGivenOrigin(
        {x: calcDim.left - this.strokeWidth / 2, y: calcDim.top - this.strokeWidth / 2},
        'left',
        'top',
        this.originX,
        this.originY
      )
    }
    if (typeof options.left === 'undefined') {
      // this.left = options.fromSVG ? calcDim.left : correctLeftTop.x
      this.left = correctLeftTop.x
    }
    if (typeof options.top === 'undefined') {
      // this.top = options.fromSVG ? calcDim.top : correctLeftTop.y
      this.top = correctLeftTop.y
    }
    this.pathOffset = {
      x: calcDim.left + this.width / 2,
      y: calcDim.top + this.height / 2
    }
  }

  _calcDimensions() {
    let points = this.points,
      minX = min(points, 'x') || 0,
      minY = min(points, 'y') || 0,
      maxX = max(points, 'x') || 0,
      maxY = max(points, 'y') || 0,
      width = (maxX - minX),
      height = (maxY - minY)

    return {
      left: minX,
      top: minY,
      width: width,
      height: height
    }
  }

  commonRender(ctx) {
    let point, len = this.points.length,
      x = this.pathOffset.x,
      y = this.pathOffset.y

    if (!len || isNaN(this.points[len - 1].y)) {
      return false
    }
    ctx.beginPath()
    ctx.moveTo(this.points[0].x - x, this.points[0].y - y)
    for (let i = 0; i < len; i++) {
      point = this.points[i]
      ctx.lineTo(point.x - x, point.y - y)
    }
    return true
  }

  _render(ctx) {
    if (!this.commonRender(ctx)) {
      return;
    }
    ctx.closePath()
    this._renderPaintInOrder(ctx)
  }

  complexity() {
    return this.get('points').length
  }
}

module.exports = PolygonClass
