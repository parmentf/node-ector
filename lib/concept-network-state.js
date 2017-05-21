'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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
    activate: function activate(node) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var id = _this.getNodeId(node);
        if (id instanceof Error) return reject(id);
        if (_this.state[id] === undefined) {
          _this.state[id] = {
            activationValue: 100,
            age: 0,
            oldActivationValue: 0
          };
        } else {
          _this.state[id] = { activationValue: 100 };
        }
        resolve(_this.state[id]);
      });
    },
    getActivationValue: function getActivationValue(node) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var id = _this2.getNodeId(node);
        if (id instanceof Error) return reject(id);
        var activationValue = 0;
        if (!_this2.state[id]) {
          activationValue = 0;
        } else {
          activationValue = _this2.state[id].activationValue;
        }
        resolve(activationValue);
      });
    },
    getOldActivationValue: function getOldActivationValue(node) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        var id = _this3.getNodeId(node);
        if (id instanceof Error) return reject(id);
        var oldActivationValue = 0;
        if (!_this3.state[id]) {
          oldActivationValue = 0;
        } else {
          oldActivationValue = _this3.state[id].oldActivationValue;
        }
        resolve(oldActivationValue);
      });
    },
    getMaximumActivationValue: function getMaximumActivationValue(filter) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        var avArray = _this4.state.filter(function (state, id) {
          if (filter) return _this4.cn.node[id].type === filter;else return true;
        }).map(function (state) {
          return state.activationValue;
        });
        var max = Math.max.apply(Math, _toConsumableArray(avArray).concat([0]));
        resolve(max);
      });
    },
    getActivatedTypedNodes: function getActivatedTypedNodes() {
      var _this5 = this;

      var filter = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
      var threshold = arguments.length <= 1 || arguments[1] === undefined ? 90 : arguments[1];

      return new Promise(function (resolve, reject) {
        var activatedTypedNodes = _this5.state.map(function (state, id) {
          return {
            node: _this5.cn.node[id],
            activationValue: _this5.state[id].activationValue
          };
        }).filter(function (e) {
          if (filter) return e.node.type === filter;else return true;
        }).filter(function (e) {
          return e.activationValue >= threshold;
        });
        resolve(activatedTypedNodes);
      });
    },
    setActivationValue: function setActivationValue(node, value) {
      var _this6 = this;

      return new Promise(function (resolve, reject) {
        var id = _this6.getNodeId(node);
        if (id instanceof Error) return reject(id);
        if (!_this6.state[id]) {
          _this6.state[id] = {
            activationValue: value,
            age: 0,
            oldActivationValue: 0
          };
        } else {
          _this6.state[id].activationValue = value;
        }
        // Reactivate non-activated nodes.
        if (!value) {
          delete _this6.state[id];
        }
        resolve(_this6.state[id]);
      });
    },


    normalNumberComingLinks: 2,

    computeInfluence: function computeInfluence() {
      var _this7 = this;

      // What a mess!! Maybe read http://exploringjs.com/es6/ch_promises.html
      // See also https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html
      debug('computeInfluence');
      return new Promise(function (resolve, reject) {
        var influenceNb = []; // nodeId -> number of influences
        var influenceValue = []; // nodeId -> total of influences
        /*        const promise = this.cn.node.reduce((sequence, node, nodeId) => {
                  return sequence.then(() => {
                    let ov  // acrobatic
                    this.getOldActivationValue(node)
                    .then(oav => {
                      ov = oav // acrobatic
                      return this.cn.getNodeFromLinks(nodeId)
                    })
                    .then(outgoingLinks => {
                      return outgoingLinks.reduce((sequence, linkId) => {
                        return sequence.then(() => {
                          this.cn.getLink(linkId)
                          .then(link => {
                            debug('link', link)
                            debug('ov', ov)
                            const nodeToId = link.toId
                            let infl = influenceValue[nodeToId] || 0
                            infl += 0.5 + ov * link.coOcc
                            influenceValue[nodeToId] = infl
                            influenceNb[nodeToId] = influenceNb[nodeToId] || 0
                            influenceNb[nodeToId] += 1
                            debug('infl', infl)
                            debug('influenceValue 1', influenceValue)
                          })
                        })
                      }, Promise.resolve())
                    })
        
                  })
                }, Promise.resolve())
                .then(() => resolve({ influenceNb, influenceValue }))
                return promise
        */
        var promise = Promise.all(_this7.cn.node.map(function (node) {
          return _this7.getOldActivationValue(node).then(function (oldActivationValue) {
            return _this7.cn.getNodeFromLinks(node.id).then(function (outgoingLinks) {
              return Promise.all(outgoingLinks.map(function (linkId) {
                return _this7.getLink(linkId).then(function (link) {
                  debug('computeInfluence 1', link);
                  return { value: 0.5 + oldActivationValue * link.coOcc,
                    toId: link.toId
                  };
                });
              })).then(function (influencesTo) {
                Promise.all(influencesTo.map(function (influence) {
                  influenceValue[influence.toId] += influence.value;
                  influenceNb[influence.toId] += 1;
                  debug('computeInfluence', influence.toId);
                  return influence.toId;
                })).then(function () {
                  return resolve({ influenceNb: influenceNb, influenceValue: influenceValue });
                });
              });
            });
          });
        }));

        return promise;
        /*        this.cn.node.forEach((node, nodeId, nodes) => {
                  this.getOldActivationValue(node)
                  .then(ov => {
                    const outgoingLinks = this.cn.getNodeFromLinks(nodeId)
                    outgoingLinks.forEach((linkId) => {
                      const link = this.cn.getLink(linkId)
                      const nodeToId = link.toId
                      let infl = influenceValue[nodeToId] || 0
                      infl += 0.5 + ov * link.coOcc
                      influenceValue[nodeToId] = infl
                      influenceNb[nodeToId] = influenceNb[nodeToId] || 0
                      influenceNb[nodeToId] += 1
                    })
                  })
                  .catch(err => {
                    reject(err)
                  })
                })
                resolve({influenceNb, influenceValue})
        */
      });
    },
    propagate: function propagate() {
      var _this8 = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? { decay: 40, memoryPerf: 100 } : arguments[0];

      return new Promise(function (resolve, reject) {
        if (options && (typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object') {
          return reject(new Error('propagate() parameter should be an object'));
        }

        // Aging
        _this8.state = _this8.state.map(function (state) {
          state.oldActivationValue = state.activationValue;
          state.age++;
          return state;
        });

        _this8.computeInfluence().then(function (_ref) {
          var influenceNb = _ref.influenceNb;
          var influenceValue = _ref.influenceValue;

          debug('influenceNb 2', influenceNb);
          debug('influenceValue 2', influenceValue);
          _this8.cn.node.forEach(function (node, id) {
            var state = _this8.state[id];
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
              influence /= Math.log(_this8.normalNumberComingLinks + nbIncomings) / Math.log(_this8.normalNumberComingLinks);
              newActivationValue = state.oldActivationValue - decay * state.oldActivationValue / 100 + influence - minusAge;
            }
            newActivationValue = Math.max(newActivationValue, 0);
            newActivationValue = Math.min(newActivationValue, 100);
            _this8.setActivationValue(id, newActivationValue);
          });
          return resolve();
        }).catch(function (err) {
          return reject(err);
        });
      }); // Promise
    } // propagate

  };

  return cns;
}