
import html from 'nanohtml'
import CodeMirror from 'codemirror/lib/codemirror'
import gfm from 'codemirror/mode/gfm/gfm'
import placeholder from 'codemirror/addon/display/placeholder'
import slashCommand from 'slash-command'
import onload from 'on-load'

import observe from './observe'


const leftDelimiter = '['
const rightDelimiter = ']'


export default (state, emitter) => {
  state.editor = {
    instance: null,
    element: null,
    value: '',
    lineNumbers: false,
    trigger: undefined
  }

  if (typeof navigator === 'undefined') return

  const cache = [
    '/theme',
    'Hello[.full]',
    '![img](https://media.giphy.com/media/lOUT5Jyh4gpuXDWYSr/giphy.gif) [.full]',
  ]
  let cacheIdx = -1

  let placeholder =
    localStorage.getItem('placeholder')

  if (!placeholder) {
    placeholder = 'message or /command'
    localStorage.setItem('placeholder', ' ') // for now, just stop showing it after first session
  }

  const editor = state.editor.instance =
    new CodeMirror( setupElement, {
      mode: 'gfm',
      placeholder,
      value: state.editor.value,
      theme: state.theme.name,
      autofocus: true,
      tabindex: 1,
      scrollbarStyle: 'null',
      spellcheck: true, // TODO make a mode-dependent setting
      autocorrect: true, // TODO make a setting
      viewportMargin: Infinity,
      lineNumbers: state.editor.lineNumbers,
      lineWrapping: true,

      extraKeys: {
        'Enter': e => {
          send()
        },

        'Esc': e => {
          editor.display.input.blur()
        },

        'Up': e => {
          if (editor.doc.lineCount() > 1 && cacheIdx === -1)
            return CodeMirror.Pass

          if (cache.length === 0)
            return CodeMirror.Pass

          cacheIdx--
          if (cacheIdx < -1) {
            cacheIdx = cache.length - 1
          }

          const value =
            cache[cacheIdx] || state.editor.value

          editor.setValue(value)
          editor.setCursor(editor.lineCount(), 0)
        },

        'Down': e => {
          if (editor.doc.lineCount() > 1 && cacheIdx === -1)
            return CodeMirror.Pass

          if (cache.length === 0)
            return CodeMirror.Pass

          cacheIdx++
          if (cacheIdx > cache.length - 1)
            cacheIdx = -1

          const value =
            cache[cacheIdx] || state.editor.value

          editor.setValue(value)
          editor.setCursor(editor.lineCount(), 0)
        }
      }
    })

  function setupElement (e) {
    state.editor.element = e

    e.isSameNode = _ => true

    onload(e, element => {
      editor.refresh()
    })
  }

  const trigger = state.editor.trigger =
    html`<div id="trigger" class="w-100 h3 up4rem"></div>`

  let unobserve
  const uniq = 1

  onload(trigger, e => {
    e.isSameNode = _e => {
      console.log("same?", _e)
      return true
    }

    unobserve = observe(e, entry => {
      const {
        intersectionRatio,
        isIntersecting,
        boundingClientRect,
        rootBounds
      } = entry

      if (rootBounds === null) return

      const reallyIntersecting =
        intersectionRatio > 0 ||
        (typeof isIntersecting === 'boolean' && isIntersecting)

      if (reallyIntersecting) {
        if (state.editor.hidden) {
          state.editor.hidden = false

          const area =
            document.getElementById('inputArea')

          area.classList.remove('o-0')
          area.classList.remove('fadeOut')
          area.classList.add('animated')
          area.classList.add('fadeIn')

          editor.focus()
        }
      } else {
        if (!state.editor.hidden) {
          state.editor.hidden = true
          
          const area =
            document.getElementById('inputArea')

          area.classList.remove('fadeIn')
          area.classList.add('fadeOut')

          editor.display.input.blur()
        }
      }

    })
  }, unobserve, uniq)

  editor.on('inputRead', instance => {
    state.editor.value = instance.getValue()
    cacheIdx = -1
  })

  editor.on('change', instance => {
    const val = instance.getValue()
    if (val.length > 2 && val[0] === '/' && val[1] !== '/') {
      const {
        command,
        subcommands,
        body,
      } = slashCommand(val)

      const fn =
        state.commands[command]

      if (fn) {
        // TODO show preview / help
      }
    } else {
      if (instance.lineCount() > 1) {
        if (!state.editor.lineNumbers){
          instance.setOption('lineNumbers', true)
          //instance.refresh()
          emitter.emit('render')
          state.editor.lineNumbers = true
        }
      } else {
        if (state.editor.lineNumbers) {
          instance.setOption('lineNumbers', false)
          //instance.refresh()
          emitter.emit('render')
          state.editor.lineNumbers = false
        }
      }
    }
  })

  emitter.on('theme', _ => {
    editor.setOption('theme', state.theme.name)
    editor.refresh()
  })

  function send () {
    const value =
      editor.getValue()

    if (value === '')
      return

    cache.push(value)
    cacheIdx = -1

    let message

    if (value.length > 2 && value[0] === '/' && value[1] !== '/') {
      const {
        command,
        subcommands,
        body,
      } = slashCommand(value)

      const fn =
        state.commands[command]

      if (fn) {
        message =
          fn(body)
      } else {
        message =
          state.commands.default(command)
      }
    } else if (state.local.prompt) {
      emitter.emit('input', value)
      message = null
    } else {
      message = {
        type: 'sending',
        body: stripClasses(value),
        markdown: value,
      }
    }

    if (message){
      emitter.emit('send', message)
    }

    editor.setValue('')
    state.editor.value = ''

    requestAnimationFrame(_ => {
      requestAnimationFrame(_ => {
        editor.refresh()
        editor.focus()
      })
    })
  }

  function stripClasses (str) {
    let pattern =
      /\[[^\[^\]]+\]/g

    return str.replace(pattern, '')
  }
}
