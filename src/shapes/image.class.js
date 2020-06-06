/**
 * Created by Sugar on 2020/5/26.
 */
const ObjectClass = require('./object.class')
const {clone} = require('../utils/object')
const {loadImage} = require('../utils/misc')

class ImageClass extends ObjectClass {
  constructor(image, options) {
    super(options)

    this.type = 'image'
    this.cacheKey = '' // 用于检索图像的标识key
    this._filterScalingX = 1
    this._filterScalingY = 1
    this.cropX = 0
    this.cropY = 0

    this.initialize(image, options)
  }

  initialize(element, options) {
    options || (options = {});
    // this.filters = [];
    this.cacheKey = 'texture' + ObjectClass.__uid++;
    this.setElement(element, options);
  }

  getElement() {
    return this._element || {};
  }

  setElement(element, options) {
    // this.removeTexture(this.cacheKey);
    // this.removeTexture(this.cacheKey + '_filtered');
    this._element = element;
    this._originalElement = element;
    this._initConfig(options);
    // if (this.filters.length !== 0) {
    //   this.applyFilters();
    // }

    return this
  }

  _initConfig(options) {
    options || (options = {});
    this.setOptions(options);
    this._setWidthHeight(options);
  }

  _setWidthHeight(options) {
    options || (options = {});
    let el = this.getElement();
    // el.width el.height为图像原始宽高
    let width = options.width || el.width || 0;
    let height = options.height || el.height || 0;
    this.width = width
    this.height = height
  }

  _render(ctx) {
    this._stroke(ctx)
    this._renderPaintInOrder(ctx)
  }

  _renderFill(ctx) {
    // console.log('绘制图片', this)
    let elementToDraw = this._element
    if (!elementToDraw) {
      return;
    }
    let dW = this.width, dH = this.height,
      // elementToDraw的width和height为图像原始宽高
      sW = Math.min(elementToDraw.width, dW * this._filterScalingX),
      sH = Math.min(elementToDraw.height, dH * this._filterScalingY),
      dx = -dW / 2, dy = -dH / 2,
      sX = Math.max(0, this.cropX * this._filterScalingX),
      sY = Math.max(0, this.cropY * this._filterScalingY)
    // console.log(sX, sY, sW, sH, dx, dy, dW, dH);
    elementToDraw && ctx.drawImage(elementToDraw, sX, sY, sW, sH, dx, dy, dW, dH)
    // elementToDraw && ctx.drawImage(elementToDraw, sX, sY, sW, sH, 0, 0, dW, dH)
    // elementToDraw && ctx.drawImage(elementToDraw, this.left, this.top, sW, sH)
  }

  _stroke(ctx) {
    if (!this.stroke || this.strokeWidth === 0) {
      return;
    }
    let w = this.width / 2, h = this.height / 2
    ctx.beginPath()
    ctx.moveTo(-w, -h)
    ctx.lineTo(w, -h)
    ctx.lineTo(w, h)
    ctx.lineTo(-w, h)
    ctx.lineTo(-w, -h)
    ctx.closePath()
  }

  /**
   * 图像是否应用了裁剪
   * @return {Boolean}
   */
  hasCrop() {
    return this.cropX || this.cropY || this.width < this._element.width || this.height < this._element.height
  }
}

/**
 * 通过对象创建sugar.Image实例
 * @static
 * @param {Object} object
 * @param {Function} callback 图像创建成功后的回调
 */
ImageClass.fromObject = (_object, callback) => {
  let object = clone(_object)
  loadImage(object.src, (img, isError) => {
    if (isError) {
      callback && callback(null, true);
      return;
    }
    const image = new ImageClass(img, object)
    callback(image, false)
  }, null)
}

/**
 * 通过URL创建sugar.Image实例
 * @static
 * @param {String} url 图像URL
 * @param {Function} [callback]
 * @param {Object} [imgOptions]
 */
ImageClass.fromURL = (url, callback, imgOptions) => {
  loadImage(url, (img, isError) => {
    callback && callback(new ImageClass(img, imgOptions), isError);
  }, null)
}

module.exports = ImageClass
