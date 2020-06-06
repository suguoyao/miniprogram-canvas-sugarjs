/**
 * Created by Sugar on 2020/5/25.
 */
const CanvasClass = require('./canvas.class')
const ObjectClass = require('./shapes/object.class')
const ImageClass = require('./shapes/image.class')
const TextClass = require('./shapes/text.class')
const RectClass = require('./shapes/rect.class')
const PolygonClass = require('./shapes/polygon.class')
const TriangleClass = require('./shapes/triangle.class')
const CircleClass = require('./shapes/circle.class')
const EllipseClass = require('./shapes/ellipse.class')
const GradientClass = require('./gradient.class')
const PatternClass = require('./pattern.class')
const PointClass = require('./point.class')
const ColorClass = require('./color.class')

const {mergeMethods} = require('./utils/index')
const CommonMethods = require('./mixins/shared_methods.mixin')
const Observable = require('./mixins/observable.mixin')
const CanvasEvent = require('./mixins/canvas_events.mixin')
const ObjectOrigin = require('./mixins/object_origin.mixin')
const ObjectInteractivity = require('./mixins/object_interactivity.mixin')
const ObjectGeometry = require('./mixins/object_geometry.mixin')
const TextStyles = require('./mixins/text_style.mixin')

const Sugar = {}

mergeMethods(CanvasClass, CommonMethods)
mergeMethods(CanvasClass, Observable)
mergeMethods(CanvasClass, CanvasEvent)
mergeMethods(ObjectClass, CommonMethods)
mergeMethods(ObjectClass, Observable)
mergeMethods(ObjectClass, ObjectOrigin)
mergeMethods(ObjectClass, ObjectInteractivity)
mergeMethods(ObjectClass, ObjectGeometry)
mergeMethods(TextClass, TextStyles)

Sugar.Canvas = CanvasClass
Sugar.Object = ObjectClass
Sugar.Image = ImageClass
Sugar.Text = TextClass
Sugar.Rect = RectClass
Sugar.Polygon = PolygonClass
Sugar.Triangle = TriangleClass
Sugar.Circle = CircleClass
Sugar.Ellipse = EllipseClass
Sugar.Gradient = GradientClass
Sugar.Pattern = PatternClass
Sugar.Point = PointClass
Sugar.Color = ColorClass


module.exports = Sugar
