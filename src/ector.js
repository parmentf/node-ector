export function Ector (name = 'ECTOR', username = 'Guy') {
  if (typeof name !== 'string') {
    name = 'ECTOR'
  }

  const ector = {
    name,
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

  ector.setUser(username)

  return ector
}
