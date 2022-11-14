

export default (state, emitter) => {
  state.commands = {
    theme: val => {
      emitter.emit('theme', val)
    },

    clear: _ => ({type: 'system', body:`[.full]`}),

    default: command => ({
      type: 'system',
      body: `/${command}: not implemented`
    }),

    login: server => emitter.emit('login', server),

    join: room => emitter.emit('join', room),

    
  }
}