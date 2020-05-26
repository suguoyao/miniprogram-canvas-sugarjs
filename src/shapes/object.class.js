/**
 * Created by Sugar on 2020/5/26.
 */

class ObjectClass {
  constructor() {
    this.type = 'object'
    // this.originX = 'left'
    // this.originY = 'top'
    this.top = 0
    this.left = 0
    this.width = 0
    this.height = 0
    this.scaleX = 1
    this.scaleY = 1
    this.flipX = false
    this.flipY = false
    this.opacity = 1
    this.angle = 0
    this.padding = 0
    this.borderColor = '#000000'
    this.selectable = true
    this.visible = true
    this.hasControls = true
    this.lockMovementX = false
    this.lockMovementY = false
  }

  /*
   * @private
   * 判断是否可渲染
   * @memberOf sugar.Object.prototype
   * @return {Boolean}
   */
  isNotVisible() {
    return this.opacity === 0 || (!this.width && !this.height) || !this.visible
  }

  /**
   * 在指定的上下文中渲染对象
   * @param {CanvasContext} ctx 微信<canvas>组件的绘图上下文
   */
  render(ctx) {
    if (this.isNotVisible()) {
      return
    }
    ctx.save()
  }
}

ObjectClass.__uid = 0

module.exports = ObjectClass
