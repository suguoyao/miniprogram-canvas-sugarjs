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

    this.preserveObjectStacking = false
    this.allowTouchScrolling = true

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

  remove() {
    let objects = this._objects
    let index
    let somethingRemoved = false

    for (let i = 0; i < arguments.length; i++) {
      index = objects.indexOf(arguments[i])

      if (index !== -1) {
        somethingRemoved = true
        objects.splice(index, 1)
        this._onObjectRemoved && this._onObjectRemoved(arguments[i])
      }
    }

    somethingRemoved && this.requestRenderAll()
    return this
  }

  _onObjectAdded(obj) {
    // this.stateful && obj.setupState()
    obj._set('canvas', this);
    obj.setCoords();
    this.fire('object:added', {target: obj})
    obj.fire('added');
  }

  _onObjectRemoved(obj) {
    if (obj === this._activeObject) {
      this.fire('before:selection:cleared', {target: obj})
      this._discardActiveObject()
      this.fire('selection:cleared', {target: obj})
      obj.fire('deselected');
    }
    this.fire('object:removed', {target: obj})
    obj.fire('removed')
    delete obj.canvas
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

  discardActiveObject(e) {
    let currentActives = this.getActiveObjects(), activeObject = this.getActiveObject()
    if (currentActives.length) {
      this.fire('before:selection:cleared', {target: activeObject, e: e})
    }
    this._discardActiveObject(e)
    this._fireSelectionEvents(currentActives, e)
    return this
  }

  /**
   * 清除实例的所有上下文（背景，主要内容等）
   * @return {sugar.Canvas} thisArg
   */
  clear() {
    this.discardActiveObject()
    this._objects.length = 0
    this.backgroundImage = null
    this.backgroundColor = ''
    this.clearContext(this.ctx)
    // this.fire('canvas:cleared')
    this.requestRenderAll()
    return this
  }

  _shouldClearSelection(e, target) {
    let activeObjects = this.getActiveObjects(),
      activeObject = this._activeObject

    return (
      !target
      ||
      (target &&
        activeObject &&
        activeObjects.length > 1 &&
        activeObjects.indexOf(target) === -1 &&
        activeObject !== target)
      ||
      (target && !target.evented)
      ||
      (target &&
        !target.selectable &&
        activeObject &&
        activeObject !== target)
    )
  }

  _setupCurrentTransform(e, target, alreadySelected) {
    if (!target) {
      return;
    }

    let pointer = this.getPointer(e), corner = target.__corner,
      // actionHandler = !!corner && target.controls[corner].getActionHandler(),
      // action = this._getActionFromCorner(alreadySelected, corner, e, target),
      // origin = this._getOriginFromCorner(target, corner),
      transform = {
        target: target,
        // action: action,
        action: 'drag',
        // actionHandler: actionHandler,
        corner: corner,
        scaleX: target.scaleX,
        scaleY: target.scaleY,
        skewX: target.skewX,
        skewY: target.skewY,
        offsetX: pointer.x - target.left,
        offsetY: pointer.y - target.top,
        // originX: origin.x,
        // originY: origin.y,
        originX: target.originX,
        originY: target.originY,
        ex: pointer.x,
        ey: pointer.y,
        lastX: pointer.x,
        lastY: pointer.y,
        // theta: degreesToRadians(target.angle),
        width: target.width * target.scaleX,
      };

    // if (this._shouldCenterTransform(target, action, altKey)) {
    //   transform.originX = 'center';
    //   transform.originY = 'center';
    // }
    // transform.original.originX = origin.x;
    // transform.original.originY = origin.y;
    this._currentTransform = transform;
    this._beforeTransform(e);
  }

  _translateObject(x, y) {
    let transform = this._currentTransform,
      target = transform.target,
      newLeft = x - transform.offsetX,
      newTop = y - transform.offsetY,
      moveX = !target.get('lockMovementX') && target.left !== newLeft,
      moveY = !target.get('lockMovementY') && target.top !== newTop

    moveX && target.set('left', newLeft)
    moveY && target.set('top', newTop)
    return moveX || moveY
  }

  /**
   * 绘制对象的控件（边框/控件）
   * @param {CanvasContext} ctx
   */
  drawControls(ctx) {
    let activeObject = this._activeObject

    if (activeObject) {
      // console.log('drawControls, activeObject:', activeObject)
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
    this.renderCanvas(this.ctx, this._chooseObjectsToRender())
    return this
  }

  _chooseObjectsToRender() {
    let activeObjects = this.getActiveObjects(),
      object, objsToRender, activeGroupObjects

    if (activeObjects.length > 0 && !this.preserveObjectStacking) {
      objsToRender = []
      activeGroupObjects = []
      for (let i = 0; i < this._objects.length; i++) {
        object = this._objects[i]
        if (activeObjects.indexOf(object) === -1) {
          objsToRender.push(object)
        } else {
          activeGroupObjects.push(object)
        }
      }
      if (activeObjects.length > 1) {
        this._activeObject._objects = activeGroupObjects
      }
      objsToRender.push.apply(objsToRender, activeGroupObjects)
    } else {
      objsToRender = this._objects
    }
    return objsToRender
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
    this.fire('before:render', {ctx: ctx,});
    // console.log('before:render');
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
    // console.log('renderCanvas after:render');
    this.fire('after:render', {ctx: ctx,})
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
    this._fireSelectionEvents(currentActives, e)
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

  _fireSelectionEvents(oldObjects, e) {
    let somethingChanged = false,
      objects = this.getActiveObjects(),
      added = [],
      removed = [],
      opt = {e: e}

    oldObjects.forEach((oldObject) => {
      if (objects.indexOf(oldObject) === -1) {
        somethingChanged = true
        oldObject.fire('deselected', opt)
        removed.push(oldObject)
      }
    });
    objects.forEach((object) => {
      if (oldObjects.indexOf(object) === -1) {
        somethingChanged = true
        object.fire('selected', opt)
        added.push(object)
      }
    });
    if (oldObjects.length > 0 && objects.length > 0) {
      opt.selected = added
      opt.deselected = removed
      opt.updated = added[0] || removed[0]
      opt.target = this._activeObject
      somethingChanged && this.fire('selection:updated', opt)
    } else if (objects.length > 0) {
      opt.selected = added
      opt.target = this._activeObject
      this.fire('selection:created', opt)
    } else if (oldObjects.length > 0) {
      opt.deselected = removed
      this.fire('selection:cleared', opt)
    }
  }

  toDataURL(options) {
    try {
      options || (options = {})

      let format = options.format || 'jpeg'
      let quality = options.quality || 0.5

      /**
       * toDataURL 微信基础库 2.11.0 开始支持
       *
       * string type
       * 图片格式，默认为 image/png
       *
       * number encoderOptions
       * 在指定图片格式为 image/jpeg 或 image/webp的情况下，可以从 0 到 1 的区间内选择图片的质量。如果超出取值范围，将会使用默认值 0.92。其他参数会被忽略。
       */
      return this.canvas.toDataURL(`image/${format}`, quality)
    } catch (e) {
      throw new Error('当前微信基础库不支持toDataURL，2.11.0开始支持')
    }
  }
}

module.exports = CanvasClass
