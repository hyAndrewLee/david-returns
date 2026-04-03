"use client"

import { useEffect } from "react"

const GlobalError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) => {
  useEffect(() => {
    console.error("Global error:", error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
          backgroundColor: "#f9f9f6",
          color: "#1a1a2e",
        }}
      >
        <main
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div style={{ maxWidth: "28rem", textAlign: "center" }}>
            <p
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#dc2626",
              }}
            >
              Error
            </p>
            <h1
              style={{
                marginTop: "1rem",
                fontSize: "2.25rem",
                fontWeight: 400,
                letterSpacing: "-0.02em",
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                marginTop: "1rem",
                fontSize: "1.125rem",
                color: "rgba(26, 26, 46, 0.6)",
              }}
            >
              A critical error occurred. Please try again.
            </p>
            <div
              style={{
                marginTop: "2rem",
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
              }}
            >
              <button
                onClick={reset}
                style={{
                  padding: "0.75rem 1.5rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  borderRadius: "0.375rem",
                  border: "1px solid rgba(26, 26, 46, 0.15)",
                  backgroundColor: "white",
                  color: "#1a1a2e",
                  cursor: "pointer",
                }}
              >
                Try again
              </button>
              <a
                href="/"
                style={{
                  padding: "0.75rem 1.5rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  borderRadius: "0.375rem",
                  backgroundColor: "#1a1a2e",
                  color: "#f9f9f6",
                  textDecoration: "none",
                }}
              >
                Back to home
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}

export default GlobalError
