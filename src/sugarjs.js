/**
 * Created by Sugar on 2020/5/25.
 */
const CanvasClass = require('./canvas.class')
const ObjectClass = require('./shapes/object.class')
const ImageClass = require('./shapes/image.class')
// const RectClass = require('./shapes/rect.class')
const GradientClass = require('./gradient.class')
const PatternClass = require('./pattern.class')
const PointClass = require('./point.class')
const ColorClass = require('./color.class')

const {mergeMethods} = require('./utils/index')
const CommonMethods = require('./mixins/shared_methods.mixin')

let Sugar = {}

mergeMethods(CanvasClass, CommonMethods)
mergeMethods(ObjectClass, CommonMethods)

Sugar.Canvas = CanvasClass
Sugar.Object = ObjectClass
Sugar.Image = ImageClass
// Sugar.Rect = RectClass
Sugar.GradientClass = GradientClass
Sugar.PatternClass = PatternClass
Sugar.PointClass = PointClass
Sugar.ColorClass = ColorClass


module.exports = Sugar
