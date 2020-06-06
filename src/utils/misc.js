/**
 * Created by Sugar on 2020/5/26.
 */
const PointClass = require('../point.class')
const {min, max} = require('./index')

let sqrt = Math.sqrt,
  atan2 = Math.atan2,
  pow = Math.pow,
  PiBy180 = Math.PI / 180,
  PiBy2 = Math.PI / 2

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
    return new PointClass(
      t[0] * p.x + t[2] * p.y,
      t[1] * p.x + t[3] * p.y
    )
  }
  return new PointClass(
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
 * 获取图片。网络图片需先配置download域名才能生效。
 * @param {String} url
 * @param {Function} callback
 * @param {*} [context] 调用回调的上下文
 */
const loadImage = (url, callback, context) => {
  if (!url) {
    callback && callback.call(context, url);
    return;
  }

  const query = wx.createSelectorQuery()
  query.select(`#sugarjs`)
    .fields({node: true, size: true})
    .exec(res => {
      const canvas = res[0].node
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
          let img = canvas.createImage()
          img.src = res.path
          img.onload = (res) => {
            callback && callback.call(context, img, false)
            img = img.onload = img.onerror = null
          }

          img.onerror = () => {
            callback && callback.call(context, null, true)
            img = img.onload = img.onerror = null
          }

          // callback && callback.call(context, res, false)
        },
        fail(err) {
          callback && callback.call(context, null, true)
        }
      })
    })
}

const degreesToRadians = (degrees) => {
  return degrees * PiBy180
}

const cos = (angle) => {
  if (angle === 0) {
    return 1;
  }
  if (angle < 0) {
    // cos(a) = cos(-a)
    angle = -angle;
  }
  let angleSlice = angle / PiBy2;
  switch (angleSlice) {
    case 1:
    case 3:
      return 0;
    case 2:
      return -1;
  }
  return Math.cos(angle);
}

const sin = (angle) => {
  if (angle === 0) {
    return 0;
  }
  let angleSlice = angle / PiBy2, sign = 1;
  if (angle < 0) {
    // sin(-a) = -sin(a)
    sign = -1;
  }
  switch (angleSlice) {
    case 1:
      return sign;
    case 2:
      return 0;
    case 3:
      return -sign;
  }
  return Math.sin(angle);
}

const sizeAfterTransform = (width, height, options) => {
  let dimX = width / 2, dimY = height / 2,
    points = [
      {
        x: -dimX,
        y: -dimY
      },
      {
        x: dimX,
        y: -dimY
      },
      {
        x: -dimX,
        y: dimY
      },
      {
        x: dimX,
        y: dimY
      }],
    transformMatrix = calcDimensionsMatrix(options),
    bbox = makeBoundingBoxFromPoints(points, transformMatrix);
  return {
    x: bbox.width,
    y: bbox.height,
  };
}

const calcDimensionsMatrix = (options) => {
  let scaleX = typeof options.scaleX === 'undefined' ? 1 : options.scaleX,
    scaleY = typeof options.scaleY === 'undefined' ? 1 : options.scaleY,
    scaleMatrix = [
      options.flipX ? -scaleX : scaleX,
      0,
      0,
      options.flipY ? -scaleY : scaleY,
      0,
      0],
    multiply = multiplyTransformMatrices;
  if (options.skewX) {
    scaleMatrix = multiply(
      scaleMatrix,
      [1, 0, Math.tan(degreesToRadians(options.skewX)), 1],
      true);
  }
  if (options.skewY) {
    scaleMatrix = multiply(
      scaleMatrix,
      [1, Math.tan(degreesToRadians(options.skewY)), 0, 1],
      true);
  }
  return scaleMatrix;
}

const multiplyTransformMatrices = (a, b, is2x2) => {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    is2x2 ? 0 : a[0] * b[4] + a[2] * b[5] + a[4],
    is2x2 ? 0 : a[1] * b[4] + a[3] * b[5] + a[5]
  ];
}

const makeBoundingBoxFromPoints = (points, transform) => {
  if (transform) {
    for (let i = 0; i < points.length; i++) {
      points[i] = transformPoint(points[i], transform);
    }
  }
  let xPoints = [points[0].x, points[1].x, points[2].x, points[3].x],
    minX = min(xPoints),
    maxX = max(xPoints),
    width = maxX - minX,
    yPoints = [points[0].y, points[1].y, points[2].y, points[3].y],
    minY = min(yPoints),
    maxY = max(yPoints),
    height = maxY - minY;

  return {
    left: minX,
    top: minY,
    width: width,
    height: height
  };
}

const qrDecompose = (a) => {
  let angle = atan2(a[1], a[0]),
    denom = pow(a[0], 2) + pow(a[1], 2),
    scaleX = sqrt(denom),
    scaleY = (a[0] * a[3] - a[2] * a[1]) / scaleX,
    skewX = atan2(a[0] * a[2] + a[1] * a [3], denom);
  return {
    angle: angle / PiBy180,
    scaleX: scaleX,
    scaleY: scaleY,
    skewX: skewX / PiBy180,
    skewY: 0,
    translateX: a[4],
    translateY: a[5]
  };
}

const rotateVector = (vector, radians) => {
  let s = sin(radians),
    c = cos(radians),
    rx = vector.x * c - vector.y * s,
    ry = vector.x * s + vector.y * c;
  return {
    x: rx,
    y: ry
  };
}

const rotatePoint = (point, origin, radians) => {
  point.subtractEquals(origin);
  let v = rotateVector(point, radians);
  return new PointClass(v.x, v.y).addEquals(origin);
}

const calcRotateMatrix = (options) => {
  if (!options.angle) {
    return [1, 0, 0, 1, 0, 0].concat();
  }
  let theta = degreesToRadians(options.angle),
    c = cos(theta),
    s = sin(theta);
  return [c, s, -s, c, 0, 0];
}

const composeMatrix = (options) => {
  var matrix = [1, 0, 0, 1, options.translateX || 0, options.translateY || 0],
    multiply = multiplyTransformMatrices;
  if (options.angle) {
    matrix = multiply(matrix, calcRotateMatrix(options));
  }
  if (options.scaleX !== 1 || options.scaleY !== 1 ||
    options.skewX || options.skewY || options.flipX || options.flipY) {
    matrix = multiply(matrix, calcDimensionsMatrix(options));
  }
  return matrix;
}

module.exports = {
  invertTransform,
  transformPoint,
  populateWithProperties,
  makeBoundingBoxFromPoints,
  loadImage,
  degreesToRadians,
  cos,
  sin,
  sizeAfterTransform,
  calcDimensionsMatrix,
  multiplyTransformMatrices,
  qrDecompose,
  rotateVector,
  rotatePoint,
  calcRotateMatrix,
  composeMatrix,
}
