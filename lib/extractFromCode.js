"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = extractFromCode;
exports.TYPESCRIPT_PARSER_OPTIONS = exports.FLOW_PARSER_OPTIONS = exports.BASE_PARSER_OPTIONS = void 0;

var _core = require("@babel/core");

var _traverse = _interopRequireDefault(require("@babel/traverse"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var noInformationTypes = ['CallExpression', 'Identifier', 'MemberExpression'];

function getKeys(node) {
  if (node.type === 'StringLiteral') {
    return [node.value];
  }

  if (node.type === 'BinaryExpression' && node.operator === '+') {
    var left = getKeys(node.left);
    var right = getKeys(node.right);

    if (left.length > 1 || right.length > 1) {
      console.warn('Unsupported multiple keys for binary expression, keys skipped.'); // TODO
    }

    return [left[0] + right[0]];
  }

  if (node.type === 'TemplateLiteral') {
    return [node.quasis.map(function (quasi) {
      return quasi.value.cooked;
    }).join('*')];
  }

  if (node.type === 'ConditionalExpression') {
    return [].concat(_toConsumableArray(getKeys(node.consequent)), _toConsumableArray(getKeys(node.alternate)));
  }

  if (node.type === 'LogicalExpression') {
    switch (node.operator) {
      case '&&':
        return _toConsumableArray(getKeys(node.right));

      case '||':
        return [].concat(_toConsumableArray(getKeys(node.left)), _toConsumableArray(getKeys(node.right)));

      default:
        console.warn("unsupported logicalExpression's operator: ".concat(node.operator));
        return [null];
    }
  }

  if (noInformationTypes.includes(node.type)) {
    return ['*']; // We can't extract anything.
  }

  console.warn("Unsupported node: ".concat(node.type));
  return [null];
}

var commentRegExp = /i18n-extract (.+)/;
var commentIgnoreRegExp = /i18n-extract-disable-line/;
var BASE_PARSER_OPTIONS = {
  sourceType: 'module',
  // Enable all the plugins
  plugins: ['jsx', 'asyncFunctions', 'classConstructorCall', 'doExpressions', 'trailingFunctionCommas', 'objectRestSpread', 'decoratorsLegacy', 'classProperties', 'exportExtensions', 'exponentiationOperator', 'asyncGenerators', 'functionBind', 'functionSent', 'dynamicImport', 'optionalChaining']
};
exports.BASE_PARSER_OPTIONS = BASE_PARSER_OPTIONS;

var FLOW_PARSER_OPTIONS = _objectSpread({}, BASE_PARSER_OPTIONS, {
  plugins: BASE_PARSER_OPTIONS.plugins.concat(['flow'])
});

exports.FLOW_PARSER_OPTIONS = FLOW_PARSER_OPTIONS;

var TYPESCRIPT_PARSER_OPTIONS = _objectSpread({}, BASE_PARSER_OPTIONS, {
  plugins: BASE_PARSER_OPTIONS.plugins.concat(['typescript'])
});

exports.TYPESCRIPT_PARSER_OPTIONS = TYPESCRIPT_PARSER_OPTIONS;

function getBabelOptions(parser, babelOptions) {
  if (babelOptions && parser) {
    throw new Error("Can't specify both parser and Babel options!");
  }

  if (babelOptions) {
    return babelOptions;
  }

  var parserOpts = FLOW_PARSER_OPTIONS;

  if (parser) {
    var availableParsers = ['flow', 'typescript'];

    if (!availableParsers.includes(parser)) {
      throw new Error('Parser must be either flow or typescript');
    } else if (parser === 'flow') {
      parserOpts = FLOW_PARSER_OPTIONS;
    } else {
      parserOpts = TYPESCRIPT_PARSER_OPTIONS;
    }
  }

  return {
    ast: true,
    parserOpts: parserOpts
  };
}

function extractFromCode(code) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$marker = options.marker,
      marker = _options$marker === void 0 ? 'i18n' : _options$marker,
      _options$keyLoc = options.keyLoc,
      keyLoc = _options$keyLoc === void 0 ? 0 : _options$keyLoc,
      _options$parser = options.parser,
      parser = _options$parser === void 0 ? null : _options$parser,
      _options$babelOptions = options.babelOptions,
      babelOptions = _options$babelOptions === void 0 ? null : _options$babelOptions,
      _options$filename = options.filename,
      filename = _options$filename === void 0 ? null : _options$filename;

  var _transformSync = (0, _core.transformSync)(code, _objectSpread({}, getBabelOptions(parser, babelOptions), {}, filename && {
    filename: filename
  })),
      ast = _transformSync.ast;

  var keys = [];
  var ignoredLines = []; // Look for keys in the comments.

  ast.comments.forEach(function (comment) {
    var match = commentRegExp.exec(comment.value);

    if (match) {
      keys.push({
        key: match[1].trim(),
        loc: comment.loc
      });
    } // Check for ignored lines


    match = commentIgnoreRegExp.exec(comment.value);

    if (match) {
      ignoredLines.push(comment.loc.start.line);
    }
  }); // Look for keys in the source code.

  (0, _traverse["default"])(ast, {
    CallExpression: function CallExpression(path) {
      var node = path.node;

      if (node.loc) {
        if (ignoredLines.includes(node.loc.end.line)) {
          // Skip ignored lines
          return;
        }
      }

      var _node$callee = node.callee,
          name = _node$callee.name,
          type = _node$callee.type;

      if (type === 'Identifier' && name === marker || path.get('callee').matchesPattern(marker)) {
        var foundKeys = getKeys(keyLoc < 0 ? node.arguments[node.arguments.length + keyLoc] : node.arguments[keyLoc]);
        foundKeys.forEach(function (key) {
          if (key) {
            keys.push({
              key: key,
              loc: node.loc
            });
          }
        });
      }
    }
  });
  return keys;
}