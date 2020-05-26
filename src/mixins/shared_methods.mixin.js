/**
 * Created by Sugar on 2020/5/26.
 */
const Gradient = require('../gradient.class')
const Pattern = require('../pattern.class')

module.exports = {
  _setOptions(options) {
    for (var prop in options) {
      this.set(prop, options[prop]);
    }
  },

  _initGradient(filler, property) {
    if (filler && filler.colorStops && !(filler instanceof Gradient)) {
      this.set(property, new Gradient(filler));
    }
  },

  _initPattern(filler, property, callback) {
    if (filler && filler.source && !(filler instanceof Pattern)) {
      this.set(property, new Pattern(filler, callback));
    } else {
      callback && callback();
    }
  },

  _setObject(obj) {
    for (var prop in obj) {
      this._set(prop, obj[prop]);
    }
  },

  set(key, value) {
    if (typeof key === 'object') {
      this._setObject(key);
    } else {
      this._set(key, value);
    }
    return this;
  },

  _set(key, value) {
    this[key] = value;
  },

  toggle(property) {
    var value = this.get(property);
    if (typeof value === 'boolean') {
      this.set(property, !value);
    }
    return this;
  },

  get(property) {
    return this[property];
  }
};
