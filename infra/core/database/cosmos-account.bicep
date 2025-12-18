@description('Location for all resources')
param location string = resourceGroup().location

@description('Tags to apply to resources')
param tags object = {}

@description('Cosmos DB account name')
param name string

@description('Database name')
param databaseName string

@description('Containers to create')
param containers array

resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: name
  location: location
  tags: tags
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    enableFreeTier: true
    publicNetworkAccess: 'Enabled'
    networkAclBypass: 'AzureServices'
    disableKeyBasedMetadataWriteAccess: true
  }
}

resource database 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2023-04-15' = {
  parent: cosmosAccount
  name: databaseName
  properties: {
    resource: {
      id: databaseName
    }
  }
}

resource cosmosContainers 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = [for container in containers: {
  parent: database
  name: container.name
  properties: {
    resource: {
      id: container.name
      partitionKey: {
        paths: [
          container.partitionKey
        ]
        kind: 'Hash'
      }
      defaultTtl: container.?defaultTtl ?? -1
    }
  }
}]

output id string = cosmosAccount.id
output name string = cosmosAccount.name
output endpoint string = cosmosAccount.properties.documentEndpoint
