'use strict';

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
    beforeAll(async () => {
      cn = ConceptNetwork();
      cns = ConceptNetworkState(cn);
      node1 = await cn.addNode({ label: 'Node 1' });
    });

    it('should put the node activation to 100', async () => {
      await cns.activate(node1);
      expect(cns.state[node1.id].activationValue).toBe(100);
    });

    it('should cap the activation of an activated node', async () => {
      await cns.activate(node1.id);
      expect(cns.state[node1.id].activationValue).toBe(100);
    });
  });

  describe('#getters', () => {
    let cn, cns, node1, node2, node3;
    describe('##getActivationValue', () => {
      beforeAll(async () => {
        cn = ConceptNetwork();
        cns = ConceptNetworkState(cn);
        node1 = await cn.addNode({ label: 'Node 1' });
        node2 = await cn.addNode({ label: 'Node 2' });
        await cns.activate(node1.id);
      });

      it('should get a zero activation value', async () => {
        const activationValue = await cns.getActivationValue(node2.id);
        expect(activationValue).toBe(0);
      });

      it('should get a 100 activation value', async () => {
        const activationValue = await cns.getActivationValue(node1.id);
        expect(activationValue).toBe(100);
      });

      it('should catch when the node does not have an id', async () => {
        try {
          const state = await cns.getActivationValue({ label: 'no id' });
          expect(state).toBeUndefined();
        } catch (e) {
          expect(e).not.toBeNull();
        }
      });
    });

    describe('##getOldActivationValue', () => {
      beforeAll(async () => {
        cn = ConceptNetwork();
        cns = ConceptNetworkState(cn);
        node1 = await cn.addNode({ label: 'Node 1' });
        node2 = await cn.addNode({ label: 'Node 2' });
        await cns.activate(node1.id);
        await cns.propagate();
      });

      it('should get a zero activation value', async () => {
        const oldActivationValue = await cns.getOldActivationValue(node2.id);
        expect(oldActivationValue).toBe(0);
      });

      it('should get a 100 activation value', async () => {
        const oldActivationValue = await cns.getOldActivationValue(node1.id);
        expect(oldActivationValue).toBe(100);
      });
    });

    describe('##getMaximumActivationValue', () => {
      beforeAll(async () => {
        cn = ConceptNetwork();
        cns = ConceptNetworkState(cn);
        node1 = await cn.addNode({ label: 'Node 1' });
        node2 = await cn.addNode({ label: 'Node 2', type: 's' });
        node3 = await cn.addNode({ label: 'Node 3', type: 't' });
      });

      it('should return 0 when no node is activated', async () => {
        const maxValue = await cns.getMaximumActivationValue();
        expect(maxValue).toBe(0);
      });

      it('should get the maximum activation value for any token', async () => {
        await cns.setActivationValue(node1.id, 75);
        await cns.setActivationValue(node2.id, 70);
        await cns.setActivationValue(node3.id, 50);
        const maxValue = await cns.getMaximumActivationValue();
        expect(maxValue).toBe(75);
      });

      it('should get the maximum activation value for s tokens', async () => {
        await cns.setActivationValue(node1.id, 75);
        await cns.setActivationValue(node2.id, 70);
        await cns.setActivationValue(node3.id, 50);
        const maxValue = await cns.getMaximumActivationValue('s');
        expect(maxValue).toBe(70);
      });
    });

    describe('##getActivatedTypedNodes', () => {
      beforeAll(async () => {
        cn = ConceptNetwork();
        cns = ConceptNetworkState(cn);
        node1 = await cn.addNode({ label: 'Node 1' });
        node2 = await cn.addNode({ label: 'Node 2', type: 's' });
        node3 = await cn.addNode({ label: 'Node 3', type: 't' });
      });

      it('should return an empty array', async () => {
        const activatedNodes = await cns.getActivatedTypedNodes();
        expect(activatedNodes).toBeInstanceOf(Array);
        expect(activatedNodes).toHaveLength(0);
      });

      it('should return one-node-array', async () => {
        await cns.setActivationValue(node1.id, 100);
        const result = await cns.getActivatedTypedNodes();
        expect(result).toEqual([
          {
            node: { id: 0, label: 'Node 1', occ: 1 },
            activationValue: 100
          }
        ]);
      });

      it('should return two-nodes-array', async () => {
        await cns.setActivationValue(node2.id, 95);
        const result = await cns.getActivatedTypedNodes();
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

      it('should return one-node-array of type s', async () => {
        await cns.setActivationValue(node2.id, 95);
        const result = await cns.getActivatedTypedNodes('s');
        expect(result).toEqual([
          {
            node: { id: 1, label: 'Node 2', occ: 1, type: 's' },
            activationValue: 95
          }
        ]);
      });

      it('should return one-node-array where threshold = 96', async () => {
        await cns.setActivationValue(node1.id, 100);
        const result = await cns.getActivatedTypedNodes('', 96);
        expect(result).toEqual([
          {
            node: { id: 0, label: 'Node 1', occ: 1 },
            activationValue: 100
          }
        ]);
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
      beforeAll(async () => {
        cn = ConceptNetwork();
        cns = ConceptNetworkState(cn);
        node1 = await cn.addNode({ label: 'Node 1' });
        node2 = await cn.addNode({ label: 'Node 2' });
      });

      it('should set a zero activation value', async () => {
        await cns.setActivationValue(node2.id, 0);
        const activationValue = await cns.getActivationValue(node2.id);
        expect(activationValue).toBe(0);
      });

      it('should set a 75 activation value', async () => {
        await cns.setActivationValue(node1.id, 75);
        const activationValue = await cns.getActivationValue(node1.id);
        expect(activationValue).toBe(75);
      });
    });
  });

  describe('#propagate', () => {
    var cn, cns, node1, node2;
    beforeAll(async () => {
      cn = ConceptNetwork();
      cns = ConceptNetworkState(cn);
      node1 = await cn.addNode({ label: 'Node 1' });
      node2 = await cn.addNode({ label: 'Node 2' });
      await cn.addLink(node1.id, node2.id);
    });

    it('should deactivate node without afferent links', async () => {
      await cns.activate(node1.id);
      const value = await cns.getActivationValue(node1.id);
      expect(value).toBe(100);
      await cns.propagate();
      const newValue = await cns.getActivationValue(node1.id);
      expect(newValue).toBeLessThan(100);
    });

    it('should activate node 2', async () => {
      const value = await cns.getActivationValue(node2.id);
      expect(value).toBeGreaterThan(0);
    });

    it('should accept options', async () => {
      await cns.propagate({ anything: 1 });
    });

    it('should take decay into account', async () => {
      await cns.propagate({ decay: 200 });
      const array = [1, 2];
      delete array[0];
      delete array[1];
      expect(cns.state).toBeInstanceOf(Array);
      expect(cns.state).toEqual(array); // all nodes should be deactivated
    });

    it('should take memoryPerf into account', async () => {
      await cns.activate(node1.id);
      await cns.propagate({ memoryPerf: Infinity });
      const value = await cns.getActivationValue(node1.id);
      expect(value).toEqual(60); // with an infinite memory perf, activation should not decay too much
    });

    it('should return an error when first parameter is not an object', async () => {
      try {
        await cns.propagate(1);
        throw new Error('Should throw an error');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
    });

    it('should use already existing influenceValue', async () => {
      const node3 = await cn.addNode({ label: 'Node 3' });
      const link = await cn.addLink(node3.id, node2.id);
      await cns.activate(node1.id);
      await cns.propagate();
    });
  });
});
