import 'babel-polyfill'
import Tokenizer from 'sentence-tokenizer'
import ConceptNetwork from './concept-network'
import {ConceptNetworkState} from './concept-network-state'
import Debug from 'debug'
const debug = Debug('ector:ector') // eslint-disable-line no-unused-vars

export function Ector (name = 'ECTOR', username = 'Guy') {
  const ector = {
    set name (name) {
      if (typeof name !== 'string') {
        name = 'ECTOR'
      }
      if (name.length < 3) {
        name = 'ECTOR'
      }
      this._name = name
    },

    get name () {
      return this._name
    },

    set user (name) {
      if (typeof name !== 'string') {
        name = 'Guy'
      }
      if (name.length < 3) {
        name = 'Guy'
      }
      if (!this.cns[name]) {
        this.cns[name] = ConceptNetworkState()
      }
      this._username = name
      this.lastSentenceNodeId = null
    },

    get user () {
      return this._username
    },

    cns: {
    },

    cn: ConceptNetwork(),

    lastSentenceNodeId: null,

    addEntry (entry, cns = this.cns[this.user]) {
      if (typeof entry !== 'string') {
        return new Error('An entry should be a string!')
      }
      if (!entry.length) {
        return new Error('An entry should not be empty!')
      }
      this.cn.addNode({
        label: entry,
        type: 'e'
      })
      let allTokenNodes = []
      const tokenizer = new Tokenizer(this.user, this.name)
      tokenizer.setEntry(entry)
      const sentences = tokenizer.getSentences()
      const sentencesObjects = sentences.map(sentence => ({
        label: sentence,
        type: 's'
      }))
      const sentencesNodes = this.cn.addNodes(sentencesObjects)
      this.lastSentenceNodeId = sentencesNodes[sentencesNodes.length - 1].id
      sentencesNodes.forEach((sentence, index) => {
        cns.activate(sentence)
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
      })
      return allTokenNodes
    },

    getLastSentenceNode () {
      return this.cn.getNodeById(this.lastSentenceNodeId)
    },

    generateResponse () {
      const lastSentenceNode = this.getLastSentenceNode()
      const fakeResponse = lastSentenceNode.label
        .replace(/{yourname}/g, this.user)
        .replace(/{myname}/g, this.name)
      return { sentence: fakeResponse, nodes: [2, 3] }
    },

    linkNodesToLastSentence(nodes) {
      for (let i in nodes) {
        this.cn.addLink(nodes[i], this.lastSentenceNodeId)
      }
    }
  }

  ector.name = name
  ector.user = username

  return ector
}
