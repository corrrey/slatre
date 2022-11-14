const HOSTNAME =
  (process.env['NODE_ENV'] === 'production' && 'slater.sh') || location.hostname

export default (state, emitter) => {
  if (typeof localStorage !== 'object') return

  const token = (state.auth.token = JSON.parse(
    localStorage.getItem('auth_token') || 'null'
  ))

  if (!token) {
    register()
  }

  async function register() {
    const hostname = location.hostname

    if (hostname !== HOSTNAME) throw 'invalid host'

    // we always start with a guest token //
    const token = await JSON.parse(await fetch('/register'))

    console.log(token)
  }
}
