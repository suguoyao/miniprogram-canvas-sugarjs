/**
 * Created by Sugar on 2020/5/30.
 */

const {degreesToRadians, cos, sin, sizeAfterTransform} = require('../utils/misc')

module.exports = {
  /**
   * 确定点击哪个角
   * @private
   * @param {Object} pointer 触摸指针
   * @return {String|Boolean}
   */
  _findTargetCorner: function (pointer, forTouch) {
    if (!this.hasControls || this.group || (!this.canvas || this.canvas._activeObject !== this)) {
      return false;
    }

    let ex = pointer.x,
      ey = pointer.y,
      xPoints,
      lines, keys = Object.keys(this.oCoords),
      j = keys.length - 1, i;
    this.__corner = 0;

    for (; j >= 0; j--) {
      i = keys[j];
      if (!this.isControlVisible(i)) {
        continue;
      }

      lines = this._getImageLines(forTouch ? this.oCoords[i].touchCorner : this.oCoords[i].corner);

      xPoints = this._findCrossPoints({x: ex, y: ey}, lines);
      if (xPoints !== 0 && xPoints % 2 === 1) {
        this.__corner = i;
        return i;
      }
    }
    return false;
  },

  forEachControl: function (fn) {
    for (let i in this.controls) {
      fn(this.controls[i], i, this);
    }
  },

  /**
   * @private
   */
  _setCornerCoords: function () {
    let coords = this.oCoords,
      newTheta = degreesToRadians(45 - this.angle),
      cosTheta = cos(newTheta),
      sinTheta = sin(newTheta),
      /* Math.sqrt(2 * Math.pow(this.cornerSize, 2)) / 2, */
      /* 0.707106 stands for sqrt(2)/2 */
      cornerHypotenuse = this.cornerSize * 0.707106,
      touchHypotenuse = this.touchCornerSize * 0.707106,
      cosHalfOffset = cornerHypotenuse * cosTheta,
      sinHalfOffset = cornerHypotenuse * sinTheta,
      touchCosHalfOffset = touchHypotenuse * cosTheta,
      touchSinHalfOffset = touchHypotenuse * sinTheta,
      x, y;

    for (let control in coords) {
      x = coords[control].x;
      y = coords[control].y;
      coords[control].corner = {
        tl: {
          x: x - sinHalfOffset,
          y: y - cosHalfOffset
        },
        tr: {
          x: x + cosHalfOffset,
          y: y - sinHalfOffset
        },
        bl: {
          x: x - cosHalfOffset,
          y: y + sinHalfOffset
        },
        br: {
          x: x + sinHalfOffset,
          y: y + cosHalfOffset
        }
      };
      coords[control].touchCorner = {
        tl: {
          x: x - touchSinHalfOffset,
          y: y - touchCosHalfOffset
        },
        tr: {
          x: x + touchCosHalfOffset,
          y: y - touchSinHalfOffset
        },
        bl: {
          x: x - touchCosHalfOffset,
          y: y + touchSinHalfOffset
        },
        br: {
          x: x + touchSinHalfOffset,
          y: y + touchCosHalfOffset
        }
      };
    }
  },

  drawSelectionBackground: function (ctx) {
    if (!this.selectionBackgroundColor ||
      (this.canvas && !this.canvas.interactive) ||
      (this.canvas && this.canvas._activeObject !== this)
    ) {
      return this;
    }
    ctx.save();
    let center = this.getCenterPoint(), wh = this._calculateCurrentDimensions(),
      vpt = this.canvas.viewportTransform;
    ctx.translate(center.x, center.y);
    ctx.scale(1 / vpt[0], 1 / vpt[3]);
    ctx.rotate(degreesToRadians(this.angle));
    ctx.fillStyle = this.selectionBackgroundColor;
    ctx.fillRect(-wh.x / 2, -wh.y / 2, wh.x, wh.y);
    ctx.restore();
    return this;
  },

  drawBorders: function (ctx, styleOverride) {
    styleOverride = styleOverride || {};
    let wh = this._calculateCurrentDimensions(),
      strokeWidth = this.borderScaleFactor,
      width = wh.x + strokeWidth,
      height = wh.y + strokeWidth,
      hasControls = typeof styleOverride.hasControls !== 'undefined' ?
        styleOverride.hasControls : this.hasControls,
      shouldStroke = false;

    ctx.save();
    ctx.strokeStyle = styleOverride.borderColor || this.borderColor;
    this._setLineDash(ctx, styleOverride.borderDashArray || this.borderDashArray, null);
    // console.log('---------drawBorders', this.left, this.top)
    ctx.strokeRect(
      -width / 2,
      -height / 2,
      // this.left,
      // this.top,
      width,
      height
    );

    if (hasControls) {
      ctx.beginPath();
      this.forEachControl(function (control, key, object) {
        if (control.withConnection && control.getVisibility(object, key)) {
          // reset movement for each control
          shouldStroke = true;
          ctx.moveTo(control.x * width, control.y * height);
          ctx.lineTo(
            control.x * width + control.offsetX,
            control.y * height + control.offsetY
          );
        }
      });
      if (shouldStroke) {
        ctx.stroke();
      }
    }
    ctx.restore();
    return this;
  },

  drawBordersInGroup: function (ctx, options, styleOverride) {
    styleOverride = styleOverride || {};
    var bbox = sizeAfterTransform(this.width, this.height, options),
      strokeWidth = this.strokeWidth,
      strokeUniform = this.strokeUniform,
      borderScaleFactor = this.borderScaleFactor,
      width =
        bbox.x + strokeWidth * (strokeUniform ? this.canvas.getZoom() : options.scaleX) + borderScaleFactor,
      height =
        bbox.y + strokeWidth * (strokeUniform ? this.canvas.getZoom() : options.scaleY) + borderScaleFactor;
    ctx.save();
    this._setLineDash(ctx, styleOverride.borderDashArray || this.borderDashArray, null);
    ctx.strokeStyle = styleOverride.borderColor || this.borderColor;
    ctx.strokeRect(
      -width / 2,
      -height / 2,
      // this.left,
      // this.top,
      width,
      height
    );

    ctx.restore();
    return this;
  },

  drawControls: function (ctx, styleOverride) {
    styleOverride = styleOverride || {};
    ctx.save();
    ctx.setTransform(this.canvas.getRetinaScaling(), 0, 0, this.canvas.getRetinaScaling(), 0, 0);
    ctx.strokeStyle = ctx.fillStyle = styleOverride.cornerColor || this.cornerColor;
    if (!this.transparentCorners) {
      ctx.strokeStyle = styleOverride.cornerStrokeColor || this.cornerStrokeColor;
    }
    this._setLineDash(ctx, styleOverride.cornerDashArray || this.cornerDashArray, null);
    this.setCoords();
    this.forEachControl(function (control, key, object) {
      if (control.getVisibility(object, key)) {
        control.render(ctx,
          object.oCoords[key].x,
          object.oCoords[key].y, styleOverride, object);
      }
    });
    ctx.restore();

    return this;
  },

  isControlVisible: function (controlKey) {
    return this.controls[controlKey] && this.controls[controlKey].getVisibility(this, controlKey);
  },

  setControlVisible: function (controlKey, visible) {
    if (!this._controlsVisibility) {
      this._controlsVisibility = {};
    }
    this._controlsVisibility[controlKey] = visible;
    return this;
  },

  setControlsVisibility: function (options) {
    options || (options = {});

    for (let p in options) {
      this.setControlVisible(p, options[p]);
    }
    return this;
  },


  onDeselect: function () {
  },

  onSelect: function () {
  }
}
