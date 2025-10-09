@description('Cosmos DB account name')
param cosmosAccountName string

@description('Principal ID to assign role')
param principalId string

resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' existing = {
  name: cosmosAccountName
}

var cosmosDataContributorRole = '00000000-0000-0000-0000-000000000002'

resource roleAssignment 'Microsoft.DocumentDB/databaseAccounts/sqlRoleAssignments@2023-04-15' = {
  parent: cosmosAccount
  name: guid(cosmosAccount.id, principalId, cosmosDataContributorRole)
  properties: {
    roleDefinitionId: '${cosmosAccount.id}/sqlRoleDefinitions/${cosmosDataContributorRole}'
    principalId: principalId
    scope: cosmosAccount.id
  }
}

output roleAssignmentId string = roleAssignment.id
