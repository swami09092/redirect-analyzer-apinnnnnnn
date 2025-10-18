# 🔗 Redirect Chain Analyzer API

**100% Cloudflare Workers** - Zero Python, Zero Servers, Infinite Scale

> **⚡ Fast Start:** Deploy in 5 minutes with `wrangler deploy` - See [QUICKSTART.md](QUICKSTART.md)

---

## 🚀 What Is This?

A production-ready API for analyzing URL redirect chains, built entirely on **Cloudflare Workers**. Runs globally on 300+ edge locations with zero server management.

### ✨ Key Features

- **34 API Endpoints** - Complete URL analysis suite
- **Global Edge Network** - Sub-10ms response times worldwide
- **100% JavaScript** - No Python, no servers, no containers
- **100K Free Requests/Day** - Generous free tier
- **Auto-Scaling** - Handles any traffic spike
- **Built-in Security** - DDoS protection, SSRF prevention, rate limiting

---

## 📋 API Endpoints

### 🆓 Free Tier (18 Endpoints)

| Endpoint | Description |
|----------|-------------|
| `GET /` | Interactive API documentation |
| `GET /health` | Health check endpoint |
| `POST /analyze` | Core redirect chain analysis |
| `POST /api/bulk/analyze` | Analyze multiple URLs |
| `POST /api/validate` | URL accessibility validation |
| `POST /api/security/enhanced-scan` | Security threat scanning |
| `POST /api/decode-shortener` | Expand shortened URLs |
| `POST /api/detect-redirect-loop` | Detect infinite loops |
| `POST /api/generate-redirect-rules` | Apache/Nginx configs |
| `POST /api/analyze/domain-trust` | Domain trust scoring |
| `POST /api/analyze/with-webhook` | Analysis with webhooks |
| `POST /api/analyze/with-auth` | HTTP Basic Auth support |
| `POST /api/analyze/bot-test` | Bot user agent testing |
| `POST /api/robots-txt/check` | Robots.txt analysis |
| `POST /api/export/csv` | CSV data export |
| `GET /api/pricing` | Pricing information |
| `GET /api/pricing/tiers` | Detailed tier breakdown |

### 💼 Premium Endpoints (16 Endpoints - API Key Required)

| Endpoint | Description |
|----------|-------------|
| `POST /api/analyze/advanced` | Deep analysis with metrics |
| `GET /api/analytics/domain/{domain}` | Domain reputation data |
| `GET /api/analytics/url/{url}` | Historical URL tracking |
| `POST /api/seo/analysis` | SEO impact analysis |
| `POST /api/browser/quick-check` | Browser compatibility |
| `POST /api/batch/quick-analyze` | Fast batch processing |
| `POST /api/analyze/malware-scan` | Malware detection |
| `POST /api/network/detection` | CDN/hosting detection |
| `POST /api/revenue/optimization` | Performance optimization |
| `POST /api/analyze/mobile-comparison` | Mobile vs desktop |
| `GET /api/dashboard/stats` | Usage statistics |
| `GET /api/analytics/history` | Historical analytics |
| `POST /api/analyze/link-types` | Link type analysis |
| `POST /api/analyze/network-diversity` | Network diversity |
| `POST /api/analyze/seo-link-juice` | SEO link equity |
| `POST /api/analyze/comprehensive` | All-in-one analysis |

---

## 🎯 5-Minute Quick Start

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Create KV Namespaces

```bash
# Create storage for rate limits
wrangler kv:namespace create RATE_LIMITS
wrangler kv:namespace create RATE_LIMITS --preview

# Create storage for analytics
wrangler kv:namespace create ANALYTICS_DATA
wrangler kv:namespace create ANALYTICS_DATA --preview

# Create storage for API keys
wrangler kv:namespace create API_KEYS
wrangler kv:namespace create API_KEYS --preview
```

### 4. Update Configuration

Edit `wrangler.toml` and replace the placeholder KV namespace IDs with your actual IDs from step 3.

### 5. Deploy!

```bash
wrangler deploy
```

**Done!** Your API is now live globally. 🎉

See [QUICKSTART.md](QUICKSTART.md) for detailed instructions.

---

## 🧪 Test Your Deployment

```bash
# Get your Worker URL from deployment output, then:

# Test health endpoint
curl https://redirect-analyzer-api.YOUR-SUBDOMAIN.workers.dev/health

# Test URL analysis
curl -X POST https://redirect-analyzer-api.YOUR-SUBDOMAIN.workers.dev/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com"}'

# Run full test suite
./test-cloudflare-endpoints.sh https://redirect-analyzer-api.YOUR-SUBDOMAIN.workers.dev
```

---

## 📁 Project Structure

```
.
├── worker.js                          # Main Cloudflare Worker (ALL code here)
├── wrangler.toml                      # Cloudflare configuration
├── QUICKSTART.md                      # 5-minute deployment guide
├── CLOUDFLARE_DEPLOYMENT_COMPLETE.md  # Comprehensive documentation
├── PYTHON_VS_WORKERS_COMPARISON.md    # Migration details
├── deploy-to-cloudflare-workers.sh    # Automated deployment
├── test-cloudflare-endpoints.sh       # Endpoint testing
└── python-backup-old-version/         # Archived Python code (not used)
```

**Note:** All Python files have been archived in `python-backup-old-version/`. They are **not used** by Cloudflare Workers. The entire application runs from `worker.js`.

---

## 💰 Pricing

### Cloudflare Workers Free Tier

- **100,000 requests/day** - FREE
- **Global edge network** - FREE
- **Built-in DDoS protection** - FREE
- **Automatic SSL/HTTPS** - FREE

### Cloudflare Workers Paid Plan

- **$5/month** - 10 million requests/month
- **$0.50 per additional million** - Beyond 10M

### API Key Tiers (Optional)

- **Free**: 100 requests/day
- **Professional**: $49/month - 5,000 requests/day
- **Enterprise**: $199/month - 50,000 requests/day

---

## 🔧 Configuration

Edit `wrangler.toml` to customize:

```toml
[vars]
MAX_REDIRECTS = "15"      # Maximum redirects to follow
REQUEST_TIMEOUT = "8000"  # Request timeout in ms
API_VERSION = "2.0.0"     # API version
```

---

## 🌐 Custom Domain (Optional)

Use your own domain:

1. Add domain to Cloudflare
2. Update `wrangler.toml`:

```toml
[env.production]
routes = [
  { pattern = "api.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

3. Deploy: `wrangler deploy --env production`

---

## 📊 Monitoring

### Real-time Logs

```bash
wrangler tail
```

### Analytics Dashboard

View metrics in Cloudflare Dashboard:
- Workers → redirect-analyzer-api → Analytics

### KV Inspection

```bash
# List all keys
wrangler kv:key list --binding=RATE_LIMITS

# Get specific value
wrangler kv:key get --binding=RATE_LIMITS "rate_limit:basic:1.2.3.4:2025-01-18"
```

---

## 🔐 Security Features

- ✅ **SSRF Protection** - Blocks private IPs, localhost, metadata endpoints
- ✅ **Rate Limiting** - 100 requests/day free tier with KV storage
- ✅ **DDoS Protection** - Cloudflare's enterprise-grade protection
- ✅ **Automatic SSL** - HTTPS everywhere
- ✅ **Input Validation** - Strict URL and parameter validation
- ✅ **CORS Support** - Configurable cross-origin requests

---

## 🏗️ Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────────────┐
│  Cloudflare Edge Network    │
│  (300+ locations)           │
│                             │
│  ┌────────────────┐         │
│  │  worker.js     │         │
│  │  (JavaScript)  │         │
│  └────────┬───────┘         │
│           │                 │
│  ┌────────▼──────────┐      │
│  │  Cloudflare KV    │      │
│  │  (Edge Storage)   │      │
│  │  - Rate Limits    │      │
│  │  - API Keys       │      │
│  │  - Analytics      │      │
│  └───────────────────┘      │
└─────────────────────────────┘
```

---

## 🆚 Python vs Cloudflare Workers

| Metric | Python (Old) | Workers (New) | Improvement |
|--------|-------------|---------------|-------------|
| Cold Start | 500-1000ms | 5-10ms | **50-200x faster** |
| Global Presence | 1 region | 300+ locations | **Worldwide** |
| Scaling | Manual | Automatic | **Infinite** |
| Cost (10M req) | $50-200 | $5 | **90-98% cheaper** |
| Maintenance | High | Zero | **Fully managed** |

See [PYTHON_VS_WORKERS_COMPARISON.md](PYTHON_VS_WORKERS_COMPARISON.md) for details.

---

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Deploy in 5 minutes
- **[CLOUDFLARE_DEPLOYMENT_COMPLETE.md](CLOUDFLARE_DEPLOYMENT_COMPLETE.md)** - Complete guide
- **[PYTHON_VS_WORKERS_COMPARISON.md](PYTHON_VS_WORKERS_COMPARISON.md)** - Migration details
- **[Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)** - Official docs

---

## 🤝 Contributing

This is a production-ready Cloudflare Workers application. To contribute:

1. Fork the repository
2. Make changes to `worker.js`
3. Test locally: `wrangler dev`
4. Test endpoints: `./test-cloudflare-endpoints.sh http://localhost:8787`
5. Submit pull request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙋 Support

- **Issues**: GitHub Issues
- **Cloudflare Workers**: [Community Forum](https://community.cloudflare.com)
- **Documentation**: [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)

---

## ⚡ Why Cloudflare Workers?

- 🚀 **10-50x faster** than traditional servers
- 💰 **90%+ cost savings** vs VPS/cloud hosting
- 🌍 **Global edge network** - runs close to users
- 🔒 **Enterprise security** - built-in DDoS protection
- 📈 **Infinite scaling** - handles any traffic
- 🛠️ **Zero maintenance** - no servers to manage

---

**Ready to deploy?** Run `wrangler deploy` and go global in seconds! 🚀
