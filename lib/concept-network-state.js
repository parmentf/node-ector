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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var debug = (0, _debug2.default)('ector:concept-network-state'); // eslint-disable-line no-unused-vars

function ConceptNetworkState(conceptNetwork) {
  (0, _assert2.default)(conceptNetwork);
  var cns = {
    state: [], // nodeId -> state

    cn: conceptNetwork,

    getNodeId: function getNodeId(node) {
      var id = -1;
      if (typeof node === 'number') {
        id = node;
      } else if ((typeof node === 'undefined' ? 'undefined' : _typeof(node)) !== 'object') {
        return new Error('node parameter should be an object or a number');
      } else if (node.id === undefined) {
        return new Error('node parameter should contain an id');
      } else if (typeof node.id !== 'number') {
        return new Error('node id should be a number');
      } else {
        id = node.id;
      }
      return id;
    },
    activate: function activate(node, cb) {
      var id = this.getNodeId(node);
      _assert2.default.ifError(id instanceof Error);
      if (this.state[id] === undefined) {
        this.state[id] = {
          activationValue: 100,
          age: 0,
          oldActivationValue: 0
        };
      } else {
        this.state[id] = { activationValue: 100 };
      }
      if (cb) return cb(null, this.state[id]);
      return this.state[id];
    },
    getActivationValue: function getActivationValue(node, cb) {
      var id = this.getNodeId(node);
      _assert2.default.ifError(id instanceof Error);
      var activationValue = 0;
      if (!this.state[id]) {
        activationValue = 0;
      } else {
        activationValue = this.state[id].activationValue;
      }
      if (cb) return cb(null, activationValue);
      return activationValue;
    },
    getOldActivationValue: function getOldActivationValue(node, cb) {
      var id = this.getNodeId(node);
      _assert2.default.ifError(id instanceof Error);
      var oldActivationValue = 0;
      if (!this.state[id]) {
        oldActivationValue = 0;
      } else {
        oldActivationValue = this.state[id].oldActivationValue;
      }
      if (cb) return cb(null, oldActivationValue);
      return oldActivationValue;
    },
    getMaximumActivationValue: function getMaximumActivationValue(filter, cb) {
      var _this = this;

      if (!cb) {
        cb = filter;
        filter = undefined;
      }
      var avArray = this.state.filter(function (state, id) {
        if (filter) return _this.cn.node[id].type === filter;else return true;
      }).map(function (state) {
        return state.activationValue;
      });
      var max = Math.max.apply(Math, _toConsumableArray(avArray).concat([0]));
      return cb(null, max);
    },
    getActivatedTypedNodes: function getActivatedTypedNodes(filter, threshold, cb) {
      var _this2 = this;

      if (!cb) {
        if (typeof threshold === 'function') {
          cb = threshold;
          threshold = undefined;
        }
        if (typeof filter === 'function') {
          cb = filter;
          filter = undefined;
        }
      }
      if (threshold === undefined) threshold = 90;
      if (typeof filter !== 'string') filter = '';

      var activatedTypedNodes = this.state.map(function (state, id) {
        return {
          node: _this2.cn.node[id],
          activationValue: _this2.state[id].activationValue
        };
      }).filter(function (e) {
        if (filter) return e.node.type === filter;else return true;
      }).filter(function (e) {
        return e.activationValue >= threshold;
      });
      return cb(null, activatedTypedNodes);
    },
    setActivationValue: function setActivationValue(node, value, cb) {
      var id = this.getNodeId(node);
      _assert2.default.ifError(id instanceof Error);
      if (!this.state[id]) {
        this.state[id] = {
          activationValue: value,
          age: 0,
          oldActivationValue: 0
        };
      } else {
        this.state[id].activationValue = value;
      }
      // Reactivate non-activated nodes.
      if (!value) {
        delete this.state[id];
      }
      if (cb) return cb();
    },


    normalNumberComingLinks: 2,

    propagate: function propagate(options, cb) {
      var _this3 = this;

      // Parameters
      if (!cb && typeof options === 'function') {
        cb = options;
        options = {
          decay: 40,
          memoryPerf: 100
        };
      }
      if (options && (typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object') {
        return cb(new Error("propagate() parameter should be an object"));
      }

      // Aging
      this.state = this.state.map(function (state) {
        state.oldActivationValue = state.activationValue;
        state.age++;
        return state;
      });

      // Compute influences
      var influenceNb = []; // nodeId -> number of influences
      var influenceValue = []; // nodeId -> total of influences
      this.cn.node.forEach(function (node, nodeId, nodes) {
        var ov = _this3.getOldActivationValue(node);
        var outgoingLinks = _this3.cn.getNodeFromLinks(nodeId);
        outgoingLinks.forEach(function (linkId) {
          var link = _this3.cn.getLink(linkId);
          var nodeToId = link.toId;
          var infl = influenceValue[nodeToId] || 0;
          infl += 0.5 + ov * link.coOcc;
          influenceValue[nodeToId] = infl;
          influenceNb[nodeToId] = influenceNb[nodeToId] || 0;
          influenceNb[nodeToId] += 1;
        });
      });

      this.cn.node.forEach(function (node, id) {
        var state = _this3.state[id];
        if (state === undefined) {
          state = { activationValue: 0, oldActivationValue: 0, age: 0 };
        }
        var decay = options.decay || 40;
        var memoryPerf = options.memoryPerf || 100;
        var minusAge = 200 / (1 + Math.exp(-state.age / memoryPerf)) - 100;
        var newActivationValue = void 0;

        // If this node is not influenced at all
        if (!influenceValue[id]) {
          newActivationValue = state.oldActivationValue - decay * state.oldActivationValue / 100 - minusAge;
        }
        // If this node receives influence
        else {
            var influence = influenceValue[id];
            var nbIncomings = influenceNb[id];
            influence /= Math.log(_this3.normalNumberComingLinks + nbIncomings) / Math.log(_this3.normalNumberComingLinks);
            newActivationValue = state.oldActivationValue - decay * state.oldActivationValue / 100 + influence - minusAge;
          }
        newActivationValue = Math.max(newActivationValue, 0);
        newActivationValue = Math.min(newActivationValue, 100);
        _this3.setActivationValue(id, newActivationValue);
      });
      return cb();
    }
  };

  return cns;
}