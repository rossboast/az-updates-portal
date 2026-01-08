targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the environment for resource naming')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

@description('Id of the principal to assign database and application roles')
param principalId string = ''

var abbrs = loadJsonContent('./abbreviations.json')
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))
var tags = { 'azd-env-name': environmentName }

resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: '${abbrs.resourcesResourceGroups}${environmentName}'
  location: location
  tags: tags
}

module monitoring './core/monitor/monitoring.bicep' = {
  name: 'monitoring'
  scope: rg
  params: {
    location: location
    tags: tags
    logAnalyticsName: '${abbrs.operationalInsightsWorkspaces}${resourceToken}'
    applicationInsightsName: '${abbrs.insightsComponents}${resourceToken}'
  }
}

module storage './core/storage/storage-account.bicep' = {
  name: 'storage'
  scope: rg
  params: {
    location: location
    tags: tags
    name: '${abbrs.storageStorageAccounts}${resourceToken}'
    containers: [
      {
        name: 'deployment'
      }
    ]
  }
}

module cosmos './core/database/cosmos-account.bicep' = {
  name: 'cosmos'
  scope: rg
  params: {
    location: location
    tags: tags
    name: '${abbrs.documentDBDatabaseAccounts}${resourceToken}'
    databaseName: 'AzureUpdatesDB'
    containers: [
      {
        name: 'Updates'
        partitionKey: '/type'
        defaultTtl: 31536000  // 12 months in seconds (365 days * 24 hours * 60 minutes * 60 seconds)
      }
    ]
  }
}

// Define web app name for use in function app config
var webAppName = '${abbrs.webSitesAppService}${resourceToken}'

module functionApp './core/host/functions-flexconsumption.bicep' = {
  name: 'functionApp'
  scope: rg
  params: {
    location: location
    tags: tags
    name: '${abbrs.webSitesFunctions}${resourceToken}'
    storageAccountName: storage.outputs.name
    applicationInsightsName: monitoring.outputs.applicationInsightsName
    appSettings: {
      COSMOS_ENDPOINT: cosmos.outputs.endpoint
      COSMOS_DATABASE_NAME: 'AzureUpdatesDB'
      COSMOS_CONTAINER_NAME: 'Updates'
      WEB_APP_URL: 'https://${webAppName}.azurewebsites.net'
    }
  }
}

module appService './core/host/appservice.bicep' = {
  name: 'appService'
  scope: rg
  params: {
    location: location
    tags: tags
    name: webAppName
    applicationInsightsName: monitoring.outputs.applicationInsightsName
    appSettings: {
      VITE_API_URL: 'https://${functionApp.outputs.name}.azurewebsites.net/api'
    }
  }
}

module cosmosRoleAssignment './core/security/role-cosmos.bicep' = {
  name: 'cosmosRoleAssignment'
  scope: rg
  params: {
    cosmosAccountName: cosmos.outputs.name
    principalId: functionApp.outputs.identityPrincipalId
  }
}

output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
output AZURE_RESOURCE_GROUP string = rg.name

output FUNCTION_APP_NAME string = functionApp.outputs.name
output FUNCTION_APP_URI string = functionApp.outputs.uri
output APP_SERVICE_NAME string = appService.outputs.name
output APP_SERVICE_URI string = appService.outputs.uri
output COSMOS_ENDPOINT string = cosmos.outputs.endpoint
output APPLICATIONINSIGHTS_CONNECTION_STRING string = monitoring.outputs.applicationInsightsConnectionString
