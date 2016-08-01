import assert from 'assert'
import Debug from 'debug'
const debug = Debug('ector:concept-network-state') // eslint-disable-line no-unused-vars

export function ConceptNetworkState (conceptNetwork) {
  const cns = {
    state: [],

    cn: conceptNetwork,

    activate (node) {
      assert.equal(typeof node, 'object')
      assert(node.id)
      assert.equal(typeof node.id, 'number')
      this.state[node.id] = 100
    },

    getActivationValue (node) {
      let id = -1
      if (typeof node === 'number') {
        id = node
      } else if (typeof node !== 'object') {
        return new Error('node parameter should be an object or a number')
      } else if (!node.id) {
        return new Error('node parameter should contain an id')
      } else if (typeof node.id !== 'number') {
        return new Error('node id should be a number')
      } else {
        id = node.id
      }
      return this.state[id]
    }
  }

  return cns
}
