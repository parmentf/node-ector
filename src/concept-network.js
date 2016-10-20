import 'babel-polyfill'
import Debug from 'debug'
const debug = Debug('ector:concept-network') // eslint-disable-line no-unused-vars

export function ConceptNetwork () {
  const cn = {
    node: [],
    nodeIndex: {},
    link: {},
    fromIndex: [],
    toIndex: [],

    addNode (node, inc = 1) {
      return new Promise((resolve, reject) => {
        const {label, type = ''} = node
        if (!this.nodeIndex[type + label]) {
          node.occ = inc
          node.id = this.node.length
          this.nodeIndex[type + label] = node
          this.node.push(node)
          return resolve(node)
        } else {
          this.getNode({label, type})
          .then(node2 => {
            node2.beg += node.beg > 0 ? 1 : 0
            node2.mid += node.mid > 0 ? 1 : 0
            node2.end += node.end > 0 ? 1 : 0
            node2.occ += inc
            return resolve(node2)
          })
        }
      })
    },

    getNode ({label, type = ''}) {
      return new Promise((resolve, reject) => {
        return resolve(this.nodeIndex[type + label])
      })
    },

    getNodeById (id) {
      return new Promise((resolve, reject) => resolve(this.node.find(node => node.id === id)))
    },

    addNodes (objects) {
      // See http://www.html5rocks.com/en/tutorials/es6/promises/#toc-creating-sequences
      const nodes = []
      const promise = objects.reduce((sequence, object) => {
        return sequence.then(() => {
          return this.addNode(object)
        })
        .then(node => {
          nodes.push(node)
        })
      }, Promise.resolve())
      .then(() => nodes)
      return promise
    },

    addLink (fromId, toId, inc = 1) {
      return new Promise((resolve, reject) => {
        if (typeof fromId !== 'number') return reject(new Error('fromId should be a number'))
        if (typeof toId !== 'number') return reject(new Error('toId should be a number'))
        if (fromId === undefined) return reject(new Error('fromId should be defined'))
        if (fromId === null) return reject(new Error('fromId should not be null'))
        if (toId === undefined) return reject(new Error('toId should be defined'))
        if (toId === null) return reject(new Error('fromId should not be null'))

        this.getLink(fromId, toId)
        .then(link => {
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

          return resolve(link)
        })
      })
    },

    getLink (fromId, toId) {
      return new Promise((resolve, reject) => {
        if (fromId === undefined) return reject(new Error('fromId should be defined'))
        let linkId
        if (typeof fromId === 'string') {
          linkId = fromId
          let [fId, tId] = linkId.split('_').map(str => Number(str))
          fromId = fId
          toId = tId
        } else {
          linkId = fromId + '_' + toId
        }
        if (typeof fromId !== 'number') return reject(new Error('fromId should be a number'))
        if (toId === undefined) return reject(new Error('toId should be defined'))
        if (typeof toId !== 'number') return reject(new Error('toId should be a number'))
        return resolve(this.link[linkId])
      })
    },

    getNodeFromLinks (fromId) {
      return new Promise((resolve, reject) => {
        const fromLinksSet = this.fromIndex[fromId]
        if (!fromLinksSet) {
          return resolve([])
        }
        const fromLinks = Array.from(fromLinksSet.values())
        return resolve(fromLinks)
      })
    },

    getNodeToLinks (toId) {
      return new Promise((resolve, reject) => {
        const toLinksSet = this.toIndex[toId]
        if (!toLinksSet) {
          return resolve([])
        }
        const toLinks = Array.from(toLinksSet.values())
        return resolve(toLinks)
      })
    },

    removeLink (fromId, toId) {
      return new Promise((resolve, reject) => {
        let linkId
        if (typeof fromId === 'string') {
          linkId = fromId
          let [fId, tId] = linkId.split('_').map(str => Number(str))
          fromId = fId
          toId = tId
        } else {
          linkId = fromId + '_' + toId
        }
        delete this.link[linkId]
        this.fromIndex[fromId] && this.fromIndex[fromId].delete(linkId)
        this.toIndex[toId] && this.toIndex[toId].delete(linkId)
        return resolve()
      })
    },

    decrementLink (linkId, cb) {
      return new Promise((resolve, reject) => {
        const link = this.link[linkId]
        link.coOcc -= 1
        if (link.coOcc === 0) {
          this.removeLink(linkId)
          .then(() => {
            resolve()
          })
          .catch(err => reject(err))
        }
        return resolve(link)
      })
    },

    decrementNode (node) {
      return new Promise((resolve, reject) => {
        this.getNode(node)
        .then(n => {
          if (!n) {
            return resolve(null)
          }
          n.occ--
          if (n.occ === 0) {
            this.removeNode(node.id)
            n = null
            return resolve(n)
          } else return resolve(n)
        })
      })
    },

    removeNode (id, cb) {
      return new Promise((resolve, reject) => {
        const fromLinksSet = this.fromIndex[id]
        let fromLinks = []
        if (fromLinksSet) {
          fromLinks = Array.from(fromLinksSet)
        }

        const toLinksSet = this.toIndex[id]
        let toLinks = []
        if (toLinksSet) {
          toLinks = Array.from(toLinksSet)
        }
        const linksToRemove = [...fromLinks, ...toLinks]
        linksToRemove.reduce((sequence, link) => {
          return sequence.then(() => {
            return this.removeLink(link)
          })
        }, Promise.resolve())
        .then(() => {
          delete this.node[id]
          resolve()
        })
      })
    }
  }

  return cn
}
