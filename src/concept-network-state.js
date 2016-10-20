import 'babel-polyfill'
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

    activate (node) {
      return new Promise((resolve, reject) => {
        const id = this.getNodeId(node)
        if (id instanceof Error) return reject(id)
        if (this.state[id] === undefined) {
          this.state[id] = {
            activationValue: 100,
            age: 0,
            oldActivationValue: 0
          }
        } else {
          this.state[id] = { activationValue: 100 }
        }
        resolve(this.state[id])
      })
    },

    getActivationValue (node) {
      return new Promise((resolve, reject) => {
        const id = this.getNodeId(node)
        if (id instanceof Error) return reject(id)
        let activationValue = 0
        if (!this.state[id]) {
          activationValue = 0
        } else {
          activationValue = this.state[id].activationValue
        }
        resolve(activationValue)
      })
    },

    getOldActivationValue (node) {
      return new Promise((resolve, reject) => {
        const id = this.getNodeId(node)
        if (id instanceof Error) return reject(id)
        let oldActivationValue = 0
        if (!this.state[id]) {
          oldActivationValue = 0
        } else {
          oldActivationValue = this.state[id].oldActivationValue
        }
        resolve(oldActivationValue)
      })
    },

    getMaximumActivationValue (filter) {
      return new Promise((resolve, reject) => {
        const avArray = this.state
        .filter((state, id) => {
          if (filter) return this.cn.node[id].type === filter
          else return true
        })
        .map(state => state.activationValue)
        const max = Math.max(...avArray, 0)
        resolve(max)
      })
    },

    getActivatedTypedNodes (filter = '', threshold = 90) {
      return new Promise((resolve, reject) => {
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
        resolve(activatedTypedNodes)
      })
    },

    setActivationValue (node, value) {
      return new Promise((resolve, reject) => {
        const id = this.getNodeId(node)
        if (id instanceof Error) return reject(id)
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
        resolve(this.state[id])
      })
    },

    normalNumberComingLinks: 2,

    computeInfluence () {
      // What a mess!! Maybe read http://exploringjs.com/es6/ch_promises.html
      return new Promise((resolve, reject) => {
        const influenceNb = []    // nodeId -> number of influences
        const influenceValue = [] // nodeId -> total of influences
        const promise = this.cn.node.reduce((sequence, node, nodeId) => {
          return sequence.then(() => {
            let ov  // acrobatic
            this.getOldActivationValue(node)
            .then(oav => {
              ov = oav // acrobatic
              return this.cn.getNodeFromLinks(nodeId)
            })
            .then(outgoingLinks => {
              return outgoingLinks.reduce((sequence, linkId) => {
                return sequence.then(() => {
                  this.cn.getLink(linkId)
                  .then(link => {
                    debug('link', link)
                    debug('ov', ov)
                    const nodeToId = link.toId
                    let infl = influenceValue[nodeToId] || 0
                    infl += 0.5 + ov * link.coOcc
                    influenceValue[nodeToId] = infl
                    influenceNb[nodeToId] = influenceNb[nodeToId] || 0
                    influenceNb[nodeToId] += 1
                    debug('infl', infl)
                    debug('influenceValue 1', influenceValue)
                  })
                })
              }, Promise.resolve())
            })

          })
        }, Promise.resolve())
        .then(() => resolve({ influenceNb, influenceValue }))
        return promise
/*
        this.cn.node.forEach((node, nodeId, nodes) => {
          this.getOldActivationValue(node)
          .then(ov => {
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
          .catch(err => {
            reject(err)
          })
        })
        resolve({influenceNb, influenceValue})
*/
      })
    },

    propagate (options = { decay: 40, memoryPerf: 100 }) {
      return new Promise((resolve, reject) => {
        if (options && typeof options !== 'object') {
          return reject(new Error('propagate() parameter should be an object'))
        }

        // Aging
        this.state = this.state.map(state => {
          state.oldActivationValue = state.activationValue
          state.age++
          return state
        })

        this.computeInfluence()
        .then(({influenceNb, influenceValue}) => {
          debug('influenceNb 2', influenceNb)
          debug('influenceValue 2', influenceValue)
          this.cn.node.forEach((node, id) => {
            let state = this.state[id]
            if (state === undefined) {
              state = { activationValue: 0, oldActivationValue: 0, age: 0 }
            }
            const decay = options.decay || 40
            const memoryPerf = options.memoryPerf || 100
            const minusAge = 200 / (1 + Math.exp(-state.age / memoryPerf)) - 100
            let newActivationValue

            if (!influenceValue[id]) {
              // If this node is not influenced at all
              newActivationValue = state.oldActivationValue -
                                   decay * state.oldActivationValue / 100 - minusAge
            } else {
              // If this node receives influence
              let influence = influenceValue[id]
              const nbIncomings = influenceNb[id]
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
          return resolve()
        })
        .catch(err => reject(err))
      }) // Promise
    } // propagate
  }

  return cns
}
