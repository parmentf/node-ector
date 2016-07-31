import assert from 'assert'
import Debug from 'debug'
const debug = Debug('ector:concept-network') // eslint-disable-line no-unused-vars

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
        const node2 = this.getNode({label, type})
        node2.beg += node.beg > 0 ? 1 : 0
        node2.mid += node.mid > 0 ? 1 : 0
        node2.end += node.end > 0 ? 1 : 0
        node2.occ++
        node = node2
      }
      return node
    },

    getNode ({label, type = ''}) {
      return this.nodeIndex[type + label]
    },

    addNodes (nodes) {
      return nodes.map(node => {
        this.addNode(node)
        return this.getNode(node)
      })
    },

    link: {},

    addLink (fromId, toId) {
      assert(fromId, 'fromId should be defined')
      assert(toId, 'toId should be defined')
      assert(typeof fromId, 'number')
      assert(typeof toId, 'number')
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
      assert(fromId, 'fromId should be defined')
      assert(toId, 'toId should be defined')
      assert(typeof fromId, 'number')
      assert(typeof toId, 'number')
      return this.link[fromId + '_' + toId]
    }
  }

  return cn
}
