import assert from 'assert'
import Debug from 'debug'
const debug = Debug('ector:concept-network-state') // eslint-disable-line no-unused-vars

export function ConceptNetworkState (conceptNetwork) {
  assert(conceptNetwork)
  const cns = {
    state: [], // nodeId -> state

    cn: conceptNetwork,

    getNodeId (node) {
      let id = -1
      if (typeof node === 'number') {
        id = node
      } else if (typeof node !== 'object') {
        return new Error('node parameter should be an object or a number')
      } else if (node.id === undefined) {
        return new Error('node parameter should contain an id')
      } else if (typeof node.id !== 'number') {
        return new Error('node id should be a number')
      } else {
        id = node.id
      }
      return id
    },

    activate (node, cb) {
      const id = this.getNodeId(node)
      assert.ifError(id instanceof Error)
      if (this.state[id] === undefined) {
        this.state[id] = {
          activationValue: 100,
          age: 0,
          oldActivationValue: 0
        }
      } else {
        this.state[id] = { activationValue: 100 }
      }
      if (cb) return cb(null, this.state[id])
      return this.state[id]
    },

    getActivationValue (node, cb) {
      const id = this.getNodeId(node)
      assert.ifError(id instanceof Error)
      let activationValue = 0
      if (!this.state[id]) {
        activationValue = 0
      } else {
        activationValue = this.state[id].activationValue
      }
      if (cb) return cb(null, activationValue)
      return activationValue
    },

    getOldActivationValue (node, cb) {
      const id = this.getNodeId(node)
      assert.ifError(id instanceof Error)
      let oldActivationValue = 0
      if (!this.state[id]) {
        oldActivationValue = 0
      } else {
        oldActivationValue = this.state[id].oldActivationValue
      }
      if (cb) return cb(null, oldActivationValue)
      return oldActivationValue
    },

    getMaximumActivationValue (filter, cb) {
      if (!cb) {
        cb = filter
        filter = undefined
      }
      const avArray = this.state
      .filter((state, id) => {
        if (filter) return this.cn.node[id].type === filter
        else return true
      })
      .map(state => state.activationValue)
      const max = Math.max(...avArray, 0)
      return cb(null, max)
    },

    getActivatedTypedNodes (filter, threshold, cb) {
      if (!cb) {
        if (typeof threshold === 'function') {
          cb = threshold
          threshold = undefined
        }
        if (typeof filter === 'function') {
          cb = filter
          filter = undefined
        }
      }
      if (threshold === undefined) threshold = 90
      if (typeof filter !== 'string') filter = ''

      const activatedTypedNodes = this.state
      .map((state, id) => {
        return {
          node: this.cn.node[id],
          activationValue: this.state[id].activationValue
        }
      })
      .filter((e) => {
        if (filter) return e.node.type === filter
        else return true
      })
      .filter((e) => e.activationValue >= threshold)
      return cb(null, activatedTypedNodes)
    },

    setActivationValue (node, value, cb) {
      const id = this.getNodeId(node)
      assert.ifError(id instanceof Error)
      if (!this.state[id]) {
        this.state[id] = {
          activationValue: value,
          age: 0,
          oldActivationValue: 0
        }
      } else {
        this.state[id].activationValue = value
      }
      // Reactivate non-activated nodes.
      if (!value) {
        delete this.state[id]
      }
      if (cb) return cb()
    },

    normalNumberComingLinks: 2,

    propagate (options, cb) {
      // Parameters
      if (!cb && typeof options === 'function') {
        cb = options
        options = {
          decay      : 40,
          memoryPerf : 100
        }
      }
      if (options && typeof options !== 'object') {
        return cb(new Error("propagate() parameter should be an object"))
      }

      // Aging
      this.state = this.state.map(state => {
        state.oldActivationValue = state.activationValue
        state.age++
        return state
      })

      // Compute influences
      const influenceNb = []    // nodeId -> number of influences
      const influenceValue = [] // nodeId -> total of influences
      this.cn.node.forEach((node, nodeId, nodes) => {
        const ov = this.getOldActivationValue(node)
        const outgoingLinks = this.cn.getNodeFromLinks(nodeId)
        outgoingLinks.forEach((linkId) => {
          const link = this.cn.getLink(linkId)
          const nodeToId = link.toId
          let infl = influenceValue[nodeToId] || 0
          infl += 0.5 + ov * link.coOcc
          influenceValue[nodeToId] = infl
          influenceNb[nodeToId] = influenceNb[nodeToId] || 0
          influenceNb[nodeToId] += 1
        })
      })

      this.cn.node.forEach((node, id) => {
        let state = this.state[id]
        if (state === undefined) {
          state = { activationValue: 0, oldActivationValue: 0, age: 0 }
        }
        const decay      = options.decay || 40
        const memoryPerf = options.memoryPerf || 100
        const minusAge = 200 / (1 + Math.exp(-state.age / memoryPerf)) - 100
        let newActivationValue

        // If this node is not influenced at all
        if (!influenceValue[id]) {
          newActivationValue = state.oldActivationValue -
                               decay * state.oldActivationValue / 100 - minusAge
        }
        // If this node receives influence
        else {
          let influence = influenceValue[id];
          const nbIncomings = influenceNb[id];
          influence /= Math.log(this.normalNumberComingLinks + nbIncomings) /
                       Math.log(this.normalNumberComingLinks)
          newActivationValue = state.oldActivationValue -
                               decay * state.oldActivationValue / 100 +
                               influence -
                               minusAge
        }
        newActivationValue = Math.max(newActivationValue, 0)
        newActivationValue = Math.min(newActivationValue, 100)
        this.setActivationValue(id, newActivationValue)
      })
      return cb()
    }
  }

  return cns
}
