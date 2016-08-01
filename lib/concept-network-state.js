'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.ConceptNetworkState = ConceptNetworkState;

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug2.default)('ector:concept-network-state'); // eslint-disable-line no-unused-vars

function ConceptNetworkState(conceptNetwork) {
  var cns = {
    state: [],

    cn: conceptNetwork,

    activate: function activate(node) {
      _assert2.default.equal(typeof node === 'undefined' ? 'undefined' : _typeof(node), 'object');
      (0, _assert2.default)(node.id);
      _assert2.default.equal(_typeof(node.id), 'number');
      this.state[node.id] = 100;
    },
    getActivationValue: function getActivationValue(node) {
      var id = -1;
      if (typeof node === 'number') {
        id = node;
      } else if ((typeof node === 'undefined' ? 'undefined' : _typeof(node)) !== 'object') {
        return new Error('node parameter should be an object or a number');
      } else if (!node.id) {
        return new Error('node parameter should contain an id');
      } else if (typeof node.id !== 'number') {
        return new Error('node id should be a number');
      } else {
        id = node.id;
      }
      return this.state[id];
    }
  };

  return cns;
}