# Interfere integration

Surface: [David Returns](https://interfere.com/~/andrew-eng/surfaces/david-returns) in **Andrews Org** (`andrew-eng`), ID `43010674-4727-41e9-bbe7-f94f7ec3f830`.

Deployment: Vercel project `david-returns` in `lolfills-projects` (`prj_NWbdHTm6WFztIL1SyFddT57NdJJ6`) is linked to the surface.

Codebase: the GitHub repository selected during installation, `davidreturns/david-returns` (`1178252384`), is linked at the repository root. The local checkout's origin currently points to `hyAndrewLee/david-returns`; the remote was left unchanged.

The surface credentials are saved in the ignored local `.env`. Local development uses `INTERFERE_ENVIRONMENT=development`, which Interfere filters before ingestion. Use `staging` to verify capture against this surface. Configure deployment credentials separately as described below.

The Next.js config uses `withInterfere`; `instrumentation.ts` registers server error capture/tracing, `instrumentation-client.ts` initializes the browser SDK before React renders, and the root layout mounts `InterfereProvider`.

## Deployment configuration

- Set `INTERFERE_PUBLIC_KEY` to the Surface's regional public key (`interfere_public_us_*` or `interfere_public_eu_*`) for each environment. Without it, the SDK sends no events.
- Set `INTERFERE_API_KEY` only in the **build environment** when release registration and source-map upload are wanted (`interfere_secret_us_*` or `interfere_secret_eu_*`). It is a secret build credential; never put it in browser code or `NEXT_PUBLIC_*`. Without it, builds skip release registration. Complete the Surface's project/repository links for release attribution.
- Set `INTERFERE_ENVIRONMENT` explicitly to the deployment environment (for example `staging` or `production`) in each build. `NODE_ENV=production` does not distinguish staging from production. Configure keys separately in each deployment environment; do not commit them.

The browser starts with analytics consent **on** and replay consent **off**, both in bootstrap and provider. This is an explicit application policy, not a consent-management UI; if consent must be collected, integrate a consent manager and update both initial consent and provider state before enabling analytics. Replay is **not automatically enabled**. Necessary errors remain active even when analytics/replay consent is denied; consent does not disable logs, tracing or session storage.

Browser recorded URLs redact **all** query parameter values and fragments (`privacy.urls: true`), and elements marked `data-sensitive` are blocked from interaction capture (and from replay if replay is ever enabled). Mark sensitive UI accordingly; do not add user identity or PII without separate approval. Server telemetry uses the SDK's default URL redaction (built-in sensitive parameter names), not blanket query-value redaction. Existing Vercel Analytics remains separately configured and is not governed by Interfere consent.
