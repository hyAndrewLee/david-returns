export const isDev = process.env.NODE_ENV !== "production"
export const isDebugEnabled = process.env.NEXT_PUBLIC_DEBUG === "true" || isDev

export function debugLog(...args: unknown[]) {
  if (isDebugEnabled) {
    console.log("[v0]", ...args)
  }
}

export function debugError(...args: unknown[]) {
  if (isDebugEnabled) {
    console.error("[v0]", ...args)
  }
}

export function debugWarn(...args: unknown[]) {
  if (isDebugEnabled) {
    console.warn("[v0]", ...args)
  }
}
