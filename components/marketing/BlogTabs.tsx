"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs"
import type { BlogPost } from "@/app/(marketing)/blog/blogPosts"

type BlogTabsProps = {
  residentPosts: BlogPost[]
  managerPosts: BlogPost[]
}

const PostCard = ({ post }: { post: BlogPost }) => (
  <Link
    href={`/blog/${post.slug}`}
    className="group flex flex-col rounded-2xl border border-border bg-card p-7 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
  >
    <h3 className="font-display text-xl font-normal leading-snug tracking-tight text-foreground group-hover:text-primary">
      {post.title}
    </h3>
    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
      {post.excerpt}
    </p>
    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
      Read article
      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
    </span>
  </Link>
)

export const BlogTabs = ({ residentPosts, managerPosts }: BlogTabsProps) => (
  <Tabs defaultValue="residents" className="gap-0">
    <div className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <TabsList className="h-auto w-auto gap-0 rounded-none bg-transparent p-0">
          <TabsTrigger
            value="residents"
            className="rounded-none border-0 border-b-2 border-transparent px-5 py-4 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            For Residents
          </TabsTrigger>
          <TabsTrigger
            value="managers"
            className="rounded-none border-0 border-b-2 border-transparent px-5 py-4 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            For Property Managers
          </TabsTrigger>
        </TabsList>
      </div>
    </div>

    <TabsContent value="residents" className="mt-0">
      <div className="bg-background-alt py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm text-muted-foreground">
            Guides on making returns easier for NYC apartment dwellers.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {residentPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </div>
    </TabsContent>

    <TabsContent value="managers" className="mt-0">
      <div className="bg-background-alt py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm text-muted-foreground">
            Building operations, amenities, and tenant retention.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {managerPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </div>
    </TabsContent>
  </Tabs>
)
