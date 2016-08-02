/* eslint-env mocha */
'use strict'

// # Tests for concept-network-state module

// ## Required libraries
var debug = require('debug')('ector:concept-network-state:test') // eslint-disable-line no-unused-vars
const assert = require('assert')
const chai = require('chai')
const expect = chai.expect

// Module to test
const ConceptNetwork = require('../lib/concept-network').ConceptNetwork
const ConceptNetworkState = require('../lib/concept-network-state')
                          .ConceptNetworkState

// ## ConceptNetwork
describe('ConceptNetworkState', function () {
  // ### Constructor
  describe('#Constructor', function () {
    it('should throw an exception if no ConceptNetwork is given', function () {
      expect(function () {
        ConceptNetworkState()
      }).to.throw(Error)
    })

    it('should not throw an exception', function () {
      expect(function () {
        const cn = ConceptNetwork()
        ConceptNetworkState(cn)
      }).to.not.throw(Error)
    })

    it('should be called from a derived constructor', function () {
      const DerivedConceptNetworkState = function () {
        const cn = ConceptNetwork()
        return cn
      }
      const derived = DerivedConceptNetworkState()
      expect(derived).to.be.not.null
      expect(derived).to.have.property('addNode')
      expect(derived.addNode).to.be.a('function')
    })
  })

  describe('#activate', function () {
    let cn = null
    let cns = null
    let node1 = null
    before(function (done) {
      cn = ConceptNetwork()
      cns = ConceptNetworkState(cn)
      cn.addNode({ label: 'Node 1' }, function (err, node) {
        node1 = node
        done(err)
      })
    })

    it('should put the node activation to 100', function (done) {
      cns.activate(node1, function (err, state) {
        expect(cns.state[node1.id].activationValue).to.be.equal(100)
        done(err)
      })
    })

    it('should cap the activation of an activated node', function (done) {
      cns.activate(node1.id, function (err, state) {
        assert.equal(cns.state[node1.id].activationValue, 100)
        done(err)
      })
    })
  })

  describe('#getters', function () {
    let cn, cns, node1, node2, node3
    describe('##getActivationValue', function () {
      before(function (done) {
        cn = ConceptNetwork()
        cns = ConceptNetworkState(cn)
        cn.addNode({ label: 'Node 1' }, function (err, node) {
          if (err) { return done(err) }
          node1 = node
          cn.addNode({ label: 'Node 2' }, function (err, node) {
            if (err) { return done(err) }
            node2 = node
            cns.activate(node1.id, function (err, state) {
              done(err)
            })
          })
        })
      })

      it('should get a zero activation value', function (done) {
        cns.getActivationValue(node2.id, function (err, activationValue) {
          assert.deepEqual(activationValue, 0)
          done(err)
        })
      })

      it('should get a 100 activation value', function (done) {
        cns.getActivationValue(node1.id, function (err, activationValue) {
          assert.deepEqual(activationValue, 100)
          done(err)
        })
      })

      it('should get a zero activation value when no callback',
      function (done) {
        assert.equal(cns.getActivationValue(node2.id), 0)
        done()
      })
    })

    describe('##getOldActivationValue', function () {
      before(function (done) {
        cn = ConceptNetwork()
        cns = ConceptNetworkState(cn)
        cn.addNode({ label: 'Node 1' }, function (err, node) {
          if (err) { return done(err) }
          node1 = node
          cn.addNode({ label: 'Node 2' }, function (err, node) {
            if (err) { return done(err) }
            node2 = node
            cns.activate(node1.id, function (err) {
              if (err) { return done(err) }
              cns.propagate(done)
            })
          })
        })
      })

      it('should get a zero activation value', function (done) {
        cns.getOldActivationValue(node2.id, function (err, oldActivationValue) {
          assert.deepEqual(oldActivationValue, 0)
          done(err)
        })
      })

      it('should get a 100 activation value', function (done) {
        cns.getOldActivationValue(node1.id, function (err, oldActivationValue) {
          assert.deepEqual(oldActivationValue, 100)
          done(err)
        })
      })
    })

    describe('##getMaximumActivationValue', function () {
      before(function (done) {
        cn = ConceptNetwork()
        cns = ConceptNetworkState(cn)
        cn.addNode({ label: 'Node 1' }, function (err, node) {
          if (err) return done(err)
          node1 = node
          cn.addNode({ label: 'Node 2', type: 's' }, function (err, node) {
            if (err) return done(err)
            node2 = node
            cn.addNode({ label: 'Node 3', type: 't' }, function (err, node) {
              node3 = node
              done(err)
            })
          })
        })
      })

      it('should return 0 when no node is activated', function (done) {
        cns.getMaximumActivationValue(function (err, maxValue) {
          assert.equal(maxValue, 0)
          done(err)
        })
      })

      it('should get the maximum activation value for any token',
        function (done) {
          cns.setActivationValue(node1.id, 75, function (err) {
            if (err) { return done(err) }
            cns.setActivationValue(node2.id, 70, function (err) {
              if (err) { return done(err) }
              cns.setActivationValue(node3.id, 50, function (err) {
                if (err) { return done(err) }
                cns.getMaximumActivationValue(function (err, maxValue) {
                  assert.equal(maxValue, 75)
                  done(err)
                })
              })
            })
          })
        })

      it('should get the maximum activation value for s tokens',
        function (done) {
          cns.setActivationValue(node1.id, 75, function (err) {
            if (err) { return done(err) }
            cns.setActivationValue(node2.id, 70, function (err) {
              if (err) { return done(err) }
              cns.setActivationValue(node3.id, 50, function (err) {
                if (err) { return done(err) }
                cns.getMaximumActivationValue('s', function (err, maxValue) {
                  assert.equal(maxValue, 70)
                  done(err)
                })
              })
            })
          })
        })
    })

    describe('##getActivatedTypedNodes', function () {
      before(function (done) {
        cn = ConceptNetwork()
        cns = ConceptNetworkState(cn)
        cn.addNode({ label: 'Node 1' }, function (err, node) {
          if (err) { return done(err) }
          node1 = node
          cn.addNode({ label: 'Node 2', type: 's' }, function (err, node) {
            if (err) { return done(err) }
            node2 = node
            cn.addNode({ label: 'Node 3', type: 't' }, function (err, node) {
              node3 = node
              done(err)
            })
          })
        })
      })

      it('should return an empty array', function (done) {
        cns.getActivatedTypedNodes(function (err, activatedNodes) {
          assert.deepEqual(activatedNodes, [])
          done(err)
        })
      })

      it('should return one-node-array', function (done) {
        cns.setActivationValue(node1.id, 100, function (err) {
          if (err) { return done(err) }
          cns.getActivatedTypedNodes(function (err, result) {
            assert.deepEqual(result,
              [{'node': {'id': 0, 'label': 'Node 1', 'occ': 1},
                'activationValue': 100}])
            done(err)
          })
        })
      })

      it('should return two-nodes-array', function (done) {
        cns.setActivationValue(node2.id, 95, function (err) {
          if (err) { return done(err) }
          cns.getActivatedTypedNodes(function (err, result) {
            assert.deepEqual(result,
              [{'node': {'id': 0, 'label': 'Node 1', 'occ': 1},
                'activationValue': 100},
               {'node': {'id': 1, 'label': 'Node 2', 'occ': 1, type: 's'},
                'activationValue': 95}
              ])
            done(err)
          })
        })
      })

      it('should return one-node-array of type s', function (done) {
        cns.setActivationValue(node2.id, 95, function (err) {
          if (err) { return done(err) }
          cns.getActivatedTypedNodes('s', function (err, result) {
            assert.deepEqual(result,
              [{'node': {'id': 1, 'label': 'Node 2', 'occ': 1, type: 's'},
                'activationValue': 95}
              ])
            done(err)
          })
        })
      })

      it('should return one-node-array where threshold = 96', function (done) {
        cns.setActivationValue(node1.id, 100, function (err) {
          if (err) { return done(err) }
          cns.getActivatedTypedNodes('', 96, function (err, result) {
            assert.deepEqual(result,
              [{'node': {'id': 0, 'label': 'Node 1', 'occ': 1},
                'activationValue': 100}])
            done(err)
          })
        })
      })
    })

      /* (self, cn, typeNames, threshold=90):
        """Get the activated nodes of cn.

        The returned nodes must be in the list of typeNames, and
        have an activation value greater than threshold

        Return a list of tuples (node,activation value)"""')*/
  })

  describe('#setters', function () {
    var cn, cns, node1, node2
    describe('##setActivationValue', function () {
      before(function (done) {
        cn = ConceptNetwork()
        cns = ConceptNetworkState(cn)
        cn.addNode({ label: 'Node 1' }, function (err, node) {
          if (err) { return done(err) }
          node1 = node
          cn.addNode({ label: 'Node 2' }, function (err, node) {
            node2 = node
            done(err)
          })
        })
      })

      it('should set a zero activation value', function (done) {
        cns.setActivationValue(node2.id, 0, function (err) {
          if (err) { return done(err) }
          cns.getActivationValue(node2.id, function (err, activationValue) {
            assert.deepEqual(activationValue, 0)
            done(err)
          })
        })
      })

      it('should set a 75 activation value', function (done) {
        cns.setActivationValue(node1.id, 75, function (err) {
          if (err) { return done(err) }
          cns.getActivationValue(node1.id, function (err, activationValue) {
            assert.deepEqual(activationValue, 75)
            done(err)
          })
        })
      })
    })
  })

  describe('#propagate', function () {
    var cn, cns, node1, node2
    before(function (done) {
      cn = ConceptNetwork()
      cns = ConceptNetworkState(cn)
      cn.addNode({ label: 'Node 1' }, function (err, node) {
        if (err) return done(err)
        node1 = node
        cn.addNode({ label: 'Node 2' }, function (err, node) {
          if (err) return done(err)
          node2 = node
          cn.addLink(node1.id, node2.id, done)
        })
      })
    })

    it('should deactivate node without afferent links', function (done) {
      cns.activate(node1.id, function (err, node) {
        if (err) { return done(err) }
        cns.getActivationValue(node1.id, function (err, value) {
          if (err) { return done(err) }
          assert.equal(value, 100)
          cns.propagate(function (err) {
            if (err) { return done(err) }
            cns.getActivationValue(node1.id, function (err, value) {
              assert.equal(value < 100, true)
              done(err)
            })
          })
        })
      })
    })

    it('should activate node 2', function (done) {
      cns.getActivationValue(node2.id, function (err, value) {
        assert.equal(value > 0, true)
        done(err)
      })
    })

    it('should accept options', function (done) {
      cns.propagate({ anything: 1}, function (err) {
        done(err)
      })
    })

    it('should take decay into account', function (done) {
      cns.propagate({decay: 200}, function (err) {
        if (err) { return done(err) }
        assert.deepEqual(cns.state, {}, 'all nodes should be deactivated')
        done(err)
      })
    })

    it('should take memoryPerf into account', function (done) {
      cns.activate(node1.id, function (err) {
        if (err) { return done(err) }
        cns.propagate({memoryPerf: Infinity}, function (err) {
          assert.equal(cns.getActivationValue(node1.id), 60,
            'with an infinite memory perf, ' +
            'activation should not decay too much')
          done(err)
        })
      })
    })

    it('should return an error when first parameter is not an object', function (done) {
      cns.propagate(1, function (err) {
        assert(err)
        done()
      })
    })

    it('should use already existing influenceValue', function (done) {
      var node3
      cn.addNode({ label: 'Node 3' }, function (err, node) {
        if (err) { return done(err) }
        node3 = node
        cn.addLink(node3.id, node2.id, function (err) {
          if (err) { return done(err) }
          cns.activate(node1.id, function (err) {
            if (err) { return done(err) }
            cns.propagate(done)
          })
        })
      })
    })
  })
})
