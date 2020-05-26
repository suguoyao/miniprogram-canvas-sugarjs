/**
 * Created by Sugar on 2020/5/26.
 */
const ObjectClass = require('./shapes/object.class')
const ColorClass = require('color.class')
const {clone} = require('./utils/object')
const {populateWithProperties} = require('./utils/misc')

class GradientClass {
  constructor(options) {
    this.type = 'linear' // linear 或 radial
    this.offsetX = 0
    this.offsetY = 0
    this.gradientTransform = null
    this.gradientUnits = 'pixels'
    this.initialize(options)
  }

  initialize(options) {
    options || (options = {});
    options.coords || (options.coords = {});

    let coords, _this = this;

    // sets everything, then coords and colorstops get sets again
    Object.keys(options).forEach(function (option) {
      _this[option] = options[option];
    });

    if (this.id) {
      this.id += '_' + ObjectClass.__uid++;
    } else {
      this.id = ObjectClass.__uid++;
    }

    coords = {
      x1: options.coords.x1 || 0,
      y1: options.coords.y1 || 0,
      x2: options.coords.x2 || 0,
      y2: options.coords.y2 || 0
    };

    if (this.type === 'radial') {
      coords.r1 = options.coords.r1 || 0;
      coords.r2 = options.coords.r2 || 0;
    }

    this.coords = coords;
    this.colorStops = options.colorStops.slice();
  }

  addColorStop(colorStops) {
    for (const position in colorStops) {
      var color = new ColorClass(colorStops[position])
      this.colorStops.push({
        offset: parseFloat(position),
        color: color.toRgb(),
        opacity: color.getAlpha()
      })
    }
    return this
  }

  toObject(propertiesToInclude) {
    let object = {
      type: this.type,
      coords: this.coords,
      colorStops: this.colorStops,
      offsetX: this.offsetX,
      offsetY: this.offsetY,
      gradientUnits: this.gradientUnits,
      gradientTransform: this.gradientTransform ? this.gradientTransform.concat() : this.gradientTransform
    };
    populateWithProperties(this, object, propertiesToInclude);

    return object;
  }

  /**
   * 返回CanvasGradient的实例
   * @param {CanvasContext} ctx
   * @return {CanvasGradient}
   */
  toLive(ctx) {
    let gradient, coords = clone(this.coords), i, len;

    if (!this.type) {
      return;
    }

    if (this.type === 'linear') {
      gradient = ctx.createLinearGradient(
        coords.x1, coords.y1, coords.x2, coords.y2);
    } else if (this.type === 'radial') {
      gradient = ctx.createRadialGradient(
        coords.x1, coords.y1, coords.r1, coords.x2, coords.y2, coords.r2);
    }

    for (i = 0, len = this.colorStops.length; i < len; i++) {
      var color = this.colorStops[i].color,
        opacity = this.colorStops[i].opacity,
        offset = this.colorStops[i].offset;

      if (typeof opacity !== 'undefined') {
        color = new ColorClass(color).setAlpha(opacity).toRgba();
      }
      gradient.addColorStop(offset, color);
    }

    return gradient;
  }
}

/**
 * @private
 */
function __convertPercentUnitsToValues(instance, options, svgOptions, gradientUnits) {
  var propValue, finalValue;
  Object.keys(options).forEach(function (prop) {
    propValue = options[prop];
    if (propValue === 'Infinity') {
      finalValue = 1;
    } else if (propValue === '-Infinity') {
      finalValue = 0;
    } else {
      finalValue = parseFloat(options[prop], 10);
      if (typeof propValue === 'string' && /^(\d+\.\d+)%|(\d+)%$/.test(propValue)) {
        finalValue *= 0.01;
        if (gradientUnits === 'pixels') {
          // then we need to fix those percentages here in svg parsing
          if (prop === 'x1' || prop === 'x2' || prop === 'r2') {
            finalValue *= svgOptions.viewBoxWidth || svgOptions.width;
          }
          if (prop === 'y1' || prop === 'y2') {
            finalValue *= svgOptions.viewBoxHeight || svgOptions.height;
          }
        }
      }
    }
    options[prop] = finalValue;
  });
}

module.exports = GradientClass
