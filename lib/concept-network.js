'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = ConceptNetwork;

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug2.default)('ector:concept-network'); // eslint-disable-line no-unused-vars

function ConceptNetwork() {
  var cn = {
    node: [],
    nodeIndex: {},

    addNode: function addNode(node) {
      var _node = node;
      var label = _node.label;
      var _node$type = _node.type;
      var type = _node$type === undefined ? '' : _node$type;

      if (!this.nodeIndex[type + label]) {
        node.occ = 1;
        node.id = this.node.length;
        this.nodeIndex[type + label] = node;
        this.node.push(node);
      } else {
        var node2 = this.getNode({ label: label, type: type });
        node2.beg += node.beg > 0 ? 1 : 0;
        node2.mid += node.mid > 0 ? 1 : 0;
        node2.end += node.end > 0 ? 1 : 0;
        node2.occ++;
        node = node2;
      }
      return node;
    },
    getNode: function getNode(_ref) {
      var label = _ref.label;
      var _ref$type = _ref.type;
      var type = _ref$type === undefined ? '' : _ref$type;

      return this.nodeIndex[type + label];
    },
    getNodeById: function getNodeById(id) {
      return this.node.find(function (node) {
        return node.id === id;
      });
    },
    addNodes: function addNodes(nodes) {
      var _this = this;

      return nodes.map(function (node) {
        _this.addNode(node);
        return _this.getNode(node);
      });
    },


    link: {},

    addLink: function addLink(fromId, toId) {
      (0, _assert2.default)(fromId, 'fromId should be defined');
      (0, _assert2.default)(toId, 'toId should be defined');
      (0, _assert2.default)(typeof fromId === 'undefined' ? 'undefined' : _typeof(fromId), 'number');
      (0, _assert2.default)(typeof toId === 'undefined' ? 'undefined' : _typeof(toId), 'number');
      var link = this.getLink(fromId, toId);
      if (link) {
        link.coOcc++;
      } else {
        this.link[fromId + '_' + toId] = {
          fromId: fromId,
          toId: toId,
          coOcc: 1
        };
      }
    },
    getLink: function getLink(fromId, toId) {
      (0, _assert2.default)(fromId, 'fromId should be defined');
      (0, _assert2.default)(toId, 'toId should be defined');
      (0, _assert2.default)(typeof fromId === 'undefined' ? 'undefined' : _typeof(fromId), 'number');
      (0, _assert2.default)(typeof toId === 'undefined' ? 'undefined' : _typeof(toId), 'number');
      return this.link[fromId + '_' + toId];
    }
  };

  return cn;
}