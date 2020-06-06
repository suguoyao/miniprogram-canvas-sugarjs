/**
 * Created by Sugar on 2020/5/26.
 */
const Gradient = require('../gradient.class')
const Pattern = require('../pattern.class')

module.exports = {
  _setOptions: function (options) {
    for (var prop in options) {
      this.set(prop, options[prop]);
    }
  },

  _initGradient: function (filler, property) {
    if (filler && filler.colorStops && !(filler instanceof Gradient)) {
      this.set(property, new Gradient(filler));
    }
  },

  _initPattern: function (filler, property, callback) {
    if (filler && filler.source && !(filler instanceof Pattern)) {
      this.set(property, new Pattern(filler, callback));
    } else {
      callback && callback();
    }
  },

  _setObject: function (obj) {
    for (var prop in obj) {
      this._set(prop, obj[prop]);
    }
  },

  set: function (key, value) {
    if (typeof key === 'object') {
      this._setObject(key);
    } else {
      this._set(key, value);
    }
    return this;
  },

  _set: function (key, value) {
    this[key] = value;
  },

  toggle: function (property) {
    var value = this.get(property);
    if (typeof value === 'boolean') {
      this.set(property, !value);
    }
    return this;
  },

  get: function (property) {
    return this[property];
  }
};
