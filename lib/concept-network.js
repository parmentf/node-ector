"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ConceptNetwork;
function ConceptNetwork() {
  var cn = {
    node: [],
    nodeIndex: {},

    addNode: function addNode(node) {
      var label = node.label;
      var type = node.type;

      if (!this.nodeIndex[type + label]) {
        this.nodeIndex[type + label] = node;
        this.node.push(node);
      }
    },
    getNode: function getNode(_ref) {
      var label = _ref.label;
      var type = _ref.type;

      return this.nodeIndex[type + label];
    },
    addNodes: function addNodes(nodes) {
      for (var node in nodes) {
        this.addNode(nodes[node]);
      }
    }
  };

  return cn;
}