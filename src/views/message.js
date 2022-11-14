
import html from 'nanohtml'
import raw from 'nanohtml/raw'
import {sanitize} from 'dompurify'

import markdown from 'markdown-it'
import markdownAttrs from 'markdown-it-attrs'


const renderer =
  new markdown({
    breaks: true,
    typographer: true,
  })

renderer.use(markdownAttrs, {
  allowedAttributes: ['class'],
  leftDelimiter: '[',
  rightDelimiter: ']',
})

const render =
  renderer.render.bind(renderer)


export default (state, emit) => roomIdx => (msg, idx) => {
  const isLocalRoom =
    roomIdx === 0

  const isServerNoticeRoom =
    roomIdx === 1

  const isNormalRoom =
    !isLocalRoom && !isServerNoticeRoom

  const common =
    'w-100 flex flex-column justify-center items-center snap-center animated fadeIn faster'

  switch (msg.content.msgtype) {
    case 'm.text':
    case 'm.notice': {

      switch (msg.content.format) {
        case 'chat.slater.markdown': {
          return html`
            <div id="msg-${roomIdx}-${idx}" class="msg ${common} f3 ${state.theme.fg3}">
              ${raw(render(msg.content.formatted_body))}
            </div>
          `
        }

        default: {
          return html`
            <div id="msg-${roomIdx}-${idx}" class="msg ${common} f3 ${state.theme.fg3}">
              ${msg.content.body}
            </div>
          `
        }
      }
    }

    default: {
      return html`
        <div id="msg-${idx}" class="msg ${common} f3 ${state.theme.fg3}">
          ${msg.content.body}
        </div>
      `
    }
  }
}
