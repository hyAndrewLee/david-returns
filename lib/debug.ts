export const isDev = process.env.NODE_ENV !== "production"
export const isDebugEnabled = process.env.NEXT_PUBLIC_DEBUG === "true" || isDev

export const debugLog = (...args: unknown[]) => {
  if (isDebugEnabled) {
    console.log("[v0]", ...args)
  }
}

export const debugError = (...args: unknown[]) => {
  if (isDebugEnabled) {
    console.error("[v0]", ...args)
  }
}

export const debugWarn = (...args: unknown[]) => {
  if (isDebugEnabled) {
    console.warn("[v0]", ...args)
  }
}
