// Shared across all three 3D product visuals (cloud3d / security3d / esim3d) so the scenes read
// as one design language. Matches the Homepage's --home-beacon / --home-wire / --home-ink-raised
// / --home-graphite-soft tokens — this is not a separate color system, just those tokens in 3D.
export const VISUAL_COLOR = {
  body: '#0a2947',
  edge: '#0066b3',
  active: '#00aeef',
  panel: '#54697d',
  // Used sparingly (one rim light, one accent detail per scene) to add depth without drifting
  // away from the navy/blue/cyan identity.
  violet: '#5b5fd1',
  // eSIM contact-line accent only — warm metallic, never used elsewhere.
  contactGold: '#caa46a',
} as const

export type VisualColorKey = keyof typeof VISUAL_COLOR
