# Deploying to Netlify

This repo now ships a `netlify.toml` with the build/publish settings and the
SPA redirect a single-page PWA needs (any path falls back to `index.html`,
and the service worker is set to never be cached). No account is connected
and nothing has been deployed — these are just the steps to do that
yourself.

1. **Create a Netlify account** at https://app.netlify.com/signup (GitHub
   login is easiest since the site lives in GitHub).
2. **Add a new site** → "Import an existing project" → choose GitHub →
   authorize Netlify to access `Wendzzz/Choice-Coin-App`.
3. **Build settings**: Netlify will read `netlify.toml` automatically —
   publish directory `.`, no build command needed since this is a static
   site. Leave the defaults Netlify shows.
4. **Deploy branch**: point it at `main` for production deploys. Netlify
   also auto-builds a preview for every pull request branch, which is
   useful for reviewing changes before merging.
5. **HTTPS**: Netlify issues a free certificate automatically once the
   site is created — no action needed.
6. **Custom domain** (optional): Site settings → Domain management → Add
   a domain, then update your DNS records as Netlify instructs.
7. **Environment variables** (if the app ever needs any, e.g. API keys):
   Site settings → Environment variables. None are required today.

Once connected, every push to `main` deploys automatically.
