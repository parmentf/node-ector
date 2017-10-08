'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.ConceptNetwork = ConceptNetwork;

require('babel-polyfill');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var debug = (0, _debug2.default)('ector:concept-network'); // eslint-disable-line no-unused-vars

function ConceptNetwork() {
  var cn = {
    node: [],
    nodeIndex: {},
    link: {},
    fromIndex: [],
    toIndex: [],

    addNode: function addNode(node) {
      var _this = this;

      var inc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

      return new Promise(function (resolve, reject) {
        var label = node.label,
            _node$type = node.type,
            type = _node$type === undefined ? '' : _node$type;

        if (!_this.nodeIndex[type + label]) {
          node.occ = inc;
          node.id = _this.node.length;
          _this.nodeIndex[type + label] = node;
          _this.node.push(node);
          return resolve(node);
        } else {
          _this.getNode({ label: label, type: type }).then(function (node2) {
            node2.beg += node.beg > 0 ? 1 : 0;
            node2.mid += node.mid > 0 ? 1 : 0;
            node2.end += node.end > 0 ? 1 : 0;
            node2.occ += inc;
            return resolve(node2);
          });
        }
      });
    },
    getNode: function getNode(_ref) {
      var _this2 = this;

      var label = _ref.label,
          _ref$type = _ref.type,
          type = _ref$type === undefined ? '' : _ref$type;

      return new Promise(function (resolve, reject) {
        return resolve(_this2.nodeIndex[type + label]);
      });
    },
    getNodeById: function getNodeById(id) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        return resolve(_this3.node.find(function (node) {
          return node.id === id;
        }));
      });
    },
    addNodes: function addNodes(objects) {
      var _this4 = this;

      // See http://www.html5rocks.com/en/tutorials/es6/promises/#toc-creating-sequences
      var nodes = [];
      var promise = objects.reduce(function (sequence, object) {
        return sequence.then(function () {
          return _this4.addNode(object);
        }).then(function (node) {
          nodes.push(node);
        });
      }, Promise.resolve()).then(function () {
        return nodes;
      });
      return promise;
    },
    addLink: function addLink(fromId, toId) {
      var _this5 = this;

      var inc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

      return new Promise(function (resolve, reject) {
        if (typeof fromId !== 'number') return reject(new Error('fromId should be a number'));
        if (typeof toId !== 'number') return reject(new Error('toId should be a number'));
        if (fromId === undefined) return reject(new Error('fromId should be defined'));
        if (fromId === null) return reject(new Error('fromId should not be null'));
        if (toId === undefined) return reject(new Error('toId should be defined'));
        if (toId === null) return reject(new Error('fromId should not be null'));

        _this5.getLink(fromId, toId).then(function (link) {
          var linkId = fromId + '_' + toId;
          if (link) {
            link.coOcc += inc;
          } else {
            _this5.link[linkId] = link = {
              fromId: fromId,
              toId: toId,
              coOcc: inc
            };
          }

          if (!_this5.fromIndex[fromId]) {
            _this5.fromIndex[fromId] = new Set();
          }
          _this5.fromIndex[fromId].add(linkId);
          if (!_this5.toIndex[toId]) {
            _this5.toIndex[toId] = new Set();
          }
          _this5.toIndex[toId].add(linkId);

          return resolve(link);
        });
      });
    },
    getLink: function getLink(fromId, toId) {
      var _this6 = this;

      return new Promise(function (resolve, reject) {
        if (fromId === undefined) return reject(new Error('fromId should be defined'));
        var linkId = void 0;
        if (typeof fromId === 'string') {
          linkId = fromId;

          var _linkId$split$map = linkId.split('_').map(function (str) {
            return Number(str);
          }),
              _linkId$split$map2 = _slicedToArray(_linkId$split$map, 2),
              fId = _linkId$split$map2[0],
              tId = _linkId$split$map2[1];

          fromId = fId;
          toId = tId;
        } else {
          linkId = fromId + '_' + toId;
        }
        if (typeof fromId !== 'number') return reject(new Error('fromId should be a number'));
        if (toId === undefined) return reject(new Error('toId should be defined'));
        if (typeof toId !== 'number') return reject(new Error('toId should be a number'));
        return resolve(_this6.link[linkId]);
      });
    },
    getNodeFromLinks: function getNodeFromLinks(fromId) {
      var _this7 = this;

      return new Promise(function (resolve, reject) {
        var fromLinksSet = _this7.fromIndex[fromId];
        if (!fromLinksSet) {
          return resolve([]);
        }
        var fromLinks = Array.from(fromLinksSet.values());
        return resolve(fromLinks);
      });
    },
    getNodeToLinks: function getNodeToLinks(toId) {
      var _this8 = this;

      return new Promise(function (resolve, reject) {
        var toLinksSet = _this8.toIndex[toId];
        if (!toLinksSet) {
          return resolve([]);
        }
        var toLinks = Array.from(toLinksSet.values());
        return resolve(toLinks);
      });
    },
    removeLink: function removeLink(fromId, toId) {
      var _this9 = this;

      return new Promise(function (resolve, reject) {
        var linkId = void 0;
        if (typeof fromId === 'string') {
          linkId = fromId;

          var _linkId$split$map3 = linkId.split('_').map(function (str) {
            return Number(str);
          }),
              _linkId$split$map4 = _slicedToArray(_linkId$split$map3, 2),
              fId = _linkId$split$map4[0],
              tId = _linkId$split$map4[1];

          fromId = fId;
          toId = tId;
        } else {
          linkId = fromId + '_' + toId;
        }
        delete _this9.link[linkId];
        _this9.fromIndex[fromId] && _this9.fromIndex[fromId].delete(linkId);
        _this9.toIndex[toId] && _this9.toIndex[toId].delete(linkId);
        return resolve();
      });
    },
    decrementLink: function decrementLink(linkId, cb) {
      var _this10 = this;

      return new Promise(function (resolve, reject) {
        var link = _this10.link[linkId];
        link.coOcc -= 1;
        if (link.coOcc === 0) {
          _this10.removeLink(linkId).then(function () {
            resolve();
          }).catch(function (err) {
            return reject(err);
          });
        }
        return resolve(link);
      });
    },
    decrementNode: function decrementNode(node) {
      var _this11 = this;

      return new Promise(function (resolve, reject) {
        _this11.getNode(node).then(function (n) {
          if (!n) {
            return resolve(null);
          }
          n.occ--;
          if (n.occ === 0) {
            _this11.removeNode(node.id);
            n = null;
            return resolve(n);
          } else return resolve(n);
        });
      });
    },
    removeNode: function removeNode(id, cb) {
      var _this12 = this;

      return new Promise(function (resolve, reject) {
        var fromLinksSet = _this12.fromIndex[id];
        var fromLinks = [];
        if (fromLinksSet) {
          fromLinks = Array.from(fromLinksSet);
        }

        var toLinksSet = _this12.toIndex[id];
        var toLinks = [];
        if (toLinksSet) {
          toLinks = Array.from(toLinksSet);
        }
        var linksToRemove = [].concat(_toConsumableArray(fromLinks), _toConsumableArray(toLinks));
        linksToRemove.reduce(function (sequence, link) {
          return sequence.then(function () {
            return _this12.removeLink(link);
          });
        }, Promise.resolve()).then(function () {
          delete _this12.node[id];
          resolve();
        });
      });
    }
  };

  return cn;
}