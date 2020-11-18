"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = findMissing;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var MISSING = 'MISSING';

function isMissing(locale, keyUsed) {
  // Dynamic key
  if (keyUsed.includes('*')) {
    var regExp = new RegExp("^".concat(keyUsed.replace('*', '(.+)'), "$"));
    return Object.keys(locale).every(function (localeKey) {
      return regExp.exec(localeKey) === null;
    });
  }

  return !locale[keyUsed];
}

function findMissing(locale, keysUsed) {
  var reports = [];
  keysUsed.forEach(function (keyUsed) {
    if (isMissing(locale, keyUsed.key)) {
      reports.push(_objectSpread({
        type: MISSING
      }, keyUsed));
    }
  });
  return reports;
}