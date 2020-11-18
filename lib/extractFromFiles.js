"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = extractFromFiles;

var _glob = _interopRequireDefault(require("glob"));

var _fs = _interopRequireDefault(require("fs"));

var _extractFromCode = _interopRequireDefault(require("./extractFromCode"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function extractFromFiles(filenames, options) {
  var keys = []; // filenames should be an array

  if (typeof filenames === 'string') {
    filenames = [filenames];
  }

  var toScan = [];
  filenames.forEach(function (filename) {
    toScan = toScan.concat(_glob["default"].sync(filename, {}));
  });
  toScan.forEach(function (filename) {
    var code = _fs["default"].readFileSync(filename, 'utf8');

    var extractedKeys = (0, _extractFromCode["default"])(code, _objectSpread({}, options, {
      filename: filename
    }));
    extractedKeys.forEach(function (keyObj) {
      keyObj.file = filename;
      keys.push(keyObj);
    });
  });
  return keys;
}