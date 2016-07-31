'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Ector = Ector;

require('babel-polyfill');

var _sentenceTokenizer = require('sentence-tokenizer');

var _sentenceTokenizer2 = _interopRequireDefault(_sentenceTokenizer);

var _conceptNetwork = require('./concept-network');

var _conceptNetwork2 = _interopRequireDefault(_conceptNetwork);

var _conceptNetworkState = require('./concept-network-state');

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
        this.cns[name] = (0, _conceptNetworkState.ConceptNetworkState)();
      }
      this._username = name;
      this.lastSentenceNodeId = null;
    },

    get user() {
      return this._username;
    },

    cns: {},

    cn: (0, _conceptNetwork2.default)(),

    lastSentenceNodeId: null,

    addEntry: function addEntry(entry) {
      var _this = this;

      var cns = arguments.length <= 1 || arguments[1] === undefined ? this.cns[this.user] : arguments[1];

      if (typeof entry !== 'string') {
        return new Error('An entry should be a string!');
      }
      if (!entry.length) {
        return new Error('An entry should not be empty!');
      }
      this.cn.addNode({
        label: entry,
        type: 'e'
      });
      var allTokenNodes = [];
      var tokenizer = new _sentenceTokenizer2.default(this.user, this.name);
      tokenizer.setEntry(entry);
      var sentences = tokenizer.getSentences();
      var sentencesObjects = sentences.map(function (sentence) {
        return {
          label: sentence,
          type: 's'
        };
      });
      var sentencesNodes = this.cn.addNodes(sentencesObjects);
      sentencesNodes.forEach(function (sentence, index) {
        cns.activate(sentence);
        var tokens = tokenizer.getTokens(index);
        var tokensObjects = tokens.map(function (token, index, array) {
          var oldToken = _this.cn.getNode({ label: token, type: 'w' }) || { beg: 0, mid: 0, end: 0 };
          var tokenNode = {
            label: token,
            type: 'w',
            beg: oldToken.beg + (index === 0 ? 1 : 0),
            mid: oldToken.mid + (index !== 0 && index < array.length - 1 ? 1 : 0),
            end: oldToken.end + (index === array.length - 1 ? 1 : 0)
          };
          return tokenNode;
        });
        var tokensNodes = _this.cn.addNodes(tokensObjects);

        for (var i = 0; i < tokensNodes.length; i++) {
          if (i < tokensNodes.length - 1) {
            _this.cn.addLink(tokensNodes[i].id, tokensNodes[i + 1].id);
          }
          _this.cn.addLink(sentencesNodes[index].id, tokensNodes[i].id);
          cns.activate(tokensNodes[i]);
        }

        allTokenNodes = [].concat(_toConsumableArray(allTokenNodes), _toConsumableArray(tokensNodes));
      });
      return allTokenNodes;
    }
  };

  ector.name = name;
  ector.user = username;

  return ector;
}