

export default function (state, emitter) {
  state.themes = {
    dark: {
      name: 'dark',

      bg1: 'bg-pretty-black',
      bg2: 'bg-dark-gray',

      fg1: 'near-white',
      fg2: 'silver',
      fg3: 'gray',
      fg4: 'dark-gray',

      border1: 'b--white-90',
      border2: 'b--white-70',
      border3: 'b--white-50',
      border4: 'b--white-30',
    },

    light: {
      name: 'light',

      bg1: 'bg-near-white',
      bg2: 'bg-light-gray',

      fg1: 'near-black',
      fg2: 'dark-gray',
      fg3: 'gray',
      fg4: 'mid-gray',

      border1: 'b--black-90',
      border2: 'b--black-70',
      border3: 'b--black-50',
      border4: 'b--black-30',
    },
  }

  state.theme =
    state.themes[ read('theme') || 'dark']

  emitter.on('theme', name => {
    if (!name) {
      switch (state.theme.name) {
        case 'light': {
          state.theme = state.themes.dark
          save('theme', 'dark')
          return emitter.emit('render')
        }

        case 'dark': {
          state.theme = state.themes.light
          save('theme', 'light')
          return emitter.emit('render')
        }
      }
    }

    if (Object.keys(state.themes).includes(name)) {
      state.theme = state.themes[name]
      save('theme', name)
    } else {
      console.log('no such theme:', val)
    }
  })

  function save (k, v) {
    if (typeof window === 'undefined')
      return

    return localStorage.setItem(k, v)
  }

  function read (k) {
    if (typeof window === 'undefined')
      return

    return localStorage.getItem(k)
  }
}
