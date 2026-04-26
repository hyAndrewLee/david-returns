import { ImageResponse } from "next/og"

export const alt = "David Returns — Return infrastructure for apartment living"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const OGImage = () =>
  new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              fontSize: "56px",
              fontWeight: 700,
              color: "#f9f9f6",
              textAlign: "center",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            David Returns
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "rgba(249, 249, 246, 0.7)",
              textAlign: "center",
              maxWidth: "800px",
              lineHeight: 1.4,
            }}
          >
            Return infrastructure for apartment buildings in NYC
          </div>
          <div
            style={{
              marginTop: "16px",
              fontSize: "18px",
              color: "rgba(249, 249, 246, 0.45)",
              textAlign: "center",
            }}
          >
            No trips. No lines. No effort.
          </div>
        </div>
      </div>
    ),
    { ...size },
  )

export default OGImage
