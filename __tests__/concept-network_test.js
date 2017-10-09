import Debug from 'debug';
const debug = Debug('ector:concept-network:test'); // eslint-disable-line no-unused-vars

import { ConceptNetwork } from '../lib/concept-network';

describe('ConceptNetwork', () => {
  describe('Creator', () => {
    it('should not throw an exception', () => {
      expect(ConceptNetwork).not.toThrow();
    });

    it('should be called from a derived constructor', () => {
      var DerivedConceptNetwork = () => {
        // Inherit ConceptNetwork
        return ConceptNetwork();
      };
      var derived = DerivedConceptNetwork();
      expect(derived).toHaveProperty('addLink');
      expect(derived).toHaveProperty('addNode');
      expect(derived).toHaveProperty('addNodes');
      expect(derived).toHaveProperty('decrementLink');
      expect(derived).toHaveProperty('decrementNode');
      expect(derived).toHaveProperty('getLink');
      expect(derived).toHaveProperty('getNode');
      expect(derived).toHaveProperty('getNodeById');
      expect(derived).toHaveProperty('getNodeFromLinks');
      expect(derived).toHaveProperty('getNodeToLinks');
      expect(derived).toHaveProperty('removeLink');
      expect(derived).toHaveProperty('removeNode');
    });
  });

  let cn;

  describe('addNode', () => {
    beforeAll(() => {
      cn = ConceptNetwork();
    });

    it('should return an object', async () => {
      const node = await cn.addNode({ label: 'Chuck Norris' });
      expect(node.id).toBe(0);
      expect(node.label).toBe('Chuck Norris');
      expect(node.occ).toBe(1);
    });

    it('should increment occ', async () => {
      const node = await cn.addNode({ label: 'Chuck Norris' });
      expect(node.id).toBe(0);
      expect(node.occ).toBe(2);
    });

    it('should increment nodeLastId', async () => {
      const node = await cn.addNode({ label: 'World' });
      expect(node.id).toBe(1);
      expect(cn.node).toHaveLength(2);
    });

    it('should increment a previous node too', async () => {
      const node = await cn.addNode({ label: 'Chuck Norris' });
      expect(node.id).toBe(0);
      expect(node.occ).toBe(3);
    });

    it('should increment more than one', async () => {
      const node = await cn.addNode({ label: 'Steven Seagal' }, 3);
      expect(node.id).toBe(2);
      expect(node.occ).toBe(3);
    });

    it('should accept a second argument with a undefined value', async () => {
      const node = await cn.addNode(
        { label: 'Jean-Claude Van Damme' },
        undefined
      );
      expect(node.id).toBe(3);
      expect(node.occ).toBe(1);
    });
  });

  describe('decrementNode', () => {
    it('should decrement a node with occ of 3', async () => {
      const node = await cn.decrementNode({ label: 'Chuck Norris' });
      expect(node.id).toBe(0);
      expect(node.occ).toBe(2);
    });

    it('should remove a node with an occ of 1', async () => {
      const node = await cn.decrementNode({ label: 'World' });
      expect(node).toBeNull();
    });

    it('should return null when node does not exist', async () => {
      const node = await cn.decrementNode({ label: 'unexisting' });
      expect(node).toBeNull();
    });
  });

  describe('addNodes', () => {
    beforeEach(() => {
      cn = ConceptNetwork();
    });

    it('should return an array', async () => {
      const nodes = await cn.addNodes([{ label: 'node1' }, { label: 'node2' }]);
      expect(nodes).toBeInstanceOf(Array);
    });

    it('should return a good-sized array', async () => {
      const nodes = await cn.addNodes([{ label: 'node1' }, { label: 'node2' }]);
      expect(nodes).toHaveLength(2);
    });

    it('should return nodes', async () => {
      const nodes = await cn.addNodes([{ label: 'node1' }, { label: 'node2' }]);
      expect(nodes[0]).toHaveProperty('label');
      expect(nodes[0]).toHaveProperty('id');
      expect(nodes[0].id).toBe(0);
      expect(nodes[1]).toHaveProperty('label');
      expect(nodes[1]).toHaveProperty('id');
      expect(nodes[1].id).toBe(1);
    });
  });

  describe('removeNode', () => {
    beforeEach(async () => {
      cn = ConceptNetwork();
      const node1 = await cn.addNode({ label: 'Node 1' });
      node1.occ = 2;
      await cn.addNode({ label: 'Node 2' });
      await cn.addNode({ label: 'Node 3' });
      await cn.addNode({ label: 'Node 4' });
      await cn.addLink(1, 2);
      await cn.addLink(2, 3);
    });

    it('should remove even a node with occ value of 2', async () => {
      expect(cn.node[0].occ).toBe(2);
      await cn.removeNode(cn.node[0].id);
      expect(cn.node[0]).toBeUndefined();
    });

    it('should remove the links from the removed node', async () => {
      await cn.removeNode(2);
      expect(cn.link['2_3']).toBeUndefined();
    });

    it('should remove the links to the removed node', async () => {
      await cn.removeNode(4);
      expect(cn.link['3_4']).toBeUndefined();
    });
  });

  describe('addLink', () => {
    beforeAll(async () => {
      cn = new ConceptNetwork();
      await cn.addNode({ label: 'Node 1' });
      await cn.addNode({ label: 'Node 2' });
      await cn.addNode({ label: 'Node 3' });
    });

    it('should return an object', async () => {
      const link = await cn.addLink(1, 2);
      expect(link).toBeInstanceOf(Object);
      expect(link.coOcc).toBe(1);
    });

    it('should increment coOcc', async () => {
      const link = await cn.addLink(1, 2);
      expect(link.coOcc).toBe(2);
    });

    it('should increment with more than 1', async () => {
      const link = await cn.addLink(1, 2, 4);
      expect(link.coOcc).toBe(6);
    });

    it('should create a good fromIndex', async () => {
      await cn.addLink(1, 3);
      expect(Array.from(cn.fromIndex[1].values())).toEqual(['1_2', '1_3']);
    });

    it('should not accept non number ids', async () => {
      try {
        await cn.addLink(1, 'berf');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
      try {
        await cn.addLink('barf', 2);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
    });

    it('should increment by 1, without an inc', async () => {
      const link = await cn.addLink(1, 2, undefined);
      expect(link.coOcc).toBe(7);
    });
  });

  describe('decrementLink', () => {
    beforeAll(async () => {
      cn = ConceptNetwork();
      await cn.addNode({ label: 'Node 1' });
      await cn.addNode({ label: 'Node 2' });
      await cn.addLink(1, 2);
      await cn.addLink(1, 2);
    });

    it('should decrement a coOcc value of 2', async () => {
      expect(cn.link['1_2'].coOcc).toBe(2);
      await cn.decrementLink('1_2');
      expect(cn.link['1_2'].coOcc).toBe(1);
    });

    it('should remove a link with a coOcc value of 0', async () => {
      expect(cn.link['1_2'].coOcc).toBe(1);
      await cn.decrementLink('1_2');
      expect(cn.link['1_2']).toBeUndefined();
    });
  });

  describe('removeLink', () => {
    beforeEach(async () => {
      cn = ConceptNetwork();
      await cn.addNode({ label: 'Node 1' });
      await cn.addNode({ label: 'Node 2' });
      await cn.addLink(1, 2);
    });

    it('should remove the link', async () => {
      expect(cn.link['1_2']).toEqual({ fromId: 1, toId: 2, coOcc: 1 });
      await cn.removeLink('1_2');
      expect(cn.link['1_2']).toBeUndefined();
    });

    it('should remove the link, even with a toId', async () => {
      expect(cn.link['1_2']).toEqual({ fromId: 1, toId: 2, coOcc: 1 });
      await cn.removeLink(1, 2);
      expect(cn.link['1_2']).toBeUndefined();
    });
  });

  describe('getters', () => {
    beforeAll(async () => {
      cn = ConceptNetwork();
      await cn.addNode({ label: 'Node 1' });
      await cn.addNode({ label: 'Node 2' });
      await cn.addNode({ label: 'Node 3' });
      await cn.addLink(0, 1);
      await cn.addLink(0, 2);
      await cn.addLink(1, 2);
    });

    describe('getNode', () => {
      it('should get the second node', async () => {
        const node = await cn.getNode({ label: 'Node 2' });
        expect(node.id).toBe(1);
      });

      it('should return undefined when the node does not exist', async () => {
        const node = await cn.getNode({ label: 'Nonexistent' });
        expect(node).toBeUndefined();
      });
    });

    describe('getLink', () => {
      it('should get the link', async () => {
        const link = await cn.getLink('1_2');
        expect(link.fromId).toBe(1);
        expect(link.toId).toBe(2);
        expect(link.coOcc).toBe(1);
      });

      it('should get the link with two parameters', async () => {
        const link = await cn.getLink(1, 2);
        expect(link.fromId).toBe(1);
        expect(link.toId).toBe(2);
        expect(link.coOcc).toBe(1);
      });

      it('should return undefined when the node does not exist', async () => {
        const link = await cn.getLink(1, 100);
        expect(link).toBeUndefined();
      });
    });

    describe('getNodeFromLinks', () => {
      it('should get all links from node 2', async () => {
        const fromLinks = await cn.getNodeFromLinks(1);
        expect(fromLinks).toEqual(['1_2']);
      });

      it('should get all links from node 1', async () => {
        const fromLinks = await cn.getNodeFromLinks(0);
        expect(fromLinks).toEqual(['0_1', '0_2']);
      });

      it('should get no links from node 3', async () => {
        const fromLinks = await cn.getNodeFromLinks(2);
        expect(fromLinks).toEqual([]);
      });
    });

    describe('getNodeToLinks', () => {
      it('should get all links to node 2', async () => {
        const toLinks = await cn.getNodeToLinks(1);
        expect(toLinks).toEqual(['0_1']);
      });

      it('should get all links to node 3', async () => {
        const toLinks = await cn.getNodeToLinks(2);
        expect(toLinks).toEqual(['0_2', '1_2']);
      });

      it('should get no links to node 1', async () => {
        const toLinks = await cn.getNodeToLinks(0);
        expect(toLinks).toEqual([]);
      });
    });
  });
});
