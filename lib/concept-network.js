'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.ConceptNetwork = ConceptNetwork;

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
    link: {},
    fromIndex: [],
    toIndex: [],

    addNode: function addNode(node, inc, cb) {
      if (!cb) {
        cb = inc;
        inc = 1;
      } else {
        inc = inc || 1;
      }
      var _node = node;
      var label = _node.label;
      var _node$type = _node.type;
      var type = _node$type === undefined ? '' : _node$type;

      if (!this.nodeIndex[type + label]) {
        node.occ = inc;
        node.id = this.node.length;
        this.nodeIndex[type + label] = node;
        this.node.push(node);
      } else {
        var node2 = this.getNode({ label: label, type: type });
        node2.beg += node.beg > 0 ? 1 : 0;
        node2.mid += node.mid > 0 ? 1 : 0;
        node2.end += node.end > 0 ? 1 : 0;
        node2.occ += inc;
        node = node2;
      }
      if (cb) {
        return cb(null, node);
      }
      return node;
    },
    getNode: function getNode(_ref, cb) {
      var label = _ref.label;
      var _ref$type = _ref.type;
      var type = _ref$type === undefined ? '' : _ref$type;

      if (cb) {
        return cb(null, this.nodeIndex[type + label]);
      }
      return this.nodeIndex[type + label];
    },
    getNodeById: function getNodeById(id, cb) {
      if (cb) {
        return this.node.find(function (node) {
          return node.id === id;
        });
      }
      return this.node.find(function (node) {
        return node.id === id;
      });
    },
    addNodes: function addNodes(nodes, cb) {
      var _this = this;

      var res = nodes.map(function (node) {
        _this.addNode(node);
        return _this.getNode(node);
      });
      if (cb) {
        return cb(null, res);
      }
      return res;
    },
    addLink: function addLink(fromId, toId, inc, cb) {
      if (!cb) {
        cb = inc;
        inc = 1;
      } else {
        inc = inc || 1;
      }
      if (cb) {
        if (typeof fromId !== 'number') {
          return cb(new Error('fromId should be a number'), null);
        }
        if (typeof toId !== 'number') {
          return cb(new Error('toId should be a number'), null);
        }
      }
      (0, _assert2.default)(typeof fromId === 'undefined' ? 'undefined' : _typeof(fromId), 'number');
      (0, _assert2.default)(typeof toId === 'undefined' ? 'undefined' : _typeof(toId), 'number');
      (0, _assert2.default)(fromId !== undefined, 'fromId should be defined');
      (0, _assert2.default)(fromId !== null, 'fromId should not be null');
      (0, _assert2.default)(toId !== undefined, 'toId should be defined');
      (0, _assert2.default)(toId !== null, 'fromId should not be null');
      var link = this.getLink(fromId, toId);
      var linkId = fromId + '_' + toId;
      if (link) {
        link.coOcc += inc;
      } else {
        this.link[linkId] = link = {
          fromId: fromId,
          toId: toId,
          coOcc: inc
        };
      }

      if (!this.fromIndex[fromId]) {
        this.fromIndex[fromId] = new Set();
      }
      this.fromIndex[fromId].add(linkId);
      if (!this.toIndex[toId]) {
        this.toIndex[toId] = new Set();
      }
      this.toIndex[toId].add(linkId);

      if (cb) {
        return cb(null, link);
      }
      return link;
    },
    getLink: function getLink(fromId, toId, cb) {
      (0, _assert2.default)(fromId !== undefined, 'fromId should be defined');
      (0, _assert2.default)(typeof fromId === 'undefined' ? 'undefined' : _typeof(fromId), 'number');
      var linkId = void 0;
      if (typeof fromId === 'string') {
        linkId = fromId;
        cb = toId;

        var _linkId$split$map = linkId.split('_').map(function (str) {
          return Number(str);
        });

        var _linkId$split$map2 = _slicedToArray(_linkId$split$map, 2);

        var fId = _linkId$split$map2[0];
        var tId = _linkId$split$map2[1];

        fromId = fId;
        toId = tId;
      } else {
        linkId = fromId + '_' + toId;
      }
      (0, _assert2.default)(toId !== undefined, 'toId should be defined');
      (0, _assert2.default)(typeof toId === 'undefined' ? 'undefined' : _typeof(toId), 'number');
      if (cb) {
        return cb(null, this.link[linkId]);
      }
      return this.link[linkId];
    },
    getNodeFromLinks: function getNodeFromLinks(fromId, cb) {
      var fromLinksSet = this.fromIndex[fromId];
      if (!fromLinksSet) {
        if (cb) return cb(null, []);
        return [];
      }
      var fromLinks = Array.from(fromLinksSet.values());
      if (cb) {
        return cb(null, fromLinks);
      }
      return fromLinks;
    },
    getNodeToLinks: function getNodeToLinks(toId, cb) {
      var toLinksSet = this.toIndex[toId];
      if (!toLinksSet) {
        if (cb) cb(null, []);
        return [];
      }
      var toLinks = Array.from(toLinksSet.values());
      if (cb) {
        return cb(null, toLinks);
      }
      return toLinks;
    },
    removeLink: function removeLink(fromId, toId, cb) {
      var linkId = void 0;
      if (typeof fromId === 'string') {
        linkId = fromId;
        cb = toId;

        var _linkId$split$map3 = linkId.split('_').map(function (str) {
          return Number(str);
        });

        var _linkId$split$map4 = _slicedToArray(_linkId$split$map3, 2);

        var fId = _linkId$split$map4[0];
        var tId = _linkId$split$map4[1];

        fromId = fId;
        toId = tId;
      } else {
        linkId = fromId + '_' + toId;
      }
      delete this.link[linkId];
      this.fromIndex[fromId] && this.fromIndex[fromId].delete(linkId);
      this.toIndex[toId] && this.toIndex[toId].delete(linkId);
      if (cb) return cb();
    },
    decrementLink: function decrementLink(linkId, cb) {
      var link = this.link[linkId];
      link.coOcc -= 1;
      if (link.coOcc === 0) {
        if (cb) return this.removeLink(linkId, cb);
        return this.removeLink(linkId);
      }
      if (cb) return cb(null, link);
      return link;
    },
    decrementNode: function decrementNode(node, cb) {
      var n = this.getNode(node);
      if (!n) {
        if (cb) {
          return cb(null, null);
        }
        return null;
      }
      n.occ--;
      if (n.occ === 0) {
        this.removeNode(node.id);
        n = null;
      }
      if (cb) {
        return cb(null, n);
      }
      return n;
    },
    removeNode: function removeNode(id, cb) {
      var fromLinksSet = this.fromIndex[id];
      if (fromLinksSet) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = fromLinksSet[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var linkId = _step.value;

            this.removeLink(linkId);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
      var toLinksSet = this.toIndex[id];
      if (toLinksSet) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = toLinksSet[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _linkId = _step2.value;

            this.removeLink(_linkId);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }
      delete this.node[id];
      if (cb) return cb();
    }
  };

  return cn;
}