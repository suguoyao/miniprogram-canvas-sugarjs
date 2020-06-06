/**
 * Created by Sugar on 2020/5/30.
 */

const PointClass = require('../point.class')
const IntersectionClass = require('../intersection.class')
const {
  degreesToRadians,
  multiplyTransformMatrices,
  transformPoint,
  calcDimensionsMatrix,
  sizeAfterTransform,
  makeBoundingBoxFromPoints,
  cos, sin,
  calcRotateMatrix,
  composeMatrix,
} = require('../utils/misc')

function arrayFromCoords(coords) {
  return [
    new PointClass(coords.tl.x, coords.tl.y),
    new PointClass(coords.tr.x, coords.tr.y),
    new PointClass(coords.br.x, coords.br.y),
    new PointClass(coords.bl.x, coords.bl.y)
  ];
}


module.exports = {
  oCoords: null,
  aCoords: null,
  lineCoords: null,
  ownMatrixCache: null,
  matrixCache: null,
  controls: {},
  _getCoords: function (absolute, calculate) {
    if (calculate) {
      return (absolute ? this.calcACoords() : this.calcLineCoords());
    }
    if (!this.aCoords || !this.lineCoords) {
      this.setCoords(true);
    }
    return (absolute ? this.aCoords : this.lineCoords);
  },

  getCoords: function (absolute, calculate) {
    return arrayFromCoords(this._getCoords(absolute, calculate));
  },

  intersectsWithRect: function (pointTL, pointBR, absolute, calculate) {
    let coords = this.getCoords(absolute, calculate),
      intersection = IntersectionClass.intersectPolygonRectangle(
        coords,
        pointTL,
        pointBR
      );
    return intersection.status === 'Intersection';
  },

  intersectsWithObject: function (other, absolute, calculate) {
    let intersection = IntersectionClass.intersectPolygonPolygon(
      this.getCoords(absolute, calculate),
      other.getCoords(absolute, calculate)
    );

    return intersection.status === 'Intersection'
      || other.isContainedWithinObject(this, absolute, calculate)
      || this.isContainedWithinObject(other, absolute, calculate);
  },

  isContainedWithinObject: function (other, absolute, calculate) {
    let points = this.getCoords(absolute, calculate),
      otherCoords = absolute ? other.aCoords : other.lineCoords,
      i = 0, lines = other._getImageLines(otherCoords);
    for (; i < 4; i++) {
      if (!other.containsPoint(points[i], lines)) {
        return false;
      }
    }
    return true;
  },

  isContainedWithinRect: function (pointTL, pointBR, absolute, calculate) {
    let boundingRect = this.getBoundingRect(absolute, calculate);

    return (
      boundingRect.left >= pointTL.x &&
      boundingRect.left + boundingRect.width <= pointBR.x &&
      boundingRect.top >= pointTL.y &&
      boundingRect.top + boundingRect.height <= pointBR.y
    );
  },

  containsPoint: function (point, lines, absolute, calculate) {
    let coords = this._getCoords(absolute, calculate);
    let l = lines || this._getImageLines(coords);
    let xPoints = this._findCrossPoints(point, l);
    return (xPoints !== 0 && xPoints % 2 === 1);
  },

  isOnScreen: function (calculate) {
    if (!this.canvas) {
      return false;
    }
    let pointTL = this.canvas.vptCoords.tl, pointBR = this.canvas.vptCoords.br;
    let points = this.getCoords(true, calculate), point;
    for (let i = 0; i < 4; i++) {
      point = points[i];
      if (point.x <= pointBR.x && point.x >= pointTL.x && point.y <= pointBR.y && point.y >= pointTL.y) {
        return true;
      }
    }
    // no points on screen, check intersection with absolute coordinates
    if (this.intersectsWithRect(pointTL, pointBR, true, calculate)) {
      return true;
    }
    return this._containsCenterOfCanvas(pointTL, pointBR, calculate);
  },

  _containsCenterOfCanvas: function (pointTL, pointBR, calculate) {
    // worst case scenario the object is so big that contains the screen
    let centerPoint = {x: (pointTL.x + pointBR.x) / 2, y: (pointTL.y + pointBR.y) / 2};
    if (this.containsPoint(centerPoint, null, true, calculate)) {
      return true;
    }
    return false;
  },

  isPartiallyOnScreen: function (calculate) {
    if (!this.canvas) {
      return false;
    }
    let pointTL = this.canvas.vptCoords.tl, pointBR = this.canvas.vptCoords.br;
    if (this.intersectsWithRect(pointTL, pointBR, true, calculate)) {
      return true;
    }
    return this._containsCenterOfCanvas(pointTL, pointBR, calculate);
  },

  _getImageLines: function (oCoords) {

    let lines = {
      topline: {
        o: oCoords.tl,
        d: oCoords.tr
      },
      rightline: {
        o: oCoords.tr,
        d: oCoords.br
      },
      bottomline: {
        o: oCoords.br,
        d: oCoords.bl
      },
      leftline: {
        o: oCoords.bl,
        d: oCoords.tl
      }
    };

    // // debugging
    // if (this.canvas.contextTop) {
    //   this.canvas.contextTop.fillRect(lines.bottomline.d.x, lines.bottomline.d.y, 2, 2);
    //   this.canvas.contextTop.fillRect(lines.bottomline.o.x, lines.bottomline.o.y, 2, 2);
    //
    //   this.canvas.contextTop.fillRect(lines.leftline.d.x, lines.leftline.d.y, 2, 2);
    //   this.canvas.contextTop.fillRect(lines.leftline.o.x, lines.leftline.o.y, 2, 2);
    //
    //   this.canvas.contextTop.fillRect(lines.topline.d.x, lines.topline.d.y, 2, 2);
    //   this.canvas.contextTop.fillRect(lines.topline.o.x, lines.topline.o.y, 2, 2);
    //
    //   this.canvas.contextTop.fillRect(lines.rightline.d.x, lines.rightline.d.y, 2, 2);
    //   this.canvas.contextTop.fillRect(lines.rightline.o.x, lines.rightline.o.y, 2, 2);
    // }

    return lines;
  },

  _findCrossPoints: function (point, lines) {
    let b1, b2, a1, a2, xi, // yi,
      xcount = 0,
      iLine;

    for (let lineKey in lines) {
      iLine = lines[lineKey];
      // optimisation 1: line below point. no cross
      if ((iLine.o.y < point.y) && (iLine.d.y < point.y)) {
        continue;
      }
      // optimisation 2: line above point. no cross
      if ((iLine.o.y >= point.y) && (iLine.d.y >= point.y)) {
        continue;
      }
      // optimisation 3: vertical line case
      if ((iLine.o.x === iLine.d.x) && (iLine.o.x >= point.x)) {
        xi = iLine.o.x;
        // yi = point.y;
      }
      // calculate the intersection point
      else {
        b1 = 0;
        b2 = (iLine.d.y - iLine.o.y) / (iLine.d.x - iLine.o.x);
        a1 = point.y - b1 * point.x;
        a2 = iLine.o.y - b2 * iLine.o.x;

        xi = -(a1 - a2) / (b1 - b2);
        // yi = a1 + b1 * xi;
      }
      // dont count xi < point.x cases
      if (xi >= point.x) {
        xcount += 1;
      }
      // optimisation 4: specific for square images
      if (xcount === 2) {
        break;
      }
    }
    return xcount;
  },

  getBoundingRect: function (absolute, calculate) {
    let coords = this.getCoords(absolute, calculate);
    return makeBoundingBoxFromPoints(coords);
  },

  getScaledWidth: function () {
    return this._getTransformedDimensions().x;
  },

  getScaledHeight: function () {
    return this._getTransformedDimensions().y;
  },

  _constrainScale: function (value) {
    if (Math.abs(value) < this.minScaleLimit) {
      if (value < 0) {
        return -this.minScaleLimit;
      } else {
        return this.minScaleLimit;
      }
    } else if (value === 0) {
      return 0.0001;
    }
    return value;
  },

  scale: function (value) {
    this._set('scaleX', value);
    this._set('scaleY', value);
    return this.setCoords();
  },

  scaleToWidth: function (value, absolute) {
    // adjust to bounding rect factor so that rotated shapes would fit as well
    let boundingRectFactor = this.getBoundingRect(absolute).width / this.getScaledWidth();
    return this.scale(value / this.width / boundingRectFactor);
  },

  scaleToHeight: function (value, absolute) {
    // adjust to bounding rect factor so that rotated shapes would fit as well
    let boundingRectFactor = this.getBoundingRect(absolute).height / this.getScaledHeight();
    return this.scale(value / this.height / boundingRectFactor);
  },

  calcCoords: function (absolute) {
    // this is a compatibility function to avoid removing calcCoords now.
    if (absolute) {
      return this.calcACoords();
    }
    return this.calcOCoords();
  },

  calcLineCoords: function () {
    var vpt = this.getViewportTransform(),
      padding = this.padding, angle = degreesToRadians(this.angle),
      c = cos(angle), s = sin(angle),
      cosP = c * padding, sinP = s * padding, cosPSinP = cosP + sinP,
      cosPMinusSinP = cosP - sinP, aCoords = this.calcACoords();

    let lineCoords = {
      tl: transformPoint(aCoords.tl, vpt),
      tr: transformPoint(aCoords.tr, vpt),
      bl: transformPoint(aCoords.bl, vpt),
      br: transformPoint(aCoords.br, vpt),
    };

    if (padding) {
      lineCoords.tl.x -= cosPMinusSinP;
      lineCoords.tl.y -= cosPSinP;
      lineCoords.tr.x += cosPSinP;
      lineCoords.tr.y -= cosPMinusSinP;
      lineCoords.bl.x -= cosPSinP;
      lineCoords.bl.y += cosPMinusSinP;
      lineCoords.br.x += cosPMinusSinP;
      lineCoords.br.y += cosPSinP;
    }

    return lineCoords;
  },

  calcOCoords: function () {
    var rotateMatrix = this._calcRotateMatrix(),
      translateMatrix = this._calcTranslateMatrix(),
      vpt = this.getViewportTransform(),
      startMatrix = multiplyTransformMatrices(vpt, translateMatrix),
      finalMatrix = multiplyTransformMatrices(startMatrix, rotateMatrix),
      finalMatrix = multiplyTransformMatrices(finalMatrix, [1 / vpt[0], 0, 0, 1 / vpt[3], 0, 0]),
      dim = this._calculateCurrentDimensions(),
      coords = {};
    this.forEachControl(function (control, key, object) {
      coords[key] = control.positionHandler(dim, finalMatrix, object);
    });

    // debug code
    // let canvas = this.canvas;
    // setTimeout(function() {
    //   canvas.contextTop.clearRect(0, 0, 700, 700);
    //   canvas.contextTop.fillStyle = 'green';
    //   Object.keys(coords).forEach(function(key) {
    //     let control = coords[key];
    //     canvas.contextTop.fillRect(control.x, control.y, 3, 3);
    //   });
    // }, 50);
    return coords;
  },

  calcACoords: function () {
    let rotateMatrix = this._calcRotateMatrix(),
      translateMatrix = this._calcTranslateMatrix(),
      finalMatrix = multiplyTransformMatrices(translateMatrix, rotateMatrix),
      dim = this._getTransformedDimensions(),
      w = dim.x / 2, h = dim.y / 2;
    return {
      // corners
      tl: transformPoint({x: -w, y: -h}, finalMatrix),
      tr: transformPoint({x: w, y: -h}, finalMatrix),
      bl: transformPoint({x: -w, y: h}, finalMatrix),
      br: transformPoint({x: w, y: h}, finalMatrix)
    };
  },

  setCoords: function (skipCorners) {
    this.aCoords = this.calcACoords();
    this.lineCoords = this.calcLineCoords();
    if (skipCorners) {
      return this;
    }
    // set coordinates of the draggable boxes in the corners used to scale/rotate the image
    this.oCoords = this.calcOCoords();
    this._setCornerCoords && this._setCornerCoords();
    return this;
  },

  _calcRotateMatrix: function () {
    return calcRotateMatrix(this);
  },

  _calcTranslateMatrix: function () {
    let center = this.getCenterPoint();
    return [1, 0, 0, 1, center.x, center.y];
  },

  transformMatrixKey: function (skipGroup) {
    let sep = '_', prefix = '';
    if (!skipGroup && this.group) {
      prefix = this.group.transformMatrixKey(skipGroup) + sep;
    }
    ;
    return prefix + this.top + sep + this.left + sep + this.scaleX + sep + this.scaleY +
      sep + this.skewX + sep + this.skewY + sep + this.angle + sep + this.originX + sep + this.originY +
      sep + this.width + sep + this.height + sep + this.strokeWidth + this.flipX + this.flipY;
  },

  calcTransformMatrix: function (skipGroup) {
    let matrix = this.calcOwnMatrix();
    if (skipGroup || !this.group) {
      return matrix;
    }
    let key = this.transformMatrixKey(skipGroup), cache = this.matrixCache || (this.matrixCache = {});
    if (cache.key === key) {
      return cache.value;
    }
    if (this.group) {
      matrix = multiplyTransformMatrices(this.group.calcTransformMatrix(false), matrix);
    }
    cache.key = key;
    cache.value = matrix;
    return matrix;
  },

  calcOwnMatrix: function () {
    let key = this.transformMatrixKey(true), cache = this.ownMatrixCache || (this.ownMatrixCache = {});
    if (cache.key === key) {
      return cache.value;
    }
    let tMatrix = this._calcTranslateMatrix(),
      options = {
        angle: this.angle,
        translateX: tMatrix[4],
        translateY: tMatrix[5],
        scaleX: this.scaleX,
        scaleY: this.scaleY,
        skewX: this.skewX,
        skewY: this.skewY,
        flipX: this.flipX,
        flipY: this.flipY,
      };
    cache.key = key;
    cache.value = composeMatrix(options);
    return cache.value;
  },

  _calcDimensionsTransformMatrix: function (skewX, skewY, flipping) {
    return calcDimensionsMatrix({
      skewX: skewX,
      skewY: skewY,
      scaleX: this.scaleX * (flipping && this.flipX ? -1 : 1),
      scaleY: this.scaleY * (flipping && this.flipY ? -1 : 1)
    });
  },

  _getNonTransformedDimensions: function () {
    let strokeWidth = this.strokeWidth,
      w = this.width + strokeWidth,
      h = this.height + strokeWidth;
    return {x: w, y: h};
  },

  _getTransformedDimensions: function (skewX, skewY) {
    if (typeof skewX === 'undefined') {
      skewX = this.skewX;
    }
    if (typeof skewY === 'undefined') {
      skewY = this.skewY;
    }
    let dimensions = this._getNonTransformedDimensions(), dimX, dimY,
      noSkew = skewX === 0 && skewY === 0;

    if (this.strokeUniform) {
      dimX = this.width;
      dimY = this.height;
    } else {
      dimX = dimensions.x;
      dimY = dimensions.y;
    }
    if (noSkew) {
      return this._finalizeDimensions(dimX * this.scaleX, dimY * this.scaleY);
    }
    let bbox = sizeAfterTransform(dimX, dimY, {
      scaleX: this.scaleX,
      scaleY: this.scaleY,
      skewX: skewX,
      skewY: skewY,
    });
    return this._finalizeDimensions(bbox.x, bbox.y);
  },

  _finalizeDimensions: function (width, height) {
    return this.strokeUniform ?
      {x: width + this.strokeWidth, y: height + this.strokeWidth}
      :
      {x: width, y: height};
  },

  _calculateCurrentDimensions: function () {
    let vpt = this.getViewportTransform(),
      dim = this._getTransformedDimensions(),
      p = transformPoint(dim, vpt, true);
    return p.scalarAdd(2 * this.padding);
  },
}
