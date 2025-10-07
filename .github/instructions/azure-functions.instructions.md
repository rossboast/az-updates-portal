---
description: 'Azure functions development best practices and guidelines'
applyTo: '**'
---

# Azure Functions General Guidelines

1. Use Flex Consumption plan for Azure Functions by default unless otherwise stated.
2. Use Bicep and Azure Verified Modules (AVM) by default for IaC and follow the structure and module usage based on samples from this repository: https://github.com/Azure-Samples/azure-functions-flex-consumption-samples. Specific examples:
   1. Use AVM as shown here https://github.com/Azure-Samples/functions-quickstart-dotnet-azd-eventgrid-blob/tree/main/infra
   2. Use standard Azure abbreviations and use the same file and folder names for infra as mentioned here: https://github.com/Azure-Samples/functions-quickstart-dotnet-azd-eventgrid-blob/tree/main/infra
4. Ensure compatibility with Azure Functions runtime and code generation best practices mentioned in `get_bestpractices` tool.
5. Remove unnecessary infra files.
6. Follow the validation points below to verify actions. In particular and with regards to post deployment, validate the Azure Function app has been deployed and the code has been deployed as functions within that.

## 🚨 CRITICAL Deployment Validation Rules

### **Pre-Deployment Checklist**
```
MANDATORY validations before deployment:

Infrastructure Validation:
✅ All Bicep files compile without errors (use get_errors tool)
✅ Module dependency order is correct (dependencies defined before consumers)
✅ No duplicate or unused module files in infra/modules/
✅ Storage account includes both blob and queue services if queue triggers used
✅ Function App uses FC1 FlexConsumption, not Y1 Dynamic
✅ All abbreviations referenced in main.bicep exist in abbreviations.json
✅ RBAC module includes all required role assignments
✅ Security settings: TLS 1.2, HTTPS-only, disabled shared key access

Code Validation:
✅ No function.json files exist for JavaScript v4 Functions
✅ All functions use app.* syntax (app.storageBlob, app.http, etc.)
✅ Package.json includes @azure/functions ^4.0.0
✅ Host.json uses extension bundle [4.*, 5.0.0)
✅ Whenever possible, Code uses bindings and not SDKs to connect to Azure Services
✅ Environment variables use managed identity patterns (__accountName)
✅ All helper modules have proper error handling

Project Structure:
✅ azure.yaml exists and is properly configured
✅ main.parameters.json matches main.bicep parameters
✅ src/ contains main entry point (app.js in the case of javascript)
✅ No legacy function directories
```

### **Deployment Command Standards**
```
PREFERRED deployment method: Azure Developer CLI (azd)
✅ azd auth login
✅ azd init (if not already initialized)
✅ azd up --template azure-functions

ALTERNATIVE: Azure CLI
✅ az login
✅ az deployment sub create --location <location> --template-file infra/main.bicep --parameters infra/main.parameters.json
✅ func azure functionapp publish <function-app-name> --javascript

VALIDATION commands:
✅ azd provision --preview (validate before deployment)
✅ az deployment group what-if (validate ARM template)
```

### **Post-Deployment Validation**
```
MANDATORY checks after deployment:

Resource Validation:
✅ All resources created successfully in Azure Portal
✅ Function App shows "Running" status
✅ Storage account containers and queues exist
✅ Computer Vision service is accessible
✅ Application Insights is receiving telemetry
✅ Managed Identity has proper role assignments

Functional Validation:
✅ Function App responds to HTTP requests (if applicable)
✅ Blob triggers activate when files uploaded to source container
✅ Computer Vision API calls succeed with managed identity
✅ Processed images appear in destination container
✅ Application Insights shows function execution logs
✅ No authentication or permission errors in logs
```
@agent rule: NEVER generate function.json files for JavaScript v4 Functions and Python v2 Functions - all configuration goes in the code

@agent rule: ALWAYS use Azure Functions Extension Bundles for built-in bindings and triggers (HTTP, Blob, Queue, Event Grid, etc.) instead of directly importing Azure SDK packages when possible. Extension Bundles simplify dependency management, reduce cold start times, and ensure compatibility with the Functions runtime. Only use the Azure SDK directly for advanced scenarios not covered by Extension Bundles.

@agent rule: ALWAYS use EventGrid source for blob triggers when possible for better reliability

@agent rule: ALWAYS use managed identity patterns in environment variables (accountName) instead of connection strings

@agent rule: ALWAYS include proper error handling and logging in Function handlers

@agent rule: ALWAYS run get_errors on all Bicep files before proceeding with deployment

@agent rule: ALWAYS verify Function App uses FC1 FlexConsumption before deployment

@agent rule: ALWAYS check that no function.json files exist for JavaScript v4 Functions before deployment

@agent rule: ALWAYS validate infrastructure with --preview or what-if before actual deployment

@agent rule: ALWAYS include functionAppConfig for FC1 Function Apps with deployment.storage configuration

@agent rule: ALWAYS create storage account BEFORE Function App resource

@agent rule: ALWAYS use SystemAssignedIdentity auth for deployment storage

@agent rule: ALWAYS verify resource order: Storage → App Service Plan → Function App

@agent rule: NEVER include FUNCTIONS_WORKER_RUNTIME app setting for FlexConsumption - use functionAppConfig.runtime instead

@agent rule: ALWAYS use this for function app authentication
 authentication: {
            type: identityType == 'SystemAssigned' ? 'SystemAssignedIdentity' : 'UserAssignedIdentity'
            userAssignedIdentityResourceId: identityType == 'UserAssigned' ? identityId : ''
        }

@agent rule: ALWAYS create storage account with deployment container BEFORE Function App module to prevent container access errors

@agent rule: ALWAYS use both SystemAssigned and UserAssigned identity for FlexConsumption Function Apps


# Azure Functions JavaScript v4 Programming Model Specific Guidelines

When generating or modifying Azure Functions code in JavaScript:

1. ALWAYS use the JavaScript v4 programming model for Node.js Functions by:
   - Importing the Functions SDK with `const { app, input } = require('@azure/functions')`
   - Defining functions using the app object (e.g., `app.http()`, `app.storageBlob()`, `app.serviceBusTrigger()`)
   - Including binding configurations directly in the code, NOT in separate function.json files
   - Using handler functions with the proper signature for each trigger type

2. NEVER use the older programming model which relies on:
   - `module.exports = async function(context, ...)` pattern
   - Separate function.json files for binding configurations
   - The `module.exports.bindings` pattern

3. ALWAYS include the required dependencies:
   - Add `"@azure/functions": "^4.0.0"` to package.json
   - Ensure host.json uses the latest extension bundle version: `"version": "[4.*, 5.0.0)"`

4. Access trigger metadata using `context.triggerMetadata` rather than `context.bindingData`

5. For storage blob triggers, use the EventGrid source when possible for better reliability:
   ```javascript
   app.storageBlob('FunctionName', {
     path: 'container/{name}',
     connection: 'AzureWebJobsStorage',
     source: 'EventGrid',
     handler: async (blob, context) => {
       // Function logic here
     }
   });
   ```

## 🚨 CRITICAL Azure Functions Code Generation Rules

### **Function App Structure Standards**
```
MANDATORY project structure:
src/
├── app.js                 # Main Functions v4 app entry point
├── host.json             # Function host configuration
├── local.settings.json   # Local development settings
├── package.json          # Dependencies
├── [helper-modules].js   # Business logic modules
└── tests/               # Test files

❌ NEVER create:
├── [functionName]/      # No individual function directories
│   ├── function.json   # No function.json files in JavaScript v4 model and Python v2 model
│   └── index.js        # No separate index files per function
```

### **Host.json Configuration Template**
```json
MANDATORY host.json settings:
{
  "version": "2.0",
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[4.*, 5.0.0)"  // Latest bundle version
  },
  "extensions": {
    "queues": {
      "maxPollingInterval": "00:00:02",
      "visibilityTimeout": "00:00:30",
      "batchSize": 1,
      "maxDequeueCount": 5
    }
  },
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "excludedTypes": "Request"
      }
    }
  }
}
```

### **Package.json Dependencies Template**
```json
MANDATORY dependencies for Azure Functions v4:
{
  "dependencies": {
    "@azure/functions": "^4.0.0",           // Functions v4 SDK
    "@azure/identity": "^latest",            // For Managed Identity
    "@azure/storage-blob": "^latest",        // If using blob storage
    "@azure/cognitiveservices-computervision": "^latest"  // If using Computer Vision
  },
  "devDependencies": {
    "@azure/functions-core-tools": "^4",     // Functions Core Tools
    "jest": "^latest"                        // For testing
  }
}
```

### **Function Definition Patterns**
```javascript
✅ CORRECT v4 Pattern:
const { app } = require('@azure/functions');

app.storageBlob('blobTriggerFunction', {
  path: 'source-container/{name}',
  connection: 'AzureWebJobsStorage',
  source: 'EventGrid',  // Use EventGrid for better reliability
  handler: async (blob, context) => {
    context.log(`Processing blob: ${context.triggerMetadata.name}`);
    // Function logic here
  }
});

❌ WRONG v1-v3 Pattern:
module.exports = async function (context, myBlob) {
  context.log("JavaScript blob trigger function processed blob");
};
```

### **Environment Variables Standards**
```javascript
MANDATORY environment variable patterns:
✅ Use managed identity connection: 'AzureWebJobsStorage__accountName'
❌ Avoid connection strings: 'AzureWebJobsStorage=DefaultEndpointsProtocol=https;...'

✅ Use specific endpoint variables:
- COMPUTER_VISION_ENDPOINT
- STORAGE_ACCOUNT_URL
- SOURCE_CONTAINER_NAME
- DESTINATION_CONTAINER_NAME

❌ Avoid generic variables:
- API_KEY (use Managed Identity instead)
- CONNECTION_STRING (use managed identity)
```



@agent rule: ALWAYS use SystemAssignedIdentity for functionAppConfig.deployment.storage authentication

@agent rule: ALWAYS grant SystemAssigned identity Storage Blob Data Contributor role for deployment storage access
