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

      it('should create a sentence node', () => {
        var ector = Ector();
        return ector.addEntry('Hello.').then(nodes => {
          expect(ector.cn.node[1].label).toBe('Hello.');
          expect(ector.cn.node[1].type).toBe('s');
        });
      });

      it('should return an array of one word node', () => {
        var ector = Ector();
        return ector.addEntry('Hello.').then(nodes => {
          expect(nodes).not.toBeInstanceOf(Error);
          expect(nodes).toHaveLength(1);
          expect(nodes[0].label).toBe('Hello.');
          expect(nodes[0].type).toBe('w');
        });
      });

      it('should return an array of two word nodes', () => {
        var ector = Ector();
        return ector.addEntry('Hello world.').then(nodes => {
          expect(nodes).not.toBeInstanceOf(Error);
          expect(nodes).toHaveLength(2);
          expect(nodes[0].label).toBe('Hello');
          expect(nodes[0].type).toBe('w');
          expect(nodes[1].label).toBe('world.');
          expect(nodes[1].type).toBe('w');
        });
      });

      it('should add the nodes in the concept network', () => {
        var ector = Ector();
        var cn = ector.cn;
        expect(cn).not.toBeNull();
        return ector.addEntry('Hello world.').then(nodes => {
          expect(cn.node).toHaveLength(4);
        });
      });

      it('should add positions in the sentence', () => {
        var ector = Ector();
        return ector.addEntry('Salut tout le monde.').then(nodes => {
          expect(nodes[0].beg).toBe(1);
          expect(nodes[2].mid).toBe(1);
          expect(nodes[3].end).toBe(1);
        });
      });

      it('should increment positions in the sentence', () => {
        var ector = Ector();
        return ector
          .addEntry('Salut tout le monde.')
          .then(nodes => {
            return ector.addEntry('Salut le peuple du monde.');
          })
          .then(nodes2 => {
            expect(nodes2[0].beg).toBe(2);
            expect(nodes2[1].mid).toBe(2);
            expect(nodes2[2].mid).toBe(1);
            expect(nodes2[4].end).toBe(2);
          });
      });

      it('should add links between following tokens', () => {
        var ector = Ector();
        var cn = ector.cn;
        return ector.addEntry('Salut tout le monde.').then(nodes => {
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
      });

      it('should add links between sentence and its tokens', () => {
        var ector = Ector();
        var cn = ector.cn;
        return ector.addEntry('Salut tout le monde.').then(nodes => {
          expect(cn.link['1_2']).toEqual({ fromId: 1, toId: 2, coOcc: 1 });
          expect(cn.link['1_3']).toEqual({ fromId: 1, toId: 3, coOcc: 1 });
          expect(cn.link['1_4']).toEqual({ fromId: 1, toId: 4, coOcc: 1 });
          expect(cn.link['1_5']).toEqual({ fromId: 1, toId: 5, coOcc: 1 });
        });
      });

      it('should add links between following sentences', () => {
        var ector = Ector();
        var cn = ector.cn;
        return ector.addEntry('Ah! Oh.').then(nodes => {
          expect(cn.link['1_3']).toEqual({ fromId: 1, toId: 3, coOcc: 1 });
        });
      });

      it('should increment links between following tokens', () => {
        var ector = Ector();
        var cn = ector.cn;
        return ector
          .addEntry('Salut tout le monde.')
          .then(nodes => {
            expect(cn.link['2_3']).toEqual({ fromId: 2, toId: 3, coOcc: 1 });
            return ector.addEntry('Salut tout le peuple.');
          })
          .then(nodes => {
            expect(cn.link['2_3']).toEqual({ fromId: 2, toId: 3, coOcc: 2 });
          });
      });

      it('should create tokens from second sentence', () => {
        var ector = Ector();
        var cn = ector.cn;
        return ector.addEntry('Salut. Hello.').then(nodes => {
          expect(cn.node).toHaveLength(5);
        });
      });

      it('should create node for second sentence', () => {
        var ector = Ector();
        var cn = ector.cn;
        return ector.addEntry('Salut. Hello.').then(nodes => {
          expect(Object.keys(cn.nodeIndex)).toContain('sHello.');
        });
      });

      it('should count Hello as a beginning node.', () => {
        var ector = Ector();
        var cn = ector.cn;
        return ector.addEntry('Salut. Hello.').then(nodes => {
          expect(cn.node[4].beg).toBeInstanceOf(Number);
          expect(cn.node[4].beg).toBe(1);
          expect(cn.node[3].beg).toBeInstanceOf(Number);
          expect(cn.node[3].beg).toBe(1);
        });
      });
    });

    describe('in the ConceptNetworkState', () => {
      var ector, cn, cns;

      beforeAll(() => {
        ector = Ector();
        cn = ector.cn;
        cns = ConceptNetworkState(cn);
        return ector.addEntry('Sentence one.', cns);
      });

      describe('with a two-tokens sentence', () => {
        beforeAll(() => {
          return ector.addEntry('Sentence one.', cns);
        });

        it('should activate the sentence node', () => {
          return cns.getActivationValue(1).then(value => {
            expect(value).toBe(100);
          });
        });

        it('should activate the token node', () => {
          return cns
            .getActivationValue(2)
            .then(value2 => {
              expect(value2).toBe(100);
              return cns.getActivationValue(3);
            })
            .then(value3 => {
              expect(value3).toBe(100);
            });
        });
      });

      describe('with a one-token sentence', () => {
        beforeAll(() => {
          return ector.addEntry('Sentence.', cns);
        });

        it('should activate the sentence node', () => {
          return cns.getActivationValue(5).then(value => {
            expect(value).toBe(100);
          });
        });

        it('should activate the token node', () => {
          return cns.getActivationValue(6).then(value => {
            expect(value).toBe(100);
          });
        });
      });
    });
  });

  describe('Response', () => {
    // First time, only the same sentence is returned.
    it('should generate a response similar to the stimulus', () => {
      var ector = Ector('ECTOR', 'Guy');
      return ector.addEntry('Hello ECTOR.').then(nodes => {
        var response = ector.generateResponse();
        expect(response).toEqual({ sentence: 'Hello Guy.', nodes: [2, 3] });
      });
    });

    it('should replace both names', () => {
      var ector = Ector('ECTOR', 'Guy');
      return ector.addEntry('Hello ECTOR and ECTOR.').then(nodes => {
        var response = ector.generateResponse();
        expect(response.sentence).toBe('Hello Guy and Guy.');
      });
    });
  });

  describe('PreviousSentenceNodeId', () => {
    it('should store the last sentence node id', () => {
      var ector = Ector('ECTOR', 'Guy');
      expect(ector.lastSentenceNodeId).toBeNull();
      return ector.addEntry('Hello ECTOR.').then(nodes => {
        expect(ector.lastSentenceNodeId).toEqual(1);
      });
    });

    describe('link nodes to lastSentenceNode', () => {
      it('should not create links when no lastSentenceNode exist', () => {
        var ector = Ector('ECTOR', 'Guy');
        return ector.addEntry('Hello.').then(nodes => {
          ector.lastSentenceNodeId = null;
          expect(() => {
            ector.linkNodesToLastSentence([2]);
          }).toThrow(Error);
        });
      });

      it('should not create link when null is given', () => {
        var ector = Ector('ECTOR', 'Guy');
        return ector.addEntry('Hello.').then(nodes => {
          ector.linkNodesToLastSentence(null);
          expect(ector.cn.link['2_']).toBeUndefined();
        });
      });

      it('should not create link when [] is given', () => {
        var ector = Ector('ECTOR', 'Guy');
        return ector.addEntry('Hello.').then(nodes => {
          ector.linkNodesToLastSentence([]);
          expect(ector.cn.link['2_']).toBeUndefined();
        });
      });

      it('should create links', () => {
        var ector = Ector('ECTOR', 'Guy');
        return ector.addEntry('Hello.').then(nodes => {
          // 1 link from sentenceNode to the only tokenNode
          // sHello. (1) -> wHello. (2)
          expect(ector.cn.link['2_1']).toBeUndefined();
          ector.linkNodesToLastSentence([2]);
          expect(ector.cn.link['2_1']).toBeInstanceOf(Object);
        });
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

  it('should work as a normal ConceptNetwork', () => {
    ector.ConceptNetwork = StrangeConceptNetwork;
    return ector.addEntry('Hello ECTOR.').then(nodes => {
      var res = ector.generateResponse();
      expect(res.sentence).toBe('Hello Guy.');
    });
  });

  it('should have its supplemental methods', () => {
    ector.ConceptNetwork = StrangeConceptNetwork;
    expect(ector.cns.Guy.cn.strange).toBeInstanceOf(Function);
  });
});
