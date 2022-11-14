

//  Hello, Slater JS


export default async slate => {
  
  //  `slate` is a proxy object
  //  to a private namespace on the room state


  //  magically sends a state event:
  slate.greetings =
    ['hi', 'hello', 'hey', 'hola', "what's up"]


  //  ...which will trigger an `update` event:
  await slate.once('update')  // (`once` returns a promise resolving with the next update event)

  //  now `.greetings` has been synced to the server like:
  //    { ..., 'chat.slater.hello': {greetings: ['hi', ...]} }


  //  `slate` is also an event emitter interface...


  //  listen for text messages:
  slate.on('message', ({sender, content: {body}}) => {
    for (let i = 0; i <= slate.greetings.length - 1; ++i) {
      const greeting = slate.greetings[i]

      if (body.includes(greeting))
        return sendHello(sender.name)
    }
  })


  //  listen for join messages
  slate.on('join', ({member}) => {
    sendHello(member.name)
  })


  function sendHello (name) {
    slate.sendNotice (
      //  full-bleed Markdown with Tachyons
      md`_hello, ${name}_ [.full .f3 .fw2]`
    )
  }


}
