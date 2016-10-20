'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.Ector = Ector;

require('babel-polyfill');

var _sentenceTokenizer = require('sentence-tokenizer');

var _sentenceTokenizer2 = _interopRequireDefault(_sentenceTokenizer);

var _conceptNetwork = require('./concept-network');

var _conceptNetworkState = require('./concept-network-state');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var debug = (0, _debug2.default)('ector:ector'); // eslint-disable-line no-unused-vars

function Ector() {
  var name = arguments.length <= 0 || arguments[0] === undefined ? 'ECTOR' : arguments[0];
  var username = arguments.length <= 1 || arguments[1] === undefined ? 'Guy' : arguments[1];

  var ector = {
    set name(name) {
      if (typeof name !== 'string') {
        name = 'ECTOR';
      }
      if (name.length < 3) {
        name = 'ECTOR';
      }
      this._name = name;
    },

    get name() {
      return this._name;
    },

    set user(name) {
      if (typeof name !== 'string') {
        name = 'Guy';
      }
      if (name.length < 3) {
        name = 'Guy';
      }
      if (!this.cns[name]) {
        this.cns[name] = (0, _conceptNetworkState.ConceptNetworkState)(this.cn);
      }
      this._username = name;
      this.lastSentenceNodeId = null;
    },

    get user() {
      return this._username;
    },

    cns: {},

    cn: (0, _conceptNetwork.ConceptNetwork)(),

    lastSentenceNodeId: null,

    createTokens: function createTokens(sentence, index, tokenizer) {
      var _this = this;

      var tokens = tokenizer.getTokens(index);
      return tokens.reduce(function (sequence, token, index) {
        return _this.cn.getNode({ label: token, type: 'w' }).then(function () {
          var oldToken = arguments.length <= 0 || arguments[0] === undefined ? { beg: 0, mid: 0, end: 0 } : arguments[0];

          var tokenObject = {
            label: token,
            type: 'w',
            beg: oldToken.beg + (index === 0 ? 1 : 0),
            mid: oldToken.mid + (index !== 0 && index < tokens.length - 1 ? 1 : 0),
            end: oldToken.end + (index === tokens.length - 1 ? 1 : 0)
          };
          return new Promise(function (resolve, reject) {
            return resolve(tokenObject);
          });
        });
      }, Promise.resolve());
      // returns a Promise(tokensObjects)
    },
    addEntry: function addEntry(entry) {
      var _this2 = this;

      var cns = arguments.length <= 1 || arguments[1] === undefined ? this.cns[this.user] : arguments[1];

      return new Promise(function (resolve, reject) {
        if (typeof entry !== 'string') {
          return reject(new Error('An entry should be a string!'));
        }
        if (!entry.length) {
          return reject(new Error('An entry should not be empty!'));
        }
        _this2.cn.addNode({
          label: entry,
          type: 'e'
        }).then(function (node) {
          var allTokenNodes = [];
          var tokenizer = new _sentenceTokenizer2.default(_this2.user, _this2.name);
          tokenizer.setEntry(entry);
          var sentences = tokenizer.getSentences();
          var sentencesObjects = sentences.map(function (sentence) {
            return {
              label: sentence,
              type: 's'
            };
          });
          var sentencesNodes = _this2.cn.addNodes(sentencesObjects);
          _this2.lastSentenceNodeId = sentencesNodes[sentencesNodes.length - 1].id;
          sentencesNodes.forEach(function (sentence, index) {
            cns.activate(sentence).then(function (state) {
              return _this2.createTokens(sentence, index, tokenizer);
            }).then(function (tokensObjects) {
              return _this2.cn.addNodes(tokensObjects);
            }).then(function (tokensNodes) {
              for (var i = 0; i < tokensNodes.length; i++) {
                if (i < tokensNodes.length - 1) {
                  _this2.cn.addLink(tokensNodes[i].id, tokensNodes[i + 1].id);
                }
                _this2.cn.addLink(sentencesNodes[index].id, tokensNodes[i].id);
                cns.activate(tokensNodes[i]);
              }

              allTokenNodes = [].concat(_toConsumableArray(allTokenNodes), _toConsumableArray(tokensNodes));
            });
            /*
                        const tokens = tokenizer.getTokens(index)
                        const tokensObjects = tokens.map((token, index, array) => {
                          const oldToken = this.cn.getNode({label: token, type: 'w'}) ||
                            { beg: 0, mid: 0, end: 0 }
                          const tokenNode = {
                            label: token,
                            type: 'w',
                            beg: oldToken.beg + (index === 0 ? 1 : 0),
                            mid: oldToken.mid + (index !== 0 && index < array.length - 1 ? 1 : 0),
                            end: oldToken.end + (index === array.length - 1 ? 1 : 0)
                          }
                          return tokenNode
                        })
                        const tokensNodes = this.cn.addNodes(tokensObjects)
            
                        for (let i = 0; i < tokensNodes.length; i++) {
                          if (i < tokensNodes.length - 1) {
                            this.cn.addLink(tokensNodes[i].id, tokensNodes[i + 1].id)
                          }
                          this.cn.addLink(sentencesNodes[index].id, tokensNodes[i].id)
                          cns.activate(tokensNodes[i])
                        }
            
                        allTokenNodes = [...allTokenNodes, ...tokensNodes]
            */
          });
          return resolve(allTokenNodes);
        });
      });
    },
    getLastSentenceNode: function getLastSentenceNode() {
      return this.cn.getNodeById(this.lastSentenceNodeId);
    },
    generateResponse: function generateResponse() {
      var lastSentenceNode = this.getLastSentenceNode();
      var fakeResponse = lastSentenceNode.label.replace(/{yourname}/g, this.user).replace(/{myname}/g, this.name);
      return { sentence: fakeResponse, nodes: [2, 3] };
    },
    linkNodesToLastSentence: function linkNodesToLastSentence(nodes) {
      for (var i in nodes) {
        this.cn.addLink(nodes[i], this.lastSentenceNodeId);
      }
    },


    _ConceptNetwork: (0, _conceptNetwork.ConceptNetwork)(),

    set ConceptNetwork(newConceptNetwork) {
      _assert2.default.equal(typeof newConceptNetwork === 'undefined' ? 'undefined' : _typeof(newConceptNetwork), 'function');
      this._ConceptNetwork = newConceptNetwork;
      this.cn = this._ConceptNetwork();
      (0, _assert2.default)(this.cn.addNode);
      (0, _assert2.default)(this.cn.addLink);
      (0, _assert2.default)(this.cn.getNode);
      this.cns[this.user] = (0, _conceptNetworkState.ConceptNetworkState)(this.cn);
    },

    get ConceptNetwork() {
      return this._ConceptNetwork;
    }

  };

  ector.name = name;
  ector.user = username;
  ector.ConceptNetwork = _conceptNetwork.ConceptNetwork;

  return ector;
}