# Bug: CSP blocks audio playback in QA (media-src violation)

## Error

```
Loading media from 'https://cxm.nyc3.digitaloceanspaces.com/...' violates the
following Content Security Policy directive: "media-src 'self' blob:".
The action has been blocked.
```

## Root cause

The nginx config (`nginx.conf`) sets a strict CSP header on every response. The
`media-src` directive only allows `'self'` and `blob:` URLs, blocking audio loaded
directly from DigitalOcean Spaces pre-signed URLs.

This does not reproduce locally because Vite's dev server does not apply the nginx
CSP headers.

## Affected file

`nginx.conf` — the CSP header appears in **3 locations** (lines 8, 19, 31), one
per `location` block:

```
media-src 'self' blob:;
```

## Solution

Follow the same pattern already used for `connect-src` and `frame-src`, which accept
environment variable overrides (`${CSP_CONNECT_SRC}`, `${CSP_FRAME_SRC}`).

### 1. `Dockerfile` — add new build arg and env var (after line 19)

```dockerfile
ARG VITE_APP_STORAGE_URL
ENV CSP_MEDIA_SRC=$VITE_APP_STORAGE_URL
```

### 2. `nginx.conf` — update `media-src` in all 3 `location` blocks

```diff
- media-src 'self' blob:;
+ media-src 'self' blob: ${CSP_MEDIA_SRC};
```

### 3. Deployment config (CI/CD — outside this repo)

Pass the new build arg when building the Docker image for QA/prod:

```
VITE_APP_STORAGE_URL=https://cxm.nyc3.digitaloceanspaces.com
```

## Verification

1. Build the Docker image with the new `VITE_APP_STORAGE_URL` build arg.
2. Run the container and open a conversation with a voice transcript.
3. Confirm audio plays without CSP errors in the browser console.
4. Check the `Content-Security-Policy` response header includes the DigitalOcean origin in `media-src`.
