

export default (state, emitter) => {
  state.net = {}
  
  emitter.on('connect', token => {
    if (!token)
      throw 'DUHH: connect() requires an access token'

    // not using our own server now, or sse, but connecting directly to Fauna 😱
    // TODO next

  })

}
