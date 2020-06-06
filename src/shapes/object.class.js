/**
 * Created by Sugar on 2020/5/26.
 */

const {
  multiplyTransformMatrices,
  qrDecompose,
  degreesToRadians
} = require('../utils/misc')

class ObjectClass {
  constructor(options) {
    this.type = 'object'
    this.originX = 'left'
    this.originY = 'top'
    this.top = 0
    this.left = 0
    this.width = 0
    this.height = 0
    this.originY = 'top'
    this.scaleX = 1
    this.scaleY = 1
    this.flipX = false
    this.flipY = false
    this.opacity = 1
    this.angle = 0
    this.skewX = 0
    this.skewY = 0
    this.stroke = null
    this.strokeWidth = 1
    this.strokeDashArray = null
    this.strokeDashOffset = 0
    this.padding = 0
    this.cornerSize = 13
    this.touchCornerSize = 24
    this.transparentCorners = true
    this.fill = 'rgb(0,0,0)'
    this.strokeWidth = 1
    this.backgroundColor = ''
    this.borderColor = 'orange'
    this.borderDashArray = null
    this.cornerColor = 'blue'
    this.cornerStrokeColor = null
    this.cornerStyle = 'rect'
    this.cornerDashArray = null
    this.centeredScaling = false
    this.centeredRotation = true // 如果为true，则将以物体中心为原点
    this.selectable = true
    this.evented = true
    this.visible = true
    this.hasControls = true
    this.hasBorders = true
    this.lockMovementX = false
    this.lockMovementY = false
    this.lockRotation = false
    this.lockScalingX = false
    this.lockScalingY = false
    this.lockSkewingX = false
    this.lockSkewingY = false
    this.selectionBackgroundColor = ''
    this.paintFirst = 'stroke'
    this.borderScaleFactor = 1
    this.borderOpacityWhenMoving = 0.4
    this.minScaleLimit = 0
    this.__corner = 0
  }

  initialize(options) {
    if (options) {
      this.setOptions(options);
    }
  }

  setOptions(options) {
    this._setOptions(options);
    this._initGradient(options.fill, 'fill');
    this._initGradient(options.stroke, 'stroke');
    this._initPattern(options.fill, 'fill');
    this._initPattern(options.stroke, 'stroke');
  }

  /*
   * @private
   * 判断是否可渲染
   * @memberOf sugar.Object.prototype
   * @return {Boolean}
   */
  isNotVisible() {
    return this.opacity === 0 || (!this.width && !this.height) || !this.visible
  }

  /**
   * 在指定的上下文中渲染对象
   * @param {CanvasContext} ctx 微信<canvas>组件的绘图上下文
   */
  render(ctx) {
    if (this.isNotVisible()) {
      return
    }
    ctx.save()
    // this._setupCompositeOperation(ctx)
    this.drawSelectionBackground(ctx)
    this.transform(ctx)
    // this._setOpacity(ctx)
    // this._setShadow(ctx, this)
    // if (this.shouldCache()) {
    //   this.renderCache()
    //   this.drawCacheOnCanvas(ctx);
    // } else {
    // this._removeCacheCanvas();
    this.drawObject(ctx)
    // if (this.objectCaching && this.statefullCache) {
    //   this.saveState({propertySet: 'cacheProperties'});
    // }
    // }
    ctx.restore()
  }

  transform(ctx) {
    let m = this.calcOwnMatrix()
    // if (this.group && !this.group._transformDone) {
    //   m = this.calcTransformMatrix();
    // }
    // console.log(m)
    ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
  }

  drawObject(ctx, forClipping) {
    let originalFill = this.fill
    let originalStroke = this.stroke
    if (forClipping) {
      this.fill = 'black'
      this.stroke = ''
      // this._setClippingProperties(ctx) // TODO
    } else {
      this._renderBackground(ctx)
      this._setStrokeStyles(ctx, this)
      this._setFillStyles(ctx, this)
    }
    // 调用子类的_render方法，绘制到canvas
    this._render(ctx)
    // this._drawClipPath(ctx)
    this.fill = originalFill
    this.stroke = originalStroke
  }

  _removeShadow(ctx) {
    if (!this.shadow) {
      return;
    }

    ctx.shadowColor = '';
    ctx.shadowBlur = ctx.shadowOffsetX = ctx.shadowOffsetY = 0;
  }

  _applyPatternGradientTransform(ctx, filler) {
    if (!filler || !filler.toLive) {
      return {offsetX: 0, offsetY: 0};
    }
    var t = filler.gradientTransform || filler.patternTransform;
    var offsetX = -this.width / 2 + filler.offsetX || 0,
      offsetY = -this.height / 2 + filler.offsetY || 0;

    if (filler.gradientUnits === 'percentage') {
      ctx.transform(this.width, 0, 0, this.height, offsetX, offsetY);
    } else {
      ctx.transform(1, 0, 0, 1, offsetX, offsetY);
    }
    if (t) {
      ctx.transform(t[0], t[1], t[2], t[3], t[4], t[5]);
    }
    return {offsetX: offsetX, offsetY: offsetY};
  }

  _renderPaintInOrder(ctx) {
    if (this.paintFirst === 'stroke') {
      this._renderStroke(ctx);
      this._renderFill(ctx);
    } else {
      this._renderFill(ctx);
      this._renderStroke(ctx);
    }
  }

  _render() {

  }

  _renderFill(ctx) {
    if (!this.fill) {
      return;
    }

    ctx.save();
    // this._applyPatternGradientTransform(ctx, this.fill);
    if (this.fillRule === 'evenodd') {
      ctx.fill('evenodd');
    } else {
      ctx.fill();
    }
    ctx.restore();
  }

  _renderStroke(ctx) {

  }

  getViewportTransform() {
    if (this.canvas && this.canvas.viewportTransform) {
      return this.canvas.viewportTransform;
    }
    return [1, 0, 0, 1, 0, 0].concat();
  }

  /**
   * 为对象绘制背景，尺寸不变
   * @private
   * @param {CanvasRenderingContext2D} ctx
   */
  _renderBackground(ctx) {
    if (!this.backgroundColor) {
      return;
    }
    let dim = this._getNonTransformedDimensions();
    ctx.fillStyle = this.backgroundColor;

    ctx.fillRect(
      -dim.x / 2,
      -dim.y / 2,
      dim.x,
      dim.y
    );
    // if there is background color no other shadows
    // should be casted
    // this._removeShadow(ctx);
  }

  getObjectOpacity() {
    let opacity = this.opacity;
    // if (this.group) {
    // opacity *= this.group.getObjectOpacity();
    // }
    return opacity;
  }

  _set(key, value) {
    console.log('set scaleX')
    let shouldConstrainValue = (key === 'scaleX' || key === 'scaleY')

    if (shouldConstrainValue) {
      value = this._constrainScale(value);
    }
    if (key === 'scaleX' && value < 0) {
      this.flipX = !this.flipX
      value *= -1;
    } else if (key === 'scaleY' && value < 0) {
      this.flipY = !this.flipY
      value *= -1;
    }

    this[key] = value;

    return this
  }

  _setOpacity(ctx) {
    if (this.group && !this.group._transformDone) {
      ctx.globalAlpha = this.getObjectOpacity();
    } else {
      ctx.globalAlpha *= this.opacity;
    }
  }

  _setStrokeStyles(ctx, decl) {
    if (decl.stroke) {
      ctx.lineWidth = decl.strokeWidth;
      ctx.lineCap = decl.strokeLineCap;
      ctx.lineDashOffset = decl.strokeDashOffset;
      ctx.lineJoin = decl.strokeLineJoin;
      ctx.miterLimit = decl.strokeMiterLimit;
      ctx.strokeStyle = decl.stroke.toLive
        ? decl.stroke.toLive(ctx, this)
        : decl.stroke;
    }
  }

  _setFillStyles(ctx, decl) {
    if (decl.fill) {
      ctx.fillStyle = decl.fill.toLive
        ? decl.fill.toLive(ctx, this)
        : decl.fill;
    }
  }

  _setClippingProperties(ctx) {
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'transparent';
    ctx.fillStyle = '#000000';
  }

  _setLineDash(ctx, dashArray, alternative) {
    if (!dashArray || dashArray.length === 0) {
      return;
    }
    if (1 & dashArray.length) {
      dashArray.push.apply(dashArray, dashArray);
    }
    if (supportsLineDash) {
      ctx.setLineDash(dashArray);
    } else {
      alternative && alternative(ctx);
    }
  }

  /**
   * 渲染对象的控件和边框
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} [styleOverride] 覆盖对象样式的属性
   */
  _renderControls(ctx, styleOverride) {
    let vpt = this.getViewportTransform(),
      matrix = this.calcTransformMatrix(),
      options, drawBorders, drawControls;
    styleOverride = styleOverride || {};
    drawBorders = typeof styleOverride.hasBorders !== 'undefined' ? styleOverride.hasBorders : this.hasBorders;
    drawControls = typeof styleOverride.hasControls !== 'undefined' ? styleOverride.hasControls : this.hasControls;
    matrix = multiplyTransformMatrices(vpt, matrix);
    options = qrDecompose(matrix);
    ctx.save();
    ctx.translate(options.translateX, options.translateY);
    ctx.lineWidth = 1 * this.borderScaleFactor;
    if (!this.group) {
      ctx.globalAlpha = this.isMoving ? this.borderOpacityWhenMoving : 1;
    }
    if (styleOverride.forActiveSelection) {
      ctx.rotate(degreesToRadians(options.angle));
      drawBorders && this.drawBordersInGroup(ctx, options, styleOverride);
    } else {
      ctx.rotate(degreesToRadians(this.angle));
      drawBorders && this.drawBorders(ctx, styleOverride);
    }
    drawControls && this.drawControls(ctx, styleOverride);
    ctx.restore();
  }

  rotate(angle) {
    let shouldCenterOrigin = (this.originX !== 'center' || this.originY !== 'center') && this.centeredRotation;

    if (shouldCenterOrigin) {
      this._setOriginToCenter();
    }

    this.set('angle', angle);

    if (shouldCenterOrigin) {
      this._resetOrigin();
    }

    return this
  }
}

ObjectClass.__uid = 0

module.exports = ObjectClass
