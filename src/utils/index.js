/**
 * Created by Sugar on 2020/5/25.
 */

/**
 * 小程序版本库版本号比较
 * @param v1
 * @param v2
 * @returns {number}
 */
const compareVersion = (v1, v2) => {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)
  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }
  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i], 10)
    const num2 = parseInt(v2[i], 10)

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}


let slice = Array.prototype.slice;

function invoke(array, method) {
  let args = slice.call(arguments, 2), result = [];
  for (let i = 0, len = array.length; i < len; i++) {
    result[i] = args.length ? array[i][method].apply(array[i], args) : array[i][method].call(array[i]);
  }
  return result;
}

function max(array, byProperty) {
  return find(array, byProperty, function (value1, value2) {
    return value1 >= value2;
  });
}

function min(array, byProperty) {
  return find(array, byProperty, function (value1, value2) {
    return value1 < value2;
  });
}

function fill(array, value) {
  let k = array.length;
  while (k--) {
    array[k] = value;
  }
  return array;
}

function find(array, byProperty, condition) {
  if (!array || array.length === 0) {
    return;
  }

  let i = array.length - 1,
    result = byProperty ? array[i][byProperty] : array[i];
  if (byProperty) {
    while (i--) {
      if (condition(array[i][byProperty], result)) {
        result = array[i][byProperty];
      }
    }
  } else {
    while (i--) {
      if (condition(array[i], result)) {
        result = array[i];
      }
    }
  }
  return result;
}

function toFixed(number, fractionDigits) {
  return parseFloat(Number(number).toFixed(fractionDigits));
}

function mergeMethods(a, b) {
  for (const prop in b) {
    if (b.hasOwnProperty(prop)) {
      a.prototype[prop] = b[prop]
    }
  }
  return a
}

module.exports = {
  compareVersion,
  fill,
  invoke,
  min,
  max,
  toFixed,
  mergeMethods
}
