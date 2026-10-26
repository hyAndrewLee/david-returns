import { init } from "@interfere/next/instrument-client"

void init({
  consent: { analytics: true, replay: false },
  privacy: { urls: true, blockSelector: "[data-sensitive]" },
})
