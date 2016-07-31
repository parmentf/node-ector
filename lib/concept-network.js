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
      var _node = node;
      var label = _node.label;
      var type = _node.type;

      if (!this.nodeIndex[type + label]) {
        node.occ = 1;
        this.nodeIndex[type + label] = node;
        this.node.push(node);
      } else {
        node = this.getNode({ label: label, type: type });
        node.occ++;
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
    },


    link: {}
  };

  return cn;
}