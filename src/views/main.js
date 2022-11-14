import html from 'nanohtml'
import message from './message'

export default (state, emit) => {
  const messageList = state.messages[state.room]

  const render = message(state, emit)(state.room)

  const messages = messageList.map(render)

  const editor = (state.editor && state.editor.element) || ''

  const trigger = state.editor.trigger || ''

  const hideShow = state.editor.hidden === false ? 'animated fadeIn' : 'o-0'

  return html`
    <body class="${state.theme.bg1}">
      <div
        id="track"
        class="track relative w-100 ${state.theme.bg1} vh-100
        snap-y-mandatory overflow-y-scroll overflow-x-hidden"
      >
        ${messages} ${trigger}
      </div>

      <div
        id="inputArea"
        class="w-100 vh-25 fixed bottom-0 faster ${hideShow}
        flex flex-column justify-center items-center snap-end"
      >
        <div
          class="w-100 f4 measure measure-wide-l pb2 bb ${state.theme.border4}"
        >
          ${editor}
        </div>
      </div>
    </body>
  `
}
