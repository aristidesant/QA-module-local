# Bug: CSP blocks audio playback in QA (media-src violation)

## Error

```
Loading media from 'https://cxm.nyc3.digitaloceanspaces.com/...' violates the
following Content Security Policy directive: "media-src 'self' blob:".
The action has been blocked.
```

## Root cause

The nginx config (`nginx.conf`) sets a strict CSP header on every response. The
`media-src` directive only allows `'self'` and `blob:` URLs in the deployed
environment, blocking audio loaded directly from pre-signed storage URLs.

This does not reproduce locally because Vite's dev server does not apply the nginx
CSP headers.

## Affected file

`nginx.conf` — the CSP header appears in **3 locations** (lines 8, 19, 31), one
per `location` block:

```
media-src 'self' blob: https://cxm.nyc3.digitaloceanspaces.com https://cxm-bpd.s3.us-east-1.amazonaws.com;
```

## Solution

Hardcode the QA and prod storage origins directly into the CSP so the audio
player can load transcript media without any extra deployment variables.

### 1. `nginx.conf` — update `media-src` in all 3 `location` blocks

```diff
- media-src 'self' blob:;
+ media-src 'self' blob: https://cxm.nyc3.digitaloceanspaces.com https://cxm-bpd.s3.us-east-1.amazonaws.com;
```

## Verification

1. Build the Docker image.
2. Run the container and open a conversation with a voice transcript.
3. Confirm audio plays without CSP errors in the browser console.
4. Check the `Content-Security-Policy` response header includes both storage origins in `media-src`.
