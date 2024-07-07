export function randomChars(): string {
  return Math.random().toString(36).slice(2);
}

export function timestamp(): number {
  return Math.floor(Date.now() / 1e3);
}
