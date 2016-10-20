/* eslint-env mocha*/
'use strict'

// # Tests for concept-network module

// ## Required libraries
const expect = require('chai').expect
var debug = require('debug')('ector:concept-network:test') // eslint-disable-line no-unused-vars

// Module to test
var ConceptNetwork = require('../lib/concept-network').ConceptNetwork

// ## ConceptNetwork
describe('ConceptNetwork', function () {
  // ### Creator
  describe('Creator', function () {
    it('should not throw an exception', function () {
      expect(ConceptNetwork).to.not.throw(Error)
    })

    it('should be called from a derived constructor', function () {
      var DerivedConceptNetwork = function () {
        // Inherit ConceptNetwork
        return ConceptNetwork()
      }
      var derived = DerivedConceptNetwork()
      expect(derived).to.have.property('addLink')
      expect(derived).to.have.property('addNode')
      expect(derived).to.have.property('addNodes')
      expect(derived).to.have.property('decrementLink')
      expect(derived).to.have.property('decrementNode')
      expect(derived).to.have.property('getLink')
      expect(derived).to.have.property('getNode')
      expect(derived).to.have.property('getNodeById')
      expect(derived).to.have.property('getNodeFromLinks')
      expect(derived).to.have.property('getNodeToLinks')
      expect(derived).to.have.property('removeLink')
      expect(derived).to.have.property('removeNode')
    })
  })

  var cn

  // ### addNode
  describe('addNode', function () {
    before(function () {
      cn = ConceptNetwork()
    })

    it('should return an object', function () {
      return cn.addNode({ label: 'Chuck Norris' })
      .then(node => {
        expect(node.id).to.be.equal(0)
        expect(node.label).to.be.equal('Chuck Norris')
        expect(node.occ).to.be.equal(1)
      })
    })

    it('should increment occ', function () {
      return cn.addNode({ label: 'Chuck Norris' })
      .then(node => {
        expect(node.id).to.be.equal(0)
        expect(node.occ).to.be.equal(2)
      })
    })

    it('should increment nodeLastId', function () {
      return cn.addNode({ label: 'World' })
      .then(node => {
        expect(node.id).to.be.equal(1)
        expect(cn.node).to.have.lengthOf(2)
      })
    })

    it('should increment a previous node too', function () {
      return cn.addNode({ label: 'Chuck Norris' })
      .then(node => {
        expect(node.id).to.be.equal(0)
        expect(node.occ).to.be.equal(3)
      })
    })

    it('should increment more than one', function () {
      return cn.addNode({ label: 'Steven Seagal' }, 3)
      .then(node => {
        expect(node.id).to.be.equal(2)
        expect(node.occ).to.be.equal(3)
      })
    })

    it('should accept a second argument with a undefined value', function () {
      return cn.addNode({ label: 'Jean-Claude Van Damme' }, undefined)
      .then(node => {
        expect(node.id).to.be.equal(3)
        expect(node.occ).to.be.equal(1)
      })
    })
  })

  // ### decrementNode
  describe('decrementNode', function () {
    it('should decrement a node with occ of 3', function () {
      return cn.decrementNode({ label: 'Chuck Norris' })
      .then(node => {
        expect(node.id).to.be.equal(0)
        expect(node.occ).to.be.equal(2)
      })
    })

    it('should remove a node with an occ of 1', function () {
      return cn.decrementNode({ label: 'World' })
      .then(node => {
        expect(node).to.be.null
      })
    })

    it('should return null when node does not exist', function () {
      return cn.decrementNode({ label: 'unexisting' })
      .then(node => {
        expect(node).to.be.null
      })
    })
  })

  // ### addNodes
  describe('addNodes', () => {
    beforeEach(() => {
      cn = ConceptNetwork()
    })

    it('should return an array', () => {
      return cn.addNodes([
        { label: 'node1' },
        { label: 'node2' }
      ])
      .then(nodes => {
        expect(nodes).to.be.an('array')
      })
    })

    it('should return a good-sized array', () => {
      return cn.addNodes([
        { label: 'node1' },
        { label: 'node2' }
      ])
      .then(nodes => {
        expect(nodes).to.be.lengthOf(2)
      })
    })

    it('should return nodes', () => {
      return cn.addNodes([
        { label: 'node1' },
        { label: 'node2' }
      ])
      .then(nodes => {
        expect(nodes[0]).to.have.property('label')
        expect(nodes[0]).to.have.property('id')
        expect(nodes[0].id).to.be.equal(0)
        expect(nodes[1]).to.have.property('label')
        expect(nodes[1]).to.have.property('id')
        expect(nodes[1].id).to.be.equal(1)
      })
    })
  })

  // ### removeNode
  describe('removeNode', function () {
    beforeEach(function () {
      cn = ConceptNetwork()
      return cn.addNode({ label: 'Node 1' })
      .then(node1 => {
        node1.occ = 2
        return cn.addNode({ label: 'Node 2' })
      })
      .then(node2 => {
        return cn.addNode({ label: 'Node 3' })
      })
      .then(node3 => {
        return cn.addNode({ label: 'Node 4' })
      })
      .then(node4 => {
        return cn.addLink(1, 2)
      })
      .then(link23 => {
        return cn.addLink(2, 3)
      })
    })

    it('should remove even a node with occ value of 2', function () {
      expect(cn.node[0].occ).to.be.equal(2)
      return cn.removeNode(cn.node[0].id)
      .then(() => {
        expect(cn.node[0]).to.be.undefined
      })
    })

    it('should remove the links from the removed node', function () {
      return cn.removeNode(2)
      .then(() => {
        expect(cn.link['2_3']).to.be.undefined
      })
    })

    it('should remove the links to the removed node', function () {
      return cn.removeNode(4)
      .then(() => {
        expect(cn.link['3_4']).to.be.undefined
      })
    })
  })

  describe('addLink', function () {
    before(function () {
      cn = new ConceptNetwork()
      return cn.addNode({ label: 'Node 1' })
      .then(node1 => {
        return cn.addNode({ label: 'Node 2' })
      })
      .then(node2 => {
        return cn.addNode({ label: 'Node 3' })
      })
    })

    it('should return an object', function () {
      return cn.addLink(1, 2)
      .then(link => {
        expect(link).to.be.an('object')
        expect(link.coOcc).to.be.equal(1)
      })
    })

    it('should increment coOcc', function () {
      return cn.addLink(1, 2)
      .then(link => {
        expect(link.coOcc).to.be.equal(2)
      })
    })

    it('should increment with more than 1', function () {
      return cn.addLink(1, 2, 4)
      .then(link => {
        expect(link.coOcc).to.be.equal(6)
      })
    })

    it('should create a good fromIndex', function () {
      return cn.addLink(1, 3)
      .then(link => {
        expect(Array.from(cn.fromIndex[1].values())).to.be.deep.equal(['1_2', '1_3'])
      })
    })

    it('should not accept non number ids', function (done) {
      cn.addLink(1, 'berf')
      .then(link => {
      })
      .catch(err => {
        expect(err).to.be.an('error')
      })
      .then(() => {
        return cn.addLink('barf', 2)
      })
      .catch(err => {
        expect(err).to.be.an('error')
        done()
      })
    })

    it('should increment by 1, without an inc', function () {
      return cn.addLink(1, 2, undefined)
      .then(link => {
        expect(link.coOcc).to.be.equal(7)
      })
    })
  })

  describe('decrementLink', function () {
    before(function () {
      cn = ConceptNetwork()
      return cn.addNode({ label: 'Node 1' })
      .then(node1 => {
        return cn.addNode({ label: 'Node 2' })
      })
      .then(node2 => {
        return cn.addLink(1, 2)
      })
      .then(link => {
        return cn.addLink(1, 2)
      })
    })

    it('should decrement a coOcc value of 2', function () {
      expect(cn.link['1_2'].coOcc).to.be.equal(2)
      return cn.decrementLink('1_2')
      .then(link => {
        expect(cn.link['1_2'].coOcc).to.be.equal(1)
      })
    })

    it('should remove a link with a coOcc value of 0', function () {
      expect(cn.link['1_2'].coOcc).to.be.equal(1)
      return cn.decrementLink('1_2')
      .then(() => {
        expect(cn.link['1_2']).to.be.undefined
      })
    })
  })

  describe('removeLink', function () {
    beforeEach(function () {
      cn = ConceptNetwork()
      return cn.addNode({ label: 'Node 1' })
      .then(() => {
        return cn.addNode({ label: 'Node 2' })
      })
      .then(() => {
        return cn.addLink(1, 2)
      })
    })

    it('should remove the link', function () {
      expect(cn.link['1_2']).to.be.deep.equal({ fromId: 1, toId: 2, coOcc: 1 })
      return cn.removeLink('1_2')
      .then(() => {
        expect(cn.link['1_2']).to.be.undefined
      })
    })

    it('should remove the link, even with a toId', function () {
      expect(cn.link['1_2']).to.be.deep.equal({ fromId: 1, toId: 2, coOcc: 1 })
      return cn.removeLink(1, 2)
      .then(() => {
        expect(cn.link['1_2']).to.be.undefined
      })
    })
  })

  describe('getters', function () {
    before(function () {
      cn = ConceptNetwork()
      return cn.addNode({ label: 'Node 1' })
      .then(() => {
        return cn.addNode({ label: 'Node 2' })
      })
      .then(() => {
        return cn.addNode({ label: 'Node 3' })
      })
      .then(() => {
        return cn.addLink(0, 1)
      })
      .then(() => {
        return cn.addLink(0, 2)
      })
      .then(() => {
        return cn.addLink(1, 2)
      })
    })

    describe('getNode', function () {
      it('should get the second node', function () {
        return cn.getNode({ label: 'Node 2' })
        .then(node => {
          expect(node.id).to.be.equal(1)
        })
      })

      it('should return undefined when the node does not exist', function () {
        return cn.getNode({ label: 'Nonexistent' })
        .then(node => {
          expect(node).to.be.undefined
        })
      })
    })

    describe('getLink', function () {
      it('should get the link', function () {
        return cn.getLink('1_2')
        .then(link => {
          expect(link.fromId).to.be.equal(1)
          expect(link.toId).to.be.equal(2)
          expect(link.coOcc).to.be.equal(1)
        })
      })

      it('should get the link with two parameters', function () {
        return cn.getLink(1, 2)
        .then(link => {
          expect(link.fromId).to.be.equal(1)
          expect(link.toId).to.be.equal(2)
          expect(link.coOcc).to.be.equal(1)
        })
      })

      it('should return undefined when the node does not exist', function () {
        return cn.getLink(1, 100)
        .then(link => {
          expect(link).to.be.undefined
        })
      })
    })

    describe('getNodeFromLinks', function () {
      it('should get all links from node 2', function () {
        return cn.getNodeFromLinks(1)
        .then(fromLinks => {
          expect(fromLinks).to.be.deep.equal(['1_2'])
        })
      })

      it('should get all links from node 1', function () {
        return cn.getNodeFromLinks(0)
        .then(fromLinks => {
          expect(fromLinks).to.be.deep.equal(['0_1', '0_2'])
        })
      })

      it('should get no links from node 3', function () {
        return cn.getNodeFromLinks(2)
        .then(fromLinks => {
          expect(fromLinks).to.be.deep.equal([])
        })
      })
    })

    describe('getNodeToLinks', function () {
      it('should get all links to node 2', function () {
        return cn.getNodeToLinks(1)
        .then(toLinks => {
          expect(toLinks).to.be.deep.equal(['0_1'])
        })
      })

      it('should get all links to node 3', function () {
        return cn.getNodeToLinks(2)
        .then(toLinks => {
          expect(toLinks).to.be.deep.equal(['0_2', '1_2'])
        })
      })

      it('should get no links to node 1', function () {
        return cn.getNodeToLinks(0)
        .then(toLinks => {
          expect(toLinks).to.be.deep.equal([])
        })
      })
    })
  })
})
