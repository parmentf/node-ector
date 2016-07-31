'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Ector = Ector;
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
        this.cns[name] = {};
      }
      this._username = name;
      this.lastSentenceNodeId = null;
    },

    get user() {
      return this._username;
    },

    cns: {},

    lastSentenceNodeId: null
  };

  ector.name = name;
  ector.user = username;

  return ector;
}