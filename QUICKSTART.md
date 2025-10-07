# Quick Start Guide

Get the Azure Updates Portal running in 5 minutes!

## Option 1: Deploy to Azure (Fastest)

**Prerequisites:** Azure subscription + [Azure Developer CLI](https://aka.ms/azd)

```bash
# Clone the repository
git clone https://github.com/rossboast/az-updates-portal2.git
cd az-updates-portal2

# Login to Azure
azd auth login

# Deploy everything
azd up
```

That's it! The command will:
- ✅ Provision Azure resources (Functions, CosmosDB, App Service)
- ✅ Build the web and API applications
- ✅ Deploy to Azure
- ✅ Configure all settings automatically
- ✅ Output the portal URL

**Estimated time:** 5-7 minutes

**Cost:** ~$15-20/month (see [DEPLOYMENT.md](DEPLOYMENT.md) for cost breakdown)

---

## Option 2: Run Locally (Development)

**Prerequisites:** Node.js 20+

### 1. Install Dependencies

```bash
# API
cd api
npm install
cd ..

# Web
cd web
npm install
cd ..
```

### 2. Configure Local Settings

Create `api/local.settings.json`:
```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "COSMOS_ENDPOINT": "https://localhost:8081",
    "COSMOS_DATABASE_NAME": "AzureUpdatesDB",
    "COSMOS_CONTAINER_NAME": "Updates"
  }
}
```

### 3. Start Development Servers

**Terminal 1 - API:**
```bash
cd api
npm start
```

**Terminal 2 - Web:**
```bash
cd web
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- API: http://localhost:7071

**Note:** Without CosmosDB, the API won't have data. You can:
- Use Azure CosmosDB Emulator (Windows)
- Deploy just CosmosDB to Azure and connect locally
- Mock the data in the frontend for UI development

---

## Option 3: Explore the Code

**Don't want to run it yet? Just browse:**

### Key Files to Check Out

**Frontend (Vue.js):**
- `web/src/App.vue` - Main application
- `web/src/components/Filters.vue` - Filter controls
- `web/src/components/UpdateCard.vue` - Update display card
- `web/src/stores/updates.js` - State management

**Backend (Azure Functions):**
- `api/src/app.js` - Main Functions app
- `api/src/handlers/updates.js` - API endpoints
- `api/src/handlers/fetchAzureUpdates.js` - Data collection
- `api/src/handlers/fetchBlogPosts.js` - Blog aggregation

**Infrastructure (Bicep):**
- `infra/main.bicep` - Main infrastructure definition
- `infra/core/` - Reusable Bicep modules

**Documentation:**
- `README.md` - Overview and features
- `DEPLOYMENT.md` - Detailed deployment guide
- `ARCHITECTURE.md` - Technical architecture
- `API.md` - API reference

---

## Next Steps

### After Deployment

1. **Trigger Data Collection:**
   - Go to Azure Portal → Your Function App
   - Navigate to Functions → `fetchAzureUpdates`
   - Click "Code + Test" → "Test/Run"
   - Repeat for `fetchBlogPosts`
   - Wait 2-3 minutes for data to populate

2. **View the Portal:**
   - Open the App Service URL (shown after `azd up`)
   - You should see Azure updates and blog posts
   - Try filtering by category or searching

3. **Explore the Data:**
   - Go to Azure Portal → CosmosDB
   - Open Data Explorer
   - View the `Updates` container

### Customize the Portal

**Add New Feed Sources:**
Edit `api/src/handlers/fetchBlogPosts.js`:
```javascript
const BLOG_FEEDS = [
  // Add your feed here
  {
    url: 'https://your-blog.com/feed',
    name: 'Your Blog',
    categories: ['Azure', 'Custom']
  }
];
```

**Change Colors:**
Edit `web/src/style.css`:
```css
body {
  background: linear-gradient(135deg, #your-color1, #your-color2);
}
```

**Adjust Update Frequency:**
Edit `api/src/app.js`:
```javascript
app.timer('fetchAzureUpdates', {
  schedule: '0 0 */6 * * *',  // Change this cron expression
  handler: fetchAzureUpdates
});
```

---

## Troubleshooting

### "azd up" fails
```bash
# Update Azure CLI and azd
az upgrade
azd upgrade
```

### No data in portal
1. Manually trigger the data collection functions in Azure Portal
2. Check Function App logs for errors
3. Verify CosmosDB connection string

### Build errors
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### CORS errors in browser
1. Check Function App CORS settings in Azure Portal
2. Ensure App Service URL is allowed
3. Verify API URL in web app settings

---

## Learning Resources

**New to Azure Functions?**
- [Azure Functions Quickstart](https://learn.microsoft.com/azure/azure-functions/functions-get-started)
- [JavaScript Functions Tutorial](https://learn.microsoft.com/azure/azure-functions/functions-reference-node)

**New to Vue.js?**
- [Vue.js 3 Guide](https://vuejs.org/guide/)
- [Pinia State Management](https://pinia.vuejs.org/)

**New to Bicep?**
- [Bicep Quickstart](https://learn.microsoft.com/azure/azure-resource-manager/bicep/quickstart-create-bicep-use-visual-studio-code)
- [Azure Verified Modules](https://azure.github.io/Azure-Verified-Modules/)

**New to Azure Developer CLI?**
- [azd Documentation](https://learn.microsoft.com/azure/developer/azure-developer-cli/)
- [azd Templates](https://azure.github.io/awesome-azd/)

---

## Common Commands

```bash
# Deploy to Azure
azd up

# Deploy code only (no infrastructure changes)
azd deploy

# View deployment logs
azd monitor

# Clean up resources
azd down

# Build locally
cd web && npm run build

# Test API locally
cd api && npm start

# Validate Bicep
bicep build infra/main.bicep
```

---

## Get Help

- 📖 [Full Documentation](README.md)
- 🐛 [Report Issues](https://github.com/rossboast/az-updates-portal2/issues)
- 💬 [Discussions](https://github.com/rossboast/az-updates-portal2/discussions)
- 📧 Support: Open an issue on GitHub

---

## Success Checklist

After following this guide, you should have:

- [ ] Deployed the application to Azure
- [ ] Accessed the web portal in your browser
- [ ] Seen Azure updates and blog posts displayed
- [ ] Tested the filter functionality
- [ ] Verified the API endpoints work
- [ ] Explored the CosmosDB data
- [ ] (Optional) Customized the portal to your needs

**Congratulations! 🎉**

You're now running the Azure Updates Portal!

---

## What's Next?

- ⭐ Star the repository on GitHub
- 🔧 Customize the portal for your needs
- 🤝 Contribute improvements (see [CONTRIBUTING.md](CONTRIBUTING.md))
- 📢 Share with your team
- 💡 Suggest new features via GitHub Issues

Happy coding! 🚀
