export function randomChars() {
  return Math.random().toString(36).slice(2);
}

export function timestamp() {
  return Math.floor(Date.now() / 1e3);
}
