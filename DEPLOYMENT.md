# ExpertEase Deployment (GitHub + Render)

## 1) Push this project to GitHub

Run from the project root:

```powershell
git init
git branch -M main
git add .
git commit -m "Initial ExpertEase setup for Render deployment"
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

Example repo URL formats:

- `https://github.com/<username>/<repo>.git`
- `git@github.com:<username>/<repo>.git`

## 2) Deploy on Render using `render.yaml`

1. In Render, click **New +** -> **Blueprint**.
2. Connect your GitHub account and select this repository.
3. Render will detect `render.yaml` and create:
- `expertease-api` (Node web service from `backend`)
- `expertease-web` (Static web service from `frontend`)

## 3) Set required environment variables in Render

For service `expertease-api`:

- `MONGO_URI` = your MongoDB connection string
- `JWT_SECRET` = strong random secret string
- `NODE_ENV` is already set to `production` in blueprint

For service `expertease-web`:

- `VITE_API_URL` = public URL of `expertease-api`
  - Example: `https://expertease-api.onrender.com`

## 4) Redeploy frontend after API URL is known

If Render assigns a different backend URL, update `VITE_API_URL` in `expertease-web` and trigger a redeploy.

## 5) Verify

- Open frontend URL (`expertease-web`) and test login/register.
- Confirm API calls succeed in browser network tab (`/api/...`).
