'use strict';

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
      var _node$type = _node.type;
      var type = _node$type === undefined ? '' : _node$type;

      if (!this.nodeIndex[type + label]) {
        node.occ = 1;
        node.id = this.node.length;
        this.nodeIndex[type + label] = node;
        this.node.push(node);
      } else {
        node = this.getNode({ label: label, type: type });
        node.occ++;
      }
    },
    getNode: function getNode(_ref) {
      var label = _ref.label;
      var _ref$type = _ref.type;
      var type = _ref$type === undefined ? '' : _ref$type;

      return this.nodeIndex[type + label];
    },
    addNodes: function addNodes(nodes) {
      for (var node in nodes) {
        this.addNode(nodes[node]);
      }
    },


    link: {},

    addLink: function addLink(fromId, toId) {
      var link = this.getLink(fromId, toId);
      if (link) {
        link.coOcc++;
      } else {
        this.link[fromId + '_' + toId] = {
          fromId: fromId,
          toId: toId,
          coOcc: 1
        };
      }
    },
    getLink: function getLink(fromId, toId) {
      return this.link[fromId + '_' + toId];
    }
  };

  return cn;
}