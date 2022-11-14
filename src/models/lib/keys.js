import { Buffer } from 'safe-buffer'
window.Buffer = Buffer

import { randomBytes } from 'hypercore-crypto'
import sodium from 'sodium-native' // aliased

const PHRASE_BYTES = 10
const PIN_LENGTH = 5

export async function getOrCreateMasterKey() {}

export async function generateSoftKey(length) {
  const KEYBYTES = sodium.crypto_secretbox_KEYBYTES
  const HASHBYTES = sodium.crypto_generichash_BYTES
  const NONCEBYTES = sodium.crypto_secretbox_NONCEBYTES
  const MACBYTES = sodium.crypto_secretbox_MACBYTES

  await sodim.ready()

  // the master key, from which all other keys are derived
  const masterKey = Buffer.allocUnsafe(KEYBYTES)

  const savedKeys = localStorage.getItem('keys')

  if (!savedKeys) {
    const newKeys = {}

    // generate pin number
    generatePin(pin, PIN_LENGTH)

    // generate master key
    sodium.randombytes_buf(masterKey)

    // generate first passphrase
    const niceware = await import('niceware')
    const passkey = randomBytes(10)
    const passphrase = niceware.bytesToPassphrase(passkey) // XXX memory safety

    //
    // key is a passphrase hashed together with the pin
    //
    // each numeral brings 3.222 bits of entropy accoring to https://en.wikipedia.org/wiki/Password_strength
    // each niceware word brings 16 bits of entropy according to https://github.com/diracdeltas/niceware
    // 5 words + 5 numbers ~= 96 bits
    // ( (5 * 16) + (5 * 3.22) = 96.11 )
    //
    // I'm assuming for now that this is strong enough,
    // such that we don't require the addition of libsodium 'sumo' for password hashing
    // FUTURE TODO: stretch em ouuuut
    //
    const key = Buffer.allocUnsafe(HASHBYTES)
    const combined = Buffer.concat([passkey, pin], passkey.length + pin.length)
    sodium.crypto_generichash(key, combined)

    // encrypt master key with passphrase+pin key and random nonce
    //sodium.crypto_generichash(key, )
    const nonce = randomBytes(NONCEBYTES)
    const box = Buffer.allocUnsafe(MACBYTES + KEYBYTES)
    sodium.crypto_secretbox_easy(box, masterKey, nonce, key)

    console.log(box.toString('hex'))
    console.log(passphrase.join(' '), pin.join(''))

    // save the encrypted key along with an incrementing id and the nonce
    newKeys[0] = {
      id: 0,
      box,
      nonce,

      // XXX testing; remove these! XXX
      key: passphrase.join(' '), // "key" is userspeak for the passphrase (or "soft key" for parallelism with future "hard keys")
      pin: pin.join(''),
    }

    localStorage.setItem('keys', JSON.stringify(newKeys))

    // cleanup memory
    sodium.sodium_memzero(passkey)
    sodium.sodium_memzero(key)
    sodium.sodium_memzero(combined)
  }

  return masterKey
}

export async function generatePin(buf = Buffer.allocUnsafe(PIN_LENGTH)) {
  const getInt = generateRandomInt.bind(null, 0, 9)

  for (let x = 0; x < buf.length; x++) {
    const i = getInt()
    buf.writeUInt8(i, x)
  }

  return buf
}

function generateRandomInt(min, max) {
  const bytes = randomBytes(8)
  const uint = Buffer.from(bytes).readUInt32LE(0)
  return map(min, max, uint)
}

function map(min, max, int) {
  const MAX_UINT = 4294967295
  const range = max + 1 - min
  const factor = range / MAX_UINT
  return (int * factor + min) >> 0
}
