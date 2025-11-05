# NeurixExt - AI Chrome Extension

A Chrome extension that provides multi-model AI chat powered by OpenRouter API with a secure Cloudflare Worker backend.

## ✨ Features

- 🤖 **Multiple AI Models**: GPT-OSS-20B, GLM-4.5-Air, Qwen3-235B, Gemini-2.0-Flash, DeepSeek
- 🔒 **Secure**: API keys stored in Cloudflare Workers (not in extension code)
- 🚀 **Fast**: Global edge network via Cloudflare
- 💰 **Free**: Up to 100,000 requests/day
- 🎯 **Smart**: Select which models to use
- 📊 **Monitor**: Track usage in Cloudflare dashboard

---

## 🚀 Quick Start - Development

First, run the development server:

```bash
npm run dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

You can start editing the popup by modifying `popup.tsx`. It should auto-update as you make changes. To add an options page, simply add a `options.tsx` file to the root of the project, with a react component default exported. Likewise to add a content page, add a `content.ts` file to the root of the project, importing some module and do some logic, then reload the extension on your browser.

For further guidance, [visit our Documentation](https://docs.plasmo.com/)

---

## 🔧 Production Deployment

For production with secure API key storage, see **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete Cloudflare Worker setup.

### Quick Deploy Steps:

1. **Install Wrangler**: `npm install -g wrangler`
2. **Deploy Worker**: 
   ```bash
   cd cloudflare-worker
   wrangler login
   wrangler secret put OPENROUTER_API_KEY
   wrangler deploy
   ```
3. **Update Config**: Add worker URL to `.env.local`
4. **Build Extension**: `npm run build`

Full guide: [cloudflare-worker/README.md](./cloudflare-worker/README.md)

---

## 📦 Building for Production

Run the following:

```bash
npm run build
```

This creates a production bundle ready to be zipped and published to the Chrome Web Store.

## Submit to the webstores

The easiest way to deploy your Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit) and you should be on your way for automated submission!
