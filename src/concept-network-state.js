import 'babel-polyfill';
import assert from 'assert';
import Debug from 'debug';
const debug = Debug('ector:concept-network-state'); // eslint-disable-line no-unused-vars

export function ConceptNetworkState(conceptNetwork) {
  assert(conceptNetwork);
  const cns = {
    state: [], // nodeId -> state

    cn: conceptNetwork,

    getNodeId(node) {
      let id = -1;
      if (typeof node === 'number') {
        id = node;
      } else if (typeof node !== 'object') {
        return new Error('node parameter should be an object or a number');
      } else if (node.id === undefined) {
        return new Error('node parameter should contain an id');
      } else if (typeof node.id !== 'number') {
        return new Error('node id should be a number');
      } else {
        id = node.id;
      }
      return id;
    },

    async activate(node) {
      const id = this.getNodeId(node);
      if (id instanceof Error) return id;
      if (this.state[id] === undefined) {
        this.state[id] = {
          activationValue: 100,
          age: 0,
          oldActivationValue: 0
        };
      } else {
        this.state[id] = { activationValue: 100 };
      }
      return this.state[id];
    },

    async getActivationValue(node) {
      const id = this.getNodeId(node);
      if (id instanceof Error) return id;
      let activationValue = 0;
      if (!this.state[id]) {
        activationValue = 0;
      } else {
        activationValue = this.state[id].activationValue;
      }
      return activationValue;
    },

    async getOldActivationValue(node) {
      const id = this.getNodeId(node);
      if (id instanceof Error) return id;
      let oldActivationValue = 0;
      if (!this.state[id]) {
        oldActivationValue = 0;
      } else {
        oldActivationValue = this.state[id].oldActivationValue;
      }
      return oldActivationValue;
    },

    async getMaximumActivationValue(filter) {
      const avArray = this.state
        .filter((state, id) => {
          if (filter) return this.cn.node[id].type === filter;
          else return true;
        })
        .map(state => state.activationValue);
      const max = Math.max(...avArray, 0);
      return max;
    },

    async getActivatedTypedNodes(filter = '', threshold = 90) {
      const activatedTypedNodes = this.state
        .map((state, id) => {
          return {
            node: this.cn.node[id],
            activationValue: this.state[id].activationValue
          };
        })
        .filter(e => {
          if (filter) return e.node.type === filter;
          else return true;
        })
        .filter(e => e.activationValue >= threshold);
      return activatedTypedNodes;
    },

    async setActivationValue(node, value) {
      const id = this.getNodeId(node);
      if (id instanceof Error) return id;
      if (!this.state[id]) {
        this.state[id] = {
          activationValue: value,
          age: 0,
          oldActivationValue: 0
        };
      } else {
        this.state[id].activationValue = value;
      }
      // Reactivate non-activated nodes.
      if (!value) {
        delete this.state[id];
      }
      return this.state[id];
    },

    normalNumberComingLinks: 2,

    oldComputeInfluence() {
      // What a mess!! Maybe read http://exploringjs.com/es6/ch_promises.html
      // See also https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html
      debug('computeInfluence');
      return new Promise((resolve, reject) => {
        const influenceNb = []; // nodeId -> number of influences
        const influenceValue = []; // nodeId -> total of influences
        /*        const promise = this.cn.node.reduce((sequence, node, nodeId) => {
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
*/
        const promise = Promise.all(
          this.cn.node.map(node =>
            this.getOldActivationValue(node).then(oldActivationValue =>
              this.cn.getNodeFromLinks(node.id).then(outgoingLinks =>
                Promise.all(
                  outgoingLinks.map(linkId =>
                    this.getLink(linkId).then(link => {
                      debug('computeInfluence 1', link);
                      return {
                        value: 0.5 + oldActivationValue * link.coOcc,
                        toId: link.toId
                      };
                    })
                  )
                ).then(influencesTo => {
                  Promise.all(
                    influencesTo.map(influence => {
                      influenceValue[influence.toId] += influence.value;
                      influenceNb[influence.toId] += 1;
                      debug('computeInfluence', influence.toId);
                      return influence.toId;
                    })
                  ).then(() => resolve({ influenceNb, influenceValue }));
                })
              )
            )
          )
        );

        return promise;
        /*        this.cn.node.forEach((node, nodeId, nodes) => {
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
      });
    },

    async computeInfluence() {
      const influenceNb = []; // nodeId -> number of influences
      const influenceValue = []; // nodeId -> total of influences
      await Promise.all(
        this.cn.node.map(async node => {
          const oldActivationValue = await this.getOldActivationValue(node);
          const outgoingLinks = await this.cn.getNodeFromLinks(node.id);
          const influencesTo = await Promise.all(
            outgoingLinks.map(async linkId => {
              const link = await this.cn.getLink(linkId);
              return {
                value: 0.5 + oldActivationValue * link.coOcc,
                toId: link.toId
              };
            })
          );
          influencesTo.map(influence => {
            influenceValue[influence.toId] =
              (influenceValue[influence.toId] || 0) + influence.value;
            influenceNb[influence.toId] =
              (influenceNb[influence.toId] || 0) + 1;
            return influence.toId;
          });
        })
      );
      return { influenceNb, influenceValue };
    },

    async propagate(options = { decay: 40, memoryPerf: 100 }) {
      if (options && typeof options !== 'object') {
        return new Error('propagate() parameter should be an object');
      }

      // Aging
      this.state = this.state.map(state => {
        state.oldActivationValue = state.activationValue;
        state.age++;
        return state;
      });

      const { influenceNb, influenceValue } = await this.computeInfluence();
      this.cn.node.forEach((node, id) => {
        let state = this.state[id];
        if (state === undefined) {
          state = { activationValue: 0, oldActivationValue: 0, age: 0 };
        }
        const decay = options.decay || 40;
        const memoryPerf = options.memoryPerf || 100;
        const minusAge = 200 / (1 + Math.exp(-state.age / memoryPerf)) - 100;
        let newActivationValue;

        if (!influenceValue[id]) {
          // If this node is not influenced at all
          newActivationValue =
            state.oldActivationValue -
            decay * state.oldActivationValue / 100 -
            minusAge;
        } else {
          // If this node receives influence
          let influence = influenceValue[id];
          const nbIncomings = influenceNb[id];
          influence /=
            Math.log(this.normalNumberComingLinks + nbIncomings) /
            Math.log(this.normalNumberComingLinks);
          newActivationValue =
            state.oldActivationValue -
            decay * state.oldActivationValue / 100 +
            influence -
            minusAge;
        }
        newActivationValue = Math.max(newActivationValue, 0);
        newActivationValue = Math.min(newActivationValue, 100);
        this.setActivationValue(id, newActivationValue);
      });
    } // propagate
  };

  return cns;
}
