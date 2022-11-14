import 'tachyons/css/tachyons.min.css'
import 'tachyons-grid-layout/css/tachyons-grid-layout.css'
import 'animate.css'
import './css/styles.css'
import './css/codemirror.css'
import './css/editor-dark.css'
import './css/editor-light.css'

import Monoapp from 'monoapp'
import morph from 'nanomorph'
import devtools from 'choo-devtools'

import theme from './models/theme'
import commands from './models/commands'
import editor from './models/editor'
import main from './models/main'
import net from './models/net'
import scripting from './models/scripting'
import core from './models/core'

import mainView from './views/main'

const app = Monoapp({
  mount: morph,
  render: morph,
  toString: (tree) => tree.toString(),
})

if (process.env.NODE_ENV !== 'production') {
  app.use(devtools())
}

app.use(async (state, emitter) => {
  if (typeof window === 'undefined') return

  window.onresize = (_) => {
    emitter.emit('render')
  }

  window.onbeforeunload = (_) => {
    const scrollPosition = document.getElementById('track').scrollTop.toString()

    sessionStorage.setItem(`scroll-${state.href}`, scrollPosition)
  }

  function restoreScroll() {
    const savedScroll = sessionStorage.getItem(`scroll-${state.href}`)

    if (savedScroll) {
      const track = document.getElementById('track')

      track.scrollTop = savedScroll
    }
  }

  emitter.on('DOMContentLoaded', (_) => {
    requestAnimationFrame((_) => requestAnimationFrame(restoreScroll))
  })

  emitter.on('navigate', restoreScroll)
})

app.use(theme)
app.use(commands)
app.use(editor)
app.use(net)
app.use(scripting)
app.use(core)
app.use(main)

app.route('/', mainView)
app.route('/:server', mainView)
app.route('/:server/:room', mainView)
app.route('/:server/:room/:page', mainView)

module.exports = app.mount('body')
