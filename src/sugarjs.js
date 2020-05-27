/**
 * Created by Sugar on 2020/5/25.
 */
const CanvasClass = require('./canvas.class')
const ObjectClass = require('./shapes/object.class')
const ImageClass = require('./shapes/image.class')
const TextClass = require('./shapes/text.class')
// const RectClass = require('./shapes/rect.class')
const GradientClass = require('./gradient.class')
const PatternClass = require('./pattern.class')
const PointClass = require('./point.class')
const ColorClass = require('./color.class')

const {mergeMethods} = require('./utils/index')
const CommonMethods = require('./mixins/shared_methods.mixin')
const TextStyles = require('./mixins/text_style.mixin')

let Sugar = {}

mergeMethods(CanvasClass, CommonMethods)
mergeMethods(ObjectClass, CommonMethods)

mergeMethods(TextClass, TextStyles)

Sugar.Canvas = CanvasClass
Sugar.Object = ObjectClass
Sugar.Image = ImageClass
Sugar.Text = TextClass
// Sugar.Rect = RectClass
Sugar.GradientClass = GradientClass
Sugar.PatternClass = PatternClass
Sugar.PointClass = PointClass
Sugar.ColorClass = ColorClass


module.exports = Sugar
