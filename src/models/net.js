

export default (state, emitter) => {
  state.net = {}
  
  emitter.on('connect', token => {
    if (!token)
      throw 'DUHH: connect() requires an access token'

    const source =
      state.net.source =
        new EventSource(`/recv?token=${token}`)

    source.onmessage = (e) => {
      try {
        const {event, data} =
          JSON.parse(e.data)

        switch (event) {
          case 'heartbeat':
            return

          case 'session':
            return emitter.emit('session', data)

          case 'message':
            return emitter.emit('message', data)

          case 'close': {
            return source.close()
          }

          default:
            return console.log('unhandled sse event:', event)
        }
      }
      catch (err) {
        console.log(err)
      }
    }

    source.onerror = e => {
      if (e.target.readyState == EventSource.CLOSED) {
        state.net.source = null
        console.log('disconnected')
      } else if (e.target.readyState == EventSource.CONNECTING) {
        console.log('connecting')
      }
    }
  })

}
