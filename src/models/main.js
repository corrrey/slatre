

export default function main (state, emitter) {
  state.room = state.room || 0
  state.messages = state.messages || [[]]
  

  emitter.on('send', (roomIdx, message) => {

    if (roomIdx === 0) {
      messages[0].push(message)
    } else {
      const client =
        clients[roomIdx]

      console.log("SEND MESSAGE", roomIdx, message)
    }

    requestAnimationFrame(_ => {
      requestAnimationFrame(_ => {
        const elem =
          document.getElementById(`msg-${roomIdx}-${messages[roomIdx].length - 1}`)

        elem.scrollIntoView(false)
      })
    })

    emitter.emit('render')
  })


  emitter.on('DOMContentLoaded', async _ => {
    
  })


}
