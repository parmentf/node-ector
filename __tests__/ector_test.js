import Debug from 'debug';
const debug = Debug('ector:test');
import { ConceptNetworkState } from '../lib/concept-network-state';
import { ConceptNetwork } from '../lib/concept-network';
import { Ector } from '../lib/ector';

describe('Constructor', () => {
  describe('No botname', () => {
    it('should not throw an exception', () => {
      expect(() => {
        Ector();
      }).not.toThrow();
    });

    it('should be ECTOR', () => {
      var ector = Ector();
      expect(ector.name).toBe('ECTOR');
    });
  });

  describe('A new botname', () => {
    it('should get the given name', () => {
      var ector = Ector('Nestor');
      expect(ector.name).toBe('Nestor');
    });
  });

  describe('Bad botname', () => {
    it('should not be a number', () => {
      var ector = Ector(1);
      expect(ector.name).toBe('ECTOR');
    });
  });

  describe('Usernames', () => {
    describe('No username', () => {
      it('should be "Guy"', () => {
        var ector = Ector();
        expect(ector.user).toBe('Guy');
      });
    });

    describe('Bad username', () => {
      it('should not be a number', () => {
        var ector = Ector(null, 1);
        expect(ector.name).toBe('ECTOR');
        expect(ector.user).toBe('Guy');
      });

      it('should not be a too short', () => {
        var ector = Ector(null, 'Al');
        expect(ector.user).toBe('Guy');
      });
    });

    describe('ConceptNetworkState', () => {
      it('should add one, for the default username', () => {
        var ector = Ector(null, 'Guy');
        expect(ector.cns['Guy']).toBeInstanceOf(Object);
      });

      it('should add one, for an unknown username', () => {
        var ector = Ector(null, 'Guy');
        ector.user = 'Chuck';
        expect(ector.cns['Chuck']).toBeInstanceOf(Object);
      });
    });
  });
});

describe('Users', () => {
  describe('Change username', () => {
    it('should change for another string', () => {
      var ector = Ector();
      expect(ector.user).toBe('Guy');
      ector.user = 'Chuck';
      expect(ector.user).toBe('Chuck');
    });

    it('should not work with a number', () => {
      var ector = Ector();
      expect(ector.user).toBe('Guy');
      ector.user = 1;
      expect(ector.user).toBe('Guy');
    });

    it('should not be an empty name', () => {
      var ector = Ector();
      expect(ector.user).toBe('Guy');
      ector.user = '';
      expect(ector.user).toBe('Guy');
    });

    it('should not be too short (< 3)', () => {
      var ector = Ector();
      expect(ector.user).toBe('Guy');
      ector.user = 'Al';
      expect(ector.user).toBe('Guy');
    });

    it('should reset the lastSentenceNodeId', () => {
      var ector = Ector();
      ector.lastSentenceNodeId = 1;
      ector.user = 'Ali';
      expect(ector.lastSentenceNodeId).toBeNull();
    });

    //    it('should not be changed using property _username', function () {
    //      var ector = new Ector()
    //      assert.equal(ector.user, "Guy")
    //      ector._username = "Nope"
    //      assert.equal(ector.user, "Guy")
    //    })
  });
});

describe('Bot', () => {
  describe('Change botname', () => {
    it('should change for another string', () => {
      var ector = Ector();
      expect(ector.name).toBe('ECTOR');
      ector.name = 'Norris';
      expect(ector.name).toBe('Norris');
    });

    it('should not work with a number', () => {
      var ector = Ector();
      expect(ector.name).toBe('ECTOR');
      ector.name = 1;
      expect(ector.name).toBe('ECTOR');
    });
  });

  describe('Add an entry', () => {
    describe('in the Concept Network', () => {
      it('should return an error when entry is empty', done => {
        const ector = Ector();
        ector.addEntry('').catch(() => {
          done();
        });
      });

      it('should return an error when entry is not a string', done => {
        var ector = Ector();
        ector.addEntry().catch(() => {
          done();
        });
      });

      it('should create a sentence node', async () => {
        var ector = Ector();
        const nodes = await ector.addEntry('Hello.');
        expect(ector.cn.node[1].label).toBe('Hello.');
        expect(ector.cn.node[1].type).toBe('s');
      });

      it('should return an array of one word node', async () => {
        var ector = Ector();
        const nodes = await ector.addEntry('Hello.');
        expect(nodes).not.toBeInstanceOf(Error);
        expect(nodes).toHaveLength(1);
        expect(nodes[0].label).toBe('Hello.');
        expect(nodes[0].type).toBe('w');
      });

      it('should return an array of two word nodes', async () => {
        var ector = Ector();
        const nodes = await ector.addEntry('Hello world.');
        expect(nodes).not.toBeInstanceOf(Error);
        expect(nodes).toHaveLength(2);
        expect(nodes[0].label).toBe('Hello');
        expect(nodes[0].type).toBe('w');
        expect(nodes[1].label).toBe('world.');
        expect(nodes[1].type).toBe('w');
      });

      it('should add the nodes in the concept network', async () => {
        var ector = Ector();
        var cn = ector.cn;
        expect(cn).not.toBeNull();
        await ector.addEntry('Hello world.');
        expect(cn.node).toHaveLength(4);
      });

      it('should add positions in the sentence', async () => {
        var ector = Ector();
        const nodes = await ector.addEntry('Salut tout le monde.');
        expect(nodes[0].beg).toBe(1);
        expect(nodes[2].mid).toBe(1);
        expect(nodes[3].end).toBe(1);
      });

      it('should increment positions in the sentence', async () => {
        var ector = Ector();
        await ector.addEntry('Salut tout le monde.');
        const nodes2 = await ector.addEntry('Salut le peuple du monde.');
        expect(nodes2[0].beg).toBe(2);
        expect(nodes2[1].mid).toBe(2);
        expect(nodes2[2].mid).toBe(1);
        expect(nodes2[4].end).toBe(2);
      });

      it('should add links between following tokens', async () => {
        var ector = Ector();
        var cn = ector.cn;
        await ector.addEntry('Salut tout le monde.');
        expect(cn.link['2_3']).toEqual({
          fromId: 2,
          toId: 3,
          coOcc: 1
        });
        expect(cn.link['3_4']).toEqual({
          fromId: 3,
          toId: 4,
          coOcc: 1
        });
        expect(cn.link['4_5']).toEqual({
          fromId: 4,
          toId: 5,
          coOcc: 1
        });
      });

      it('should add links between sentence and its tokens', async () => {
        var ector = Ector();
        var cn = ector.cn;
        await ector.addEntry('Salut tout le monde.');
        expect(cn.link['1_2']).toEqual({ fromId: 1, toId: 2, coOcc: 1 });
        expect(cn.link['1_3']).toEqual({ fromId: 1, toId: 3, coOcc: 1 });
        expect(cn.link['1_4']).toEqual({ fromId: 1, toId: 4, coOcc: 1 });
        expect(cn.link['1_5']).toEqual({ fromId: 1, toId: 5, coOcc: 1 });
      });

      it('should add links between following sentences', async () => {
        var ector = Ector();
        var cn = ector.cn;
        await ector.addEntry('Ah! Oh.');
        expect(cn.link['1_3']).toEqual({ fromId: 1, toId: 3, coOcc: 1 });
      });

      it('should increment links between following tokens', async () => {
        var ector = Ector();
        var cn = ector.cn;
        await ector.addEntry('Salut tout le monde.');
        expect(cn.link['2_3']).toEqual({ fromId: 2, toId: 3, coOcc: 1 });
        await ector.addEntry('Salut tout le peuple.');
        expect(cn.link['2_3']).toEqual({ fromId: 2, toId: 3, coOcc: 2 });
      });

      it('should create tokens from second sentence', async () => {
        var ector = Ector();
        var cn = ector.cn;
        await ector.addEntry('Salut. Hello.');
        expect(cn.node).toHaveLength(5);
      });

      it('should create node for second sentence', async () => {
        var ector = Ector();
        var cn = ector.cn;
        await ector.addEntry('Salut. Hello.');
        expect(Object.keys(cn.nodeIndex)).toContain('sHello.');
      });

      it('should count Hello as a beginning node.', async () => {
        var ector = Ector();
        var cn = ector.cn;
        await ector.addEntry('Salut. Hello.');
        expect(cn.node[4].beg).toBeInstanceOf(Number);
        expect(cn.node[3].beg).toBeInstanceOf(Number);
        expect(cn.node[3].beg).toBe(1);
      });
    });

    describe('in the ConceptNetworkState', () => {
      var ector, cn, cns;

      beforeAll(async () => {
        ector = Ector();
        cn = ector.cn;
        cns = ConceptNetworkState(cn);
        await ector.addEntry('Sentence one.', cns);
      });

      describe('with a two-tokens sentence', () => {
        beforeAll(async () => {
          await ector.addEntry('Sentence one.', cns);
        });

        it('should activate the sentence node', async () => {
          const value = await cns.getActivationValue(1);
          expect(value).toBe(100);
        });

        it('should activate the token node', async () => {
          const value2 = await cns.getActivationValue(2);
          expect(value2).toBe(100);
          const value3 = await cns.getActivationValue(3);
          expect(value3).toBe(100);
        });
      });

      describe('with a one-token sentence', () => {
        beforeAll(async () => {
          await ector.addEntry('Sentence.', cns);
        });

        it('should activate the sentence node', async () => {
          const value = await cns.getActivationValue(5);
          expect(value).toBe(100);
        });

        it('should activate the token node', async () => {
          const value = await cns.getActivationValue(6);
          expect(value).toBe(100);
        });
      });
    });
  });

  describe('Response', () => {
    // First time, only the same sentence is returned.
    it('should generate a response similar to the stimulus', async () => {
      const ector = Ector('ECTOR', 'Guy');
      await ector.addEntry('Hello ECTOR.');
      const response = ector.generateResponse();
      expect(response).toEqual({ sentence: 'Hello Guy.', nodes: [2, 3] });
    });

    it('should replace both names', async () => {
      const ector = Ector('ECTOR', 'Guy');
      await ector.addEntry('Hello ECTOR and ECTOR.');
      const response = ector.generateResponse();
      expect(response.sentence).toBe('Hello Guy and Guy.');
    });
  });

  describe('PreviousSentenceNodeId', () => {
    it('should store the last sentence node id', async () => {
      const ector = Ector('ECTOR', 'Guy');
      expect(ector.lastSentenceNodeId).toBeNull();
      await ector.addEntry('Hello ECTOR.');
      expect(ector.lastSentenceNodeId).toEqual(1);
    });

    describe('link nodes to lastSentenceNode', () => {
      it('should not create links when no lastSentenceNode exist', async () => {
        const ector = Ector('ECTOR', 'Guy');
        await ector.addEntry('Hello.');
        ector.lastSentenceNodeId = null;
        expect(() => {
          ector.linkNodesToLastSentence([2]);
        }).toThrow(Error);
      });

      it('should not create link when null is given', async () => {
        const ector = Ector('ECTOR', 'Guy');
        await ector.addEntry('Hello.');
        ector.linkNodesToLastSentence(null);
        expect(ector.cn.link['2_']).toBeUndefined();
      });

      it('should not create link when [] is given', async () => {
        const ector = Ector('ECTOR', 'Guy');
        await ector.addEntry('Hello.');
        ector.linkNodesToLastSentence([]);
        expect(ector.cn.link['2_']).toBeUndefined();
      });

      it('should create links', async () => {
        const ector = Ector('ECTOR', 'Guy');
        await ector.addEntry('Hello.');
        // 1 link from sentenceNode to the only tokenNode
        // sHello. (1) -> wHello. (2)
        expect(ector.cn.link['2_1']).toBeUndefined();
        ector.linkNodesToLastSentence([2]);
        expect(ector.cn.link['2_1']).toBeInstanceOf(Object);
      });
    });
  });
});

describe('Injector', () => {
  // Define a Fake derived ConceptNetwork
  const StrangeConceptNetwork = () => {
    const cn = ConceptNetwork();
    cn.strange = () => {
      return 'Did you say strange?';
    };
    return cn;
  };
  let ector = null;

  beforeAll(() => {
    ector = Ector('ECTOR', 'Guy');
  });

  it('should accept another ConceptNetwork', () => {
    ector.ConceptNetwork = StrangeConceptNetwork;
    expect(ector.cn).toHaveProperty('node');
    expect(ector.cn).toHaveProperty('strange');
    expect(ector.cn.strange()).toBe('Did you say strange?');
  });

  it('should not accept another class for ConceptNetwork', () => {
    expect(() => {
      ector.ConceptNetwork = ConceptNetworkState;
    }).toThrow(Error);
  });

  it('should work as a normal ConceptNetwork', async () => {
    ector.ConceptNetwork = StrangeConceptNetwork;
    await ector.addEntry('Hello ECTOR.');
    const res = ector.generateResponse();
    expect(res.sentence).toBe('Hello Guy.');
  });

  it('should have its supplemental methods', () => {
    ector.ConceptNetwork = StrangeConceptNetwork;
    expect(ector.cns.Guy.cn.strange).toBeInstanceOf(Function);
  });
});
