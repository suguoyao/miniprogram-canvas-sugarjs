/**
 * Created by Sugar on 2020/5/27.
 */
const {extend} = require('../utils/object')

module.exports = {
  isEmptyStyles(lineIndex) {
    if (!this.styles) {
      return true;
    }
    if (typeof lineIndex !== 'undefined' && !this.styles[lineIndex]) {
      return true;
    }
    let obj = typeof lineIndex === 'undefined' ? this.styles : {line: this.styles[lineIndex]};
    for (let p1 in obj) {
      for (let p2 in obj[p1]) {
        for (let p3 in obj[p1][p2]) {
          return false;
        }
      }
    }
    return true;
  },

  styleHas(property, lineIndex) {
    if (!this.styles || !property || property === '') {
      return false;
    }
    if (typeof lineIndex !== 'undefined' && !this.styles[lineIndex]) {
      return false;
    }
    let obj = typeof lineIndex === 'undefined' ? this.styles : {0: this.styles[lineIndex]};
    for (let p1 in obj) {
      for (let p2 in obj[p1]) {
        if (typeof obj[p1][p2][property] !== 'undefined') {
          return true;
        }
      }
    }
    return false;
  },

  cleanStyle(property) {
    if (!this.styles || !property || property === '') {
      return false;
    }
    let obj = this.styles, stylesCount = 0, letterCount, stylePropertyValue,
      allStyleObjectPropertiesMatch = true, graphemeCount = 0, styleObject;
    // eslint-disable-next-line
    for (let p1 in obj) {
      letterCount = 0;
      // eslint-disable-next-line
      for (let p2 in obj[p1]) {
        let styleObject = obj[p1][p2],
          stylePropertyHasBeenSet = styleObject.hasOwnProperty(property);

        stylesCount++;

        if (stylePropertyHasBeenSet) {
          if (!stylePropertyValue) {
            stylePropertyValue = styleObject[property];
          } else if (styleObject[property] !== stylePropertyValue) {
            allStyleObjectPropertiesMatch = false;
          }

          if (styleObject[property] === this[property]) {
            delete styleObject[property];
          }
        } else {
          allStyleObjectPropertiesMatch = false;
        }

        if (Object.keys(styleObject).length !== 0) {
          letterCount++;
        } else {
          delete obj[p1][p2];
        }
      }

      if (letterCount === 0) {
        delete obj[p1];
      }
    }
    for (let i = 0; i < this._textLines.length; i++) {
      graphemeCount += this._textLines[i].length;
    }
    if (allStyleObjectPropertiesMatch && stylesCount === graphemeCount) {
      this[property] = stylePropertyValue;
      this.removeStyle(property);
    }
  },

  removeStyle(property) {
    if (!this.styles || !property || property === '') {
      return;
    }
    let obj = this.styles, line, lineNum, charNum;
    for (lineNum in obj) {
      line = obj[lineNum];
      for (charNum in line) {
        delete line[charNum][property];
        if (Object.keys(line[charNum]).length === 0) {
          delete line[charNum];
        }
      }
      if (Object.keys(line).length === 0) {
        delete obj[lineNum];
      }
    }
  },

  _extendStyles(index, styles) {
    let loc = this.get2DCursorLocation(index);

    if (!this._getLineStyle(loc.lineIndex)) {
      this._setLineStyle(loc.lineIndex);
    }

    if (!this._getStyleDeclaration(loc.lineIndex, loc.charIndex)) {
      this._setStyleDeclaration(loc.lineIndex, loc.charIndex, {});
    }

    extend(this._getStyleDeclaration(loc.lineIndex, loc.charIndex), styles);
  },

  get2DCursorLocation(selectionStart, skipWrapping) {
    if (typeof selectionStart === 'undefined') {
      selectionStart = this.selectionStart;
    }
    let lines = skipWrapping ? this._unwrappedTextLines : this._textLines,
      len = lines.length;
    for (let i = 0; i < len; i++) {
      if (selectionStart <= lines[i].length) {
        return {
          lineIndex: i,
          charIndex: selectionStart
        };
      }
      selectionStart -= lines[i].length + this.missingNewlineOffset(i);
    }
    return {
      lineIndex: i - 1,
      charIndex: lines[i - 1].length < selectionStart ? lines[i - 1].length : selectionStart
    };
  },

  getSelectionStyles(startIndex, endIndex, complete) {
    if (typeof startIndex === 'undefined') {
      startIndex = this.selectionStart || 0;
    }
    if (typeof endIndex === 'undefined') {
      endIndex = this.selectionEnd || startIndex;
    }
    let styles = [];
    for (let i = startIndex; i < endIndex; i++) {
      styles.push(this.getStyleAtPosition(i, complete));
    }
    return styles;
  },

  getStyleAtPosition(position, complete) {
    let loc = this.get2DCursorLocation(position),
      style = complete ? this.getCompleteStyleDeclaration(loc.lineIndex, loc.charIndex) :
        this._getStyleDeclaration(loc.lineIndex, loc.charIndex);
    return style || {};
  },

  setSelectionStyles(styles, startIndex, endIndex) {
    if (typeof startIndex === 'undefined') {
      startIndex = this.selectionStart || 0;
    }
    if (typeof endIndex === 'undefined') {
      endIndex = this.selectionEnd || startIndex;
    }
    for (let i = startIndex; i < endIndex; i++) {
      this._extendStyles(i, styles);
    }
    this._forceClearCache = true;
    return this;
  },

  _getStyleDeclaration(lineIndex, charIndex) {
    let lineStyle = this.styles && this.styles[lineIndex];
    if (!lineStyle) {
      return null;
    }
    return lineStyle[charIndex];
  },

  getCompleteStyleDeclaration(lineIndex, charIndex) {
    let style = this._getStyleDeclaration(lineIndex, charIndex) || {},
      styleObject = {}, prop;
    for (let i = 0; i < this._styleProperties.length; i++) {
      prop = this._styleProperties[i];
      styleObject[prop] = typeof style[prop] === 'undefined' ? this[prop] : style[prop];
    }
    return styleObject;
  },

  _setStyleDeclaration(lineIndex, charIndex, style) {
    this.styles[lineIndex][charIndex] = style;
  },

  _deleteStyleDeclaration(lineIndex, charIndex) {
    delete this.styles[lineIndex][charIndex];
  },

  _getLineStyle(lineIndex) {
    return !!this.styles[lineIndex];
  },

  _setLineStyle(lineIndex) {
    this.styles[lineIndex] = {};
  },

  _deleteLineStyle(lineIndex) {
    delete this.styles[lineIndex];
  }
}
