/*jshint node:true curly:true, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true, sub:true, undef:true, eqnull:true, laxcomma:true, white:true, indent:2 */
/*global describe:true, it:true, before:true */
"use strict";

// # Tests for ECTOR module

// ## Required libraries
var debug = require('debug')('ector:test');
var assert = require('assert'); // Maybe one day "should"?
var util = require('util');
var sugar = require('sugar');
var ConceptNetworkState = require('concept-network').ConceptNetworkState;
var ConceptNetwork = require('concept-network').ConceptNetwork;

// ## Module to test
var Ector = require('../lib/ector.js');

// ## Let's test
// ### Constructor
describe('Instanciations', function () {

  describe('No botname', function () {

    it("should not throw an exception", function () {
      assert.doesNotThrow(function () {
        var ector = new Ector();
      }, null, "unexpected error");
    });

    it("should be ECTOR", function () {
      var ector = new Ector();
      assert.equal(ector.name, "ECTOR", "ECTOR's name is not ECTOR!");
    });
  });

  describe('A new botname', function () {
    it("should get the given name", function () {
      var ector = new Ector("Nestor");
      assert.equal(ector.name, "Nestor", "ECTOR's name should be Nestor");
    });
  });

  describe('Bad botname', function () {
    it("should not be a number", function () {
      var ector = new Ector(1);
      assert.equal(ector.name, "ECTOR");
    });
  });

  describe('Usernames', function () {

    describe('No username', function () {
      it('should be "Guy"', function () {
        var ector = new Ector();
        assert.equal(ector.username, "Guy", "ECTOR's username should be Guy");
      });
    });

    describe('Bad username', function () {
      it("should not be a number", function () {
        var ector = new Ector(null, 1);
        assert.equal(ector.name, "ECTOR");
        assert.equal(ector.username, "Guy");
      });

      it("should not be a too short", function () {
        var ector = new Ector(null, "Al");
        assert.equal(ector.username, "Guy");
      });
    });

    describe('ConceptNetworkState', function () {

      it('should add one, for the default username', function () {
        var ector = new Ector(null, "Guy");
        assert.equal(typeof ector.cns["Guy"], "object");
      });

      it('should add one, for an unknown username', function () {
        var ector = new Ector(null, "Guy");
        ector.setUser('Chuck');
        assert.equal(typeof ector.cns["Chuck"], "object");
      });

    });

  });
});

// ### Users
describe('Users', function () {

  describe('Change username', function () {

    it('should change for another string', function () {
      var ector = new Ector();
      assert.equal(ector.username, "Guy");
      ector.setUser("Chuck");
      assert.equal(ector.username, "Chuck");
    });

    it('should not work with a number', function () {
      var ector = new Ector();
      assert.equal(ector.username, "Guy");
      var userId = ector.setUser(1);
      assert.equal(userId instanceof Error, true);
    });

    it('should not be an empty name', function () {
      var ector = new Ector();
      assert.equal(ector.username, "Guy");
      var userId = ector.setUser("");
      assert.equal(userId instanceof Error, true);
    });

    it('should not be too short (< 3)', function () {
      var ector = new Ector();
      var userId = ector.setUser("Al");
      assert.equal(userId instanceof Error, true);
    });

    it('should reset the lastSentenceNodeId', function () {
      var ector = new Ector();
      ector.lastSentenceNodeId = 1;
      var userId = ector.setUser("Ali");
      assert.equal(ector.lastSentenceNodeId, null);
    });

    // it('should not be change using property username', function () {
    //   var ector = new Ector();
    //   assert.equal(ector.username, "Guy");
    //   ector.username = "Nope";
    //   assert.equal(ector.username, "Guy");
    // });
  });

});

// ### Bot
describe('Bot', function () {

  describe('Change botname', function () {

    it('should change for another string', function () {
      var ector = new Ector();
      assert.equal(ector.name, "ECTOR");
      ector.setName("Norris");
      assert.equal(ector.name, "Norris");
    });

    it('should not work with a number', function () {
      var ector = new Ector();
      assert.equal(ector.name, "ECTOR");
      var name = ector.setName(1);
      assert.equal(name instanceof Error, true);
    });
  });

  describe('Add an entry', function () {

    describe('in the Concept Network', function () {

      it('should return an error when entry is empty', function () {
        var ector = new Ector();
        var nodes = ector.addEntry("");
        assert.equal(nodes instanceof Error, true);
      });

      it('should return an error when entry is not a string', function () {
        var ector = new Ector();
        var nodes = ector.addEntry();
        assert.equal(nodes instanceof Error, true);
      });

      it('should create a sentence node', function () {
        var ector = new Ector();
        ector.addEntry("Hello.");
        assert.equal(ector.cn.node[1].label, "sHello.");
      });

      it('should return an array of one word node', function () {
        var ector = new Ector();
        var nodes = ector.addEntry("Hello.");
        assert.equal(nodes instanceof Error, false);
        assert.equal(nodes.length, 1);
        assert.equal(nodes[0].label, "wHello.");
      });

      it('should return an array of two word nodes', function () {
        var ector = new Ector();
        var nodes = ector.addEntry("Hello world.");
        assert.equal(nodes instanceof Error, false);
        assert.equal(nodes.length, 2);
        assert.equal(nodes[0].label, "wHello");
        assert.equal(nodes[1].label, "wworld.");
      });

      it('should add the nodes in the concept network', function () {
        var ector = new Ector();
        var cn = ector.cn;
        assert.notEqual(cn, null);
        var nodes = ector.addEntry("Hello world.");
        assert.equal(Object.getOwnPropertyNames(cn.node).length, 3);
      });

      it('should add positions in the sentence', function () {
        var ector = new Ector();
        var cn = ector.cn;
        var nodes = ector.addEntry("Salut tout le monde.");
        assert.equal(nodes[0].beg, 1);
        assert.equal(nodes[2].mid, 1);
        assert.equal(nodes[3].end, 1);
      });

      it('should increment positions in the sentence', function () {
        var ector = new Ector();
        var cn = ector.cn;
        var nodes = ector.addEntry("Salut tout le monde.");
        var nodes2 = ector.addEntry("Salut le peuple du monde.");
        assert.equal(nodes2[0].beg, 2);
        assert.equal(nodes2[1].mid, 2);
        assert.equal(nodes2[2].mid, 1);
        assert.equal(nodes2[4].end, 2);
      });

      it('should add links between following tokens', function () {
        var ector = new Ector();
        var cn = ector.cn;
        var nodes = ector.addEntry("Salut tout le monde.");
        assert.deepEqual(cn.link['2_3'], { fromId: 2, toId: 3, coOcc: 1 });
        assert.deepEqual(cn.link['3_4'], { fromId: 3, toId: 4, coOcc: 1 });
        assert.deepEqual(cn.link['4_5'], { fromId: 4, toId: 5, coOcc: 1 });
      });

      it('should add links between sentence and its tokens', function () {
        var ector = new Ector();
        var cn = ector.cn;
        var nodes = ector.addEntry("Salut tout le monde.");
        assert.deepEqual(cn.link['1_2'], { fromId: 1, toId: 2, coOcc: 1 });
        assert.deepEqual(cn.link['1_3'], { fromId: 1, toId: 3, coOcc: 1 });
        assert.deepEqual(cn.link['1_4'], { fromId: 1, toId: 4, coOcc: 1 });
        assert.deepEqual(cn.link['1_5'], { fromId: 1, toId: 5, coOcc: 1 });
      });

      it('should add links between following sentences', function () {
        var ector = new Ector();
        var cn = ector.cn;
        var nodes = ector.addEntry("Ah! Oh.");
        assert.deepEqual(cn.link['1_3'], { fromId: 1, toId: 3, coOcc: 1 });
      });

      it('should increment links between following tokens', function () {
        var ector = new Ector();
        var cn = ector.cn;
        var nodes = ector.addEntry("Salut tout le monde.");
        assert.deepEqual(cn.link['2_3'], { fromId: 2, toId: 3, coOcc: 1 });
        var nodes2 = ector.addEntry("Salut tout le peuple.");
        assert.deepEqual(cn.link['2_3'], { fromId: 2, toId: 3, coOcc: 2 });
      });

      it('should create tokens from second sentence', function () {
        var ector = new Ector();
        var cn = ector.cn;
        var nodes = ector.addEntry("Salut. Hello.");
        assert.ok(Object.has(cn.node, '4'));
      });

      it('should create node for second sentence', function () {
        var ector = new Ector();
        var cn = ector.cn;
        var nodes = ector.addEntry("Salut. Hello.");
        assert.ok(Object.has(cn.labelIndex, 'sHello.'));
      });

      it('should count Hello as a beginning node.', function () {
        var ector = new Ector();
        var cn = ector.cn;
        var nodes = ector.addEntry("Salut. Hello.");
        assert.equal(typeof cn.node[4].beg, "number");
        assert.equal(cn.node[4].beg, 1);
        assert.equal(typeof cn.node[2].beg, "number");
        assert.equal(cn.node[2].beg, 1);
      });

    });

    describe('in the ConceptNetworkState', function () {

      var ector, cn, cns, nodes, node2;

      before(function () {
        ector = new Ector();
        cn = ector.cn;
        cns = new ConceptNetworkState(cn);
        ector.addEntry("Sentence one.", cns);
      });

      describe('with a two-tokens sentence', function () {

        before(function () {
          ector.addEntry("Sentence one.", cns);
        });

        it('should activate the sentence node', function () {
          assert.equal(cns.getActivationValue(1), 100);
        });

        it('should activate the token node', function () {
          assert.equal(cns.getActivationValue(2), 100);
          assert.equal(cns.getActivationValue(3), 100);
        });

      });

      describe('with a one-token sentence', function () {

        before(function () {
          ector.addEntry("Sentence.", cns);
        });

        it('should activate the sentence node', function () {
          assert.equal(cns.getActivationValue(4), 100);
        });

        it('should activate the token node', function () {
          assert.equal(cns.getActivationValue(5), 100);
        });

      });

    });

  });

  describe('Response', function () {

    // First time, only the same sentence is returned.
    it('should generate a response similar to the stimulus', function () {
      var ector = new Ector("ECTOR", "Guy");
      var nodes = ector.addEntry("Hello ECTOR.");
      var response = ector.generateResponse();
      assert.deepEqual(response, { sentence: "Hello Guy.", nodes: [2, 3] });
    });

    it('should replace both names', function () {
      var ector = new Ector("ECTOR", "Guy");
      var nodes = ector.addEntry("Hello ECTOR and ECTOR.");
      var response = ector.generateResponse();
      assert.equal(response.sentence, "Hello Guy and Guy.");
    });

  });

  describe('PreviousSentenceNodeId', function () {

    it('should store the last sentence node id', function () {
      var ector = new Ector("ECTOR", "Guy");
      assert.equal(ector.lastSentenceNodeId, null);
      var nodes = ector.addEntry("Hello ECTOR.");
      assert.equal(ector.lastSentenceNodeId, 1);
    });

    describe('link nodes to lastSentenceNode', function () {

      it('should not create links when no lastSentenceNode exist', function () {
        var ector = new Ector("ECTOR", "Guy");
        var nodes = ector.addEntry("Hello.");
        ector.lastSentenceNodeId = null;
        ector.linkNodesToLastSentence([2]);
        assert.equal(typeof ector.cn.link['2_'], 'undefined');
      });

      it('should not create link when null is given', function () {
        var ector = new Ector("ECTOR", "Guy");
        var nodes = ector.addEntry("Hello.");
        ector.linkNodesToLastSentence(null);
        assert.equal(typeof ector.cn.link['2_'], 'undefined');
      });

      it('should not create link when [] is given', function () {
        var ector = new Ector("ECTOR", "Guy");
        var nodes = ector.addEntry("Hello.");
        ector.linkNodesToLastSentence([]);
        assert.equal(typeof ector.cn.link['2_'], 'undefined');
      });

      it('should create links', function () {
        var ector = new Ector("ECTOR", "Guy");
        var nodes = ector.addEntry("Hello.");
        // 1 link from sentenceNode to the only tokenNode
        // sHello. (1) -> wHello. (2)
        assert.equal(typeof ector.cn.link['2_1'], "undefined");
        ector.linkNodesToLastSentence([2]);
        assert.equal(typeof ector.cn.link['2_1'], "object");
      });

    });
  });

});

// ### Injector
describe('Injector', function () {

  // Define a Fake derived ConceptNetwork
  var StrangeConceptNetwork = function () {
    // Inherits ConceptNetwork
    ConceptNetwork.call(this);
  };
  util.inherits(StrangeConceptNetwork, ConceptNetwork);
  StrangeConceptNetwork.prototype.strange = function () {
    return "Did you say strange?";
  };

  var ector;

  before(function () {
    ector = new Ector("ECTOR", "Guy");
  });

  it('should accept another ConceptNetwork', function () {
    ector.injectConceptNetwork(StrangeConceptNetwork);
    assert(ector.cn instanceof ConceptNetwork, "New ConceptNetwork is a ConceptNetwork");
    assert(ector.cn instanceof StrangeConceptNetwork, "New ConceptNetwork is a StrangeConceptNetwork");
  });

  it('should not accept another class for ConceptNetwork', function () {
    assert.throws(function () {
      ector.injectConceptNetwork(ConceptNetworkState);
    });
  });

  it('should work as a normal ConceptNetwork', function () {
    ector.injectConceptNetwork(StrangeConceptNetwork);
    ector.addEntry('Hello ECTOR.');
    var res = ector.generateResponse();
    assert.equal(res.sentence, 'Hello Guy.');
  });

  it('should have its supplemental methods', function () {
    ector.injectConceptNetwork(StrangeConceptNetwork);
    assert.equal(typeof ector.cns.Guy.cn.strange, 'function');
  });

});