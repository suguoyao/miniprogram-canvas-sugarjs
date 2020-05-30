/**
 * Created by Sugar on 2020/5/30.
 */
const PointClass = require('../point.class')
const {degreesToRadians, cos, sin, rotatePoint} = require('../utils/misc')
const originXOffset = {
  left: -0.5,
  center: 0,
  right: 0.5
}
const originYOffset = {
  top: -0.5,
  center: 0,
  bottom: 0.5
}

module.exports = {
  translateToGivenOrigin: function (point, fromOriginX, fromOriginY, toOriginX, toOriginY) {
    let x = point.x,
      y = point.y,
      offsetX, offsetY, dim;

    if (typeof fromOriginX === 'string') {
      fromOriginX = originXOffset[fromOriginX];
    } else {
      fromOriginX -= 0.5;
    }

    if (typeof toOriginX === 'string') {
      toOriginX = originXOffset[toOriginX];
    } else {
      toOriginX -= 0.5;
    }

    offsetX = toOriginX - fromOriginX;

    if (typeof fromOriginY === 'string') {
      fromOriginY = originYOffset[fromOriginY];
    } else {
      fromOriginY -= 0.5;
    }

    if (typeof toOriginY === 'string') {
      toOriginY = originYOffset[toOriginY];
    } else {
      toOriginY -= 0.5;
    }

    offsetY = toOriginY - fromOriginY;

    if (offsetX || offsetY) {
      dim = this._getTransformedDimensions();
      x = point.x + offsetX * dim.x;
      y = point.y + offsetY * dim.y;
    }

    return new PointClass(x, y);
  },


  translateToCenterPoint: function (point, originX, originY) {
    let p = this.translateToGivenOrigin(point, originX, originY, 'center', 'center');
    if (this.angle) {
      return rotatePoint(p, point, degreesToRadians(this.angle));
    }
    return p;
  },

  /**
   * Translates the coordinates from center to origin coordinates (based on the object's dimensions)
   * @param {PointClass} center The point which corresponds to center of the object
   * @param {String} originX Horizontal origin: 'left', 'center' or 'right'
   * @param {String} originY Vertical origin: 'top', 'center' or 'bottom'
   * @return {PointClass}
   */
  translateToOriginPoint: function (center, originX, originY) {
    let p = this.translateToGivenOrigin(center, 'center', 'center', originX, originY);
    if (this.angle) {
      return rotatePoint(p, center, degreesToRadians(this.angle));
    }
    return p;
  },

  /**
   * Returns the real center coordinates of the object
   * @return {PointClass}
   */
  getCenterPoint: function () {
    let leftTop = new PointClass(this.left, this.top);
    return this.translateToCenterPoint(leftTop, this.originX, this.originY);
  },

  /**
   * Returns the coordinates of the object based on center coordinates
   * @param {PointClass} point The point which corresponds to the originX and originY params
   * @return {PointClass}
   */
  // getOriginPoint: function(center) {
  //   return this.translateToOriginPoint(center, this.originX, this.originY);
  // },

  /**
   * Returns the coordinates of the object as if it has a different origin
   * @param {String} originX Horizontal origin: 'left', 'center' or 'right'
   * @param {String} originY Vertical origin: 'top', 'center' or 'bottom'
   * @return {PointClass}
   */
  getPointByOrigin: function (originX, originY) {
    let center = this.getCenterPoint();
    return this.translateToOriginPoint(center, originX, originY);
  },

  /**
   * Returns the point in local coordinates
   * @param {PointClass} point The point relative to the global coordinate system
   * @param {String} originX Horizontal origin: 'left', 'center' or 'right'
   * @param {String} originY Vertical origin: 'top', 'center' or 'bottom'
   * @return {PointClass}
   */
  toLocalPoint: function (point, originX, originY) {
    let center = this.getCenterPoint(),
      p, p2;

    if (typeof originX !== 'undefined' && typeof originY !== 'undefined') {
      p = this.translateToGivenOrigin(center, 'center', 'center', originX, originY);
    } else {
      p = new PointClass(this.left, this.top);
    }

    p2 = new PointClass(point.x, point.y);
    if (this.angle) {
      p2 = rotatePoint(p2, center, -degreesToRadians(this.angle));
    }
    return p2.subtractEquals(p);
  },

  /**
   * Returns the point in global coordinates
   * @param {PointClass} The point relative to the local coordinate system
   * @return {PointClass}
   */
  // toGlobalPoint: function(point) {
  //   return rotatePoint(point, this.getCenterPoint(), degreesToRadians(this.angle)).addEquals(new PointClass(this.left, this.top));
  // },

  /**
   * Sets the position of the object taking into consideration the object's origin
   * @param {PointClass} pos The new position of the object
   * @param {String} originX Horizontal origin: 'left', 'center' or 'right'
   * @param {String} originY Vertical origin: 'top', 'center' or 'bottom'
   * @return {void}
   */
  setPositionByOrigin: function (pos, originX, originY) {
    let center = this.translateToCenterPoint(pos, originX, originY),
      position = this.translateToOriginPoint(center, this.originX, this.originY);
    this.set('left', position.x);
    this.set('top', position.y);
  },

  /**
   * @param {String} to One of 'left', 'center', 'right'
   */
  adjustPosition: function (to) {
    let angle = degreesToRadians(this.angle),
      hypotFull = this.getScaledWidth(),
      xFull = cos(angle) * hypotFull,
      yFull = sin(angle) * hypotFull,
      offsetFrom, offsetTo;

    //TODO: this function does not consider mixed situation like top, center.
    if (typeof this.originX === 'string') {
      offsetFrom = originXOffset[this.originX];
    } else {
      offsetFrom = this.originX - 0.5;
    }
    if (typeof to === 'string') {
      offsetTo = originXOffset[to];
    } else {
      offsetTo = to - 0.5;
    }
    this.left += xFull * (offsetTo - offsetFrom);
    this.top += yFull * (offsetTo - offsetFrom);
    this.setCoords();
    this.originX = to;
  },

  /**
   * Sets the origin/position of the object to it's center point
   * @private
   * @return {void}
   */
  _setOriginToCenter: function () {
    this._originalOriginX = this.originX;
    this._originalOriginY = this.originY;

    let center = this.getCenterPoint();

    this.originX = 'center';
    this.originY = 'center';

    this.left = center.x;
    this.top = center.y;
  },

  /**
   * Resets the origin/position of the object to it's original origin
   * @private
   * @return {void}
   */
  _resetOrigin: function () {
    let originPoint = this.translateToOriginPoint(
      this.getCenterPoint(),
      this._originalOriginX,
      this._originalOriginY);

    this.originX = this._originalOriginX;
    this.originY = this._originalOriginY;

    this.left = originPoint.x;
    this.top = originPoint.y;

    this._originalOriginX = null;
    this._originalOriginY = null;
  },

  /**
   * @private
   */
  _getLeftTopCoords: function () {
    return this.translateToOriginPoint(this.getCenterPoint(), 'left', 'top');
  },
}
