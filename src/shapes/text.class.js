/**
 * Created by Sugar on 2020/5/26.
 */
const ObjectClass = require('./object.class')
const {graphemeSplit} = require('../utils/string')

class TextClass extends ObjectClass {
  constructor(text, options) {
    super(options)

    this.type = 'text'
    this.stroke = null
    this.fontSize = 16
    this.fontWeight = 'normal'
    this.fontFamily = 'sans-serif'
    this.underline = false
    this.overline = false
    this.linethrough = false
    this.textAlign = 'left'
    this.fontStyle = 'normal'
    this.lineHeight = 1.16
    this.charSpacing = 0
    this.styles = null
    this._fontSizeMult = 1.13
    this._fontSizeFraction = 0.222

    this._reNewline = /\r?\n/
    this._reSpaceAndTab = /[ \t\r]/
    this._reSpacesAndTabs = /[ \t\r]/g

    this.__charBounds = []
    this.MIN_TEXT_WIDTH = 2
    this.CACHE_FONT_SIZE = 400

    this._styleProperties = [
      'stroke',
      'strokeWidth',
      'fill',
      'fontFamily',
      'fontSize',
      'fontWeight',
      'fontStyle',
      'underline',
      'overline',
      'linethrough',
      // 'deltaY',
      // 'textBackgroundColor',
    ]
    this._dimensionAffectingProps = [
      'fontSize',
      'fontWeight',
      'fontFamily',
      'fontStyle',
      'lineHeight',
      'text',
      'charSpacing',
      'textAlign',
      'styles',
    ]

    this.initialize(text, options)
  }

  initialize(text, options) {
    this.styles = options ? (options.styles || {}) : {}
    this.text = text
    super.initialize(options)
    this.initDimensions();
    this.setCoords();
    // this.setupState({propertySet: '_dimensionAffectingProps'});
  }

  initDimensions() {
    this._splitText();
    this._clearCache();

    if (this.canvas && this.canvas.ctx) {
      // this.width = this.canvas.ctx.measureText(this.text).width || this.MIN_TEXT_WIDTH
      this.width = this.calcTextWidth() || this.MIN_TEXT_WIDTH
    }
    this.height = this.calcTextHeight()
    if (this.textAlign.indexOf('justify') !== -1) {
      this.enlargeSpaces();
    }
    this.height = this.calcTextHeight();
    // this.saveState({propertySet: '_dimensionAffectingProps'})
  }

  enlargeSpaces() {
    let diffSpace, currentLineWidth, numberOfSpaces, accumulatedSpace, line, charBound, spaces;
    for (let i = 0, len = this._textLines.length; i < len; i++) {
      if (this.textAlign !== 'justify' && (i === len - 1 || this.isEndOfWrapping(i))) {
        continue;
      }
      accumulatedSpace = 0;
      line = this._textLines[i];
      currentLineWidth = this.getLineWidth(i);
      if (currentLineWidth < this.width && (spaces = this.textLines[i].match(this._reSpacesAndTabs))) {
        numberOfSpaces = spaces.length;
        diffSpace = (this.width - currentLineWidth) / numberOfSpaces;
        for (let j = 0, jlen = line.length; j <= jlen; j++) {
          charBound = this.__charBounds[i][j];
          if (this._reSpaceAndTab.test(line[j])) {
            charBound.width += diffSpace;
            charBound.kernedWidth += diffSpace;
            charBound.left += accumulatedSpace;
            accumulatedSpace += diffSpace;
          } else {
            charBound.left += accumulatedSpace;
          }
        }
      }
    }
  }

  getFontCache(decl) {
    let fontFamily = decl.fontFamily.toLowerCase();
    if (!TextClass.charWidthsCache[fontFamily]) {
      TextClass.charWidthsCache[fontFamily] = {};
    }
    let cache = TextClass.charWidthsCache[fontFamily],
      cacheProp = decl.fontStyle.toLowerCase() + '_' + (decl.fontWeight + '').toLowerCase();
    if (!cache[cacheProp]) {
      cache[cacheProp] = {};
    }
    return cache[cacheProp];
  }

  calcTextHeight() {
    let lineHeight, height = 0;
    for (let i = 0, len = this._textLines.length; i < len; i++) {
      lineHeight = this.getHeightOfLine(i);
      height += (i === len - 1 ? lineHeight / this.lineHeight : lineHeight);
    }
    return height;
  }

  getHeightOfLine(lineIndex) {
    if (this.__lineHeights[lineIndex]) {
      return this.__lineHeights[lineIndex];
    }

    let line = this._textLines[lineIndex],
      maxHeight = this.getHeightOfChar(lineIndex, 0);
    for (let i = 1; i < line.length; i++) {
      maxHeight = Math.max(this.getHeightOfChar(lineIndex, i), maxHeight);
    }

    return this.__lineHeights[lineIndex] = maxHeight * this.lineHeight * this._fontSizeMult;
  }

  getHeightOfChar(line, _char) {
    return this.getValueOfPropertyAt(line, _char, 'fontSize');
  }

  getValueOfPropertyAt(lineIndex, charIndex, property) {
    var charStyle = this._getStyleDeclaration(lineIndex, charIndex);
    if (charStyle && typeof charStyle[property] !== 'undefined') {
      return charStyle[property];
    }
    return this[property];
  }

  _clearCache() {
    this.__lineWidths = []
    this.__lineHeights = []
    this.__charBounds = []
  }

  isEndOfWrapping(lineIndex) {
    return lineIndex === this._textLines.length - 1;
  }

  missingNewlineOffset() {
    return 1;
  }

  getMeasuringContext() {
    let _measuringContext = this.canvas && this.canvas.ctx
    return _measuringContext;
  }

  _splitText() {
    let newLines = this._splitTextIntoLines(this.text)
    this.textLines = newLines.lines
    this._textLines = newLines.graphemeLines
    this._unwrappedTextLines = newLines._unwrappedLines
    this._text = newLines.graphemeText
    return newLines
  }

  /**
   * 返回分行后的文本数组.
   * @param {String} text
   * @returns {Array}
   */
  _splitTextIntoLines(text) {
    let lines = text.split(this._reNewline),
      newLines = new Array(lines.length),
      newLine = ['\n'],
      newText = []
    for (let i = 0; i < lines.length; i++) {
      newLines[i] = graphemeSplit(lines[i])
      newText = newText.concat(newLines[i], newLine)
    }
    newText.pop()
    return {_unwrappedLines: newLines, lines: lines, graphemeText: newText, graphemeLines: newLines}
  }

  calcTextWidth() {
    let maxWidth = this.getLineWidth(0);

    for (let i = 1, len = this._textLines.length; i < len; i++) {
      let currentLineWidth = this.getLineWidth(i);
      if (currentLineWidth > maxWidth) {
        maxWidth = currentLineWidth;
      }
    }
    console.log('文本宽度', maxWidth)
    return maxWidth;
  }

  getLineWidth(lineIndex) {
    if (this.__lineWidths[lineIndex]) {
      return this.__lineWidths[lineIndex];
    }

    let width, line = this._textLines[lineIndex], lineInfo;

    if (line === '') {
      width = 0;
    } else {
      lineInfo = this.measureLine(lineIndex);
      width = lineInfo.width;
    }
    this.__lineWidths[lineIndex] = width;
    return width;
  }

  measureLine(lineIndex) {
    let lineInfo = this._measureLine(lineIndex);
    if (this.charSpacing !== 0) {
      lineInfo.width -= this._getWidthOfCharSpacing();
    }
    if (lineInfo.width < 0) {
      lineInfo.width = 0;
    }
    return lineInfo;
  }

  _measureLine(lineIndex) {
    let width = 0, i, grapheme, line = this._textLines[lineIndex], prevGrapheme,
      graphemeInfo, numOfSpaces = 0, lineBounds = new Array(line.length);

    this.__charBounds[lineIndex] = lineBounds;
    for (i = 0; i < line.length; i++) {
      grapheme = line[i];
      graphemeInfo = this._getGraphemeBox(grapheme, lineIndex, i, prevGrapheme);
      lineBounds[i] = graphemeInfo;
      width += graphemeInfo.kernedWidth;
      prevGrapheme = grapheme;
    }
    // this latest bound box represent the last character of the line
    // to simplify cursor handling in interactive mode.
    lineBounds[i] = {
      left: graphemeInfo ? graphemeInfo.left + graphemeInfo.width : 0,
      width: 0,
      kernedWidth: 0,
      height: this.fontSize
    };
    return {width: width, numOfSpaces: numOfSpaces};
  }

  _renderTextCommon(ctx, method) {
    ctx.save();
    let lineHeights = 0, left = this._getLeftOffset(ctx), top = this._getTopOffset(ctx),
      offsets = this._applyPatternGradientTransform(ctx, method === 'fillText' ? this.fill : this.stroke);
    for (let i = 0, len = this._textLines.length; i < len; i++) {
      let heightOfLine = this.getHeightOfLine(i),
        maxHeight = heightOfLine / this.lineHeight,
        leftOffset = this._getLineLeftOffset(i);
      this._renderTextLine(
        method,
        ctx,
        this._textLines[i],
        left + leftOffset - offsets.offsetX, // TODO 优化position
        top + lineHeights + maxHeight - offsets.offsetY,
        i
      );
      lineHeights += heightOfLine;
    }
    ctx.restore();
  }

  _getLeftOffset(ctx) {
    // this.width = ctx.measureText(this.text).width || this.MIN_TEXT_WIDTH
    return -this.width / 2;
  }

  _getTopOffset(ctx) {
    return -this.height / 2;
  }

  _getLineLeftOffset(lineIndex) {
    let lineWidth = this.getLineWidth(lineIndex);
    if (this.textAlign === 'center') {
      return (this.width - lineWidth) / 2;
    }
    if (this.textAlign === 'right') {
      return this.width - lineWidth;
    }
    if (this.textAlign === 'justify-center' && this.isEndOfWrapping(lineIndex)) {
      return (this.width - lineWidth) / 2;
    }
    if (this.textAlign === 'justify-right' && this.isEndOfWrapping(lineIndex)) {
      return this.width - lineWidth;
    }
    return 0;
  }

  _getGraphemeBox(grapheme, lineIndex, charIndex, prevGrapheme, skipLeft) {
    let style = this.getCompleteStyleDeclaration(lineIndex, charIndex),
      prevStyle = prevGrapheme ? this.getCompleteStyleDeclaration(lineIndex, charIndex - 1) : {},
      info = this._measureChar(grapheme, style, prevGrapheme, prevStyle),
      kernedWidth = info.kernedWidth,
      width = info.width, charSpacing;

    if (this.charSpacing !== 0) {
      charSpacing = this._getWidthOfCharSpacing();
      width += charSpacing;
      kernedWidth += charSpacing;
    }

    let box = {
      width: width,
      left: 0,
      height: style.fontSize,
      kernedWidth: kernedWidth,
      deltaY: style.deltaY,
    };
    if (charIndex > 0 && !skipLeft) {
      let previousBox = this.__charBounds[lineIndex][charIndex - 1];
      box.left = previousBox.left + previousBox.width + info.kernedWidth - info.width;
    }
    return box;
  }

  _measureChar(_char, charStyle, previousChar, prevCharStyle) {
    let fontCache = this.getFontCache(charStyle),
      fontDeclaration = this._getFontDeclaration(charStyle),
      previousFontDeclaration = this._getFontDeclaration(prevCharStyle), couple = previousChar + _char,
      stylesAreEqual = fontDeclaration === previousFontDeclaration, width, coupleWidth, previousWidth,
      fontMultiplier = charStyle.fontSize / this.CACHE_FONT_SIZE, kernedWidth;

    if (previousChar && fontCache[previousChar] !== undefined) {
      previousWidth = fontCache[previousChar];
    }
    if (fontCache[_char] !== undefined) {
      kernedWidth = width = fontCache[_char];
    }
    if (stylesAreEqual && fontCache[couple] !== undefined) {
      coupleWidth = fontCache[couple];
      kernedWidth = coupleWidth - previousWidth;
    }
    let ctx
    if (width === undefined || previousWidth === undefined || coupleWidth === undefined) {
      ctx = this.getMeasuringContext();
      this._setTextStyles(ctx, charStyle, true);
    }
    if (width === undefined) {
      kernedWidth = width = ctx.measureText(_char).width;
      fontCache[_char] = width;
    }
    if (previousWidth === undefined && stylesAreEqual && previousChar) {
      previousWidth = ctx.measureText(previousChar).width;
      fontCache[previousChar] = previousWidth;
    }
    if (stylesAreEqual && coupleWidth === undefined) {
      coupleWidth = ctx.measureText(couple).width;
      fontCache[couple] = coupleWidth;
      kernedWidth = coupleWidth - previousWidth;
    }
    return {width: width * fontMultiplier, kernedWidth: kernedWidth * fontMultiplier};
  }

  _getFontDeclaration(styleObject, forMeasuring) {
    // let style = styleObject || this, family = this.fontFamily,
    //   fontIsGeneric = TextClass.genericFonts.indexOf(family.toLowerCase()) > -1;
    // let fontFamily = family === undefined ||
    // family.indexOf('\'') > -1 || family.indexOf(',') > -1 ||
    // family.indexOf('"') > -1 || fontIsGeneric
    //   ? style.fontFamily : '"' + style.fontFamily + '"';
    // return [
    //   style.fontStyle,
    //   style.fontWeight,
    //   forMeasuring ? this.CACHE_FONT_SIZE + 'px' : style.fontSize + 'px',
    //   fontFamily
    // ].join(' ');

    return `${this.fontStyle} ${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`
  }

  _getWidthOfCharSpacing() {
    if (this.charSpacing !== 0) {
      return this.fontSize * this.charSpacing / 1000;
    }
    return 0;
  }

  _setTextStyles(ctx, charStyle, forMeasuring) {
    ctx.font = this._getFontDeclaration(charStyle, forMeasuring);
    this.width = ctx.measureText(this.text).width || this.MIN_TEXT_WIDTH
  }

  _renderTextLinesBackground(ctx) {
    if (!this.textBackgroundColor && !this.styleHas('textBackgroundColor')) {
      return;
    }
    var lineTopOffset = 0, heightOfLine,
      lineLeftOffset, originalFill = ctx.fillStyle,
      line, lastColor,
      leftOffset = this._getLeftOffset(ctx),
      topOffset = this._getTopOffset(ctx),
      boxStart = 0, boxWidth = 0, charBox, currentColor;

    for (var i = 0, len = this._textLines.length; i < len; i++) {
      heightOfLine = this.getHeightOfLine(i);
      if (!this.textBackgroundColor && !this.styleHas('textBackgroundColor', i)) {
        lineTopOffset += heightOfLine;
        continue;
      }
      line = this._textLines[i];
      lineLeftOffset = this._getLineLeftOffset(i);
      boxWidth = 0;
      boxStart = 0;
      lastColor = this.getValueOfPropertyAt(i, 0, 'textBackgroundColor');
      for (var j = 0, jlen = line.length; j < jlen; j++) {
        charBox = this.__charBounds[i][j];
        currentColor = this.getValueOfPropertyAt(i, j, 'textBackgroundColor');
        if (currentColor !== lastColor) {
          ctx.fillStyle = lastColor;
          lastColor && ctx.fillRect(
            leftOffset + lineLeftOffset + boxStart,
            topOffset + lineTopOffset,
            boxWidth,
            heightOfLine / this.lineHeight
          );
          boxStart = charBox.left;
          boxWidth = charBox.width;
          lastColor = currentColor;
        } else {
          boxWidth += charBox.kernedWidth;
        }
      }
      if (currentColor) {
        ctx.fillStyle = currentColor;
        ctx.fillRect(
          leftOffset + lineLeftOffset + boxStart,
          topOffset + lineTopOffset,
          boxWidth,
          heightOfLine / this.lineHeight
        );
      }
      lineTopOffset += heightOfLine;
    }
    ctx.fillStyle = originalFill;

    this._removeShadow(ctx);
  }

  _renderTextDecoration(ctx, type) {
    if (!this[type] && !this.styleHas(type)) {
      return;
    }
    var heightOfLine, size, _size,
      lineLeftOffset, dy, _dy,
      line, lastDecoration,
      leftOffset = this._getLeftOffset(ctx),
      topOffset = this._getTopOffset(ctx), top,
      boxStart, boxWidth, charBox, currentDecoration,
      maxHeight, currentFill, lastFill,
      charSpacing = this._getWidthOfCharSpacing();

    for (var i = 0, len = this._textLines.length; i < len; i++) {
      heightOfLine = this.getHeightOfLine(i);
      if (!this[type] && !this.styleHas(type, i)) {
        topOffset += heightOfLine;
        continue;
      }
      line = this._textLines[i];
      maxHeight = heightOfLine / this.lineHeight;
      lineLeftOffset = this._getLineLeftOffset(i);
      boxStart = 0;
      boxWidth = 0;
      lastDecoration = this.getValueOfPropertyAt(i, 0, type);
      lastFill = this.getValueOfPropertyAt(i, 0, 'fill');
      top = topOffset + maxHeight * (1 - this._fontSizeFraction);
      size = this.getHeightOfChar(i, 0);
      dy = this.getValueOfPropertyAt(i, 0, 'deltaY');
      for (var j = 0, jlen = line.length; j < jlen; j++) {
        charBox = this.__charBounds[i][j];
        currentDecoration = this.getValueOfPropertyAt(i, j, type);
        currentFill = this.getValueOfPropertyAt(i, j, 'fill');
        _size = this.getHeightOfChar(i, j);
        _dy = this.getValueOfPropertyAt(i, j, 'deltaY');
        if ((currentDecoration !== lastDecoration || currentFill !== lastFill || _size !== size || _dy !== dy) &&
          boxWidth > 0) {
          ctx.fillStyle = lastFill;
          lastDecoration && lastFill && ctx.fillRect(
            leftOffset + lineLeftOffset + boxStart,
            top + this.offsets[type] * size + dy,
            boxWidth,
            this.fontSize / 15
          );
          boxStart = charBox.left;
          boxWidth = charBox.width;
          lastDecoration = currentDecoration;
          lastFill = currentFill;
          size = _size;
          dy = _dy;
        } else {
          boxWidth += charBox.kernedWidth;
        }
      }
      ctx.fillStyle = currentFill;
      currentDecoration && currentFill && ctx.fillRect(
        leftOffset + lineLeftOffset + boxStart,
        top + this.offsets[type] * size + dy,
        boxWidth - charSpacing,
        this.fontSize / 15
      );
      topOffset += heightOfLine;
    }
    this._removeShadow(ctx);
  }

  _renderTextStroke(ctx) {
    if ((!this.stroke || this.strokeWidth === 0) && this.isEmptyStyles()) {
      return;
    }

    if (this.shadow && !this.shadow.affectStroke) {
      this._removeShadow(ctx);
    }

    ctx.save();
    this._setLineDash(ctx, this.strokeDashArray);
    ctx.beginPath();
    this._renderTextCommon(ctx, 'strokeText');
    ctx.closePath();
    ctx.restore();
  }

  _renderText(ctx) {
    if (this.paintFirst === 'stroke') {
      this._renderTextStroke(ctx);
      this._renderTextFill(ctx);
    } else {
      this._renderTextFill(ctx);
      this._renderTextStroke(ctx);
    }
  }

  _renderTextFill(ctx) {
    if (!this.fill && !this.styleHas('fill')) {
      return;
    }

    this._renderTextCommon(ctx, 'fillText');
  }

  _renderTextLine(method, ctx, line, left, top, lineIndex) {
    this._renderChars(method, ctx, line, left, top, lineIndex);
  }

  _renderChars(method, ctx, line, left, top, lineIndex) {
    // set proper line offset
    var lineHeight = this.getHeightOfLine(lineIndex),
      isJustify = this.textAlign.indexOf('justify') !== -1,
      actualStyle,
      nextStyle,
      charsToRender = '',
      charBox,
      boxWidth = 0,
      timeToRender,
      shortCut = !isJustify && this.charSpacing === 0 && this.isEmptyStyles(lineIndex);

    ctx.save();
    top -= lineHeight * this._fontSizeFraction / this.lineHeight;
    if (shortCut) {
      // render all the line in one pass without checking
      this._renderChar(method, ctx, lineIndex, 0, this.textLines[lineIndex], left, top, lineHeight);
      ctx.restore();
      return;
    }
    for (var i = 0, len = line.length - 1; i <= len; i++) {
      timeToRender = i === len || this.charSpacing;
      charsToRender += line[i];
      charBox = this.__charBounds[lineIndex][i];
      if (boxWidth === 0) {
        left += charBox.kernedWidth - charBox.width;
        boxWidth += charBox.width;
      } else {
        boxWidth += charBox.kernedWidth;
      }
      if (isJustify && !timeToRender) {
        if (this._reSpaceAndTab.test(line[i])) {
          timeToRender = true;
        }
      }
      if (!timeToRender) {
        // if we have charSpacing, we render char by char
        actualStyle = actualStyle || this.getCompleteStyleDeclaration(lineIndex, i);
        nextStyle = this.getCompleteStyleDeclaration(lineIndex, i + 1);
        timeToRender = this._hasStyleChanged(actualStyle, nextStyle);
      }
      if (timeToRender) {
        this._renderChar(method, ctx, lineIndex, i, charsToRender, left, top, lineHeight);
        charsToRender = '';
        actualStyle = nextStyle;
        left += boxWidth;
        boxWidth = 0;
      }
    }
    ctx.restore();
  }

  _renderChar(method, ctx, lineIndex, charIndex, _char, left, top) {
    var decl = this._getStyleDeclaration(lineIndex, charIndex),
      fullDecl = this.getCompleteStyleDeclaration(lineIndex, charIndex),
      shouldFill = method === 'fillText' && fullDecl.fill,
      shouldStroke = method === 'strokeText' && fullDecl.stroke && fullDecl.strokeWidth;

    if (!shouldStroke && !shouldFill) {
      return;
    }
    decl && ctx.save();

    this._applyCharStyles(method, ctx, lineIndex, charIndex, fullDecl);

    if (decl && decl.textBackgroundColor) {
      this._removeShadow(ctx);
    }
    if (decl && decl.deltaY) {
      top += decl.deltaY;
    }
    // console.log('ctx.fillText', _char, left, top)
    shouldFill && ctx.fillText(_char, left, top);
    shouldStroke && ctx.strokeText(_char, left, top);
    decl && ctx.restore();
  }

  _applyCharStyles(method, ctx, lineIndex, charIndex, styleDeclaration) {
    this._setFillStyles(ctx, styleDeclaration);
    this._setStrokeStyles(ctx, styleDeclaration);
    ctx.font = this._getFontDeclaration(styleDeclaration);
  }

  _hasStyleChanged(prevStyle, thisStyle) {
    return prevStyle.fill !== thisStyle.fill ||
      prevStyle.stroke !== thisStyle.stroke ||
      prevStyle.strokeWidth !== thisStyle.strokeWidth ||
      prevStyle.fontSize !== thisStyle.fontSize ||
      prevStyle.fontFamily !== thisStyle.fontFamily ||
      prevStyle.fontWeight !== thisStyle.fontWeight ||
      prevStyle.fontStyle !== thisStyle.fontStyle ||
      prevStyle.deltaY !== thisStyle.deltaY;
  }

  set(key, value) {
    super.set(key, value)
    let needsDims = false;
    if (typeof key === 'object') {
      for (let _key in key) {
        needsDims = needsDims || this._dimensionAffectingProps.indexOf(_key) !== -1;
      }
    } else {
      needsDims = this._dimensionAffectingProps.indexOf(key) !== -1;
    }
    if (needsDims) {
      this.initDimensions();
      this.setCoords();
    }
    return this;
  }

  _render(ctx) {
    // console.log('_render绘制文字', ctx, this);
    // ctx.save()
    // // italic bold 20px cursive
    // ctx.font = `${this.fontStyle} ${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`
    // this.width = ctx.measureText(this.text).width || this.MIN_TEXT_WIDTH
    // ctx.fillStyle = this.fill
    // // ctx.fillText(this.text, this.left, this.top + this.fontSize)
    // ctx.fillText(this.text, this.left, this.top)
    // // ctx.strokeText(this.text, this.left, this.top)
    // ctx.restore();
    this._setTextStyles(ctx);
    this._renderTextLinesBackground(ctx);
    this._renderTextDecoration(ctx, 'underline');
    this._renderText(ctx);
    this._renderTextDecoration(ctx, 'overline');
    this._renderTextDecoration(ctx, 'linethrough');
  }

  render(ctx) {
    if (!this.visible) {
      return;
    }
    // if (this.canvas && this.canvas.skipOffscreen && !this.group && !this.isOnScreen()) {
    //   return;
    // }
    // if (this._shouldClearDimensionCache()) {
    // this.initDimensions();
    // }
    super.render(ctx)
  }
}

TextClass.charWidthsCache = {}
TextClass.genericFonts = ['sans-serif', 'serif', 'cursive', 'fantasy', 'monospace']

module.exports = TextClass
