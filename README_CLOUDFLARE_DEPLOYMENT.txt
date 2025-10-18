CLOUDFLARE DEPLOYMENT GUIDE - Complete Setup
==============================================

This guide shows you how to deploy your entire application to Cloudflare via GitHub.

DEPLOYMENT OPTIONS:
-------------------

Since your application is Python-based, you have 2 options for Cloudflare:

OPTION 1: JavaScript Version (RECOMMENDED - Full Cloudflare Support)
--------------------------------------------------------------------
✅ 100,000 free requests/day
✅ All features work perfectly
✅ No limitations
✅ Global edge network

Files ready: worker.js + wrangler.toml

OPTION 2: Python Version (Limited Cloudflare Support)
-----------------------------------------------------
⚠️ Uses Pyodide (Python in browser)
⚠️ Not all Python libraries work
⚠️ More complex setup

STEP-BY-STEP DEPLOYMENT VIA GITHUB:
===================================

STEP 1: Prepare Your Repository
--------------------------------
1. Create a new GitHub repository (public or private)
2. Download this entire project as ZIP or use git commands

STEP 2: Push to GitHub
-----------------------
Run these commands in your terminal:

git init
git add .
git commit -m "Initial commit - Redirect Analyzer API"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main

STEP 3: Deploy via Cloudflare Dashboard
----------------------------------------
1. Go to: https://dash.cloudflare.com/
2. Click "Workers & Pages" in the left sidebar
3. Click "Create application" button
4. Choose "Pages" tab
5. Click "Connect to Git"
6. Select your GitHub repository
7. Configure build settings:
   - Build command: (leave empty for Workers)
   - Build output directory: (leave empty)
8. Click "Save and Deploy"

STEP 4: Configure Cloudflare for Your App
------------------------------------------
Since we're using Workers (worker.js):

1. In Cloudflare Dashboard, go to "Workers & Pages"
2. Click "Create application"
3. Choose "Workers" tab
4. Click "Create Worker"
5. Replace the default code with contents from worker.js
6. Click "Save and Deploy"

OR use Wrangler CLI (recommended):
----------------------------------
npx wrangler login
npx wrangler deploy

STEP 5: Setup KV Namespaces (for data storage)
-----------------------------------------------
Run the deployment script to auto-create:

bash deploy-cloudflare.sh

Or manually:
npx wrangler kv:namespace create "RATE_LIMITS"
npx wrangler kv:namespace create "ANALYTICS_DATA"
npx wrangler kv:namespace create "API_KEYS"

Then update wrangler.toml with the IDs provided.

STEP 6: Test Your Live API
---------------------------
Your API will be available at:
https://redirect-analyzer-api.YOUR-SUBDOMAIN.workers.dev

Test it:
curl https://YOUR-WORKER-URL/health

IMPORTANT FILES:
----------------
✅ worker.js - Main application code (JavaScript version)
✅ wrangler.toml - Cloudflare configuration
✅ deploy-cloudflare.sh - Automated deployment script
✅ .gitignore - Git ignore rules

GITHUB → CLOUDFLARE AUTO-DEPLOY:
=================================
To enable automatic deployments when you push to GitHub:

1. In Cloudflare Dashboard → Workers & Pages
2. Select your Worker
3. Go to "Settings" → "Triggers"
4. Enable GitHub integration
5. Every git push will auto-deploy!

SUPPORT:
--------
- Cloudflare Docs: https://developers.cloudflare.com/workers/
- Wrangler Docs: https://developers.cloudflare.com/workers/wrangler/

Your app is ready for Cloudflare deployment! 🚀
