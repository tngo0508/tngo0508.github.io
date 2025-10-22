# Running this site in GitHub Codespaces

This repo contains a Jekyll site. The provided devcontainer config lets you open the project in GitHub Codespaces or VS Code Remote - Containers and have Ruby, Bundler, Jekyll and Node installed.

Quick steps

1. Click "Code" → "Open with Codespaces" → "New codespace" (or from GitHub create a new Codespace for this repo).
2. Wait for the container to build. The `postCreateCommand` will run `bundle install` and `npm install` if applicable.
3. Start the site in the terminal:

```powershell
bundle exec jekyll serve --host 0.0.0.0 --port 4000
```

4. Forward port 4000 in Codespaces (should be auto-forwarded). Open the forwarded URL in your browser.

Notes

- If you need a specific Ruby version, consider replacing the Dockerfile with rbenv or the official devcontainer Ruby feature.
- The Dockerfile installs `jekyll` and `bundler` globally; adjust versions in `Gemfile` if necessary.
