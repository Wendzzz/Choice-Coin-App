# Deploying to Netlify

This repo ships a `netlify.toml` with the build/publish settings and the SPA
redirect this PWA needs (any path falls back to `index.html`, and the
service worker file is set to never be cached). No account is connected and
nothing has been deployed — these are just the steps to do that yourself.

1. **Create a Netlify account** at https://app.netlify.com/signup (GitHub
   login is easiest since the site lives in GitHub).
2. **Add a new site** → "Import an existing project" → choose GitHub →
   authorize Netlify to access this repository.
3. **Build settings**: Netlify will read `netlify.toml` automatically —
   build command `npm run build`, publish directory `dist`. Leave the
   defaults Netlify shows.
4. **Deploy branch**: point it at `main` for production deploys. Netlify
   also auto-builds a preview for every pull request branch, which is
   useful for reviewing changes before merging.
5. **HTTPS**: Netlify issues a free certificate automatically once the
   site is created — no action needed.
6. **Custom domain** (optional): Site settings → Domain management → Add
   a domain, then update your DNS records as Netlify instructs.
7. **Environment variables**: none are required today.

Once connected, every push to `main` deploys automatically.
