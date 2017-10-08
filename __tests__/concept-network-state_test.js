'use strict';

// const ConceptNetwork = require('../lib/concept-network').ConceptNetwork;
import { ConceptNetwork } from '../lib/concept-network';
import { ConceptNetworkState } from '../lib/concept-network-state';

describe('ConceptNetworkState', () => {
  describe('#Constructor', () => {
    it('should throw an exception if no ConceptNetwork is given', () => {
      expect(() => {
        ConceptNetworkState();
      }).toThrow(Error);
    });

    it('should not throw an exception', () => {
      expect(() => {
        const cn = ConceptNetwork();
        ConceptNetworkState(cn);
      }).not.toThrow(Error);
    });

    it('should be called from a derived constructor', () => {
      const DerivedConceptNetworkState = () => {
        const cn = ConceptNetwork();
        return cn;
      };
      const derived = DerivedConceptNetworkState();
      expect(derived).not.toBeNull();
      expect(derived).toHaveProperty('addNode');
      expect(typeof derived.addNode).toBe('function');
    });
  });

  describe('#activate', () => {
    let cn = null;
    let cns = null;
    let node1 = null;
    beforeAll(() => {
      cn = ConceptNetwork();
      cns = ConceptNetworkState(cn);
      return cn.addNode({ label: 'Node 1' }).then(node => {
        node1 = node;
      });
    });

    it('should put the node activation to 100', () => {
      return cns.activate(node1).then(state => {
        expect(cns.state[node1.id].activationValue).toBe(100);
      });
    });

    it('should cap the activation of an activated node', () => {
      return cns.activate(node1.id).then(state => {
        expect(cns.state[node1.id].activationValue).toBe(100);
      });
    });
  });

  describe('#getters', () => {
    let cn, cns, node1, node2, node3;
    describe('##getActivationValue', () => {
      beforeAll(() => {
        cn = ConceptNetwork();
        cns = ConceptNetworkState(cn);
        return cn
          .addNode({ label: 'Node 1' })
          .then(node => {
            node1 = node;
            return cn.addNode({ label: 'Node 2' });
          })
          .then(node => {
            node2 = node;
            return cns.activate(node1.id);
          });
      });

      it('should get a zero activation value', () => {
        return cns.getActivationValue(node2.id).then(activationValue => {
          expect(activationValue).toBe(0);
        });
      });

      it('should get a 100 activation value', () => {
        return cns.getActivationValue(node1.id).then(activationValue => {
          expect(activationValue).toBe(100);
        });
      });

      it('should catch when the node does not have an id', done => {
        return cns
          .getActivationValue({ label: 'no id' })
          .then(state => {
            done(new Error('This node should not exist'));
          })
          .catch(() => {
            done();
          });
      });
    });

    describe('##getOldActivationValue', () => {
      beforeAll(() => {
        cn = ConceptNetwork();
        cns = ConceptNetworkState(cn);
        return cn
          .addNode({ label: 'Node 1' })
          .then(node => {
            node1 = node;
            return cn.addNode({ label: 'Node 2' });
          })
          .then(node => {
            node2 = node;
            return cns.activate(node1.id);
          })
          .then(state => {
            return cns.propagate();
          });
      });

      it('should get a zero activation value', () => {
        return cns.getOldActivationValue(node2.id).then(oldActivationValue => {
          expect(oldActivationValue).toBe(0);
        });
      });

      it('should get a 100 activation value', () => {
        return cns.getOldActivationValue(node1.id).then(oldActivationValue => {
          expect(oldActivationValue).toBe(100);
        });
      });
    });

    describe('##getMaximumActivationValue', () => {
      beforeAll(() => {
        cn = ConceptNetwork();
        cns = ConceptNetworkState(cn);
        return cn
          .addNode({ label: 'Node 1' })
          .then(node => {
            node1 = node;
            return cn.addNode({ label: 'Node 2', type: 's' });
          })
          .then(node => {
            node2 = node;
            return cn.addNode({ label: 'Node 3', type: 't' });
          })
          .then(node => {
            node3 = node;
          });
      });

      it('should return 0 when no node is activated', () => {
        return cns.getMaximumActivationValue().then(maxValue => {
          expect(maxValue).toBe(0);
        });
      });

      it('should get the maximum activation value for any token', () => {
        return cns
          .setActivationValue(node1.id, 75)
          .then(() => {
            return cns.setActivationValue(node2.id, 70);
          })
          .then(() => {
            return cns.setActivationValue(node3.id, 50);
          })
          .then(() => {
            return cns.getMaximumActivationValue();
          })
          .then(maxValue => {
            expect(maxValue).toBe(75);
          });
      });

      it('should get the maximum activation value for s tokens', () => {
        return cns
          .setActivationValue(node1.id, 75)
          .then(() => {
            return cns.setActivationValue(node2.id, 70);
          })
          .then(() => {
            return cns.setActivationValue(node3.id, 50);
          })
          .then(() => {
            return cns.getMaximumActivationValue('s');
          })
          .then(maxValue => {
            expect(maxValue).toBe(70);
          });
      });
    });

    describe('##getActivatedTypedNodes', () => {
      beforeAll(() => {
        cn = ConceptNetwork();
        cns = ConceptNetworkState(cn);
        return cn
          .addNode({ label: 'Node 1' })
          .then(node => {
            node1 = node;
            return cn.addNode({ label: 'Node 2', type: 's' });
          })
          .then(node => {
            node2 = node;
            return cn.addNode({ label: 'Node 3', type: 't' });
          })
          .then(node => {
            node3 = node;
          });
      });

      it('should return an empty array', () => {
        return cns.getActivatedTypedNodes().then(activatedNodes => {
          expect(activatedNodes).toBeInstanceOf(Array);
          expect(activatedNodes).toHaveLength(0);
        });
      });

      it('should return one-node-array', () => {
        return cns
          .setActivationValue(node1.id, 100)
          .then(() => {
            return cns.getActivatedTypedNodes();
          })
          .then(result => {
            expect(result).toEqual([
              {
                node: { id: 0, label: 'Node 1', occ: 1 },
                activationValue: 100
              }
            ]);
          });
      });

      it('should return two-nodes-array', () => {
        return cns
          .setActivationValue(node2.id, 95)
          .then(() => {
            return cns.getActivatedTypedNodes();
          })
          .then(result => {
            expect(result).toEqual([
              {
                node: { id: 0, label: 'Node 1', occ: 1 },
                activationValue: 100
              },
              {
                node: { id: 1, label: 'Node 2', occ: 1, type: 's' },
                activationValue: 95
              }
            ]);
          });
      });

      it('should return one-node-array of type s', () => {
        return cns
          .setActivationValue(node2.id, 95)
          .then(() => {
            return cns.getActivatedTypedNodes('s');
          })
          .then(result => {
            expect(result).toEqual([
              {
                node: { id: 1, label: 'Node 2', occ: 1, type: 's' },
                activationValue: 95
              }
            ]);
          });
      });

      it('should return one-node-array where threshold = 96', () => {
        return cns
          .setActivationValue(node1.id, 100)
          .then(() => {
            return cns.getActivatedTypedNodes('', 96);
          })
          .then(result => {
            expect(result).toEqual([
              {
                node: { id: 0, label: 'Node 1', occ: 1 },
                activationValue: 100
              }
            ]);
          });
      });
    });

    /* (self, cn, typeNames, threshold=90):
        """Get the activated nodes of cn.

        The returned nodes must be in the list of typeNames, and
        have an activation value greater than threshold

        Return a list of tuples (node,activation value)"""')*/
  });

  describe('#setters', () => {
    let cn, cns, node1, node2;
    describe('##setActivationValue', () => {
      beforeAll(() => {
        cn = ConceptNetwork();
        cns = ConceptNetworkState(cn);
        return cn
          .addNode({ label: 'Node 1' })
          .then(node => {
            node1 = node;
            return cn.addNode({ label: 'Node 2' });
          })
          .then(node => {
            node2 = node;
          });
      });

      it('should set a zero activation value', () => {
        return cns
          .setActivationValue(node2.id, 0)
          .then(() => {
            return cns.getActivationValue(node2.id);
          })
          .then(activationValue => {
            expect(activationValue).toBe(0);
          });
      });

      it('should set a 75 activation value', () => {
        return cns
          .setActivationValue(node1.id, 75)
          .then(() => {
            return cns.getActivationValue(node1.id);
          })
          .then(activationValue => {
            expect(activationValue).toBe(75);
          });
      });
    });
  });

  describe('#propagate', () => {
    var cn, cns, node1, node2;
    beforeAll(() => {
      cn = ConceptNetwork();
      cns = ConceptNetworkState(cn);
      cn
        .addNode({ label: 'Node 1' })
        .then(node => {
          node1 = node;
          return cn.addNode({ label: 'Node 2' });
        })
        .then(node => {
          node2 = node;
          return cn.addLink(node1.id, node2.id);
        });
    });

    it('should deactivate node without afferent links', () => {
      return cns
        .activate(node1.id)
        .then(node => {
          return cns.getActivationValue(node1.id);
        })
        .then(value => {
          expect(value).toBe(100);
          return cns.propagate();
        })
        .then(() => {
          return cns.getActivationValue(node1.id);
        })
        .then(value => {
          expect(value).toBeLessThan(100);
        });
    });

    it('should activate node 2', () => {
      return cns.getActivationValue(node2.id).then(value => {
        expect(value).toBeGreaterThan(0);
      });
    });

    it('should accept options', () => {
      return cns.propagate({ anything: 1 });
    });

    it('should take decay into account', () => {
      return cns.propagate({ decay: 200 }).then(() => {
        const array = [1, 2];
        delete array[0];
        delete array[1];
        expect(cns.state).toBeInstanceOf(Array);
        expect(cns.state).toEqual(array); // all nodes should be deactivated
      });
    });

    it('should take memoryPerf into account', () => {
      return cns
        .activate(node1.id)
        .then(state => {
          return cns.propagate({ memoryPerf: Infinity });
        })
        .then(() => {
          return cns.getActivationValue(node1.id);
        })
        .then(value => {
          expect(value).toEqual(
            60,
            'with an infinite memory perf, ' +
              'activation should not decay too much'
          );
        });
    });

    it('should return an error when first parameter is not an object', done => {
      cns
        .propagate(1)
        .then(() => done(new Error('Should return an error')))
        .catch(err => {
          expect(err).toBeInstanceOf(Error);
          done();
        });
    });

    it('should use already existing influenceValue', () => {
      var node3;
      cn
        .addNode({ label: 'Node 3' })
        .then(node => {
          node3 = node;
          return cn.addLink(node3.id, node2.id);
        })
        .then(link => {
          return cns.activate(node1.id);
        })
        .then(state => {
          return cns.propagate();
        });
    });
  });
});
