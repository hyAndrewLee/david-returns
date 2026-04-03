import type { MetadataRoute } from "next"

const robots = (): MetadataRoute.Robots => ({
  rules: [
    {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/profile",
        "/orders",
        "/schedule",
        "/manage/",
        "/signin",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/auth/",
        "/api/",
      ],
    },
  ],
  sitemap: "https://davidreturns.com/sitemap.xml",
})

export default robots
