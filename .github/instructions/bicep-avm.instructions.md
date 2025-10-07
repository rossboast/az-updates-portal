---
description: 'Infrastructure as Code with Bicep and Azure Verified Modules'
applyTo: '**/*.bicep'
---

# Bicep Development

## Naming Conventions

- When writing Bicep code, use lowerCamelCase for all names (variables, parameters, resources)
- Use resource type descriptive symbolic names (e.g., 'storageAccount' not 'storageAccountName')
- Avoid using 'name' in a symbolic name as it represents the resource, not the resource's name
- Avoid distinguishing variables and parameters by the use of suffixes

## Structure and Declaration

- Always declare parameters at the top of files with @description decorators
- Use latest stable API versions for all resources
- Use descriptive @description decorators for all parameters
- Specify minimum and maximum character length for naming parameters

## Parameters

- Set default values that are safe for test environments (use low-cost pricing tiers)
- Use @allowed decorator sparingly to avoid blocking valid deployments
- Use parameters for settings that change between deployments

## Variables

- Variables automatically infer type from the resolved value
- Use variables to contain complex expressions instead of embedding them directly in resource properties

## Resource References

- Use symbolic names for resource references instead of reference() or resourceId() functions
- Create resource dependencies through symbolic names (resourceA.id) not explicit dependsOn
- For accessing properties from other resources, use the 'existing' keyword instead of passing values through outputs

## Resource Names

- Use template expressions with uniqueString() to create meaningful and unique resource names
- Add prefixes to uniqueString() results since some resources don't allow names starting with numbers

## Child Resources

- Avoid excessive nesting of child resources
- Use parent property or nesting instead of constructing resource names for child resources

## Security

- Never include secrets or keys in outputs
- Use resource properties directly in outputs (e.g., storageAccount.properties.primaryEndpoints)

## Documentation

- Include helpful // comments within your Bicep files to improve readability

## Bicep Code Style

- Follow consistent indentation (2 spaces)
- Group related parameters, variables, and resources together
- Place parameters at the top of the file
- Define variables after parameters
- Place resource definitions after variables
- Put outputs at the end of the file

# Azure Verified Modules (AVM)

Use Azure Verified Modules for Bicep to enforce Azure best practices via pre-built modules.

## Discover modules

- AVM Index: `https://azure.github.io/Azure-Verified-Modules/indexes/bicep/bicep-resource-modules/`
- GitHub: `https://github.com/Azure/bicep-registry-modules/tree/main/avm/`

## Usage

- **Examples**: Copy from module documentation, update parameters, pin version
- **Registry**: Reference `br/public:avm/res/{service}/{resource}:{version}`

## Versioning

- MCR Endpoint: `https://mcr.microsoft.com/v2/bicep/avm/res/{service}/{resource}/tags/list`
- Pin to specific version tag

## Sources

- GitHub: `https://github.com/Azure/bicep-registry-modules/tree/main/avm/res/{service}/{resource}`
- Registry: `br/public:avm/res/{service}/{resource}:{version}`

## Naming conventions

- Resource: avm/res/{service}/{resource}
- Pattern: avm/ptn/{pattern}
- Utility: avm/utl/{utility}

## Best practices

- Always use AVM modules where available
- Pin module versions
- Start with official examples
- Review module parameters and outputs
- Always run `bicep lint` after making changes
- Prefer Azure Verified Modules when available for consistent, tested, and maintained infrastructure code
- Use AVM pattern modules for common Azure resource patterns
- Follow AVM naming conventions: `avm/res/<resource-provider>/<resource-type>`
- Leverage AVM's built-in features like RBAC, diagnostics, and tags
- Check AVM registry for latest versions and updates
- Import AVM modules using the Bicep module registry
- Pass required parameters according to AVM module specifications
- Use AVM's standardized outputs for resource references
- Follow AVM's approach to role assignments and diagnostic settings
- Contribute back to AVM if you develop reusable patterns
- Review AVM module documentation for configuration options
- Test AVM modules in non-production environments first
- Use AVM's telemetry capabilities for deployment tracking
- Follow AVM's security and compliance recommendations
