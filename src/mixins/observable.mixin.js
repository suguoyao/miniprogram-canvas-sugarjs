/**
 * Created by Sugar on 2020/5/28.
 */
const {fill} = require('../utils/index');

const _removeEventListener = function (eventName, handler) {
  if (!this.__eventListeners[eventName]) {
    return;
  }
  var eventListener = this.__eventListeners[eventName];
  if (handler) {
    eventListener[eventListener.indexOf(handler)] = false;
  } else {
    fill(eventListener, false);
  }
}

const on = function (eventName, handler) {
  if (!this.__eventListeners) {
    this.__eventListeners = {};
  }
  if (arguments.length === 1) {
    for (var prop in eventName) {
      this.on(prop, eventName[prop]);
    }
  } else {
    if (!this.__eventListeners[eventName]) {
      this.__eventListeners[eventName] = [];
    }
    this.__eventListeners[eventName].push(handler);
  }
  return this;
}

const off = function (eventName, handler) {
  if (!this.__eventListeners) {
    return this;
  }

  if (arguments.length === 0) {
    for (eventName in this.__eventListeners) {
      _removeEventListener.call(this, eventName);
    }
  } else if (arguments.length === 1 && typeof arguments[0] === 'object') {
    for (var prop in eventName) {
      _removeEventListener.call(this, prop, eventName[prop]);
    }
  } else {
    _removeEventListener.call(this, eventName, handler);
  }
  return this;
}

const fire = function (eventName, options) {
  if (!this.__eventListeners) {
    return this;
  }

  var listenersForEvent = this.__eventListeners[eventName];
  if (!listenersForEvent) {
    return this;
  }

  for (var i = 0, len = listenersForEvent.length; i < len; i++) {
    listenersForEvent[i] && listenersForEvent[i].call(this, options || {});
  }
  this.__eventListeners[eventName] = listenersForEvent.filter((value) => {
    return value !== false;
  });
  return this;
}

module.exports = {
  fire,
  on,
  off
}
