/*jshint node:true curly: true, eqeqeq: true, immed: true, latedef: true, newcap: true, noarg: true, sub: true, undef: true, eqnull: true, laxcomma: true, white: true, indent: 2 */
/*
 * ector
 * https://github.com/francois/node-ector
 *
 * Copyright (c) 2012 François Parmentier
 * Licensed under the MIT license.
 */
"use strict";

// ## Node modules
var debug = require('debug')('ector:lib');

/**
 * ## Ector's constructor
 * Use it to instanciate one bot.
 *
 * Warning: username and botname should be at least 3 characters long.
 *
 * @param {string} botname name of the bot (default: ECTOR)
 * @param {string} username name of the user (default: Guy)
 */
function Ector(botname, username) {

  this.name = "ECTOR";
  var name;
  if (botname) {
    name = this.setName(botname);
  }

  this.username = "Guy";
  var user;
  if (username) {
    user = this.setUser(username);
  }

  if (name instanceof Error) {
    debug('name', name);
  }
  if (user instanceof Error) {
    debug('user', user);
  }
}

// ## Ector's methods
Ector.prototype = {
  /**
   * ### setUser
   * 
   * @this Ector
   * @param {string} username new user's name
   * @return {string|Error} the user's name or an Error.
   */
  setUser : function (username) {
    if (typeof username !== 'string') {
      return new Error("Username should be a string");
    }
    if (username.length === 0) {
      return new Error("Username should not be empty");
    }
    if (username.length < 3) {
      return new Error("Username should be at least 3 characters long");
    }
    this.username = username;
    return this.username;
  },

  /**
   * ### setName
   * @param {string} botname new bot's name
   * @return {string|Error} the name of the bot, or an Error.
   */
  setName : function (botname) {
    if (typeof botname !== 'string') {
      return new Error("botname should be a string");
    }
    this.name = botname;
    return this.name;
  },

  /**
   * ### addEntry
   *
   * Add an entry into the ECTOR's Concept Network
   *
   * @param {string} entry One or several sentences.
   * @return {Array|Error} array of token nodes
   **/
  addEntry : function (entry) {
    if (typeof entry !== 'string') {
      return new Error("entry should be a string");
    }
    if (entry.length === 0) {
      return new Error("entry should not be empty");
    }
    return [entry];
  }
};


module.exports = Ector;
