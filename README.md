# Azure Updates Portal

A production-ready web application that aggregates Azure announcements, updates, and blog posts from multiple sources into a single, filterable interface. Built with Vue.js 3, Azure Functions, and CosmosDB.

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/)

**🚀 Quick Deploy:** `azd up` (requires [Azure Developer CLI](https://aka.ms/azd))

**✨ Key Features:**
- 🔄 Automatic content aggregation from multiple Azure sources
- 🎥 Microsoft Build and Ignite event videos from YouTube
- 🎯 Filter by category (Compute, Integration, AI, Events, etc.)
- 🔍 Real-time search functionality
- 📱 Responsive, mobile-friendly design
- 🔒 Secure with managed identities
- 💰 Cost-optimized (~$15-20/month)
- 📚 Comprehensive documentation

## Features

### Frontend (Vue.js 3)
- **Modern UI**: Clean, responsive interface with gradient backgrounds and card-based layout
- **Real-time Filtering**: Filter by category, type (updates, blogs, videos), and search query
- **Configurable Categories**: Support for Azure categories like Compute, Integration, AI, Development, Events
- **State Management**: Pinia store for efficient state handling
- **API Integration**: Connects to backend API for dynamic content

### Backend (Azure Functions)
- **REST API**: HTTP endpoints for fetching updates and categories
- **Timer Triggers**: Automated fetching of Azure updates, blog posts, and event videos
- **Multiple Sources**: Aggregates content from:
  - Azure Updates RSS feed
  - Azure Blog
  - Azure SDK Blog
  - Azure Tech Community
  - Microsoft Build videos (YouTube)
  - Microsoft Ignite videos (YouTube)
- **Extensible Design**: Easy to add new feed sources

### Infrastructure (Bicep IaC)
- **Azure Functions**: Flex Consumption plan for cost-effective compute
- **CosmosDB**: NoSQL database for storing and querying updates
- **App Service**: Linux-based hosting for Vue.js frontend
- **Application Insights**: Monitoring and telemetry
- **Managed Identity**: Secure, password-less authentication
- **Azure Developer CLI**: One-command deployment with `azd up`

## Getting Started

### Prerequisites
- Azure subscription
- Azure Developer CLI ([azd](https://aka.ms/azd))
- Node.js 20+
- Visual Studio Code (recommended)

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rossboast/az-updates-portal2.git
   cd az-updates-portal2
   ```

2. **Login to Azure**:
   ```bash
   azd auth login
   ```

3. **Deploy to Azure**:
   ```bash
   azd up
   ```
   
   This single command will:
   - Provision all Azure resources (Functions, CosmosDB, App Service, etc.)
   - Build and deploy the API and web application
   - Configure all necessary settings and connections

4. **Access the portal**:
   - The deployment will output the web application URL
   - Open it in your browser to view the Azure Updates Portal

### Local Development

Run both API and web app locally with **mock data** (no Azure required):

**Terminal 1 - API:**
```bash
cd api
npm install
npm start
```

**Terminal 2 - Web:**
```bash
cd web
npm install
npm run dev
```

Open `http://localhost:5173` to see the portal with sample data!

📖 **See [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md) for detailed local setup guide**

## Project Structure

```
.
├── api/                        # Azure Functions backend
│   ├── src/
│   │   ├── app.js             # Main Functions v4 app
│   │   ├── handlers/          # Function handlers
│   │   │   ├── updates.js     # HTTP API endpoints
│   │   │   ├── fetchAzureUpdates.js    # Timer-triggered fetcher
│   │   │   └── fetchBlogPosts.js       # Timer-triggered fetcher
│   │   └── lib/
│   │       └── cosmosClient.js         # CosmosDB client
│   ├── host.json
│   └── package.json
├── web/                        # Vue.js 3 frontend
│   ├── src/
│   │   ├── App.vue            # Main component
│   │   ├── main.js            # Application entry
│   │   ├── components/        # Vue components
│   │   │   ├── Filters.vue
│   │   │   └── UpdateCard.vue
│   │   └── stores/            # Pinia state management
│   │       └── updates.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── infra/                      # Bicep infrastructure as code
│   ├── main.bicep             # Main infrastructure definition
│   ├── main.parameters.json
│   ├── abbreviations.json
│   └── core/                  # Reusable Bicep modules
│       ├── database/
│       ├── host/
│       ├── monitor/
│       ├── security/
│       └── storage/
├── .github/                    # GitHub configuration
│   ├── copilot-instructions.md
│   ├── chatmodes/
│   ├── instructions/
│   └── prompts/
├── azure.yaml                  # Azure Developer CLI config
└── README.md
```

## Customization

### Adding New Feed Sources

To add a new blog or update feed:

1. Edit `api/src/handlers/fetchBlogPosts.js` or create a new handler
2. Add the feed URL and configuration to the `BLOG_FEEDS` array:
   ```javascript
   {
     url: 'https://example.com/feed/',
     name: 'Example Blog',
     categories: ['Azure', 'Custom']
   }
   ```
3. The system will automatically start fetching from the new source

### Adding New Categories

Categories are automatically extracted from feed sources. To add custom categories:

1. Update the RSS parsing logic in the fetch handlers
2. Or manually tag items with categories in the `parseRSSFeed` function

### Customizing Update Frequency

Edit the timer schedules in `api/src/app.js`:
- `fetchAzureUpdates`: Currently runs every 6 hours
- `fetchBlogPosts`: Currently runs every 12 hours

### Frontend Customization

- **Styling**: Edit `web/src/style.css` for colors, fonts, and layout
- **Components**: Modify Vue components in `web/src/components/`
- **Filters**: Update filter logic in `web/src/stores/updates.js`

## Architecture

### Data Flow

1. **Timer Triggers**: Azure Functions run on schedule to fetch content
2. **RSS Parsing**: Functions parse RSS feeds and extract updates
3. **Storage**: Updates are stored in CosmosDB with categories and metadata
4. **API**: HTTP-triggered functions expose REST endpoints
5. **Frontend**: Vue.js app fetches and displays updates with filtering

### Security

- **Managed Identity**: Functions authenticate to CosmosDB without credentials
- **HTTPS Only**: All endpoints enforce HTTPS
- **CORS**: Configured for secure cross-origin requests
- **Role-Based Access**: CosmosDB uses fine-grained role assignments

### Scalability

- **Flex Consumption**: Azure Functions scale automatically based on demand
- **CosmosDB**: Scales horizontally with partitioning by type
- **Static Frontend**: App Service serves the built Vue.js app efficiently

## Future Enhancements

- Add authentication for personalized feeds
- Implement bookmarking and favorites
- Add email notifications for new updates
- Cross-reference with Microsoft Learn documentation
- Add AI-powered content summarization
- Support for custom RSS feed subscriptions
- Real-time updates with SignalR

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project as a template for your own Azure applications.

## API Endpoints

### GET `/api/updates`
Get all updates with optional filtering

Query Parameters:
- `category` (optional): Filter by category
- `limit` (optional): Number of results (default: 50)

### GET `/api/categories`
Get all available categories

### GET `/api/updates/category/{category}`
Get updates for a specific category

Query Parameters:
- `limit` (optional): Number of results (default: 50)

## Documentation

### Complete Guides
- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes
- **[LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md)** - Run locally with mock data
- **[TESTING.md](TESTING.md)** - Testing guide and best practices
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture details
- **[API.md](API.md)** - API reference documentation
- **[FEATURES.md](FEATURES.md)** - Feature documentation
- **[COSMOSDB_RATIONALE.md](COSMOSDB_RATIONALE.md)** - Why CosmosDB was chosen
- **[DATA_RETENTION.md](DATA_RETENTION.md)** - 12-month TTL implementation details
- **[DATA_PREFETCH_OPTIONS.md](DATA_PREFETCH_OPTIONS.md)** - Pre-fetching strategies explained
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines

## Resources

- [Azure Functions Documentation](https://learn.microsoft.com/azure/azure-functions/)
- [Vue.js 3 Documentation](https://vuejs.org/)
- [Pinia State Management](https://pinia.vuejs.org/)
- [Azure CosmosDB Documentation](https://learn.microsoft.com/azure/cosmos-db/)
- [Azure Developer CLI (azd)](https://learn.microsoft.com/azure/developer/azure-developer-cli/)
- [Azure Updates RSS Feed](https://azure.microsoft.com/en-us/updates/)