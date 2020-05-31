/**
 * Created by Sugar on 2020/5/26.
 */
const {invertTransform, transformPoint, loadImage} = require('./utils/misc')
const PointClass = require('point.class')
const ImageClass = require('./shapes/image.class')

class CanvasClass {
  constructor(options) {
    let canvas = options.canvas
    let ctx = canvas ? canvas.getContext('2d') : null
    if (!canvas || !ctx) {
      throw new Error(`请传入<canvas>组件节点`)
    }
    const dpr = wx.getSystemInfoSync().pixelRatio
    canvas.width = options.width * dpr
    canvas.height = options.height * dpr
    ctx.scale(dpr, dpr)
    this.ctx = ctx
    this.canvas = canvas
    this.dpr = dpr
    // this.width = width
    // this.height = height
    // this._objects = []

    this.backgroundImage = null // 画布实例的背景图像
    this.backgroundColor = '' // 画布实例的背景颜色
    this.overlayImage = null
    this.overlayColor = ''

    this.backgroundVpt = true
    this.overlayVpt = true
    this.controlsAboveOverlay = false // 是否在覆盖图像上方渲染对象

    this.viewportTransform = [1, 0, 0, 1, 0, 0]
    this.vptCoords = {} // 画布的四个角左边，属性为tl，tr，bl，br

    this.initialize(options)
  }

  initialize(options) {
    // this.renderAndResetBound = this.renderAndReset.bind(this);
    this.requestRenderAllBound = this.requestRenderAll.bind(this)
    this._initStatic(options)
    this._initInteractive()
  }

  _initInteractive() {
    this._currentTransform = null
    this._groupSelector = null
    // this._initEventListeners()

    // this._initRetinaScaling()

    // this.calcOffset()
  }


  /**
   * @private
   * @param {Object} [options] object
   */
  _initStatic(options) {
    let cb = this.requestRenderAllBound
    this._objects = []
    this._initOptions(options);
    if (options.backgroundImage) {
      this.setBackgroundImage(options.backgroundImage, cb);
    }
    if (options.backgroundColor) {
      this.setBackgroundColor(options.backgroundColor, cb)
    }
    // if (options.overlayImage) {
    //   this.setOverlayImage(options.overlayImage, cb);
    // }
    // if (options.overlayColor) {
    //   this.setOverlayColor(options.overlayColor, cb);
    // }
  }

  _initOptions(options) {
    this._setOptions(options);

    this.width = this.width || 0;
    this.height = this.height || 0;

    this.viewportTransform = this.viewportTransform.slice();
  }

  _isRetinaScaling() {
    return (this.dpr !== 1 && this.enableRetinaScaling);
  }

  getRetinaScaling() {
    return this._isRetinaScaling() ? this.dpr : 1;
  }

  setBackgroundImage(image, callback, options) {
    return this.__setBgOverlayImage('backgroundImage', image, callback, options)
  }

  setBackgroundColor(backgroundColor, callback) {
    return this.__setBgOverlayColor('backgroundColor', backgroundColor, callback)
  }

  __setBgOverlayImage(property, image, callback, options) {
    if (typeof image === 'string') {
      loadImage(image, (img, isError) => {
        console.log('设置背景图', img);
        if (img) {
          let instance = new ImageClass(img, options)
          this[property] = instance
          instance.canvas = this
        }
        callback && callback(img, isError)
      }, this)
    } else {
      options && image.setOptions(options)
      this[property] = image
      image && (image.canvas = this)
      callback && callback(image, false)
    }

    return this
  }

  __setBgOverlayColor(property, color, callback) {
    this[property] = color
    this._initGradient(color, property)
    this._initPattern(color, property, callback)
    return this
  }

  add() {
    this._objects.push.apply(this._objects, arguments)
    if (this._onObjectAdded) {
      for (let i = 0; i < arguments.length; i++) {
        this._onObjectAdded(arguments[i])
      }
    }
    this.requestRenderAll()
    return this
  }

  _onObjectAdded(obj) {
    // this.stateful && obj.setupState();
    obj._set('canvas', this);
    obj.setCoords();
    this.fire('object:added', {target: obj});
    obj.fire('added');
  }

  _onObjectRemoved(obj) {
    this.fire('object:removed', {target: obj});
    obj.fire('removed');
    delete obj.canvas;
  }

  /**
   * 清除画布元素的指定上下文
   * @param {CanvasContext} ctx 要清除的上下文
   * @return {sugar.Canvas} thisArg
   */
  clearContext(ctx) {
    ctx.clearRect(0, 0, this.width, this.height)
    return this
  }

  /**
   * 返回绘制对象的画布的上下文
   * @return {CanvasContext}
   */
  getContext() {
    return this.ctx
  }

  /**
   * 清除实例的所有上下文（背景，主要内容等）
   * @return {sugar.Canvas} thisArg
   */
  clear() {
    // this.discardActiveObject() // TODO
    this._objects.length = 0
    this.backgroundImage = null
    this.backgroundColor = ''
    this.clearContext(this.ctx)
    // this.fire('canvas:cleared')
    this.requestRenderAll()
    return this
  }

  /**
   * 绘制对象的控件（边框/控件）
   * @param {CanvasContext} ctx
   */
  drawControls(ctx) {
    let activeObject = this._activeObject

    if (activeObject) {
      console.log('drawControls, activeObject:', activeObject)
      activeObject._renderControls(ctx)
    }
  }

  getZoom() {
    return this.viewportTransform[0];
  }

  /**
   * 将renderAll请求追加到下一个动画帧
   * 除非已经在进行中，否则就什么也不做
   * @return {sugar.Canvas} instance
   */
  requestRenderAll() {
    if (!this.isRendering) {
      this.isRendering = this.canvas.requestAnimationFrame(() => {
        this.isRendering = 0
        this.renderAll()
      })
    }
    return this
  }

  /**
   * 使用当前视口计算画布4个角的位置
   * @return {Object} points
   */
  calcViewportBoundaries() {
    let points = {}, width = this.width, height = this.height,
      iVpt = invertTransform(this.viewportTransform)
    points.tl = transformPoint({x: 0, y: 0}, iVpt)
    points.br = transformPoint({x: width, y: height}, iVpt)
    points.tr = new PointClass(points.br.x, points.tl.y)
    points.bl = new PointClass(points.tl.x, points.br.y)
    this.vptCoords = points
    return points
  }

  cancelRequestedRender() {
    if (this.isRendering) {
      this.canvas.cancelAnimationFrame(this.isRendering)
      this.isRendering = 0
    }
  }

  /**
   * 渲染画布
   * @return {sugar.Canvas} instance
   */
  renderAll() {
    this.renderCanvas(this.ctx, this._objects)
    return this
  }

  /**
   * 渲染背景，对象，叠加层和控件
   * @param {CanvasContext} ctx
   * @param {Array} objects 待渲染的图层对象
   * @return {sugar.Canvas} instance
   */
  renderCanvas(ctx, objects) {
    let v = this.viewportTransform
    this.cancelRequestedRender()
    this.calcViewportBoundaries()
    this.clearContext(ctx)
    // setImageSmoothing(ctx, this.imageSmoothingEnabled);
    // this.fire('before:render', {ctx: ctx,});
    console.log('before:render');
    this._renderBackground(ctx);

    ctx.save();
    // 对所有渲染过程应用一次视口变换
    ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5])
    this._renderObjects(ctx, objects)
    ctx.restore()
    if (!this.controlsAboveOverlay) {
      this.drawControls(ctx)
    }
    // this._renderOverlay(ctx)
    if (this.controlsAboveOverlay) {
      this.drawControls(ctx)
    }
    console.log('renderCanvas after:render');
    // this.fire('after:render', {ctx: ctx,})
  }

  /**
   * @private
   * @param {CanvasContext} ctx
   * @param {Array} objects
   */
  _renderObjects(ctx, objects) {
    for (let i = 0; i < objects.length; i++) {
      objects[i] && objects[i].render(ctx)
    }
  }

  /**
   * @private
   * @param {CanvasContext} ctx
   * @param {string} property 'background' 或 'overlay'
   */
  _renderBackgroundOrOverlay(ctx, property) {
    let fill = this[property + 'Color']
    let object = this[property + 'Image']
    let v = this.viewportTransform
    let needsVpt = this[property + 'Vpt']
    if (!fill && !object) {
      return
    }
    if (fill) {
      ctx.save()
      ctx.beginPath();
      ctx.moveTo(0, 0)
      ctx.lineTo(this.width, 0)
      ctx.lineTo(this.width, this.height)
      ctx.lineTo(0, this.height)
      ctx.closePath()
      ctx.fillStyle = fill.toLive ? fill.toLive(ctx, this) : fill
      if (needsVpt) {
        ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5])
      }
      ctx.transform(1, 0, 0, 1, fill.offsetX || 0, fill.offsetY || 0)
      // let m = fill.gradientTransform || fill.patternTransform
      // m && ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5])
      ctx.fill()
      ctx.restore()
    }
    if (object) {
      ctx.save()
      if (needsVpt) {
        ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5])
      }
      object.render(ctx)
      ctx.restore()
    }
  }

  /**
   * @private
   * @param {CanvasContext} ctx
   */
  _renderBackground(ctx) {
    this._renderBackgroundOrOverlay(ctx, 'background')
  }

  /**
   * @private
   * @param {CanvasContext} ctx
   */
  _renderOverlay(ctx) {
    this._renderBackgroundOrOverlay(ctx, 'overlay')
  }

  /**
   * 返回画布中心的坐标
   * @return {Object} object 返回值是具有top和left属性的对象
   */
  getCenter() {
    return {
      top: this.height / 2,
      left: this.width / 2
    }
  }

  /**
   * 返回当前选中操作的对象
   * @return {sugar.Object}
   */
  getActiveObject() {
    return this._activeObject
  }

  /**
   * 返回具有当前所选操作的对象数组
   * @return {sugar.Object} active object
   */
  getActiveObjects() {
    let active = this._activeObject
    if (active) {
      if (active.type === 'activeSelection' && active._objects) {
        return active._objects.slice(0)
      } else {
        return [active]
      }
    }
    return []
  }

  /**
   * 将一个对象在画布中设置为选中激活状态
   * @param {sugar.Object} object 设为激活的对象
   * @param {Event} [e] 事件（触发"object:selected"时传递）
   * @return {sugar.Canvas}
   */
  setActiveObject(object, e) {
    let currentActives = this.getActiveObjects()
    this._setActiveObject(object, e)
    // this._fireSelectionEvents(currentActives, e) TODO
    return this;
  }

  /**
   * @private
   * @param {Object} object 设为激活的对象
   * @param {Event} [e] 事件（触发"object:selected"时传递）
   * @return {Boolean} 如果对象为选中激活状态，返回true
   */
  _setActiveObject(object, e) {
    if (this._activeObject === object) {
      // 当前对象已选中
      return false
    }
    if (!this._discardActiveObject(e, object)) {
      return false
    }
    if (object.onSelect({e: e})) {
      return false
    }
    this._activeObject = object
    return true
  }

  /**
   * @private
   */
  _discardActiveObject(e, object) {
    let obj = this._activeObject;
    if (obj) {
      if (obj.onDeselect({e: e, object: object})) {
        return false
      }
      this._activeObject = null
    }
    return true
  }
}

module.exports = CanvasClass
