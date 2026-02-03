# Vercel auto-deploy via GitHub Actions (when Vercel Git is not deploying)

If pushes to `main` are not triggering Vercel automatically, use a **Deploy Hook** so this repo triggers a deploy on every push.

## 1. Create Deploy Hook in Vercel

1. Open [Vercel Dashboard](https://vercel.com/dashboard) → your project.
2. Go to **Settings** → **Git** (or **Deploy Hooks**).
3. Under **Deploy Hooks**, click **Create Hook**.
4. Name it (e.g. `Deploy on push`), select branch **main**, then **Create Hook**.
5. Copy the generated URL (e.g. `https://api.vercel.com/v1/integrations/deploy/...`).

## 2. Add secret in GitHub

1. Open your repo on GitHub → **Settings** → **Secrets and variables** → **Actions**.
2. Click **New repository secret**.
3. Name: `VERCEL_DEPLOY_HOOK`
4. Value: paste the URL from step 1 → **Add secret**.

## 3. Result

On every **push to `main`**, the workflow `.github/workflows/vercel-deploy.yml` runs and calls your Deploy Hook, so Vercel starts a new deployment even if the built-in Git connection is broken.

---

**Alternative:** Fix Vercel’s Git connection: **Settings** → **Git** → **Disconnect** then **Connect Git Repository** again and choose this repo and branch.
