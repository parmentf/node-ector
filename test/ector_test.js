/*jshint node:true curly: true, eqeqeq: true, immed: true, latedef: true, newcap: true, noarg: true, sub: true, undef: true, eqnull: true, laxcomma: true, white: true, indent: 2 */
/*global describe: true, it: true */
"use strict";

// # Tests for ECTOR module

// ## Required libraries
var debug = require('debug')('ector:test');
var assert = require('assert'); // Maybe one day "should"?

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

  });
});

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

    // it('should not be change using property username', function () {
    //   var ector = new Ector();
    //   assert.equal(ector.username, "Guy");
    //   ector.username = "Nope";
    //   assert.equal(ector.username, "Guy");
    // });
  });

});

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

});
