export function delay(min = 300, max = 700): Promise<void> {
  const ms = Math.floor(min + Math.random() * (max - min))
  return new Promise((resolve) => setTimeout(resolve, ms))
}
