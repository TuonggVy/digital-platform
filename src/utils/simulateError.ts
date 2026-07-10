/**
 * Dev-only hook for exercising error UI. Set `localStorage.novadigital_debug_error = "<context>"`
 * (e.g. "products.getProducts") in the browser console to force that call to reject.
 */
export function simulateError(context: string): void {
  if (typeof window === 'undefined') return
  if (localStorage.getItem('novadigital_debug_error') === context) {
    throw new Error(`Simulated error: ${context}`)
  }
}
