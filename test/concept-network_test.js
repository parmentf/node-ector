/* eslint-env mocha*/
'use strict'

// # Tests for concept-network module

// ## Required libraries
var assert = require('assert')
var debug = require('debug')('ector:concept-network:test') // eslint-disable-line no-unused-vars

// Module to test
var ConceptNetwork = require('../lib/concept-network').ConceptNetwork

// ## ConceptNetwork
describe('ConceptNetwork', function () {
  // ### Creator
  describe('Creator', function () {
    it('should not throw an exception', function () {
      assert.doesNotThrow(function () {
        ConceptNetwork()
      }, null, 'unexpected error')
    })

    it('should be called from a derived constructor', function () {
      var DerivedConceptNetwork = function () {
        // Inherit ConceptNetwork
        ConceptNetwork.call(this)
      }
      var derived = new DerivedConceptNetwork()
      assert.deepEqual(derived, {})
    })
  })

  var cn

  // ### addNode
  describe('addNode', function () {
    before(function () {
      cn = ConceptNetwork()
    })

    it('should return an object', function (done) {
      cn.addNode({ label: 'Chuck Norris' }, function (err, node) {
        assert.equal(node.id, 0)
        assert.equal(node.label, 'Chuck Norris')
        assert.equal(node.occ, 1)
        done(err)
      })
    })

    it('should increment occ', function (done) {
      cn.addNode({ label: 'Chuck Norris' }, function (err, node) {
        assert.equal(node.id, 0)
        assert.equal(node.occ, 2)
        done(err)
      })
    })

    it('should increment nodeLastId', function (done) {
      cn.addNode({ label: 'World' }, function (err, node) {
        assert.equal(node.id, 1)
        assert.equal(cn.node.length, 2)
        done(err)
      })
    })

    it('should increment a previous node too', function (done) {
      cn.addNode({ label: 'Chuck Norris' }, function (err, node) {
        assert.equal(node.id, 0)
        assert.equal(node.occ, 3)
        done(err)
      })
    })

    it('should increment more than one', function (done) {
      cn.addNode({ label: 'Steven Seagal' }, 3, function (err, node) {
        assert.equal(node.id, 2)
        assert.equal(node.occ, 3)
        done(err)
      })
    })

    it('should accept a second argument with a null value', function (done) {
      cn.addNode({ label: 'Jean-Claude Van Damme' }, null, function (err, node) {
        assert.equal(node.id, 3)
        assert.equal(node.occ, 1)
        done(err)
      })
    })
  })

  // ### decrementNode
  describe('decrementNode', function () {
    it('should decrement a node with occ of 3', function (done) {
      cn.decrementNode({ label: 'Chuck Norris' }, function (err, node) {
        assert.equal(node.id, 0)
        assert.equal(node.occ, 2)
        done(err)
      })
    })

    it('should remove a node with an occ of 1', function (done) {
      cn.decrementNode({ label: 'World' }, function (err, node) {
        assert.equal(node, null)
        done(err)
      })
    })

    it('should return null when node does not exist', function (done) {
      cn.decrementNode({ label: 'unexisting' }, function (err, node) {
        assert.equal(node, undefined)
        done(err)
      })
    })
  })

  // ### removeNode
  describe('removeNode', function () {
    beforeEach(function (done) {
      cn = new ConceptNetwork()
      cn.addNode({ label: 'Node 1' }, function (err1, node1) {
        node1.occ = 2
        if (err1) { return done(err1) }
        cn.addNode({ label: 'Node 2' }, function (err2, node2) {
          if (err2) { return done(err2) }
          cn.addNode({ label: 'Node 3' }, function (err3, node3) {
            if (err3) { return done(err3) }
            cn.addNode({ label: 'Node 4' }, function (err4, node4) {
              if (err4) { return done(err4) }
              cn.addLink(2, 3, function (err5, link23) {
                if (err5) { return done(err5) }
                cn.addLink(3, 4, function (err6, link34) {
                  done(err6)
                })
              })
            })
          })
        })
      })
    })

    it('should remove even a node with occ value of 2', function (done) {
      assert.equal(cn.node[0].occ, 2)
      cn.removeNode(cn.node[0].id, function (err) {
        assert.equal(typeof cn.node[0], 'undefined')
        done(err)
      })
    })

    it('should remove the links from the removed node', function (done) {
      cn.removeNode(2, function (err) {
        assert.equal(cn.link['2_3'], undefined)
        done(err)
      })
    })

    it('should remove the links to the removed node', function (done) {
      cn.removeNode(4, function (err) {
        assert.equal(cn.link['3_4'], undefined)
        done(err)
      })
    })
  })

  describe('addLink', function () {
    before(function (done) {
      cn = new ConceptNetwork()
      cn.addNode({ label: 'Node 1' }, function (err1, node1) {
        if (err1) { return done(err1) }
        cn.addNode({ label: 'Node 2' }, function (err2, node2) {
          if (err2) { return done(err2) }
          cn.addNode({ label: 'Node 3' }, function (err3, node3) {
            done(err3)
          })
        })
      })
    })

    it('should return an object', function (done) {
      cn.addLink(1, 2, function (err, link) {
        assert.equal(typeof link, 'object')
        assert.equal(link.coOcc, 1)
        done(err)
      })
    })

    it('should increment coOcc', function (done) {
      cn.addLink(1, 2, function (err, link) {
        assert.equal(link.coOcc, 2)
        done(err)
      })
    })

    it('should increment with more than 1', function (done) {
      cn.addLink(1, 2, 4, function (err, link) {
        assert.equal(link.coOcc, 6)
        done(err)
      })
    })

    it('should create a good fromIndex', function (done) {
      cn.addLink(1, 3, function (err, link) {
        assert.deepEqual(Array.from(cn.fromIndex[1].values()), ['1_2', '1_3'])
        done(err)
      })
    })

    it('should not accept non number ids', function (done) {
      cn.addLink(1, 'berf', function (err, link) {
        assert.equal(err instanceof Error, true)
        cn.addLink('barf', 2, function (err, link) {
          assert.equal(err instanceof Error, true)
          done()
        })
      })
    })

    it('should increment by 1 with a cb, without an inc', function (done) {
      cn.addLink(1, 2, undefined, function (err, link) {
        assert.equal(link.coOcc, 7)
        done(err)
      })
    })
  })

  describe('decrementLink', function () {
    before(function (done) {
      cn = new ConceptNetwork()
      cn.addNode({ label: 'Node 1' }, function (err) {
        if (err) { return done(err) }
        cn.addNode({ label: 'Node 2' }, function (err) {
          if (err) { return done(err) }
          cn.addLink(1, 2, function (err) {
            if (err) { return done(err) }
            cn.addLink(1, 2, function (err) {
              done(err)
            })
          })
        })
      })
    })

    it('should decrement a coOcc value of 2', function (done) {
      assert.equal(cn.link['1_2'].coOcc, 2)
      cn.decrementLink('1_2', function (err, link) {
        assert.equal(cn.link['1_2'].coOcc, 1)
        done(err)
      })
    })

    it('should remove a link with a coOcc value of 0', function (done) {
      assert.equal(cn.link['1_2'].coOcc, 1)
      cn.decrementLink('1_2', function (err) {
        assert.equal(typeof cn.link['1_2'], 'undefined')
        done(err)
      })
    })
  })

  describe('removeLink', function () {
    beforeEach(function (done) {
      cn = ConceptNetwork()
      cn.addNode({ label: 'Node 1' }, function (err) {
        if (err) { return done(err) }
        cn.addNode({ label: 'Node 2' }, function (err) {
          if (err) {
            return done(err)
          }
          cn.addLink(1, 2, function (err) {
            done(err)
          })
        })
      })
    })

    it('should remove the link', function (done) {
      assert.deepEqual(cn.link['1_2'], { fromId: 1, toId: 2, coOcc: 1 })
      cn.removeLink('1_2', function (err) {
        assert.equal(typeof cn.link['1_2'], 'undefined')
        done(err)
      })
    })

    it('should remove the link, even with a toId', function (done) {
      assert.deepEqual(cn.link['1_2'], { fromId: 1, toId: 2, coOcc: 1 })
      cn.removeLink(1, 2, function (err) {
        assert.equal(typeof cn.link['1_2'], 'undefined')
        done(err)
      })
    })
  })

  describe('getters', function () {
    before(function (done) {
      cn = ConceptNetwork()
      cn.addNode({ label: 'Node 1' }, function (err) {
        if (err) { return done(err) }
        cn.addNode({ label: 'Node 2' }, function (err) {
          if (err) { return done(err) }
          cn.addNode({ label: 'Node 3' }, function (err) {
            if (err) { return done(err) }
            cn.addLink(1, 2, function (err) {
              if (err) { return done(err) }
              cn.addLink(1, 3, function (err) {
                if (err) { return done(err) }
                cn.addLink(2, 3, function (err) {
                  done(err)
                })
              })
            })
          })
        })
      })
    })

    describe('getNode', function () {
      it('should get the second node', function (done) {
        cn.getNode({ label: 'Node 2' }, function (err, node) {
          assert.equal(node.id, 1)
          done(err)
        })
      })

      it('should return null when the node does not exist', function (done) {
        cn.getNode({ label: 'Nonexistent' }, function (err, node) {
          assert.equal(node, null)
          done(err)
        })
      })
    })

    describe('getLink', function () {
      it('should get the link', function (done) {
        cn.getLink('1_2', function (err, link) {
          assert.equal(link.fromId, 1)
          assert.equal(link.toId, 2)
          assert.equal(link.coOcc, 1)
          done(err)
        })
      })

      it('should get the link with two parameters', function (done) {
        cn.getLink(1, 2, function (err, link) {
          assert.equal(link.fromId, 1)
          assert.equal(link.toId, 2)
          assert.equal(link.coOcc, 1)
          done(err)
        })
      })

      it('should return null when the node does not exist', function (done) {
        cn.getLink(1, 100, function (err, link) {
          assert.equal(link, null)
          done(err)
        })
      })
    })

    describe('getNodeFromLinks', function () {
      it('should get all links from node 2', function (done) {
        cn.getNodeFromLinks(2, function (err, fromLinks) {
          assert.deepEqual(fromLinks, ['2_3'])
          done(err)
        })
      })

      it('should get all links from node 1', function (done) {
        cn.getNodeFromLinks(1, function (err, fromLinks) {
          assert.deepEqual(fromLinks, ['1_2', '1_3'])
          done(err)
        })
      })

      it('should get no links from node 3', function (done) {
        cn.getNodeFromLinks(3, function (err, fromLinks) {
          assert.deepEqual(fromLinks, [])
          done(err)
        })
      })
    })

    describe('getNodeToLinks', function () {
      it('should get all links to node 2', function (done) {
        cn.getNodeToLinks(2, function (err, toLinks) {
          assert.deepEqual(toLinks, ['1_2'])
          done(err)
        })
      })

      it('should get all links to node 3', function (done) {
        cn.getNodeToLinks(3, function (err, toLinks) {
          assert.deepEqual(toLinks, ['1_3', '2_3'])
          done(err)
        })
      })

      it('should get no links to node 1', function (done) {
        cn.getNodeToLinks(1, function (err, toLinks) {
          assert.deepEqual(toLinks, [])
          done(err)
        })
      })
    })
  })
})
