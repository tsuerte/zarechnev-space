const UUID_V7_COUNTER_MAX = 0x0fff

let lastTimestampMs = -1
let lastCounter = 0

function toHex(byte: number) {
  return byte.toString(16).padStart(2, "0")
}

function fillUnixTimestamp(bytes: Uint8Array, timestamp: number) {
  bytes[0] = Math.floor(timestamp / 2 ** 40) & 0xff
  bytes[1] = Math.floor(timestamp / 2 ** 32) & 0xff
  bytes[2] = Math.floor(timestamp / 2 ** 24) & 0xff
  bytes[3] = Math.floor(timestamp / 2 ** 16) & 0xff
  bytes[4] = Math.floor(timestamp / 2 ** 8) & 0xff
  bytes[5] = timestamp & 0xff
}

function nextTimestampAndCounter() {
  const now = Date.now()

  if (now > lastTimestampMs) {
    lastTimestampMs = now
    lastCounter = crypto.getRandomValues(new Uint16Array(1))[0] & UUID_V7_COUNTER_MAX
    return { timestamp: lastTimestampMs, counter: lastCounter }
  }

  if (lastCounter < UUID_V7_COUNTER_MAX) {
    lastCounter += 1
    return { timestamp: lastTimestampMs, counter: lastCounter }
  }

  lastTimestampMs += 1
  lastCounter = crypto.getRandomValues(new Uint16Array(1))[0] & UUID_V7_COUNTER_MAX
  return { timestamp: lastTimestampMs, counter: lastCounter }
}

export function generateUuidV7() {
  const bytes = new Uint8Array(16)
  const random = crypto.getRandomValues(new Uint8Array(8))
  const { timestamp, counter } = nextTimestampAndCounter()

  fillUnixTimestamp(bytes, timestamp)

  bytes[6] = 0x70 | ((counter >> 8) & 0x0f)
  bytes[7] = counter & 0xff
  bytes[8] = 0x80 | (random[0] & 0x3f)
  bytes[9] = random[1]
  bytes[10] = random[2]
  bytes[11] = random[3]
  bytes[12] = random[4]
  bytes[13] = random[5]
  bytes[14] = random[6]
  bytes[15] = random[7]

  const hex = Array.from(bytes, toHex).join("")

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
    16,
    20
  )}-${hex.slice(20)}`
}
