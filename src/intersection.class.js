/**
 * Created by Sugar on 2020/5/30.
 */
const PointClass = require('./point.class')

class IntersectionClass {
  constructor(status) {
    this.status = status;
    this.points = [];
  }

  appendPoint(point) {
    this.points.push(point);
    return this;
  }

  appendPoints(points) {
    this.points = this.points.concat(points);
    return this;
  }
}

IntersectionClass.intersectLineLine = function (a1, a2, b1, b2) {
  let result,
    uaT = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x),
    ubT = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x),
    uB = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
  if (uB !== 0) {
    let ua = uaT / uB,
      ub = ubT / uB;
    if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
      result = new IntersectionClass('Intersection');
      result.appendPoint(new PointClass(a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y)));
    } else {
      result = new Intersection();
    }
  } else {
    if (uaT === 0 || ubT === 0) {
      result = new IntersectionClass('Coincident');
    } else {
      result = new IntersectionClass('Parallel');
    }
  }
  return result;
}

IntersectionClass.intersectLinePolygon = function (a1, a2, points) {
  let result = new IntersectionClass(),
    length = points.length,
    b1, b2, inter, i;

  for (i = 0; i < length; i++) {
    b1 = points[i];
    b2 = points[(i + 1) % length];
    inter = IntersectionClass.intersectLineLine(a1, a2, b1, b2);

    result.appendPoints(inter.points);
  }
  if (result.points.length > 0) {
    result.status = 'Intersection';
  }
  return result;
}

IntersectionClass.intersectPolygonPolygon = function (points1, points2) {
  let result = new IntersectionClass(),
    length = points1.length, i;

  for (i = 0; i < length; i++) {
    let a1 = points1[i],
      a2 = points1[(i + 1) % length],
      inter = IntersectionClass.intersectLinePolygon(a1, a2, points2);

    result.appendPoints(inter.points);
  }
  if (result.points.length > 0) {
    result.status = 'Intersection';
  }
  return result;
};

IntersectionClass.intersectPolygonRectangle = function (points, r1, r2) {
  let min = r1.min(r2),
    max = r1.max(r2),
    topRight = new PointClass(max.x, min.y),
    bottomLeft = new PointClass(min.x, max.y),
    inter1 = IntersectionClass.intersectLinePolygon(min, topRight, points),
    inter2 = IntersectionClass.intersectLinePolygon(topRight, max, points),
    inter3 = IntersectionClass.intersectLinePolygon(max, bottomLeft, points),
    inter4 = IntersectionClass.intersectLinePolygon(bottomLeft, min, points),
    result = new IntersectionClass();

  result.appendPoints(inter1.points);
  result.appendPoints(inter2.points);
  result.appendPoints(inter3.points);
  result.appendPoints(inter4.points);

  if (result.points.length > 0) {
    result.status = 'Intersection';
  }
  return result;
};

module.exports = IntersectionClass
