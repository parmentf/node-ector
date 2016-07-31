import 'babel-polyfill'
import Tokenizer from 'sentence-tokenizer'
import ConceptNetwork from './concept-network'

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
        this.cns[name] = {}
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

    addEntry (entry) {
      if (typeof entry !== 'string') {
        return new Error('An entry should be a string!')
      }
      if (!entry.length) {
        return new Error('An entry should not be empty!')
      }
      this.cn.node.push({
        label: entry,
        type: 'e'
      })
      let allTokenNodes = []
      const tokenizer = new Tokenizer(this.user, this.name)
      tokenizer.setEntry(entry)
      const sentences = tokenizer.getSentences()
      const sentencesNodes = sentences.map(sentence => ({
        label: sentence,
        type: 's'
      }))
      this.cn.addNodes(sentencesNodes)
      sentencesNodes.forEach((sentence, index) => {
        const tokens = tokenizer.getTokens(index)
        const tokensNodes = tokens.map((token, index, array) => {
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
        this.cn.addNodes(tokensNodes)

        for (let i = 0; i < tokensNodes.length - 1; i++) {
          this.cn.addLink(tokensNodes[i].id, tokensNodes[i + 1].id)
        }

        allTokenNodes = [...allTokenNodes, ...tokensNodes]
      })
      return allTokenNodes
    }
  }

  ector.name = name
  ector.user = username

  return ector
}
