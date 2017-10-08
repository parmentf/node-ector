/* eslint-env mocha*/
'use strict';

// ## Required libraries
var debug = require('debug')('ector:test'); // eslint-disable-line no-unused-vars
var assert = require('assert'); // Maybe one day "should"?
const expect = require('chai').expect;
var ConceptNetworkState = require('../lib/concept-network-state')
  .ConceptNetworkState;
var ConceptNetwork = require('../lib/concept-network').ConceptNetwork;

var Ector = require('../lib/ector.js').Ector;

describe('Constructor', function() {
  describe('No botname', function() {
    it('should not throw an exception', function() {
      assert.doesNotThrow(
        function() {
          Ector();
        },
        null,
        'unexpected error'
      );
    });

    it('should be ECTOR', function() {
      var ector = Ector();
      assert.equal(ector.name, 'ECTOR', "ECTOR's name is not ECTOR!");
    });
  });

  describe('A new botname', function() {
    it('should get the given name', function() {
      var ector = Ector('Nestor');
      assert.equal(ector.name, 'Nestor', "ECTOR's name should be Nestor");
    });
  });

  describe('Bad botname', function() {
    it('should not be a number', function() {
      var ector = Ector(1);
      assert.equal(ector.name, 'ECTOR');
    });
  });

  describe('Usernames', function() {
    describe('No username', function() {
      it('should be "Guy"', function() {
        var ector = Ector();
        assert.equal(ector.user, 'Guy', "ECTOR's username should be Guy");
      });
    });

    describe('Bad username', function() {
      it('should not be a number', function() {
        var ector = Ector(null, 1);
        assert.equal(ector.name, 'ECTOR');
        assert.equal(ector.user, 'Guy');
      });

      it('should not be a too short', function() {
        var ector = Ector(null, 'Al');
        assert.equal(ector.user, 'Guy');
      });
    });

    describe('ConceptNetworkState', function() {
      it('should add one, for the default username', function() {
        var ector = Ector(null, 'Guy');
        assert.equal(typeof ector.cns['Guy'], 'object');
      });

      it('should add one, for an unknown username', function() {
        var ector = Ector(null, 'Guy');
        ector.user = 'Chuck';
        assert.equal(typeof ector.cns['Chuck'], 'object');
      });
    });
  });
});

describe('Users', function() {
  describe('Change username', function() {
    it('should change for another string', function() {
      var ector = Ector();
      assert.equal(ector.user, 'Guy');
      ector.user = 'Chuck';
      assert.equal(ector.user, 'Chuck');
    });

    it('should not work with a number', function() {
      var ector = Ector();
      assert.equal(ector.user, 'Guy');
      ector.user = 1;
      assert.equal(ector.user, 'Guy');
    });

    it('should not be an empty name', function() {
      var ector = Ector();
      assert.equal(ector.user, 'Guy');
      ector.user = '';
      assert.equal(ector.user, 'Guy');
    });

    it('should not be too short (< 3)', function() {
      var ector = Ector();
      assert.equal(ector.user, 'Guy');
      ector.user = 'Al';
      assert.equal(ector.user, 'Guy');
    });

    it('should reset the lastSentenceNodeId', function() {
      var ector = Ector();
      ector.lastSentenceNodeId = 1;
      ector.user = 'Ali';
      assert.equal(ector.lastSentenceNodeId, null);
    });

    //    it('should not be changed using property _username', function () {
    //      var ector = new Ector()
    //      assert.equal(ector.user, "Guy")
    //      ector._username = "Nope"
    //      assert.equal(ector.user, "Guy")
    //    })
  });
});

// ### Bot
describe('Bot', function() {
  describe('Change botname', function() {
    it('should change for another string', function() {
      var ector = Ector();
      assert.equal(ector.name, 'ECTOR');
      ector.name = 'Norris';
      assert.equal(ector.name, 'Norris');
    });

    it('should not work with a number', function() {
      var ector = Ector();
      assert.equal(ector.name, 'ECTOR');
      ector.name = 1;
      assert.equal(ector.name, 'ECTOR');
    });
  });

  describe('Add an entry', function() {
    describe('in the Concept Network', function(done) {
      it('should return an error when entry is empty', function() {
        const ector = Ector();
        ector.addEntry('').catch(() => {
          done();
        });
      });

      it('should return an error when entry is not a string', function(done) {
        var ector = Ector();
        ector.addEntry().catch(() => {
          done();
        });
      });

      it('should create a sentence node', function() {
        var ector = Ector();
        return ector.addEntry('Hello.').then(nodes => {
          expect(ector.cn.node[1].label).to.be.equal('Hello.');
          expect(ector.cn.node[1].type).to.be.equal('s');
        });
      });

      it('should return an array of one word node', function() {
        var ector = Ector();
        return ector.addEntry('Hello.').then(nodes => {
          expect(nodes).to.not.be.an('error');
          expect(nodes).to.be.lengthOf(1);
          expect(nodes[0].label).to.be.equal('Hello.');
          expect(nodes[0].type).to.be.equal('w');
        });
      });

      it('should return an array of two word nodes', function() {
        var ector = Ector();
        return ector.addEntry('Hello world.').then(nodes => {
          expect(nodes).to.not.be.an('error');
          expect(nodes).to.be.lengthOf(2);
          expect(nodes[0].label).to.be.equal('Hello');
          expect(nodes[0].type).to.be.equal('w');
          expect(nodes[1].label).to.be.equal('world.');
          expect(nodes[1].type).to.be.equal('w');
        });
      });

      it('should add the nodes in the concept network', function() {
        var ector = Ector();
        var cn = ector.cn;
        expect(cn).to.be.not.null;
        return ector.addEntry('Hello world.').then(nodes => {
          expect(cn.node).to.be.lengthOf(4);
        });
      });

      it('should add positions in the sentence', function() {
        var ector = Ector();
        return ector.addEntry('Salut tout le monde.').then(nodes => {
          expect(nodes[0].beg).to.be.equal(1);
          expect(nodes[2].mid).to.be.equal(1);
          expect(nodes[3].end).to.be.equal(1);
        });
      });

      it('should increment positions in the sentence', function() {
        var ector = Ector();
        return ector
          .addEntry('Salut tout le monde.')
          .then(nodes => {
            return ector.addEntry('Salut le peuple du monde.');
          })
          .then(nodes2 => {
            expect(nodes2[0].beg).to.be.equal(2);
            expect(nodes2[1].mid).to.be.equal(2);
            expect(nodes2[2].mid).to.be.equal(1);
            expect(nodes2[4].end).to.be.equal(2);
          });
      });

      it('should add links between following tokens', function() {
        var ector = Ector();
        var cn = ector.cn;
        return ector.addEntry('Salut tout le monde.').then(nodes => {
          expect(cn.link['2_3']).to.be.deep.equal({
            fromId: 2,
            toId: 3,
            coOcc: 1,
          });
          expect(cn.link['3_4']).to.be.deep.equal({
            fromId: 3,
            toId: 4,
            coOcc: 1,
          });
          expect(cn.link['4_5']).to.be.deep.equal({
            fromId: 4,
            toId: 5,
            coOcc: 1,
          });
        });
      });

      it('should add links between sentence and its tokens', function() {
        var ector = Ector();
        var cn = ector.cn;
        return ector.addEntry('Salut tout le monde.').then(nodes => {
          expect(cn.link['1_2']).to.eql({ fromId: 1, toId: 2, coOcc: 1 });
          expect(cn.link['1_3']).to.eql({ fromId: 1, toId: 3, coOcc: 1 });
          expect(cn.link['1_4']).to.eql({ fromId: 1, toId: 4, coOcc: 1 });
          expect(cn.link['1_5']).to.eql({ fromId: 1, toId: 5, coOcc: 1 });
        });
      });

      it('should add links between following sentences', function() {
        var ector = Ector();
        var cn = ector.cn;
        return ector.addEntry('Ah! Oh.').then(nodes => {
          expect(cn.link['1_3']).to.eql({ fromId: 1, toId: 3, coOcc: 1 });
        });
      });

      it('should increment links between following tokens', function() {
        var ector = Ector();
        var cn = ector.cn;
        return ector
          .addEntry('Salut tout le monde.')
          .then(nodes => {
            expect(cn.link['2_3']).to.eql({ fromId: 2, toId: 3, coOcc: 1 });
            return ector.addEntry('Salut tout le peuple.');
          })
          .then(nodes => {
            expect(cn.link['2_3']).to.eql({ fromId: 2, toId: 3, coOcc: 2 });
          });
      });

      it('should create tokens from second sentence', function() {
        var ector = Ector();
        var cn = ector.cn;
        return ector.addEntry('Salut. Hello.').then(nodes => {
          expect(cn.node).to.be.lengthOf(5);
        });
      });

      it('should create node for second sentence', function() {
        var ector = Ector();
        var cn = ector.cn;
        return ector.addEntry('Salut. Hello.').then(nodes => {
          expect(cn.nodeIndex).to.have.any.keys('sHello.');
        });
      });

      it('should count Hello as a beginning node.', function() {
        var ector = Ector();
        var cn = ector.cn;
        return ector.addEntry('Salut. Hello.').then(nodes => {
          expect(cn.node[4].beg).to.be.a('number');
          expect(cn.node[4].beg).to.be.equal(1);
          expect(cn.node[3].beg).to.be.a('number');
          expect(cn.node[3].beg).to.be.equal(1);
        });
      });
    });

    describe('in the ConceptNetworkState', function() {
      var ector, cn, cns;

      before(function() {
        ector = Ector();
        cn = ector.cn;
        cns = ConceptNetworkState(cn);
        return ector.addEntry('Sentence one.', cns);
      });

      describe('with a two-tokens sentence', function() {
        before(function() {
          return ector.addEntry('Sentence one.', cns);
        });

        it('should activate the sentence node', function() {
          return cns.getActivationValue(1).then(value => {
            expect(value).to.be.equal(100);
          });
        });

        it('should activate the token node', function() {
          return cns
            .getActivationValue(2)
            .then(value2 => {
              expect(value2).to.be.equal(100);
              return cns.getActivationValue(3);
            })
            .then(value3 => {
              expect(value3).to.be.equal(100);
            });
        });
      });

      describe('with a one-token sentence', function() {
        before(function() {
          return ector.addEntry('Sentence.', cns);
        });

        it('should activate the sentence node', function() {
          return cns.getActivationValue(5).then(value => {
            expect(value).to.be.equal(100);
          });
        });

        it('should activate the token node', function() {
          return cns.getActivationValue(6).then(value => {
            expect(value).to.be.equal(100);
          });
        });
      });
    });
  });

  describe('Response', function() {
    // First time, only the same sentence is returned.
    it('should generate a response similar to the stimulus', function() {
      var ector = Ector('ECTOR', 'Guy');
      return ector.addEntry('Hello ECTOR.').then(nodes => {
        var response = ector.generateResponse();
        expect(response).to.eql({ sentence: 'Hello Guy.', nodes: [2, 3] });
      });
    });

    it('should replace both names', function() {
      var ector = Ector('ECTOR', 'Guy');
      return ector.addEntry('Hello ECTOR and ECTOR.').then(nodes => {
        var response = ector.generateResponse();
        expect(response.sentence).to.be.equal('Hello Guy and Guy.');
      });
    });
  });

  describe('PreviousSentenceNodeId', function() {
    it('should store the last sentence node id', function() {
      var ector = Ector('ECTOR', 'Guy');
      expect(ector.lastSentenceNodeId).to.null;
      return ector.addEntry('Hello ECTOR.').then(nodes => {
        expect(ector.lastSentenceNodeId).to.be.equal(1);
      });
    });

    describe('link nodes to lastSentenceNode', function() {
      it('should not create links when no lastSentenceNode exist', function() {
        var ector = Ector('ECTOR', 'Guy');
        return ector.addEntry('Hello.').then(nodes => {
          ector.lastSentenceNodeId = null;
          expect(() => {
            ector.linkNodesToLastSentence([2]);
          }).to.throw(Error);
        });
      });

      it('should not create link when null is given', function() {
        var ector = Ector('ECTOR', 'Guy');
        return ector.addEntry('Hello.').then(nodes => {
          ector.linkNodesToLastSentence(null);
          expect(ector.cn.link['2_']).to.be.undefined;
        });
      });

      it('should not create link when [] is given', function() {
        var ector = Ector('ECTOR', 'Guy');
        return ector.addEntry('Hello.').then(nodes => {
          ector.linkNodesToLastSentence([]);
          expect(ector.cn.link['2_']).to.be.undefined;
        });
      });

      it('should create links', function() {
        var ector = Ector('ECTOR', 'Guy');
        return ector.addEntry('Hello.').then(nodes => {
          // 1 link from sentenceNode to the only tokenNode
          // sHello. (1) -> wHello. (2)
          expect(ector.cn.link['2_1']).to.be.undefined;
          ector.linkNodesToLastSentence([2]);
          expect(ector.cn.link['2_1']).to.be.an('object');
        });
      });
    });
  });
});

// ### Injector
describe('Injector', function() {
  // Define a Fake derived ConceptNetwork
  const StrangeConceptNetwork = function() {
    const cn = ConceptNetwork();
    cn.strange = function() {
      return 'Did you say strange?';
    };
    return cn;
  };
  let ector = null;

  before(function() {
    ector = Ector('ECTOR', 'Guy');
  });

  it('should accept another ConceptNetwork', function() {
    ector.ConceptNetwork = StrangeConceptNetwork;
    expect(ector.cn).to.have.property('node');
    expect(ector.cn).to.have.property('strange');
    expect(ector.cn.strange()).to.be.equal('Did you say strange?');
  });

  it('should not accept another class for ConceptNetwork', function() {
    expect(function() {
      ector.ConceptNetwork = ConceptNetworkState;
    }).to.throw(Error);
  });

  it('should work as a normal ConceptNetwork', function() {
    ector.ConceptNetwork = StrangeConceptNetwork;
    return ector.addEntry('Hello ECTOR.').then(nodes => {
      var res = ector.generateResponse();
      expect(res.sentence).to.be.equal('Hello Guy.');
    });
  });

  it('should have its supplemental methods', function() {
    ector.ConceptNetwork = StrangeConceptNetwork;
    assert.equal(typeof ector.cns.Guy.cn.strange, 'function');
  });
});
