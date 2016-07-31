export default function ConceptNetwork () {
  const cn = {
    node: [],
    nodeIndex: {},

    addNode (node) {
      const {label, type} = node
      if (!this.nodeIndex[type + label]) {
        this.nodeIndex[type + label] = node
        this.node.push(node)
      }
    },

    getNode ({label, type}) {
      return this.nodeIndex[type + label]
    },

    addNodes (nodes) {
      for (let node in nodes) {
        this.addNode(nodes[node])
      }
    }
  }

  return cn
}
