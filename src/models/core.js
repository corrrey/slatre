import ra from 'random-access-idb'
import sodium from 'sodium-native' // aliased

import { Buffer } from 'safe-buffer'
window.Buffer = Buffer

import { getOrCreateMasterKey } from './lib/keys'

export default async function (state, emitter) {
  await sodium.ready

  const Corestore = await import('corestore')
  const Hypertrie = await import('mountable-hypertrie')

  const storage = ra('db0')

  const masterKey = await getOrCreateMasterKey()

  console.log('MASTER KEY:', masterKey)

  // workaround issue with closing IDB
  // ( for now, I'm just not closing it )
  const patchStorage = (path) => {
    const stor = storage(path)
    stor._close = (req) => req._callback.apply(req)
    return stor
  }

  const store = new Corestore(patchStorage)

  await store.ready()

  const core0 = store.default()

  await new Promise((resolve) => core0.on('ready', resolve))

  const trie = new Hypertrie(store)

  await new Promise((resolve) => trie.ready(resolve))

  /*
  const watcher = trie.watch('/', () => {
    trie.list('/', console.log)
  })
  */

  /*
  trie.get('/run', (err, node) => {
    const value = node && node.value
    console.log(decode(value))

    trie.put('/run', encode({ num: 42 }), noop)
  })
  */
}

function encode(thing) {
  return Buffer.from(JSON.stringify(thing))
}

function decode(thing) {
  return JSON.parse(thing.toString())
}

function noop() {}
