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

    it('should return an object', () => {
      return cn.addNode({ label: 'Chuck Norris' }).then(node => {
        expect(node.id).toBe(0);
        expect(node.label).toBe('Chuck Norris');
        expect(node.occ).toBe(1);
      });
    });

    it('should increment occ', () => {
      return cn.addNode({ label: 'Chuck Norris' }).then(node => {
        expect(node.id).toBe(0);
        expect(node.occ).toBe(2);
      });
    });

    it('should increment nodeLastId', () => {
      return cn.addNode({ label: 'World' }).then(node => {
        expect(node.id).toBe(1);
        expect(cn.node).toHaveLength(2);
      });
    });

    it('should increment a previous node too', () => {
      return cn.addNode({ label: 'Chuck Norris' }).then(node => {
        expect(node.id).toBe(0);
        expect(node.occ).toBe(3);
      });
    });

    it('should increment more than one', () => {
      return cn.addNode({ label: 'Steven Seagal' }, 3).then(node => {
        expect(node.id).toBe(2);
        expect(node.occ).toBe(3);
      });
    });

    it('should accept a second argument with a undefined value', () => {
      return cn
        .addNode({ label: 'Jean-Claude Van Damme' }, undefined)
        .then(node => {
          expect(node.id).toBe(3);
          expect(node.occ).toBe(1);
        });
    });
  });

  describe('decrementNode', () => {
    it('should decrement a node with occ of 3', () => {
      return cn.decrementNode({ label: 'Chuck Norris' }).then(node => {
        expect(node.id).toBe(0);
        expect(node.occ).toBe(2);
      });
    });

    it('should remove a node with an occ of 1', () => {
      return cn.decrementNode({ label: 'World' }).then(node => {
        expect(node).toBeNull();
      });
    });

    it('should return null when node does not exist', () => {
      return cn.decrementNode({ label: 'unexisting' }).then(node => {
        expect(node).toBeNull();
      });
    });
  });

  describe('addNodes', () => {
    beforeEach(() => {
      cn = ConceptNetwork();
    });

    it('should return an array', () => {
      return cn
        .addNodes([{ label: 'node1' }, { label: 'node2' }])
        .then(nodes => {
          expect(nodes).toBeInstanceOf(Array);
        });
    });

    it('should return a good-sized array', () => {
      return cn
        .addNodes([{ label: 'node1' }, { label: 'node2' }])
        .then(nodes => {
          expect(nodes).toHaveLength(2);
        });
    });

    it('should return nodes', () => {
      return cn
        .addNodes([{ label: 'node1' }, { label: 'node2' }])
        .then(nodes => {
          expect(nodes[0]).toHaveProperty('label');
          expect(nodes[0]).toHaveProperty('id');
          expect(nodes[0].id).toBe(0);
          expect(nodes[1]).toHaveProperty('label');
          expect(nodes[1]).toHaveProperty('id');
          expect(nodes[1].id).toBe(1);
        });
    });
  });

  describe('removeNode', () => {
    beforeEach(() => {
      cn = ConceptNetwork();
      return cn
        .addNode({ label: 'Node 1' })
        .then(node1 => {
          node1.occ = 2;
          return cn.addNode({ label: 'Node 2' });
        })
        .then(node2 => {
          return cn.addNode({ label: 'Node 3' });
        })
        .then(node3 => {
          return cn.addNode({ label: 'Node 4' });
        })
        .then(node4 => {
          return cn.addLink(1, 2);
        })
        .then(link23 => {
          return cn.addLink(2, 3);
        });
    });

    it('should remove even a node with occ value of 2', () => {
      expect(cn.node[0].occ).toBe(2);
      return cn.removeNode(cn.node[0].id).then(() => {
        expect(cn.node[0]).toBeUndefined();
      });
    });

    it('should remove the links from the removed node', () => {
      return cn.removeNode(2).then(() => {
        expect(cn.link['2_3']).toBeUndefined();
      });
    });

    it('should remove the links to the removed node', () => {
      return cn.removeNode(4).then(() => {
        expect(cn.link['3_4']).toBeUndefined();
      });
    });
  });

  describe('addLink', () => {
    beforeAll(() => {
      cn = new ConceptNetwork();
      return cn
        .addNode({ label: 'Node 1' })
        .then(node1 => {
          return cn.addNode({ label: 'Node 2' });
        })
        .then(node2 => {
          return cn.addNode({ label: 'Node 3' });
        });
    });

    it('should return an object', () => {
      return cn.addLink(1, 2).then(link => {
        expect(link).toBeInstanceOf(Object);
        expect(link.coOcc).toBe(1);
      });
    });

    it('should increment coOcc', () => {
      return cn.addLink(1, 2).then(link => {
        expect(link.coOcc).toBe(2);
      });
    });

    it('should increment with more than 1', () => {
      return cn.addLink(1, 2, 4).then(link => {
        expect(link.coOcc).toBe(6);
      });
    });

    it('should create a good fromIndex', () => {
      return cn.addLink(1, 3).then(link => {
        expect(Array.from(cn.fromIndex[1].values())).toEqual(['1_2', '1_3']);
      });
    });

    it('should not accept non number ids', done => {
      cn
        .addLink(1, 'berf')
        .then(link => {})
        .catch(err => {
          expect(err).toBeInstanceOf(Error);
        })
        .then(() => {
          return cn.addLink('barf', 2);
        })
        .catch(err => {
          expect(err).toBeInstanceOf(Error);
          done();
        });
    });

    it('should increment by 1, without an inc', () => {
      return cn.addLink(1, 2, undefined).then(link => {
        expect(link.coOcc).toBe(7);
      });
    });
  });

  describe('decrementLink', () => {
    beforeAll(() => {
      cn = ConceptNetwork();
      return cn
        .addNode({ label: 'Node 1' })
        .then(node1 => {
          return cn.addNode({ label: 'Node 2' });
        })
        .then(node2 => {
          return cn.addLink(1, 2);
        })
        .then(link => {
          return cn.addLink(1, 2);
        });
    });

    it('should decrement a coOcc value of 2', () => {
      expect(cn.link['1_2'].coOcc).toBe(2);
      return cn.decrementLink('1_2').then(link => {
        expect(cn.link['1_2'].coOcc).toBe(1);
      });
    });

    it('should remove a link with a coOcc value of 0', () => {
      expect(cn.link['1_2'].coOcc).toBe(1);
      return cn.decrementLink('1_2').then(() => {
        expect(cn.link['1_2']).toBeUndefined();
      });
    });
  });

  describe('removeLink', () => {
    beforeEach(() => {
      cn = ConceptNetwork();
      return cn
        .addNode({ label: 'Node 1' })
        .then(() => {
          return cn.addNode({ label: 'Node 2' });
        })
        .then(() => {
          return cn.addLink(1, 2);
        });
    });

    it('should remove the link', () => {
      expect(cn.link['1_2']).toEqual({ fromId: 1, toId: 2, coOcc: 1 });
      return cn.removeLink('1_2').then(() => {
        expect(cn.link['1_2']).toBeUndefined();
      });
    });

    it('should remove the link, even with a toId', () => {
      expect(cn.link['1_2']).toEqual({ fromId: 1, toId: 2, coOcc: 1 });
      return cn.removeLink(1, 2).then(() => {
        expect(cn.link['1_2']).toBeUndefined();
      });
    });
  });

  describe('getters', () => {
    beforeAll(() => {
      cn = ConceptNetwork();
      return cn
        .addNode({ label: 'Node 1' })
        .then(() => {
          return cn.addNode({ label: 'Node 2' });
        })
        .then(() => {
          return cn.addNode({ label: 'Node 3' });
        })
        .then(() => {
          return cn.addLink(0, 1);
        })
        .then(() => {
          return cn.addLink(0, 2);
        })
        .then(() => {
          return cn.addLink(1, 2);
        });
    });

    describe('getNode', () => {
      it('should get the second node', () => {
        return cn.getNode({ label: 'Node 2' }).then(node => {
          expect(node.id).toBe(1);
        });
      });

      it('should return undefined when the node does not exist', () => {
        return cn.getNode({ label: 'Nonexistent' }).then(node => {
          expect(node).toBeUndefined();
        });
      });
    });

    describe('getLink', () => {
      it('should get the link', () => {
        return cn.getLink('1_2').then(link => {
          expect(link.fromId).toBe(1);
          expect(link.toId).toBe(2);
          expect(link.coOcc).toBe(1);
        });
      });

      it('should get the link with two parameters', () => {
        return cn.getLink(1, 2).then(link => {
          expect(link.fromId).toBe(1);
          expect(link.toId).toBe(2);
          expect(link.coOcc).toBe(1);
        });
      });

      it('should return undefined when the node does not exist', () => {
        return cn.getLink(1, 100).then(link => {
          expect(link).toBeUndefined();
        });
      });
    });

    describe('getNodeFromLinks', () => {
      it('should get all links from node 2', () => {
        return cn.getNodeFromLinks(1).then(fromLinks => {
          expect(fromLinks).toEqual(['1_2']);
        });
      });

      it('should get all links from node 1', () => {
        return cn.getNodeFromLinks(0).then(fromLinks => {
          expect(fromLinks).toEqual(['0_1', '0_2']);
        });
      });

      it('should get no links from node 3', () => {
        return cn.getNodeFromLinks(2).then(fromLinks => {
          expect(fromLinks).toEqual([]);
        });
      });
    });

    describe('getNodeToLinks', () => {
      it('should get all links to node 2', () => {
        return cn.getNodeToLinks(1).then(toLinks => {
          expect(toLinks).toEqual(['0_1']);
        });
      });

      it('should get all links to node 3', () => {
        return cn.getNodeToLinks(2).then(toLinks => {
          expect(toLinks).toEqual(['0_2', '1_2']);
        });
      });

      it('should get no links to node 1', () => {
        return cn.getNodeToLinks(0).then(toLinks => {
          expect(toLinks).toEqual([]);
        });
      });
    });
  });
});
