'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.ConceptNetworkState = ConceptNetworkState;

require('babel-polyfill');

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
    activate: async function activate(node) {
      var id = this.getNodeId(node);
      if (id instanceof Error) return id;
      if (this.state[id] === undefined) {
        this.state[id] = {
          activationValue: 100,
          age: 0,
          oldActivationValue: 0
        };
      } else {
        this.state[id] = { activationValue: 100 };
      }
      return this.state[id];
    },
    getActivationValue: async function getActivationValue(node) {
      var id = this.getNodeId(node);
      if (id instanceof Error) return id;
      var activationValue = 0;
      if (!this.state[id]) {
        activationValue = 0;
      } else {
        activationValue = this.state[id].activationValue;
      }
      return activationValue;
    },
    getOldActivationValue: async function getOldActivationValue(node) {
      var id = this.getNodeId(node);
      if (id instanceof Error) return id;
      var oldActivationValue = 0;
      if (!this.state[id]) {
        oldActivationValue = 0;
      } else {
        oldActivationValue = this.state[id].oldActivationValue;
      }
      return oldActivationValue;
    },
    getMaximumActivationValue: async function getMaximumActivationValue(filter) {
      var _this = this;

      var avArray = this.state.filter(function (state, id) {
        if (filter) return _this.cn.node[id].type === filter;else return true;
      }).map(function (state) {
        return state.activationValue;
      });
      var max = Math.max.apply(Math, _toConsumableArray(avArray).concat([0]));
      return max;
    },
    getActivatedTypedNodes: async function getActivatedTypedNodes() {
      var _this2 = this;

      var filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var threshold = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 90;

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
      return activatedTypedNodes;
    },
    setActivationValue: async function setActivationValue(node, value) {
      var id = this.getNodeId(node);
      if (id instanceof Error) return id;
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
      return this.state[id];
    },


    normalNumberComingLinks: 2,

    computeInfluence: async function computeInfluence() {
      var _this3 = this;

      var influenceNb = []; // nodeId -> number of influences
      var influenceValue = []; // nodeId -> total of influences
      await Promise.all(this.cn.node.map(async function (node) {
        var oldActivationValue = await _this3.getOldActivationValue(node);
        var outgoingLinks = await _this3.cn.getNodeFromLinks(node.id);
        var influencesTo = await Promise.all(outgoingLinks.map(async function (linkId) {
          var link = await _this3.cn.getLink(linkId);
          return {
            value: 0.5 + oldActivationValue * link.coOcc,
            toId: link.toId
          };
        }));
        influencesTo.map(function (influence) {
          influenceValue[influence.toId] = (influenceValue[influence.toId] || 0) + influence.value;
          influenceNb[influence.toId] = (influenceNb[influence.toId] || 0) + 1;
          return influence.toId;
        });
      }));
      return { influenceNb: influenceNb, influenceValue: influenceValue };
    },
    propagate: async function propagate() {
      var _this4 = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { decay: 40, memoryPerf: 100 };

      if (options && (typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object') {
        return new Error('propagate() parameter should be an object');
      }

      // Aging
      this.state = this.state.map(function (state) {
        state.oldActivationValue = state.activationValue;
        state.age++;
        return state;
      });

      var _ref = await this.computeInfluence(),
          influenceNb = _ref.influenceNb,
          influenceValue = _ref.influenceValue;

      this.cn.node.forEach(function (node, id) {
        var state = _this4.state[id];
        if (state === undefined) {
          state = { activationValue: 0, oldActivationValue: 0, age: 0 };
        }
        var decay = options.decay || 40;
        var memoryPerf = options.memoryPerf || 100;
        var minusAge = 200 / (1 + Math.exp(-state.age / memoryPerf)) - 100;
        var newActivationValue = void 0;

        if (!influenceValue[id]) {
          // If this node is not influenced at all
          newActivationValue = state.oldActivationValue - decay * state.oldActivationValue / 100 - minusAge;
        } else {
          // If this node receives influence
          var influence = influenceValue[id];
          var nbIncomings = influenceNb[id];
          influence /= Math.log(_this4.normalNumberComingLinks + nbIncomings) / Math.log(_this4.normalNumberComingLinks);
          newActivationValue = state.oldActivationValue - decay * state.oldActivationValue / 100 + influence - minusAge;
        }
        newActivationValue = Math.max(newActivationValue, 0);
        newActivationValue = Math.min(newActivationValue, 100);
        _this4.setActivationValue(id, newActivationValue);
      });
    } // propagate

  };

  return cns;
}