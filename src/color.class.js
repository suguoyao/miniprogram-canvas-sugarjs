/**
 * Created by Sugar on 2020/5/26.
 */
const {max, min} = require('./utils/index')

class ColorClass {
  constructor() {

  }

  _tryParsingColor(color) {
    let source;

    if (color in ColorClass.colorNameMap) {
      color = ColorClass.colorNameMap[color];
    }

    if (color === 'transparent') {
      source = [255, 255, 255, 0];
    }

    if (!source) {
      source = ColorClass.sourceFromHex(color);
    }
    if (!source) {
      source = ColorClass.sourceFromRgb(color);
    }
    if (!source) {
      source = ColorClass.sourceFromHsl(color);
    }
    if (!source) {
      source = [0, 0, 0, 1];
    }
    if (source) {
      this.setSource(source);
    }
  }

  _rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    let h, s, l,
      max = max([r, g, b]),
      min = min([r, g, b]);

    l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return [
      Math.round(h * 360),
      Math.round(s * 100),
      Math.round(l * 100)
    ];
  }

  getSource() {
    return this._source;
  }

  setSource(source) {
    this._source = source;
  }

  toRgb() {
    let source = this.getSource();
    return 'rgb(' + source[0] + ',' + source[1] + ',' + source[2] + ')';
  }

  toRgba() {
    let source = this.getSource();
    return 'rgba(' + source[0] + ',' + source[1] + ',' + source[2] + ',' + source[3] + ')';
  }

  toHsl() {
    let source = this.getSource(),
      hsl = this._rgbToHsl(source[0], source[1], source[2]);

    return 'hsl(' + hsl[0] + ',' + hsl[1] + '%,' + hsl[2] + '%)';
  }

  toHsla() {
    let source = this.getSource(),
      hsl = this._rgbToHsl(source[0], source[1], source[2]);

    return 'hsla(' + hsl[0] + ',' + hsl[1] + '%,' + hsl[2] + '%,' + source[3] + ')';
  }

  toHex() {
    let source = this.getSource(), r, g, b;

    r = source[0].toString(16);
    r = (r.length === 1) ? ('0' + r) : r;

    g = source[1].toString(16);
    g = (g.length === 1) ? ('0' + g) : g;

    b = source[2].toString(16);
    b = (b.length === 1) ? ('0' + b) : b;

    return r.toUpperCase() + g.toUpperCase() + b.toUpperCase();
  }

  toHexa() {
    let source = this.getSource(), a;

    a = Math.round(source[3] * 255);
    a = a.toString(16);
    a = (a.length === 1) ? ('0' + a) : a;

    return this.toHex() + a.toUpperCase();
  }

  getAlpha() {
    return this.getSource()[3];
  }

  setAlpha(alpha) {
    let source = this.getSource();
    source[3] = alpha;
    this.setSource(source);
    return this;
  }

  toGrayscale() {
    let source = this.getSource(),
      average = parseInt((source[0] * 0.3 + source[1] * 0.59 + source[2] * 0.11).toFixed(0), 10),
      currentAlpha = source[3];
    this.setSource([average, average, average, currentAlpha]);
    return this;
  }

  toBlackWhite(threshold) {
    let source = this.getSource(),
      average = (source[0] * 0.3 + source[1] * 0.59 + source[2] * 0.11).toFixed(0),
      currentAlpha = source[3];

    threshold = threshold || 127;

    average = (Number(average) < Number(threshold)) ? 0 : 255;
    this.setSource([average, average, average, currentAlpha]);
    return this;
  }

  overlayWith(otherColor) {
    if (!(otherColor instanceof Color)) {
      otherColor = new ColorClass(otherColor);
    }

    let result = [],
      alpha = this.getAlpha(),
      otherAlpha = 0.5,
      source = this.getSource(),
      otherSource = otherColorClass.getSource(), i;

    for (i = 0; i < 3; i++) {
      result.push(Math.round((source[i] * (1 - otherAlpha)) + (otherSource[i] * otherAlpha)));
    }

    result[3] = alpha;
    this.setSource(result);
    return this;
  }
}

ColorClass.reRGBa = /^rgba?\(\s*(\d{1,3}(?:\.\d+)?\%?)\s*,\s*(\d{1,3}(?:\.\d+)?\%?)\s*,\s*(\d{1,3}(?:\.\d+)?\%?)\s*(?:\s*,\s*((?:\d*\.?\d+)?)\s*)?\)$/i;

ColorClass.reHSLa = /^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3}\%)\s*,\s*(\d{1,3}\%)\s*(?:\s*,\s*(\d+(?:\.\d+)?)\s*)?\)$/i;

ColorClass.reHex = /^#?([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})$/i;

ColorClass.colorNameMap = {
  aliceblue: '#F0F8FF',
  antiquewhite: '#FAEBD7',
  aqua: '#00FFFF',
  aquamarine: '#7FFFD4',
  azure: '#F0FFFF',
  beige: '#F5F5DC',
  bisque: '#FFE4C4',
  black: '#000000',
  blanchedalmond: '#FFEBCD',
  blue: '#0000FF',
  blueviolet: '#8A2BE2',
  brown: '#A52A2A',
  burlywood: '#DEB887',
  cadetblue: '#5F9EA0',
  chartreuse: '#7FFF00',
  chocolate: '#D2691E',
  coral: '#FF7F50',
  cornflowerblue: '#6495ED',
  cornsilk: '#FFF8DC',
  crimson: '#DC143C',
  cyan: '#00FFFF',
  darkblue: '#00008B',
  darkcyan: '#008B8B',
  darkgoldenrod: '#B8860B',
  darkgray: '#A9A9A9',
  darkgrey: '#A9A9A9',
  darkgreen: '#006400',
  darkkhaki: '#BDB76B',
  darkmagenta: '#8B008B',
  darkolivegreen: '#556B2F',
  darkorange: '#FF8C00',
  darkorchid: '#9932CC',
  darkred: '#8B0000',
  darksalmon: '#E9967A',
  darkseagreen: '#8FBC8F',
  darkslateblue: '#483D8B',
  darkslategray: '#2F4F4F',
  darkslategrey: '#2F4F4F',
  darkturquoise: '#00CED1',
  darkviolet: '#9400D3',
  deeppink: '#FF1493',
  deepskyblue: '#00BFFF',
  dimgray: '#696969',
  dimgrey: '#696969',
  dodgerblue: '#1E90FF',
  firebrick: '#B22222',
  floralwhite: '#FFFAF0',
  forestgreen: '#228B22',
  fuchsia: '#FF00FF',
  gainsboro: '#DCDCDC',
  ghostwhite: '#F8F8FF',
  gold: '#FFD700',
  goldenrod: '#DAA520',
  gray: '#808080',
  grey: '#808080',
  green: '#008000',
  greenyellow: '#ADFF2F',
  honeydew: '#F0FFF0',
  hotpink: '#FF69B4',
  indianred: '#CD5C5C',
  indigo: '#4B0082',
  ivory: '#FFFFF0',
  khaki: '#F0E68C',
  lavender: '#E6E6FA',
  lavenderblush: '#FFF0F5',
  lawngreen: '#7CFC00',
  lemonchiffon: '#FFFACD',
  lightblue: '#ADD8E6',
  lightcoral: '#F08080',
  lightcyan: '#E0FFFF',
  lightgoldenrodyellow: '#FAFAD2',
  lightgray: '#D3D3D3',
  lightgrey: '#D3D3D3',
  lightgreen: '#90EE90',
  lightpink: '#FFB6C1',
  lightsalmon: '#FFA07A',
  lightseagreen: '#20B2AA',
  lightskyblue: '#87CEFA',
  lightslategray: '#778899',
  lightslategrey: '#778899',
  lightsteelblue: '#B0C4DE',
  lightyellow: '#FFFFE0',
  lime: '#00FF00',
  limegreen: '#32CD32',
  linen: '#FAF0E6',
  magenta: '#FF00FF',
  maroon: '#800000',
  mediumaquamarine: '#66CDAA',
  mediumblue: '#0000CD',
  mediumorchid: '#BA55D3',
  mediumpurple: '#9370DB',
  mediumseagreen: '#3CB371',
  mediumslateblue: '#7B68EE',
  mediumspringgreen: '#00FA9A',
  mediumturquoise: '#48D1CC',
  mediumvioletred: '#C71585',
  midnightblue: '#191970',
  mintcream: '#F5FFFA',
  mistyrose: '#FFE4E1',
  moccasin: '#FFE4B5',
  navajowhite: '#FFDEAD',
  navy: '#000080',
  oldlace: '#FDF5E6',
  olive: '#808000',
  olivedrab: '#6B8E23',
  orange: '#FFA500',
  orangered: '#FF4500',
  orchid: '#DA70D6',
  palegoldenrod: '#EEE8AA',
  palegreen: '#98FB98',
  paleturquoise: '#AFEEEE',
  palevioletred: '#DB7093',
  papayawhip: '#FFEFD5',
  peachpuff: '#FFDAB9',
  peru: '#CD853F',
  pink: '#FFC0CB',
  plum: '#DDA0DD',
  powderblue: '#B0E0E6',
  purple: '#800080',
  rebeccapurple: '#663399',
  red: '#FF0000',
  rosybrown: '#BC8F8F',
  royalblue: '#4169E1',
  saddlebrown: '#8B4513',
  salmon: '#FA8072',
  sandybrown: '#F4A460',
  seagreen: '#2E8B57',
  seashell: '#FFF5EE',
  sienna: '#A0522D',
  silver: '#C0C0C0',
  skyblue: '#87CEEB',
  slateblue: '#6A5ACD',
  slategray: '#708090',
  slategrey: '#708090',
  snow: '#FFFAFA',
  springgreen: '#00FF7F',
  steelblue: '#4682B4',
  tan: '#D2B48C',
  teal: '#008080',
  thistle: '#D8BFD8',
  tomato: '#FF6347',
  turquoise: '#40E0D0',
  violet: '#EE82EE',
  wheat: '#F5DEB3',
  white: '#FFFFFF',
  whitesmoke: '#F5F5F5',
  yellow: '#FFFF00',
  yellowgreen: '#9ACD32'
};


function hue2rgb(p, q, t) {
  if (t < 0) {
    t += 1;
  }
  if (t > 1) {
    t -= 1;
  }
  if (t < 1 / 6) {
    return p + (q - p) * 6 * t;
  }
  if (t < 1 / 2) {
    return q;
  }
  if (t < 2 / 3) {
    return p + (q - p) * (2 / 3 - t) * 6;
  }
  return p;
}

ColorClass.fromRgb = function (color) {
  return ColorClass.fromSource(ColorClass.sourceFromRgb(color));
};

ColorClass.sourceFromRgb = function (color) {
  let match = color.match(ColorClass.reRGBa);
  if (match) {
    let r = parseInt(match[1], 10) / (/%$/.test(match[1]) ? 100 : 1) * (/%$/.test(match[1]) ? 255 : 1),
      g = parseInt(match[2], 10) / (/%$/.test(match[2]) ? 100 : 1) * (/%$/.test(match[2]) ? 255 : 1),
      b = parseInt(match[3], 10) / (/%$/.test(match[3]) ? 100 : 1) * (/%$/.test(match[3]) ? 255 : 1);

    return [
      parseInt(r, 10),
      parseInt(g, 10),
      parseInt(b, 10),
      match[4] ? parseFloat(match[4]) : 1
    ];
  }
};

ColorClass.fromRgba = ColorClass.fromRgb;

ColorClass.fromHsl = function (color) {
  return ColorClass.fromSource(ColorClass.sourceFromHsl(color));
};

ColorClass.sourceFromHsl = function (color) {
  let match = color.match(ColorClass.reHSLa);
  if (!match) {
    return;
  }

  let h = (((parseFloat(match[1]) % 360) + 360) % 360) / 360,
    s = parseFloat(match[2]) / (/%$/.test(match[2]) ? 100 : 1),
    l = parseFloat(match[3]) / (/%$/.test(match[3]) ? 100 : 1),
    r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    let q = l <= 0.5 ? l * (s + 1) : l + s - l * s,
      p = l * 2 - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255),
    match[4] ? parseFloat(match[4]) : 1
  ];
};

ColorClass.fromHsla = ColorClass.fromHsl;

ColorClass.fromHex = function (color) {
  return ColorClass.fromSource(ColorClass.sourceFromHex(color));
};

ColorClass.sourceFromHex = function (color) {
  if (color.match(ColorClass.reHex)) {
    let value = color.slice(color.indexOf('#') + 1),
      isShortNotation = (value.length === 3 || value.length === 4),
      isRGBa = (value.length === 8 || value.length === 4),
      r = isShortNotation ? (value.charAt(0) + value.charAt(0)) : value.substring(0, 2),
      g = isShortNotation ? (value.charAt(1) + value.charAt(1)) : value.substring(2, 4),
      b = isShortNotation ? (value.charAt(2) + value.charAt(2)) : value.substring(4, 6),
      a = isRGBa ? (isShortNotation ? (value.charAt(3) + value.charAt(3)) : value.substring(6, 8)) : 'FF';

    return [
      parseInt(r, 16),
      parseInt(g, 16),
      parseInt(b, 16),
      parseFloat((parseInt(a, 16) / 255).toFixed(2))
    ];
  }
};

ColorClass.fromSource = function (source) {
  let oColor = new Color();
  oColorClass.setSource(source);
  return oColor;
};

module.exports = ColorClass
