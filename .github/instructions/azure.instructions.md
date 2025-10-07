---
description: 'Azure cloud development best practices and guidelines'
applyTo: '**'
---

# Azure Development

## Azure Resource Management

- Use Azure CLI or Azure PowerShell for resource management tasks
- Always follow Azure naming conventions and tagging best practices
- Implement proper resource lifecycle management (create, update, delete)
- Use managed identities for authentication when possible
- Follow the principle of least privilege for RBAC assignments

## Azure Best Practices

- Use Azure Resource Manager (ARM) templates or Bicep for infrastructure as code
- Implement monitoring and alerting using Azure Monitor
- Use Azure Key Vault for secrets management
- Follow the Well-Architected Framework pillars: reliability, security, cost optimization, operational excellence, performance efficiency
- Use availability zones for high availability when applicable

## Azure Developer CLI (azd)

### azd Project Structure

- Use azure.yaml as the project manifest file
- Define services, infrastructure, and deployment configuration
- Organize infrastructure code in the `infra` directory
- Keep application code separate from infrastructure code

### azd Best Practices

- Use azd templates for consistent project initialization
- Leverage azd environment variables for configuration
- Use azd hooks for custom deployment steps
- Implement proper environment management (dev, test, prod)
- Document azd commands and workflow in README

### azd Commands

- `azd init` - Initialize a new project
- `azd up` - Provision and deploy application
- `azd deploy` - Deploy application code
- `azd provision` - Provision infrastructure only
- `azd down` - Deprovision resources
- `azd env` - Manage environments
