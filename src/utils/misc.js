/**
 * Created by Sugar on 2020/5/26.
 */
const Point = require('../point.class')

/**
 * 逆向变换t
 * @param {Array} t 要变换的数据
 * @return {Array} 变换后的数据
 */
const invertTransform = (t) => {
  let a = 1 / (t[0] * t[3] - t[1] * t[2]),
    r = [a * t[3], -a * t[1], -a * t[2], a * t[0]],
    o = transformPoint({x: t[4], y: t[5]}, r, true)
  r[4] = -o.x
  r[5] = -o.y
  return r
}

/**
 * 将变换t应用于点p
 * @static
 * @param  {sugar.Point} p 转变点
 * @param  {Array} t 矩阵
 * @param  {Boolean} [ignoreOffset] 指定是否不偏移
 * @return {sugar.Point} 转换后的点
 */
const transformPoint = (p, t, ignoreOffset) => {
  if (ignoreOffset) {
    return new Point(
      t[0] * p.x + t[2] * p.y,
      t[1] * p.x + t[3] * p.y
    )
  }
  return new Point(
    t[0] * p.x + t[2] * p.y + t[4],
    t[1] * p.x + t[3] * p.y + t[5]
  )
}

/**
 * 用另一个对象的属性填充一个对象
 * @static
 * @param {Object} source 源对象
 * @param {Object} destination 目标对象
 * @return {Array} properties 要包括的属性名称
 */
const populateWithProperties = (source, destination, properties) => {
  if (properties && Object.prototype.toString.call(properties) === '[object Array]') {
    for (let i = 0, len = properties.length; i < len; i++) {
      if (properties[i] in source) {
        destination[properties[i]] = source[properties[i]];
      }
    }
  }
}


/**
 * 获取图片信息。网络图片需先配置download域名才能生效。
 * @param {String} url
 * @param {Function} callback
 * @param {*} [context] 调用回调的上下文
 */
const loadImage = (url, callback, context) => {
  if (!url) {
    callback && callback.call(context, url);
    return;
  }

  wx.getImageInfo({
    src: url,
    success(res) {
      /**
       * res数据结构
       width  number  图片原始宽度，单位px。不考虑旋转。
       height  number  图片原始高度，单位px。不考虑旋转。
       path  string  图片的本地路径
       orientation  string  拍照时设备方向
       type  string  图片格式
       */
      callback && callback.call(context, res, false)
    },
    fail(err) {
      callback && callback.call(context, null, true)
    }
  })
}

module.exports = {
  invertTransform,
  transformPoint,
  populateWithProperties,
  loadImage
}
