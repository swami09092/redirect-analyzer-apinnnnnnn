# 🚀 Quick Deployment Guide

## Deploy Your API to Cloudflare in 5 Minutes

### Prerequisites
- Cloudflare account (free tier works)
- Node.js installed
- Your application code (already ready!)

---

## Step-by-Step Deployment

### 1. Install Wrangler
```bash
npm install -g wrangler
```

### 2. Login to Cloudflare
```bash
wrangler login
```
This will open your browser - log in to your Cloudflare account.

### 3. Create KV Namespaces
```bash
# Create production KV namespaces
wrangler kv:namespace create RATE_LIMITS
wrangler kv:namespace create ANALYTICS_DATA  
wrangler kv:namespace create API_KEYS

# Create preview KV namespaces (for testing)
wrangler kv:namespace create RATE_LIMITS --preview
wrangler kv:namespace create ANALYTICS_DATA --preview
wrangler kv:namespace create API_KEYS --preview
```

**Important:** Copy the IDs from the output!

### 4. Update wrangler.toml
Open `wrangler.toml` and replace the KV namespace IDs:

```toml
[[kv_namespaces]]
binding = "RATE_LIMITS"
id = "abc123..."  # ← Paste your RATE_LIMITS ID here
preview_id = "def456..."  # ← Paste your RATE_LIMITS preview ID here

[[kv_namespaces]]
binding = "ANALYTICS_DATA"
id = "ghi789..."  # ← Paste your ANALYTICS_DATA ID here
preview_id = "jkl012..."  # ← Paste your ANALYTICS_DATA preview ID here

[[kv_namespaces]]
binding = "API_KEYS"
id = "mno345..."  # ← Paste your API_KEYS ID here
preview_id = "pqr678..."  # ← Paste your API_KEYS preview ID here
```

### 5. Deploy!
```bash
wrangler deploy
```

**That's it!** Your API is now live globally! 🎉

---

## Test Your Deployment

After deployment, you'll see a URL like:
```
https://redirect-analyzer-api.YOUR-SUBDOMAIN.workers.dev
```

### Test the health endpoint:
```bash
curl https://redirect-analyzer-api.YOUR-SUBDOMAIN.workers.dev/health
```

### Test URL analysis:
```bash
curl -X POST https://redirect-analyzer-api.YOUR-SUBDOMAIN.workers.dev/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com"}'
```

### View documentation:
Open in browser: `https://redirect-analyzer-api.YOUR-SUBDOMAIN.workers.dev/`

---

## All 34 Endpoints Available

Once deployed, ALL endpoints will work:
- ✅ 18 free tier endpoints (no API key needed)
- ✅ 16 premium endpoints (API key required)

---

## Troubleshooting

### Issue: "KV namespace not found"
**Solution:** Make sure you updated all 6 KV namespace IDs in `wrangler.toml` (3 production + 3 preview)

### Issue: "Worker deployment failed"
**Solution:** Check that `worker.js` exists and has no syntax errors:
```bash
wrangler deploy --dry-run
```

### Issue: "Cannot find module"
**Solution:** Make sure you're in the correct directory with `worker.js` and `wrangler.toml`

---

## Next Steps

1. **Add API Keys** (for premium features):
```bash
# Add a professional tier API key
wrangler kv:key put --binding=API_KEYS "api_key:YOUR_SECRET_KEY" \
  '{"tier":"professional","daily_limit":5000}'
```

2. **Monitor Usage:**
- Go to Cloudflare Dashboard → Workers & Pages
- Click your worker → Analytics

3. **Add Custom Domain** (optional):
- Add domain to Cloudflare
- Add route in `wrangler.toml`:
```toml
routes = [
  { pattern = "api.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

---

## Cost

### Cloudflare Workers Free Tier:
- ✅ 100,000 requests/day - **FREE**
- ✅ Global CDN - **FREE**
- ✅ SSL/HTTPS - **FREE**

### Cloudflare Workers Paid ($5/month):
- ✅ 10 million requests/month
- ✅ $0.50 per additional million

**Your API costs almost nothing to run!** 🎉

---

## Support

- **Documentation:** See DEPLOYMENT_STATUS.md
- **Cloudflare Docs:** https://developers.cloudflare.com/workers/
- **Community:** https://community.cloudflare.com/

---

🚀 **Ready to go? Run: `wrangler deploy`**
