/*jshint node:true curly: true, eqeqeq: true, immed: true, latedef: true, newcap: true, noarg: true, sub: true, undef: true, eqnull: true, laxcomma: true, white: true, indent: 2 */
/*
 * ector
 * https://github.com/parmentf/node-ector
 *
 * Copyright (c) 2012 François Parmentier
 * Licensed under the MIT license.
 */
"use strict";

// ## Node modules
var debug = require('debug')('ector:lib');
var sugar = require('sugar');

var Tokenizer = require('sentence-tokenizer');
var concept_network = require('concept-network');
var ConceptNetwork = concept_network.ConceptNetwork;
var ConceptNetworkState = concept_network.ConceptNetworkState;
var rwc = require('random-weighted-choice');

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

  if (name instanceof Error) {
    debug('name', name);
  }
  if (user instanceof Error) {
    debug('user', user);
  }

  this.cn = new ConceptNetwork();
  this.cns = {}; // username -> ConceptNetworkState

  this.lastSentenceNodeId = null;

  if (username) {
    user = this.setUser(username);
  }
  else {
    user = this.setUser(this.username);
  }

}

// ## Ector's methods
Ector.prototype = {
  rwc : rwc,

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
    if (typeof this.cns[this.username] === 'undefined') {
      this.cns[this.username] = new ConceptNetworkState(this.cn);
    }
    this.lastSentenceNodeId = null;
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
   * @param {conceptNetworkState} cns
   * @return {Array|Error} array of token nodes
   **/
  addEntry : function (entry, cns) {
    if (typeof entry !== 'string') {
      return new Error("entry should be a string");
    }
    if (entry.length === 0) {
      return new Error("entry should not be empty");
    }
    cns = cns || this.cns[this.username];
    var tokenizer = new Tokenizer(this.username, this.name);
    tokenizer.setEntry(entry);
    var sentences = tokenizer.getSentences();
    var tokens = [];
    var tokenNodes = [];
    var prevSentenceNode = null;
    var sentenceNode;
    var prevTokenNode;
    var curTokenNode;
    var curToken;
    // all sentences
    for (var sentenceIndex in sentences) {
      tokens = tokenizer.getTokens(Number(sentenceIndex));
      sentenceNode = this.cn.addNode('s' + sentences[sentenceIndex]);
      if (prevSentenceNode) {
        this.cn.addLink(prevSentenceNode.id, sentenceNode.id);
      }
      if (Number(sentenceIndex) === 0) {
        this.lastSentenceNodeId = sentenceNode.id;
      }
      cns.activate(sentenceNode.id);
      // Tokens in the sentence
      prevTokenNode = null;
      for (var tokenIndex in tokens) {
        curToken = tokens[tokenIndex];
        curTokenNode = this.cn.addNode('w' + curToken);
        // First token of a sentence
        if (Number(tokenIndex) === 0) {
          if (typeof curTokenNode.beg === 'undefined') { curTokenNode.beg = 1; }
          else { curTokenNode.beg += 1; }
        }
        // tokens in the middle of the sentence
        else if (tokenIndex > 0 && tokenIndex < tokens.length - 1) {
          if (typeof curTokenNode.mid === 'undefined') { curTokenNode.mid = 1; }
          else { curTokenNode.mid += 1; }
        }
        this.cn.addLink(sentenceNode.id, curTokenNode.id);
        tokenNodes = tokenNodes.concat(curTokenNode);
        cns.activate(curTokenNode.id);
        // Link previous token to current one
        if (prevTokenNode) {
          this.cn.addLink(prevTokenNode.id, curTokenNode.id);
        }
        prevTokenNode = curTokenNode;
      } // For all tokens in the sentence
      // Last token of a sentence
      if (typeof tokenNodes[tokenNodes.length - 1].end === 'undefined') { tokenNodes[tokenNodes.length - 1].end = 1; }
      else { tokenNodes[tokenNodes.length - 1].end += 1; }
      prevSentenceNode = sentenceNode;
    } // For all sentences
    return tokenNodes;
  },

  /**
   * ###generateForward
   *
   * Generate the end of a sentence, adding tokens to the list of token
   * nodes in phrase.
   *
   * @param {Array} phraseNodes array of token nodes
   * @param {Number} temperature
   * @return {Array} array of token nodes (end of phrase)
   **/
  generateForward : function (phraseNodes, temperature) {
    var outgoingLinks = this.cn.getNodeFromLinks(phraseNodes[phraseNodes.length - 1].id);
    var nextNodes = []; // [{id, weight}]
    for (var ol in outgoingLinks) {
      var linkId = outgoingLinks[ol];
      var link = this.cn.link[linkId];
      var toNode = this.cn.node[link.toId];
      // When toNode is a word token
      if (toNode.label.slice(0, 1) === 'w') {
        var activationValue = this.cns[this.username].getActivationValue(toNode.id);
        activationValue = Math.max(activationValue, 1);
        var repeatNb = phraseNodes.count(toNode);
        var len = toNode.label.length;
        // If the node is not present more than 3 times
        if (repeatNb * len <= 5 * 3) {
          var repetition = 1 + repeatNb * repeatNb * len;
          nextNodes.push({
            id: toNode.id,
            weight: link.coOcc * activationValue / repetition
          });
        }
      }
    }
    // Stop condition
    if (nextNodes.length === 0) {
      return phraseNodes;
    }
    // Choose one node among the tokens following the one at the end of the
    // phrase
    var chosenItem = this.rwc(nextNodes, temperature);
    var chosenTokenNode = this.cn.node[chosenItem];
    phraseNodes.push(chosenTokenNode);

    // Recursively generate the remaining of the phrase
    return this.generateForward(phraseNodes, temperature);
  },

  /**
   * ###generateBackward
   *
   * Generate the begining of a sentence, adding tokens to the list of token
   * nodes in phrase.
   *
   * @param {Array} phraseNodes array of token nodes
   * @param {Number} temperature
   * @return {Array} array of token nodes
   **/
  generateBackward : function (phraseNodes, temperature) {
    var incomingLinks = this.cn.getNodeToLinks(phraseNodes[0].id);
    var previousNodes = []; // [{id, weight}]
    for (var ol in incomingLinks) {
      var linkId = incomingLinks[ol];
      var link = this.cn.link[linkId];
      var fromNode = this.cn.node[link.fromId];
      // When fromNode is a word token
      if (fromNode.label.slice(0, 1) === 'w') {
        var activationValue = this.cns[this.username].getActivationValue(fromNode.id);
        activationValue = Math.max(activationValue, 1);
        var repeatNb = phraseNodes.count(fromNode);
        var len = fromNode.label.length;
        // If the node is not present more than 3 times
        if (repeatNb * len <= 5 * 3) {
          var repetition = 1 + repeatNb * repeatNb * len;
          previousNodes.push({
            id: fromNode.id,
            weight: link.coOcc * activationValue / repetition
          });
        }
      }
    }
    // Stop condition
    if (previousNodes.length === 0) {
      return phraseNodes;
    }
    // Choose one node among the tokens following the one at the end of the
    // phrase
    var chosenItem = this.rwc(previousNodes, temperature);
    var chosenTokenNode = this.cn.node[chosenItem];
    phraseNodes = [chosenTokenNode].concat(phraseNodes);
    // Recursively generate the remaining of the phrase
    return this.generateBackward(phraseNodes, temperature);
  },

  /**
   * ### generateResponse
   *
   * Generate a response from the Concept Network and a network state.
   * @return {Object} { response, nodes } The response is a string, and nodes is an array of nodes.
   **/
  generateResponse : function () {
    // Propagation activations through links
    var cns = this.cns[this.username];
    cns.propagate();
    // Choose a token node among the most activated ones
    var maxActivationValue = cns.getMaximumActivationValue('w');
    var tokens = cns.getActivatedTypedNodes('w', maxActivationValue - 10);
    var toChoose = [];
    for (var i in tokens) {
      toChoose.push({ weight: tokens[i].activationValue,
                      id: tokens[i].node.id });
    }
    var temperature = 60;
    var chosenItem = this.rwc(toChoose, temperature);
    var chosenTokenNode = this.cn.node[chosenItem];
    var phraseNodes = [chosenTokenNode];
    // Generate forwards
    phraseNodes = this.generateForward(phraseNodes, temperature);
    // Generate backwards
    phraseNodes = this.generateBackward(phraseNodes, temperature);
    // Generate string
    var sentence = phraseNodes.map(function (node) {
      return node.label.slice(1);
    }).join(' ');
    var nodes = phraseNodes.map(function (node) {
      return node.id;
    });
    sentence = sentence.replace(/\{yourname\}/g, this.username);
    sentence = sentence.replace(/\{myname\}/g, this.name);
    return { sentence: sentence, nodes: nodes };
  },

  /**
   * ### linkNodesToLastSentence
   *
   * Link nodes to the previous sentence node id (this is automatically set by
   * addEntry, it is the node id of the first sentence of the entry).
   *
   * Used with the nodes returned by addEntry.
   *
   * @param {Array} nodes Array of nodes ids.
   **/

  linkNodesToLastSentence : function (nodes) {
    for (var i in nodes) {
      var nodeId = nodes[i];
      this.cn.addLink(nodeId, this.lastSentenceNodeId);
    }
  },

  /**
   * ### injectConceptNetwork
   *
   * inject a new ConceptNetwork constructor.
   * Useful when one wants to use specialized ConceptNetwork (e.g.
   * FileConceptNetwork)
   *
   * WARNING: reinitialize this.cn and this.cn[this.username].cns
   * @param {ConceptNetwork} NewConceptNetwork
   */
  injectConceptNetwork : function (NewConceptNetwork) {
    if (NewConceptNetwork && NewConceptNetwork.super_ &&
      NewConceptNetwork.super_.name &&
      NewConceptNetwork.super_.name === 'ConceptNetwork') {
      this.cn = new NewConceptNetwork();
      ConceptNetwork = NewConceptNetwork;
      this.cns[this.username] = new ConceptNetworkState(this.cn);
    }
    else {
      this.cn = new ConceptNetwork();
      throw new Error('NewConceptNetwork is not a ConceptNetwork');
    }
  }

};


module.exports = Ector;
