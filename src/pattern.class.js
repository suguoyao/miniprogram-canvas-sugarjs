/**
 * Created by Sugar on 2020/5/26.
 */
const ObjectClass = require('./shapes/object.class')
const {toFixed} = require('./utils/index')
const {populateWithProperties} = require('./utils/misc')

class PatternClass {
  constructor(options) {
    this.repeat = 'repeat'
    this.offsetX = 0
    this.offsetY = 0
    this.initialize(options)
  }


  initialize(options, callback) {
    options || (options = {});

    this.id = ObjectClass.__uid++;
    this.setOptions(options);
    if (!options.source || (options.source && typeof options.source !== 'string')) {
      callback && callback(this);
      return;
    } else {
      // img src string
      let _this = this;
      // this.source = createImage();
      // loadImage(options.source, function (img, isError) {
      //   _this.source = img;
      //   callback && callback(_this, isError);
      // }, null, this.crossOrigin);
    }
  }

  toObject(propertiesToInclude) {
    let NUM_FRACTION_DIGITS = 2,
      source, object;

    // <img> element
    if (typeof this.source.src === 'string') {
      source = this.source.src;
    }
    // <canvas> element
    else if (typeof this.source === 'object' && this.source.toDataURL) {
      source = this.source.toDataURL();
    }

    object = {
      type: 'pattern',
      source: source,
      repeat: this.repeat,
      crossOrigin: this.crossOrigin,
      offsetX: toFixed(this.offsetX, NUM_FRACTION_DIGITS),
      offsetY: toFixed(this.offsetY, NUM_FRACTION_DIGITS),
      patternTransform: this.patternTransform ? this.patternTransform.concat() : null
    };
    populateWithProperties(this, object, propertiesToInclude);

    return object;
  }

  setOptions(options) {
    for (let prop in options) {
      this[prop] = options[prop];
    }
  }

  /**
   * 返回CanvasPattern的实例
   * @param {CanvasContext} ctx
   * @return {CanvasPattern}
   */
  toLive(ctx) {
    let source = this.source;
    if (!source) {
      return '';
    }

    // 重复的图像源，支持代码包路径和本地临时路径 (本地路径)
    if (typeof source.src !== 'undefined') {
      if (!source.complete) {
        return '';
      }
      if (source.naturalWidth === 0 || source.naturalHeight === 0) {
        return '';
      }
    }

    /**
     * createPattern第二个参数 string repetition
     repeat  水平竖直方向都重复
     repeat-x  水平方向重复
     repeat-y  竖直方向重复
     no-repeat  不重复
     */
    return ctx.createPattern(source, this.repeat);
  }
}

module.exports = PatternClass
