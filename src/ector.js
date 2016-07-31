export function Ector (name = 'ECTOR', username = 'Guy') {
  const ector = {
    set name (name) {
      if (typeof name !== 'string') {
        name = 'ECTOR'
      }
      this._name = name
    },

    get name () {
      return this._name
    },

    set user(name) {
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
    },

    get user() {
      return this._username
    },

    cns: {
    },
  }

  ector.name = name
  ector.user = username

  return ector
}
