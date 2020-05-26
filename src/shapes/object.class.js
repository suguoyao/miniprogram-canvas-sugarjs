/**
 * Created by Sugar on 2020/5/26.
 */

class ObjectClass {
  constructor(options) {
    this.type = 'object'
    // this.originX = 'left'
    // this.originY = 'top'
    this.top = 0
    this.left = 0
    this.width = 0
    this.height = 0
    this.scaleX = 1
    this.scaleY = 1
    this.flipX = false
    this.flipY = false
    this.opacity = 1
    this.angle = 0
    this.stroke = null
    this.padding = 0
    this.fill = 'rgb(0,0,0)'
    this.backgroundColor = ''
    this.borderColor = '#000000'
    this.selectable = true
    this.visible = true
    this.hasControls = true
    this.lockMovementX = false
    this.lockMovementY = false

    this.initialize(options)
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
    // this.drawSelectionBackground(ctx)
    // this.transform(ctx)
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
    ctx.restore();
  }

  drawObject(ctx, forClipping) {
    let originalFill = this.fill
    let originalStroke = this.stroke
    if (forClipping) {
      this.fill = 'black';
      this.stroke = '';
      // this._setClippingProperties(ctx); // TODO
    } else {
      // this._renderBackground(ctx)
      // this._setStrokeStyles(ctx, this)
      // this._setFillStyles(ctx, this)
    }
    this._render(ctx)
    // this._drawClipPath(ctx)
    this.fill = originalFill
    this.stroke = originalStroke
  }

  _renderPaintInOrder(ctx) {
    // if (this.paintFirst === 'stroke') {
    //   this._renderStroke(ctx);
    //   this._renderFill(ctx);
    // } else {
    this._renderFill(ctx);
    this._renderStroke(ctx);
    // }
  }

  _render(ctx) {

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

  // _renderBackground(ctx) {
  //   if (!this.backgroundColor) {
  //     return;
  //   }
  //   var dim = this._getNonTransformedDimensions();
  //   ctx.fillStyle = this.backgroundColor;
  //
  //   ctx.fillRect(
  //     -dim.x / 2,
  //     -dim.y / 2,
  //     dim.x,
  //     dim.y
  //   );
  //   // if there is background color no other shadows
  //   // should be casted
  //   this._removeShadow(ctx);
  // }
}

ObjectClass.__uid = 0

module.exports = ObjectClass
