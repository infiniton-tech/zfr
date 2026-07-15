---
name: verify
description: Build, launch, and visually verify this Next.js storefront (zfr-ecommerce).
---

# Verify zfr-ecommerce

Next.js App Router storefront + admin. MongoDB URI in `.env.local` (dev DB reachable; pages render without auth except `/admin/*`, which redirects to `/login`).

## Launch

```bash
npm run dev > /tmp/dev.log 2>&1 &   # ready in <1s, port 3000
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
```

## Screenshot (no playwright installed; use system Chrome)

```bash
google-chrome --headless --disable-gpu --hide-scrollbars \
  --window-size=1440,900 --screenshot=/tmp/shot.png \
  --virtual-time-budget=8000 http://localhost:3000/
```

- Mobile: `--window-size=390,844`.
- Home has a 2.3s WelcomeSplash overlay; `--virtual-time-budget=8000` fast-forwards past it, `~900` captures the splash frame itself.
- `/admin/*` unauthenticated → renders `/login`; verifying admin chrome needs a seeded admin login.

## Gotchas

- Kill with `pkill -f "next dev"` (exits 144 — ignore), confirm with curl.
- Chrome sandbox: run Bash with sandbox disabled or screenshots fail silently.
