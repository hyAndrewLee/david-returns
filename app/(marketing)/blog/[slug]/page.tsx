import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { blogPosts, getPostBySlug, getPostsByAudience } from "@/app/(marketing)/blog/blogPosts"

const BASE_URL = "https://davidreturns.com"

const AUDIENCE_KEYWORDS: Record<string, string[]> = {
  residents: [
    "package returns NYC",
    "return packages New York City",
    "NYC apartment returns",
    "schedule return pickup NYC",
    "David Returns",
  ],
  "property-managers": [
    "NYC apartment building amenities",
    "tenant retention NYC",
    "package management apartment building",
    "property management NYC",
    "David Returns",
  ],
}

type Props = {
  params: Promise<{ slug: string }>
}

export const generateStaticParams = () =>
  blogPosts.map((post) => ({ slug: post.slug }))

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}

  const url = `${BASE_URL}/blog/${post.slug}`

  return {
    title: `${post.title} — David Returns`,
    description: post.excerpt,
    keywords: AUDIENCE_KEYWORDS[post.audience],
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      siteName: "David Returns",
      locale: "en_US",
      type: "article",
      authors: ["David Returns"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  }
}

const BlogPostPage = async ({ params }: Props) => {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) notFound()

  const relatedPosts = getPostsByAudience(post.audience)
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2)

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Organization",
      name: "David Returns",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "David Returns",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/images/david-returns-logo.png`,
      },
    },
    url: `${BASE_URL}/blog/${post.slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/blog/${post.slug}`,
    },
    keywords: AUDIENCE_KEYWORDS[post.audience].join(", "),
    articleSection: post.audienceLabel,
    inLanguage: "en-US",
    isPartOf: {
      "@type": "Blog",
      name: "David Returns Blog",
      url: `${BASE_URL}/blog`,
    },
  }

  return (
    <main className="min-h-screen">
      <script type="application/ld+json">
        {JSON.stringify(articleJsonLd)}
      </script>

      <Navigation />

      {/* Article header */}
      <section className="bg-background pb-10 pt-16 sm:pt-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All articles
          </Link>

          <div className="mt-8">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-warm">
              {post.audienceLabel}
            </span>
            <h1 className="mt-3 font-display text-3xl font-normal leading-tight tracking-tight sm:text-4xl lg:text-[2.5rem]">
              {post.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">David Returns</span>
              <span className="text-border">·</span>
              <span>Published for {post.audience === "residents" ? "NYC Residents" : "Property Managers"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Article body */}
      <section className="bg-background pb-20 pt-4">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="border-t border-border pt-10">
            <div className="space-y-6 text-base leading-relaxed text-foreground/85">
              {post.content.map((block, i) => {
                if (block.type === "p") {
                  return (
                    <p key={i} className="leading-[1.8]">
                      {block.text}
                    </p>
                  )
                }

                if (block.type === "h2") {
                  return (
                    <h2
                      key={i}
                      className="mt-10! font-display text-xl font-normal tracking-tight text-foreground sm:text-2xl"
                    >
                      {block.text}
                    </h2>
                  )
                }

                if (block.type === "ul") {
                  return (
                    <ul key={i} className="space-y-3 pl-1">
                      {block.items.map((item, j) => (
                        <li key={j} className="flex gap-3 leading-[1.8]">
                          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-warm" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )
                }

                if (block.type === "cta") {
                  return (
                    <div
                      key={i}
                      className="mt-12! rounded-2xl border border-border bg-background-alt p-8"
                    >
                      <p className="text-base font-medium text-foreground">
                        {block.text}
                      </p>
                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <Link
                          href="/schedule"
                          className="inline-flex items-center gap-2 rounded-[0.375rem] bg-primary px-6 py-3 text-sm font-medium text-on-primary transition-all hover:opacity-90"
                        >
                          Schedule a pickup
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                        <a
                          href="mailto:hello@davidreturns.com?subject=Partner%20My%20Building"
                          className="inline-flex items-center gap-2 rounded-[0.375rem] border border-border px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-background-alt"
                        >
                          Partner your building
                        </a>
                      </div>
                    </div>
                  )
                }

                return null
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Related articles */}
      {relatedPosts.length > 0 && (
        <section className="bg-background-alt py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-display text-xl font-normal tracking-tight sm:text-2xl">
              More for {post.audience === "residents" ? "residents" : "property managers"}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group flex flex-col rounded-2xl border border-border bg-card p-7 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <h3 className="font-display text-lg font-normal leading-snug tracking-tight text-foreground group-hover:text-primary">
                    {related.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {related.excerpt}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    Read article
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}

export default BlogPostPage
