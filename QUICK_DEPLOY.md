# 🚀 QUICK DEPLOYMENT GUIDE

## Step 1: Deploy This Homepage to Netlify

```bash
# Build the app
npm run build

# Install Netlify CLI if you haven't
npm install -g netlify-cli

# Deploy to Netlify
netlify deploy --prod --dir=build
```

## Step 2: Connect Your Domain

1. Go to Netlify dashboard
2. Domain settings → Add custom domain
3. Add `repspheres.com`

## Step 3: Your Apps Will Be Available At:

- **Homepage**: https://repspheres.com
- **Market Insights**: https://repspheres.com/insights
- **Workspace**: https://repspheres.com/workspace  
- **Linguistics**: https://repspheres.com/linguistics
- **AI Visualizer**: https://repspheres.com/visualizer
- **Podcast**: https://repspheres.com/?page=podcast

## That's It! 🎉

The `_redirects` file will automatically route traffic to your existing Netlify apps.

## If You Need to Update App URLs Later:

Edit `/public/_redirects` and redeploy.