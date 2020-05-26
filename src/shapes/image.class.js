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
    this.width = options.width || el.width || 0;
    this.height = options.height || el.width || 0;
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
