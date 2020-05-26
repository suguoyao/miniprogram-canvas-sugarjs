/**
 * Created by Sugar on 2020/5/26.
 */

class PointClass {
  constructor(x, y) {
    this.type = 'point'
    this.x = x
    this.y = y
  }

  /**
   * 向当前点添加另一点的值并返回新点
   * @param {sugar.Point} that
   * @return {sugar.Point} new PointClass
   */
  add(that) {
    return new PointClass(this.x + that.x, this.y + that.y)
  }

  /**
   * 在当前的点添加另一点
   * @param {sugar.Point} that
   * @return {sugar.Point} thisArg
   * @chainable
   */
  addEquals(that) {
    this.x += that.x
    this.y += that.y
    return this
  }

  /**
   * 在当前点加值并返回一个新的点
   * @param {Number} scalar
   * @return {sugar.Point} new PointClass
   */
  scalarAdd(scalar) {
    return new PointClass(this.x + scalar, this.y + scalar)
  }

  /**
   * 在当前的点加值
   * @param {Number} scalar
   * @return {sugar.Point} thisArg
   */
  scalarAddEquals(scalar) {
    this.x += scalar
    this.y += scalar
    return this
  }

  /**
   * 向该点减另一点的值并返回新点
   * @param {sugar.Point} that
   * @return {sugar.Point} new PointClass
   */
  subtract(that) {
    return new PointClass(this.x - that.x, this.y - that.y)
  }

  /**
   * 在当前的点减值
   * @param {sugar.Point} that
   * @return {sugar.Point} thisArg
   * @chainable
   */
  subtractEquals(that) {
    this.x -= that.x
    this.y -= that.y
    return this
  }

  /**
   * 向当前点减值并返回新的点
   * @param {Number} scalar
   * @return {sugar.Point}
   */
  scalarSubtract(scalar) {
    return new PointClass(this.x - scalar, this.y - scalar)
  }

  /**
   * 当前点减值
   * @param {Number} scalar
   * @return {sugar.Point} thisArg
   */
  scalarSubtractEquals(scalar) {
    this.x -= scalar
    this.y -= scalar
    return this
  }


  multiply(scalar) {
    return new PointClass(this.x * scalar, this.y * scalar)
  }

  multiplyEquals(scalar) {
    this.x *= scalar
    this.y *= scalar
    return this
  }

  divide(scalar) {
    return new PointClass(this.x / scalar, this.y / scalar)
  }

  divideEquals(scalar) {
    this.x /= scalar
    this.y /= scalar
    return this
  }

  /**
   * 如果此点等于另一点，则返回true
   * @param {sugar.Point} that
   * @return {Boolean}
   */
  eq(that) {
    return (this.x === that.x && this.y === that.y)
  }

  /**
   * 如果此点小于另一点，则返回true
   * @param {sugar.Point} that
   * @return {Boolean}
   */
  lt(that) {
    return (this.x < that.x && this.y < that.y)
  }

  /**
   * 如果此点小于或等于另一点，则返回true
   * @param {sugar.Point} that
   * @return {Boolean}
   */
  lte(that) {
    return (this.x <= that.x && this.y <= that.y)
  }

  /**

   * 如果此点大于另一点，则返回true
   * @param {sugar.Point} that
   * @return {Boolean}
   */
  gt(that) {
    return (this.x > that.x && this.y > that.y)
  }

  /**
   * 如果此点大于或等于另一点，则返回true
   * @param {sugar.Point} that
   * @return {Boolean}
   */
  gte(that) {
    return (this.x >= that.x && this.y >= that.y)
  }


  lerp(that, t) {
    if (typeof t === 'undefined') {
      t = 0.5
    }
    t = Math.max(Math.min(1, t), 0)
    return new PointClass(this.x + (that.x - this.x) * t, this.y + (that.y - this.y) * t)
  }

  /**
   * 返回此点与另一点的距离
   * @param {sugar.Point} that
   * @return {Number}
   */
  distanceFrom(that) {
    var dx = this.x - that.x,
      dy = this.y - that.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * 返回此点与另一点之间的点
   * @param {sugar.Point} that
   * @return {sugar.Point}
   */
  midPointFrom(that) {
    return this.lerp(that)
  }

  /**
   * 返回一个新点，该点是该点和另一个点的最小值
   * @param {sugar.Point} that
   * @return {sugar.Point}
   */
  min(that) {
    return new PointClass(Math.min(this.x, that.x), Math.min(this.y, that.y))
  }

  /**
   * 返回一个新点，该点是该点和另一个点的最大值
   * @param {sugar.Point} that
   * @return {sugar.Point}
   */
  max(that) {
    return new PointClass(Math.max(this.x, that.x), Math.max(this.y, that.y))
  }

  /**
   * 返回此点的字符串表示形式
   * @return {String}
   */
  toString() {
    return this.x + ',' + this.y
  }

  /**
   * 设置此点的x/y
   * @param {Number} x
   * @param {Number} y
   * @chainable
   */
  setXY(x, y) {
    this.x = x
    this.y = y
    return this
  }

  /**
   * 设置此点的x
   * @param {Number} x
   * @chainable
   */
  setX(x) {
    this.x = x
    return this
  }

  /**
   * 设置此点的y
   * @param {Number} y
   * @chainable
   */
  setY(y) {
    this.y = y
    return this
  }

  /**
   * 从另一个点设置该点的x/y
   * @param {sugar.Point} that
   * @chainable
   */
  setFromPoint(that) {
    this.x = that.x
    this.y = that.y
    return this
  }

  /**
   * 和另一个点交换x和y
   * @param {sugar.Point} that
   */
  swap(that) {
    var x = this.x,
      y = this.y
    this.x = that.x
    this.y = that.y
    that.x = x
    that.y = y
  }

  /**
   * 返回该点的克隆实例
   * @return {sugar.Point}
   */
  clone() {
    return new PointClass(this.x, this.y)
  }
}

module.exports = PointClass
