/**
 * Created by Sugar on 2020/5/27.
 */

function camelize(string) {
  return string.replace(/-+(.)?/g, function (match, character) {
    return character ? character.toUpperCase() : '';
  });
}

function capitalize(string, firstLetterOnly) {
  return string.charAt(0).toUpperCase() +
    (firstLetterOnly ? string.slice(1) : string.slice(1).toLowerCase());
}

function escapeXml(string) {
  return string.replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function graphemeSplit(textstring) {
  var i = 0, chr, graphemes = [];
  for (i = 0, chr; i < textstring.length; i++) {
    if ((chr = getWholeChar(textstring, i)) === false) {
      continue;
    }
    graphemes.push(chr);
  }
  return graphemes;
}

function getWholeChar(str, i) {
  var code = str.charCodeAt(i);

  if (isNaN(code)) {
    return '';
  }
  if (code < 0xD800 || code > 0xDFFF) {
    return str.charAt(i);
  }

  if (0xD800 <= code && code <= 0xDBFF) {
    if (str.length <= (i + 1)) {
      throw 'High surrogate without following low surrogate';
    }
    var next = str.charCodeAt(i + 1);
    if (0xDC00 > next || next > 0xDFFF) {
      throw 'High surrogate without following low surrogate';
    }
    return str.charAt(i) + str.charAt(i + 1);
  }
  if (i === 0) {
    throw 'Low surrogate without preceding high surrogate';
  }
  var prev = str.charCodeAt(i - 1);

  if (0xD800 > prev || prev > 0xDBFF) {
    throw 'Low surrogate without preceding high surrogate';
  }
  return false;
}

module.exports = {
  camelize,
  capitalize,
  escapeXml,
  graphemeSplit
}
