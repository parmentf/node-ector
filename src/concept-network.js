export default function ConceptNetwork () {
  const cn = {
    node: [],
    nodeIndex: {},

    addNode (node) {
      const {label, type = ''} = node
      if (!this.nodeIndex[type + label]) {
        node.occ = 1
        node.id = this.node.length
        this.nodeIndex[type + label] = node
        this.node.push(node)
      } else {
        node = this.getNode({label, type})
        node.occ++
      }
    },

    getNode ({label, type = ''}) {
      return this.nodeIndex[type + label]
    },

    addNodes (nodes) {
      for (let node in nodes) {
        this.addNode(nodes[node])
      }
    },

    link: {},

    addLink (fromId, toId) {
      const link = this.getLink(fromId, toId)
      if (link) {
        link.coOcc++
      } else {
        this.link[fromId + '_' + toId] = {
          fromId,
          toId,
          coOcc: 1
        }
      }
    },

    getLink (fromId, toId) {
      return this.link[fromId + '_' + toId]
    }
  }

  return cn
}
