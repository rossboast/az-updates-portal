# Deployment Guide

## Prerequisites

- Azure Subscription
- [Azure Developer CLI](https://aka.ms/azd) installed
- Node.js 20+ installed
- Azure CLI (optional, for manual operations)

## Quick Deployment

The fastest way to deploy the Azure Updates Portal:

```bash
# 1. Login to Azure
azd auth login

# 2. Initialize and deploy
azd up
```

The `azd up` command will:
1. Prompt for environment name (e.g., "dev", "prod")
2. Prompt for Azure location (e.g., "eastus", "westeurope")
3. Provision all Azure resources
4. Build the applications
5. Deploy to Azure
6. Output the application URLs

## Manual Step-by-Step Deployment

If you prefer more control, use these individual commands:

```bash
# 1. Login to Azure
azd auth login

# 2. Initialize the environment (first time only)
azd init

# 3. Provision infrastructure
azd provision

# 4. Deploy applications
azd deploy
```

## Post-Deployment

After deployment completes:

1. **Access the Web Portal**: Open the App Service URL (output as `APP_SERVICE_URI`)
2. **Verify API**: Test the Function App URL (output as `FUNCTION_APP_URI`)
3. **Trigger Data Collection**: 
   - The timer functions run automatically on schedule
   - To manually trigger, use Azure Portal or Azure CLI:
   ```bash
   func azure functionapp fetch-app-settings <function-app-name>
   func start
   ```

## First-Time Setup

The first time you deploy:

1. **Data Collection**: Timer functions will start collecting data on schedule
   - Azure Updates: Every 6 hours
   - Blog Posts: Every 12 hours
   
2. **Initial Data**: To populate data immediately:
   - Navigate to Azure Portal → Function App
   - Go to Functions → `fetchAzureUpdates` or `fetchBlogPosts`
   - Click "Test/Run" to manually trigger

## Environment Variables

Key environment variables (automatically set by deployment):

### Function App
- `COSMOS_ENDPOINT`: CosmosDB endpoint
- `COSMOS_DATABASE_NAME`: Database name
- `COSMOS_CONTAINER_NAME`: Container name
- `APPLICATIONINSIGHTS_CONNECTION_STRING`: Application Insights

### Web App
- `VITE_API_URL`: Function App API URL

## Updating the Application

To update after making code changes:

```bash
# Deploy just the code (faster)
azd deploy

# Or rebuild everything
azd up
```

## Monitoring and Debugging

### Application Insights
- View telemetry in Azure Portal → Application Insights
- Query logs, track exceptions, monitor performance

### Function Logs
```bash
# Stream live logs
func azure functionapp logstream <function-app-name>
```

### CosmosDB Data
- Azure Portal → CosmosDB → Data Explorer
- View and query the Updates container

## Cost Management

This deployment uses:
- **Azure Functions**: Consumption plan (pay per execution)
- **CosmosDB**: Free tier (first 1000 RU/s free)
- **App Service**: Basic tier (~$13/month, or use Free tier)
- **Application Insights**: Pay per GB ingested
- **Storage**: Minimal cost (~$0.01/month)

Estimated total: **~$15-20/month** with normal usage

To reduce costs:
- Change App Service to Free tier in `infra/main.bicep`
- Reduce timer function frequency
- Adjust CosmosDB throughput

## Cleanup

To delete all Azure resources:

```bash
azd down
```

This will remove all resources created by the deployment.

## Troubleshooting

### Issue: Bicep deployment fails
**Solution**: Ensure Azure CLI and bicep are up to date:
```bash
az upgrade
az bicep upgrade
```

### Issue: Function App deployment fails
**Solution**: Check build logs and ensure dependencies are installed:
```bash
cd api
npm install
```

### Issue: Web app shows blank page
**Solution**: 
1. Check browser console for errors
2. Verify API URL is correct in App Service configuration
3. Rebuild the web app: `cd web && npm run build`

### Issue: No data in portal
**Solution**: 
1. Manually trigger the data collection functions in Azure Portal
2. Check Function App logs for errors
3. Verify CosmosDB connection in Function App settings

### Issue: CORS errors
**Solution**: Function App should have CORS configured for the App Service URL. Check in Azure Portal → Function App → CORS settings.

## Architecture Overview

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐      ┌──────────────────┐
│  App Service    │─────▶│  Functions API   │
│  (Vue.js SPA)   │      │  (Node.js)       │
└─────────────────┘      └────────┬─────────┘
                                  │
                                  ▼
                         ┌────────────────┐
                         │   CosmosDB     │
                         │  (NoSQL)       │
                         └────────────────┘
                                  ▲
                                  │
                         ┌────────┴─────────┐
                         │  Timer Triggers  │
                         │  (RSS Fetchers)  │
                         └──────────────────┘
```

## Development Workflow

1. Make code changes
2. Test locally (see README.md for local dev setup)
3. Commit changes
4. Run `azd deploy` to update Azure
5. Verify changes in production

## Security Notes

- All services use HTTPS only
- CosmosDB uses managed identity for authentication
- No secrets in code or configuration files
- Application Insights for security monitoring

## Support

For issues or questions:
1. Check Application Insights logs
2. Review Azure Portal diagnostics
3. Consult [Azure Functions documentation](https://learn.microsoft.com/azure/azure-functions/)
4. Open an issue in the repository
