/**
 * Created by Sugar on 2020/5/25.
 */
const CanvasClass = require('./canvas.class')
const ObjectClass = require('./shapes/object.class')
// const RectClass = require('./shapes/rect.class')
const GradientClass = require('./gradient.class')
const PatternClass = require('./pattern.class')
const PointClass = require('./point.class')
const ColorClass = require('./color.class')

let Sugar = {}

Sugar.Canvas = CanvasClass
Sugar.Object = ObjectClass
// Sugar.Rect = RectClass
Sugar.GradientClass = GradientClass
Sugar.PatternClass = PatternClass
Sugar.PointClass = PointClass
Sugar.ColorClass = ColorClass


module.exports = Sugar
