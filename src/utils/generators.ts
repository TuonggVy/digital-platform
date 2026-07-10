let counter = 0

/** Deterministic-enough unique id generator, safe for demo/mock usage (no crypto needed). */
export function generateId(prefix = 'id'): string {
  counter += 1
  return `${prefix}-${Date.now()}-${counter}`
}

export function generateOrderCode(): string {
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `ND${Date.now().toString().slice(-6)}${rand}`
}

export function generateTicketCode(): string {
  const rand = Math.floor(100 + Math.random() * 900)
  return `TK-${Date.now().toString().slice(-6)}${rand}`
}
