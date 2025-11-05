# Cloudflare Worker Deployment Guide

This Cloudflare Worker acts as a secure proxy between your Chrome extension and the OpenRouter API, keeping your API key secret and enabling rate limiting.

## 🚀 Quick Start

### Prerequisites

1. **Cloudflare Account** (Free tier works!)
   - Sign up at: https://dash.cloudflare.com/sign-up

2. **Node.js & npm** (Already installed)
   - Verify: `node --version`

3. **Wrangler CLI** (Cloudflare's deployment tool)
   ```bash
   npm install -g wrangler
   ```

---

## 📦 Step 1: Install Wrangler

```bash
npm install -g wrangler
```

Verify installation:
```bash
wrangler --version
```

---

## 🔐 Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open your browser to authenticate.

---

## 🔑 Step 3: Set Your OpenRouter API Key as a Secret

**IMPORTANT:** Never commit your API key to git. Use Cloudflare's secret storage:

```bash
cd cloudflare-worker
wrangler secret put OPENROUTER_API_KEY
```

When prompted, paste your OpenRouter API key:
Press Enter. The key is now securely stored in Cloudflare (never in your code).

---

## 🚢 Step 4: Deploy the Worker

```bash
wrangler deploy
```

After deployment, you'll see output like:
```
✨ Successfully published your Worker to
   https://neurix-openrouter-proxy.your-subdomain.workers.dev
```

**Copy this URL!** You'll need it for Step 5.

---

## ⚙️ Step 5: Update Extension Configuration

1. Open `.env.local` in the extension root directory
2. Replace the `PLASMO_PUBLIC_WORKER_URL` with your deployed worker URL:

```env
PLASMO_PUBLIC_WORKER_URL=https://neurix-openrouter-proxy.your-subdomain.workers.dev
```

3. Rebuild the extension:
```bash
npm run build
```

---

## ✅ Step 6: Test Your Worker

### Test health endpoint:
```bash
curl https://neurix-openrouter-proxy.your-subdomain.workers.dev/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "neurix-openrouter-proxy",
  "timestamp": "2025-01-05T12:00:00.000Z"
}
```

### Test chat endpoint:
```bash
curl -X POST https://neurix-openrouter-proxy.your-subdomain.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "modelName": "GPT-OSS-20B",
    "messages": [{"role": "user", "content": "Hello!"}],
    "temperature": 0.7,
    "maxTokens": 100
  }'
```

Expected response:
```json
{
  "success": true,
  "data": "Hello! How can I help you today?",
  "model": "GPT-OSS-20B",
  "usage": { ... }
}
```

---

## 🔄 Updating the Worker

After making changes to `worker.js`:

```bash
wrangler deploy
```

No need to re-set secrets unless you want to change them.

---

## 🎛️ Advanced Configuration

### Rate Limiting

By default, the worker limits users to **30 requests per minute** per IP address.

To change this, edit `worker.js`:
```javascript
const RATE_LIMIT = 30 // Change this number
const RATE_LIMIT_WINDOW = 60000 // 1 minute in milliseconds
```

### Custom Domain (Optional)

1. Add a route in `wrangler.toml`:
```toml
routes = [
  { pattern = "api.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

2. Deploy:
```bash
wrangler deploy
```

### CORS Configuration

For production, restrict CORS to your extension ID only.

In `worker.js`, change:
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'chrome-extension://YOUR_EXTENSION_ID',
  // ... rest of headers
}
```

To find your extension ID:
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Find your extension and copy its ID

---

## 📊 Monitoring

View your worker's usage and logs:

```bash
wrangler tail
```

Or visit the Cloudflare Dashboard:
https://dash.cloudflare.com/ → Workers & Pages → Your Worker

---

## 🐛 Troubleshooting

### "Error: API key not set"
- Run: `wrangler secret put OPENROUTER_API_KEY`
- Make sure you're in the `cloudflare-worker` directory

### "Rate limit exceeded"
- Wait 1 minute and try again
- Or increase `RATE_LIMIT` in worker.js

### "Worker not found"
- Verify you're using the correct worker URL
- Check deployment: `wrangler deployments list`

### "CORS error in extension"
- Make sure CORS headers are set to `'*'` or your extension ID
- Check if the worker URL is correct in `.env.local`

---

## 💰 Pricing

**Cloudflare Workers Free Tier:**
- ✅ 100,000 requests/day
- ✅ Unlimited scripts
- ✅ Global edge network

**Paid Plan ($5/month):**
- ✅ 10 million requests/month
- ✅ Longer CPU time
- ✅ More memory

For most extensions, the **free tier is plenty**!

---

## 🔒 Security Best Practices

1. ✅ **Never commit secrets** - Use `wrangler secret put`
2. ✅ **Use environment-specific secrets** - Different keys for dev/prod
3. ✅ **Enable rate limiting** - Already included in the worker
4. ✅ **Restrict CORS in production** - Change `*` to your extension ID
5. ✅ **Monitor usage** - Check Cloudflare dashboard regularly
6. ✅ **Rotate API keys periodically** - Update with `wrangler secret put`

---

## 📚 Additional Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [OpenRouter API Docs](https://openrouter.ai/docs)

---

## 🆘 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. View worker logs: `wrangler tail`
3. Check Cloudflare dashboard for errors
4. Test endpoints with `curl` commands above

---

## ✨ You're Done!

Your extension now uses a secure Cloudflare Worker proxy! 🎉

The API key is safely stored in Cloudflare, not in your extension code.
