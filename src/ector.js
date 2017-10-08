import 'babel-polyfill';
import Tokenizer from 'sentence-tokenizer';
import { ConceptNetwork } from './concept-network';
import { ConceptNetworkState } from './concept-network-state';
import assert from 'assert';
import Debug from 'debug';
const debug = Debug('ector:ector'); // eslint-disable-line no-unused-vars

export function Ector(name = 'ECTOR', username = 'Guy') {
  const ector = {
    set name(name) {
      if (typeof name !== 'string') {
        name = 'ECTOR';
      }
      if (name.length < 3) {
        name = 'ECTOR';
      }
      this._name = name;
    },

    get name() {
      return this._name;
    },

    set user(name) {
      if (typeof name !== 'string') {
        name = 'Guy';
      }
      if (name.length < 3) {
        name = 'Guy';
      }
      if (!this.cns[name]) {
        this.cns[name] = ConceptNetworkState(this.cn);
      }
      this._username = name;
      this.lastSentenceNodeId = null;
    },

    get user() {
      return this._username;
    },

    cns: {},

    cn: ConceptNetwork(),

    lastSentenceNodeId: null,

    createTokens(sentence, index, tokenizer) {
      const tokens = tokenizer.getTokens(index);
      return tokens.reduce((sequence, token, index) => {
        return this.cn
          .getNode({ label: token, type: 'w' })
          .then((oldToken = { beg: 0, mid: 0, end: 0 }) => {
            const tokenObject = {
              label: token,
              type: 'w',
              beg: oldToken.beg + (index === 0 ? 1 : 0),
              mid:
                oldToken.mid +
                (index !== 0 && index < tokens.length - 1 ? 1 : 0),
              end: oldToken.end + (index === tokens.length - 1 ? 1 : 0)
            };
            return new Promise((resolve, reject) => resolve(tokenObject));
          });
      }, Promise.resolve());
      // returns a Promise(tokensObjects)
    },

    addEntry(entry, cns = this.cns[this.user]) {
      return new Promise((resolve, reject) => {
        if (typeof entry !== 'string') {
          return reject(new Error('An entry should be a string!'));
        }
        if (!entry.length) {
          return reject(new Error('An entry should not be empty!'));
        }
        this.cn
          .addNode({
            label: entry,
            type: 'e'
          })
          .then(node => {
            let allTokenNodes = [];
            const tokenizer = new Tokenizer(this.user, this.name);
            tokenizer.setEntry(entry);
            const sentences = tokenizer.getSentences();
            const sentencesObjects = sentences.map(sentence => ({
              label: sentence,
              type: 's'
            }));
            const sentencesNodes = this.cn.addNodes(sentencesObjects);
            this.lastSentenceNodeId =
              sentencesNodes[sentencesNodes.length - 1].id;
            sentencesNodes.forEach((sentence, index) => {
              cns
                .activate(sentence)
                .then(state => {
                  return this.createTokens(sentence, index, tokenizer);
                })
                .then(tokensObjects => this.cn.addNodes(tokensObjects))
                .then(tokensNodes => {
                  for (let i = 0; i < tokensNodes.length; i++) {
                    if (i < tokensNodes.length - 1) {
                      this.cn.addLink(tokensNodes[i].id, tokensNodes[i + 1].id);
                    }
                    this.cn.addLink(
                      sentencesNodes[index].id,
                      tokensNodes[i].id
                    );
                    cns.activate(tokensNodes[i]);
                  }

                  allTokenNodes = [...allTokenNodes, ...tokensNodes];
                });
              /*
            const tokens = tokenizer.getTokens(index)
            const tokensObjects = tokens.map((token, index, array) => {
              const oldToken = this.cn.getNode({label: token, type: 'w'}) ||
                { beg: 0, mid: 0, end: 0 }
              const tokenNode = {
                label: token,
                type: 'w',
                beg: oldToken.beg + (index === 0 ? 1 : 0),
                mid: oldToken.mid + (index !== 0 && index < array.length - 1 ? 1 : 0),
                end: oldToken.end + (index === array.length - 1 ? 1 : 0)
              }
              return tokenNode
            })
            const tokensNodes = this.cn.addNodes(tokensObjects)

            for (let i = 0; i < tokensNodes.length; i++) {
              if (i < tokensNodes.length - 1) {
                this.cn.addLink(tokensNodes[i].id, tokensNodes[i + 1].id)
              }
              this.cn.addLink(sentencesNodes[index].id, tokensNodes[i].id)
              cns.activate(tokensNodes[i])
            }

            allTokenNodes = [...allTokenNodes, ...tokensNodes]
*/
            });
            return resolve(allTokenNodes);
          });
      });
    },

    getLastSentenceNode() {
      return this.cn.getNodeById(this.lastSentenceNodeId);
    },

    generateResponse() {
      const lastSentenceNode = this.getLastSentenceNode();
      const fakeResponse = lastSentenceNode.label
        .replace(/{yourname}/g, this.user)
        .replace(/{myname}/g, this.name);
      return { sentence: fakeResponse, nodes: [2, 3] };
    },

    linkNodesToLastSentence(nodes) {
      for (let i in nodes) {
        this.cn.addLink(nodes[i], this.lastSentenceNodeId);
      }
    },

    _ConceptNetwork: ConceptNetwork(),

    set ConceptNetwork(newConceptNetwork) {
      assert.equal(typeof newConceptNetwork, 'function');
      this._ConceptNetwork = newConceptNetwork;
      this.cn = this._ConceptNetwork();
      assert(this.cn.addNode);
      assert(this.cn.addLink);
      assert(this.cn.getNode);
      this.cns[this.user] = ConceptNetworkState(this.cn);
    },

    get ConceptNetwork() {
      return this._ConceptNetwork;
    }
  };

  ector.name = name;
  ector.user = username;
  ector.ConceptNetwork = ConceptNetwork;

  return ector;
}
