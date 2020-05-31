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

    this._reNewline = /\r?\n/
    this._reSpaceAndTab = /[ \t\r]/
    this._reSpacesAndTabs = /[ \t\r]/g

    this.__charBounds = []
    this.MIN_TEXT_WIDTH = 2

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
    // this.width = this.calcTextWidth() || this.MIN_TEXT_WIDTH;
    // if (this.textAlign.indexOf('justify') !== -1) {
    //   this.enlargeSpaces();
    // }
    // this.height = this.calcTextHeight();
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
    let _measuringContext = this.canvas && this.canvas.contextCache
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

  /**
   * calculate and return the text Width measuring each line.
   * @private
   * @param {CanvasRenderingContext2D} ctx Context to render on
   * @return {Number} Maximum width of fabric.Text object
   */
  calcTextWidth() {
    let maxWidth = this.getLineWidth(0);

    for (let i = 1, len = this._textLines.length; i < len; i++) {
      let currentLineWidth = this.getLineWidth(i);
      if (currentLineWidth > maxWidth) {
        maxWidth = currentLineWidth;
      }
    }
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
    if (width === undefined || previousWidth === undefined || coupleWidth === undefined) {
      let ctx = this.getMeasuringContext();
      // send a TRUE to specify measuring font size CACHE_FONT_SIZE
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
      // we can measure the kerning couple and subtract the width of the previous character
      coupleWidth = ctx.measureText(couple).width;
      fontCache[couple] = coupleWidth;
      kernedWidth = coupleWidth - previousWidth;
    }
    return {width: width * fontMultiplier, kernedWidth: kernedWidth * fontMultiplier};
  }

  _getFontDeclaration(styleObject, forMeasuring) {
    let style = styleObject || this, family = this.fontFamily,
      fontIsGeneric = TextClass.genericFonts.indexOf(family.toLowerCase()) > -1;
    let fontFamily = family === undefined ||
    family.indexOf('\'') > -1 || family.indexOf(',') > -1 ||
    family.indexOf('"') > -1 || fontIsGeneric
      ? style.fontFamily : '"' + style.fontFamily + '"';
    return [
      style.fontStyle,
      style.fontWeight,
      forMeasuring ? this.CACHE_FONT_SIZE + 'px' : style.fontSize + 'px',
      fontFamily
    ].join(' ');
  }

  _getWidthOfCharSpacing() {
    if (this.charSpacing !== 0) {
      return this.fontSize * this.charSpacing / 1000;
    }
    return 0;
  }

  _setTextStyles(ctx, charStyle, forMeasuring) {
    ctx.textBaseline = 'alphabetic';
    ctx.font = this._getFontDeclaration(charStyle, forMeasuring);
  }

  set(key, value) {
    super.set(key, value)
    // let needsDims = false;
    // if (typeof key === 'object') {
    //   for (let _key in key) {
    //     needsDims = needsDims || this._dimensionAffectingProps.indexOf(_key) !== -1;
    //   }
    // } else {
    //   needsDims = this._dimensionAffectingProps.indexOf(key) !== -1;
    // }
    // if (needsDims) {
    //   this.initDimensions();
    //   this.setCoords();
    // }
    return this;
  }

  _render(ctx) {
    console.log('text _render')
    // this._setTextStyles(ctx);
    // this._renderTextLinesBackground(ctx);
    // this._renderTextDecoration(ctx, 'underline');
    // this._renderText(ctx);
    // this._renderTextDecoration(ctx, 'overline');
    // this._renderTextDecoration(ctx, 'linethrough');
  }

  render(ctx) {
    if (!this.visible) {
      return;
    }
    console.log('绘制文字', this);
    ctx.save()
    // italic bold 20px cursive
    ctx.font = `${this.fontStyle} ${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`
    this.width = ctx.measureText(this.text).width
    this.height = this.calcTextHeight()
    ctx.fillStyle = this.fill
    ctx.fillText(this.text, this.left, this.top)
    // ctx.strokeText(this.text, this.left, this.top)
    ctx.restore();

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
