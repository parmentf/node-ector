/* eslint-env mocha */
'use strict'

// # Tests for concept-network-state module

// ## Required libraries
var debug = require('debug')('ector:concept-network-state:test') // eslint-disable-line no-unused-vars
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

    it('should put the node activation to 100', function () {
      return cns.activate(node1)
      .then(state => {
        expect(cns.state[node1.id].activationValue).to.be.equal(100)
      })
    })

    it('should cap the activation of an activated node', function () {
      return cns.activate(node1.id)
      .then(state => {
        expect(cns.state[node1.id].activationValue).to.be.equal(100)
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
            cns.activate(node1.id)
            .then(state => {
              done()
            })
            .catch(err => {
              done(err)
            })
          })
        })
      })

      it('should get a zero activation value', function () {
        return cns.getActivationValue(node2.id)
        .then(activationValue => {
          expect(activationValue).to.be.equal(0)
        })
      })

      it('should get a 100 activation value', function () {
        return cns.getActivationValue(node1.id)
        .then(activationValue => {
          expect(activationValue).to.be.equal(100)
        })
      })

      it('should catch when the node does not have an id',
      function (done) {
        return cns.getActivationValue({label: 'no id'})
        .then(state => {
          done(new Error('This node should not exist'))
        })
        .catch(() => {
          done()
        })
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
            cns.activate(node1.id)
            .then(state => {
              return cns.propagate()
            })
            .then(() => done())
            .catch(err => {
              done(err)
            })
          })
        })
      })

      it('should get a zero activation value', function () {
        return cns.getOldActivationValue(node2.id)
        .then(oldActivationValue => {
          expect(oldActivationValue).to.be.equal(0)
        })
      })

      it('should get a 100 activation value', function () {
        return cns.getOldActivationValue(node1.id)
        .then(oldActivationValue => {
          expect(oldActivationValue).to.be.equal(100)
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

      it('should return 0 when no node is activated', function () {
        return cns.getMaximumActivationValue()
        .then(maxValue => {
          expect(maxValue).to.be.equal(0)
        })
      })

      it('should get the maximum activation value for any token', function () {
        return cns.setActivationValue(node1.id, 75)
        .then(() => {
          return cns.setActivationValue(node2.id, 70)
        })
        .then(() => {
          return cns.setActivationValue(node3.id, 50)
        })
        .then(() => {
          return cns.getMaximumActivationValue()
        })
        .then(maxValue => {
          expect(maxValue).to.be.equal(75)
        })
      })

      it('should get the maximum activation value for s tokens', function () {
        return cns.setActivationValue(node1.id, 75)
        .then(() => {
          return cns.setActivationValue(node2.id, 70)
        })
        .then(() => {
          return cns.setActivationValue(node3.id, 50)
        })
        .then(() => {
          return cns.getMaximumActivationValue('s')
        })
        .then(maxValue => {
          expect(maxValue).to.be.equal(70)
        })
      })
    })

    describe('##getActivatedTypedNodes', function () {
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

      it('should return an empty array', function () {
        return cns.getActivatedTypedNodes()
        .then(activatedNodes => {
          expect(activatedNodes).to.be.an('array')
          expect(activatedNodes).to.be.empty
        })
      })

      it('should return one-node-array', function () {
        return cns.setActivationValue(node1.id, 100)
        .then(() => {
          return cns.getActivatedTypedNodes()
        })
        .then(result => {
          expect(result).to.be.deep.equal(
            [{'node': {'id': 0, 'label': 'Node 1', 'occ': 1},
              'activationValue': 100}])
        })
      })

      it('should return two-nodes-array', function () {
        return cns.setActivationValue(node2.id, 95)
        .then(() => {
          return cns.getActivatedTypedNodes()
        })
        .then(result => {
          expect(result).to.be.deep.equal(
            [{'node': {'id': 0, 'label': 'Node 1', 'occ': 1},
              'activationValue': 100},
             {'node': {'id': 1, 'label': 'Node 2', 'occ': 1, type: 's'},
              'activationValue': 95}
            ]
          )
        })
      })

      it('should return one-node-array of type s', function () {
        return cns.setActivationValue(node2.id, 95)
        .then(() => {
          return cns.getActivatedTypedNodes('s')
        })
        .then(result => {
          expect(result).to.be.deep.equal(
            [{'node': {'id': 1, 'label': 'Node 2', 'occ': 1, type: 's'},
              'activationValue': 95}
            ]
          )
        })
      })

      it('should return one-node-array where threshold = 96', function () {
        return cns.setActivationValue(node1.id, 100)
        .then(() => {
          return cns.getActivatedTypedNodes('', 96)
        })
        .then(result => {
          expect(result).to.be.deep.equal(
            [{'node': {'id': 0, 'label': 'Node 1', 'occ': 1},
              'activationValue': 100}])
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

      it('should set a zero activation value', function () {
        return cns.setActivationValue(node2.id, 0)
        .then(() => {
          return cns.getActivationValue(node2.id)
        })
        .then(activationValue => {
          expect(activationValue).to.be.equal(0)
        })
      })

      it('should set a 75 activation value', function () {
        return cns.setActivationValue(node1.id, 75)
        .then(() => {
          return cns.getActivationValue(node1.id)
        })
        .then(activationValue => {
          expect(activationValue).to.be.equal(75)
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

    it('should deactivate node without afferent links', function () {
      return cns.activate(node1.id)
      .then(node => {
        return cns.getActivationValue(node1.id)
      })
      .then(value => {
        expect(value).to.be.equal(100)
        return cns.propagate()
      })
      .then(() => {
        return cns.getActivationValue(node1.id)
      })
      .then(value => {
        expect(value).to.be.below(100)
      })
    })

    it('should activate node 2', function () {
      return cns.getActivationValue(node2.id)
      .then(value => {
        expect(value).to.be.above(0)
      })
    })

    it('should accept options', function () {
      return cns.propagate({ anything: 1 })
    })

    it('should take decay into account', function () {
      return cns.propagate({decay: 200})
      .then(() => {
        const array = [1, 2]
        delete array[0]
        delete array[1]
        expect(cns.state).to.be.an('array')
        expect(cns.state).to.be.deep.equal(array, 'all nodes should be deactivated')
      })
    })

    it('should take memoryPerf into account', function () {
      return cns.activate(node1.id)
      .then(state => {
        return cns.propagate({memoryPerf: Infinity})
      })
      .then(() => {
        return cns.getActivationValue(node1.id)
      })
      .then(value => {
        expect(value).to.be.equal(60, 'with an infinite memory perf, ' +
          'activation should not decay too much')
      })
    })

    it('should return an error when first parameter is not an object', function (done) {
      cns.propagate(1)
      .then(() => done(new Error('Should return an error')))
      .catch((err) => {
        expect(err).to.be.an('error')
        done()
      })
    })

    it('should use already existing influenceValue', function (done) {
      var node3
      cn.addNode({ label: 'Node 3' }, function (err, node) {
        if (err) return done(err)
        node3 = node
        cn.addLink(node3.id, node2.id, function (err) {
          if (err) return done(err)
          cns.activate(node1.id)
          .then(state => {
            return cns.propagate()
          })
          .then(() => done())
          .catch(err => done(err))
        })
      })
    })
  })
})
