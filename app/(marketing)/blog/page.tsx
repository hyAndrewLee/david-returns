import type { Metadata } from "next"

import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { BlogTabs } from "@/components/marketing/BlogTabs"
import { getPostsByAudience } from "@/app/(marketing)/blog/blogPosts"

export const metadata: Metadata = {
  title: "Blog — David Returns",
  description:
    "Insights and guides on package returns for NYC residents and property managers.",
}

const BlogPage = () => {
  const residentPosts = getPostsByAudience("residents")
  const managerPosts = getPostsByAudience("property-managers")

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero */}
      <section className="bg-background pb-0 pt-16 sm:pt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="pb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-copper">
              Resources
            </p>
            <h1 className="mt-4 font-display text-4xl font-normal tracking-tight sm:text-5xl">
              Blog
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Practical guides and insights on package returns in New York City.
            </p>
          </div>
        </div>
      </section>

      <BlogTabs residentPosts={residentPosts} managerPosts={managerPosts} />

      <Footer />
    </main>
  )
}

export default BlogPage
