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
    username,
    cns: {
    },
    setUser (name) {
      if (typeof name !== 'string') {
        name = 'Guy'
      }
      if (name.length < 3) {
        name = 'Guy'
      }
      if (!this.cns[name]) {
        this.cns[name] = {}
      }
      this.username = name
    }
  }

  ector.name = name
  ector.setUser(username)

  return ector
}
