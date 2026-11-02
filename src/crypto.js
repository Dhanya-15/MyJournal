// AES-GCM + PBKDF2 (Web Crypto). Random salt and IV per encryption, versioned payload.
const enc = new TextEncoder(), dec = new TextDecoder()
const b64 = (b) => btoa(String.fromCharCode(...new Uint8Array(b)))
const ub = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
async function key(pw, salt) {
  const base = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
}
export async function encrypt(text, pw) {
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12))
  const c = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await key(pw, salt), enc.encode(text))
  return { v: 1, salt: b64(salt), iv: b64(iv), data: b64(c) }
}
export async function decrypt(p, pw) { // throws if passphrase wrong (auth tag fails)
  const t = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ub(p.iv) }, await key(pw, ub(p.salt)), ub(p.data))
  return dec.decode(t)
}
