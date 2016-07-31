export default function ConceptNetwork () {
  const cn = {
    node: [],
    nodeIndex: {},

    addNode (node) {
      const {label, type} = node
      if (!this.nodeIndex[type + label]) {
        node.occ = 1
        this.nodeIndex[type + label] = node
        this.node.push(node)
      }
      else {
        node = this.getNode({label, type})
        node.occ++
      }
    },

    getNode ({label, type}) {
      return this.nodeIndex[type + label]
    },

    addNodes (nodes) {
      for (let node in nodes) {
        this.addNode(nodes[node])
      }
    },

    link: {}
  }

  return cn
}
