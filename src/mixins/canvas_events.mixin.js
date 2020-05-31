/**
 * Created by Sugar on 2020/5/30.
 */
module.exports = {
  /**
   * @param e
   * changedTouches: [
   {identifier: 0
     x: 188.0001220703125
     y: 218.99996948242188
     }
   ],
   currentTarget:{
     dataset:{}
     id: "sugarjs"
     offsetLeft: 0
     offsetTop: 0
   }
   target:{
     dataset: {}
     id: "sugarjs"
     offsetLeft: 0
     offsetTop: 0
   }
   timeStamp: 5821.974999998929
   touches: [
   {
       identifier: 0
       x: 188.0001220703125
       y: 218.99996948242188
     }
   ],
   type: "touchstart"
   */
  touchstart: function (e) {
    this._target = null
    console.log('touchstart', e)
    this._handleEvent(e, 'start:before');
    this._target = this._currentTransform ? this._currentTransform.target : this.findTarget(e) || null

    var target = this._target
    var pointer = this._pointer;
    var shouldRender = this._shouldRender(target)

    if (target) {
      var alreadySelected = target === this._activeObject;
      if (target.selectable) {
        console.log('点击目标', target)
        this.setActiveObject(target, e);
      }
      // var corner = target._findTargetCorner(
      //   this.getPointer(e, true),
      //   true
      // );
      // target.__corner = corner;
      // if (target === this._activeObject && (corner || !shouldGroup)) {
      //   var control = target.controls[corner],
      //     mouseDownHandler = control && control.getMouseDownHandler(e, target, control);
      //   if (mouseDownHandler) {
      //     mouseDownHandler(e, target, control);
      //   }
      //   this._setupCurrentTransform(e, target, alreadySelected);
      // }
    }
    this._handleEvent(e, 'start');
    (shouldRender) && this.requestRenderAll();
  },
  touchmove: function (e) {

  },
  touchend: function (e) {

  },
  longtap: function (e) {

  },
  _handleEvent: function (e, eventType, button, isClick) {
    var target = this._target,
      targets = this.targets || [],
      options = {
        e: e,
        target: target,
        subTargets: targets,
        // button: button || LEFT_CLICK,
        // isClick: isClick || false,
        // pointer: this._pointer,
        // absolutePointer: this._absolutePointer,
        transform: this._currentTransform
      };
    this.fire('touch:' + eventType, options);
    target && target.fire('touch' + eventType, options);
    for (var i = 0; i < targets.length; i++) {
      targets[i].fire('touch' + eventType, options);
    }
  },
  _shouldRender: function (target) {
    var activeObject = this._activeObject;

    if (
      !!activeObject !== !!target ||
      (activeObject && target && (activeObject !== target))
    ) {
      return true;
    }
    return false;
  },

  findTarget: function (e, skipGroup) {
    if (this.skipTargetFind) {
      return;
    }
    let ignoreZoom = true,
      pointer = this.getPointer(e, ignoreZoom),
      activeObject = this._activeObject,
      aObjects = this.getActiveObjects(),
      activeTarget, activeTargetSubs

    this.targets = [];

    if (aObjects.length > 1 && !skipGroup && activeObject === this._searchPossibleTargets([activeObject], pointer)) {
      return activeObject;
    }
    if (aObjects.length === 1 && activeObject._findTargetCorner(pointer)) {
      return activeObject;
    }
    if (aObjects.length === 1 &&
      activeObject === this._searchPossibleTargets([activeObject], pointer)) {
      if (!this.preserveObjectStacking) {
        return activeObject;
      } else {
        activeTarget = activeObject;
        activeTargetSubs = this.targets;
        this.targets = [];
      }
    }
    var target = this._searchPossibleTargets(this._objects, pointer);
    if (e[this.altSelectionKey] && target && activeTarget && target !== activeTarget) {
      target = activeTarget;
      this.targets = activeTargetSubs;
    }
    return target;
  },

  _searchPossibleTargets: function (objects, pointer) {
    var target, i = objects.length, subTarget;
    while (i--) {
      var objToCheck = objects[i];
      // var pointerToUse = objToCheck.group && objToCheck.group.type !== 'activeSelection' ?
      //   this._normalizePointer(objToCheck.group, pointer) : pointer;
      if (this._checkTarget(pointer, objToCheck, pointer)) {
        target = objects[i];
        // if (target.subTargetCheck && target instanceof Group) {
        //   subTarget = this._searchPossibleTargets(target._objects, pointer);
        //   subTarget && this.targets.push(subTarget);
        // }
        break;
      }
    }
    return target;
  },

  getPointer: function (e, ignoreZoom) {
    if (this._pointer && ignoreZoom) {
      return this._pointer;
    }

    var pointer = {
      x: e.touches[0].x,
      y: e.touches[0].y
    }

    return pointer
  },

  _checkTarget: function (pointer, obj, globalPointer) {
    if (obj &&
      obj.visible &&
      obj.evented &&
      this.containsPoint(null, obj, pointer)) {
      // if ((this.perPixelTargetFind || obj.perPixelTargetFind) && !obj.isEditing) {
      //   var isTransparent = this.isTargetTransparent(obj, globalPointer.x, globalPointer.y);
      //   if (!isTransparent) {
      //     return true;
      //   }
      // } else {
      return true;
      // }
    }
  },

  containsPoint: function (e, target, point) {
    var ignoreZoom = true,
      pointer = point || this.getPointer(e, ignoreZoom),
      xy;

    // if (target.group && target.group === this._activeObject && target.group.type === 'activeSelection') {
    //   xy = this._normalizePointer(target.group, pointer);
    // } else {
    xy = {x: pointer.x, y: pointer.y};
    // }
    // return (target.containsPoint(xy) || !!target._findTargetCorner(pointer, true));
    return target.left <= xy.x && xy.x <= (target.left + target.width) && target.top <= xy.y && xy.y <= (target.top + target.height)
  }
}
