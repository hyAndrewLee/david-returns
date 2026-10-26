import { withInterfere } from "@interfere/next/config"

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["pino", "pino-pretty"],
}

export default withInterfere(nextConfig)
