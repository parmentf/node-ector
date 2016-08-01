import assert from 'assert'
import Debug from 'debug'
const debug = Debug('ector:concept-network') // eslint-disable-line no-unused-vars

export function ConceptNetwork () {
  const cn = {
    node: [],
    nodeIndex: {},
    link: {},
    fromIndex: [],
    toIndex: [],

    addNode (node, inc, cb) {
      if (!cb) {
        cb = inc
        inc = 1
      } else {
        inc = inc || 1
      }
      const {label, type = ''} = node
      if (!this.nodeIndex[type + label]) {
        node.occ = inc
        node.id = this.node.length
        this.nodeIndex[type + label] = node
        this.node.push(node)
      } else {
        const node2 = this.getNode({label, type})
        node2.beg += node.beg > 0 ? 1 : 0
        node2.mid += node.mid > 0 ? 1 : 0
        node2.end += node.end > 0 ? 1 : 0
        node2.occ += inc
        node = node2
      }
      if (cb) {
        return cb(null, node)
      }
      return node
    },

    getNode ({label, type = ''}, cb) {
      if (cb) {
        return cb(null, this.nodeIndex[type + label])
      }
      return this.nodeIndex[type + label]
    },

    getNodeById (id, cb) {
      if (cb) {
        return this.node.find(node => node.id === id)
      }
      return this.node.find(node => node.id === id)
    },

    addNodes (nodes, cb) {
      const res = nodes.map(node => {
        this.addNode(node)
        return this.getNode(node)
      })
      if (cb) {
        return cb(null, res)
      }
      return res
    },

    addLink (fromId, toId, inc, cb) {
      if (!cb) {
        cb = inc
        inc = 1
      } else {
        inc = inc || 1
      }
      if (cb) {
        if (typeof fromId !== 'number') {
          return cb(new Error('fromId should be a number'), null)
        }
        if (typeof toId !== 'number') {
          return cb(new Error('toId should be a number'), null)
        }
      }
      assert(fromId, 'fromId should be defined')
      assert(toId, 'toId should be defined')
      assert(typeof fromId, 'number')
      assert(typeof toId, 'number')
      let link = this.getLink(fromId, toId)
      const linkId = fromId + '_' + toId
      if (link) {
        link.coOcc += inc
      } else {
        this.link[linkId] = link = {
          fromId,
          toId,
          coOcc: inc
        }
      }

      if (!this.fromIndex[fromId]) {
        this.fromIndex[fromId] = new Set()
      }
      this.fromIndex[fromId].add(linkId)
      if (!this.toIndex[toId]) {
        this.toIndex[toId] = new Set()
      }
      this.toIndex[toId].add(linkId)

      if (cb) {
        return cb(null, link)
      }
      return link
    },

    getLink (fromId, toId, cb) {
      assert(fromId, 'fromId should be defined')
      assert(toId, 'toId should be defined')
      assert(typeof fromId, 'number')
      assert(typeof toId, 'number')
      let linkId
      if (typeof fromId === 'string') {
        linkId = fromId
        cb = toId
        let [fId, tId] = linkId.split('_').map(str => Number(str))
        fromId = fId
        toId = tId
      } else {
        linkId = fromId + '_' + toId
      }
      if (cb) {
        return cb(null, this.link[linkId])
      }
      return this.link[linkId]
    },

    getNodeFromLinks (fromId, cb) {
      const fromLinksSet = this.fromIndex[fromId]
      if (!fromLinksSet) {
        if (cb) return cb(null, [])
        return []
      }
      const fromLinks = Array.from(fromLinksSet.values())
      if (cb) {
        return cb(null, fromLinks)
      }
      return fromLinks
    },

    getNodeToLinks (toId, cb) {
      const toLinksSet = this.toIndex[toId]
      if (!toLinksSet) {
        if (cb) cb(null, [])
        return []
      }
      const toLinks = Array.from(toLinksSet.values())
      if (cb) {
        return cb(null, toLinks)
      }
      return toLinks
    },

    removeLink (fromId, toId, cb) {
      let linkId
      if (typeof fromId === 'string') {
        linkId = fromId
        cb = toId
        let [fId, tId] = linkId.split('_').map(str => Number(str))
        fromId = fId
        toId = tId
      } else {
        linkId = fromId + '_' + toId
      }
      delete this.link[linkId]
      this.fromIndex[fromId] && this.fromIndex[fromId].delete(linkId)
      this.toIndex[toId] && this.toIndex[toId].delete(linkId)
      if (cb) return cb()
    },

    decrementLink (linkId, cb) {
      const link = this.link[linkId]
      link.coOcc -= 1
      if (link.coOcc === 0) {
        if (cb) return this.removeLink(linkId, cb)
        return this.removeLink(linkId)
      }
      if (cb) return cb(null, link)
      return link
    },

    decrementNode (node, cb) {
      let n = this.getNode(node)
      if (!n) {
        if (cb) {
          return cb(null, null)
        }
        return null
      }
      n.occ--
      if (n.occ === 0) {
        this.removeNode(node.id)
        n = null
      }
      if (cb) {
        return cb(null, n)
      }
      return n
    },

    removeNode (id, cb) {
      const fromLinksSet = this.fromIndex[id]
      if (fromLinksSet) {
        for (let linkId of fromLinksSet) {
          this.removeLink(linkId)
        }
      }
      const toLinksSet = this.toIndex[id]
      if (toLinksSet) {
        for (let linkId of toLinksSet) {
          this.removeLink(linkId)
        }
      }
      delete this.node[id]
      if (cb) return cb()
    }
  }

  return cn
}
