# Agent Rules

- After every working change in this project:
  1. Build the production bundle: `npm run build`
  2. Commit with a short, descriptive message and push to GitHub: `git push origin master`
  3. Deploy to the GitHub Pages `.io` website: run `npm run deploy` (or `npx gh-pages -d dist`) to update the live `gh-pages` branch immediately, and keep `.github/workflows/deploy.yml` intact for automatic GitHub Actions deployment.
