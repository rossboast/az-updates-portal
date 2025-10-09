# Contributing to Azure Updates Portal

Thank you for your interest in contributing to the Azure Updates Portal! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- Node.js 20+
- Azure subscription (for testing deployments)
- Git
- VS Code (recommended)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/az-updates-portal2.git
   cd az-updates-portal2
   ```

2. **Install Dependencies**
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

3. **Run Locally**
   
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

## Project Structure

```
.
├── api/                    # Azure Functions backend
│   ├── src/
│   │   ├── app.js         # Main app entry
│   │   ├── handlers/      # Function handlers
│   │   └── lib/           # Shared libraries
│   └── package.json
├── web/                    # Vue.js frontend
│   ├── src/
│   │   ├── components/    # Vue components
│   │   ├── stores/        # Pinia stores
│   │   └── App.vue
│   └── package.json
├── infra/                  # Bicep IaC
│   ├── main.bicep
│   └── core/              # Reusable modules
└── README.md
```

## How to Contribute

### Reporting Bugs

1. Check if the issue already exists in [GitHub Issues](https://github.com/rossboast/az-updates-portal2/issues)
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, Node version)

### Suggesting Features

1. Open a [GitHub Issue](https://github.com/rossboast/az-updates-portal2/issues) with the `enhancement` label
2. Describe the feature and its value
3. Provide examples or mockups if possible

### Pull Requests

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow the coding standards (see below)
   - Write clear commit messages
   - Add tests if applicable

3. **Test Locally**
   ```bash
   # Test API
   cd api
   npm test
   
   # Build web
   cd web
   npm run build
   
   # Validate Bicep
   bicep build infra/main.bicep
   ```

4. **Submit PR**
   - Push your branch
   - Open a Pull Request
   - Link related issues
   - Wait for review

## Coding Standards

### JavaScript/Vue.js

- **Style**: Follow existing code style
- **ES Modules**: Use `import/export` syntax
- **Async/Await**: Prefer over callbacks
- **Comments**: Write clear, concise comments for complex logic
- **Vue Composition API**: Use `<script setup>` syntax
- **Naming**: camelCase for variables/functions, PascalCase for components

**Example:**
```javascript
import { ref, computed } from 'vue';

export function useUpdates() {
  const updates = ref([]);
  const filteredUpdates = computed(() => {
    // Filter logic
    return updates.value.filter(/* ... */);
  });
  
  return { updates, filteredUpdates };
}
```

### Bicep

- **Naming**: Use lowerCamelCase
- **Parameters**: Add @description decorators
- **Modules**: Reuse core modules
- **Resources**: Use symbolic names

**Example:**
```bicep
@description('Location for all resources')
param location string = resourceGroup().location

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  // ...
}
```

### CSS

- **Methodology**: Follow existing style patterns
- **Mobile First**: Design for mobile, enhance for desktop
- **Variables**: Use CSS custom properties for theming
- **Naming**: Descriptive class names

## Adding New Feed Sources

To add a new RSS feed source:

1. **Edit `api/src/handlers/fetchBlogPosts.js`**
   ```javascript
   const BLOG_FEEDS = [
     // ... existing feeds
     {
       url: 'https://example.com/feed',
       name: 'Example Blog',
       categories: ['Azure', 'Category']
     }
   ];
   ```

2. **Test Locally**
   - Trigger the function manually
   - Verify data is saved to CosmosDB

3. **Update Documentation**
   - Add to README.md
   - Update ARCHITECTURE.md if needed

## Testing Guidelines

### API Tests

- Test HTTP endpoints
- Test RSS parsing
- Test CosmosDB operations
- Mock external dependencies

### Frontend Tests

- Test component rendering
- Test user interactions
- Test store mutations
- Test computed properties

### E2E Tests

- Test complete user flows
- Test filter functionality
- Test API integration

## Documentation

When adding features, update:

- **README.md**: User-facing information
- **ARCHITECTURE.md**: Technical details
- **DEPLOYMENT.md**: Deployment changes
- **Code Comments**: Complex logic

## Git Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add email notifications
fix: resolve CORS issue
docs: update deployment guide
style: format code with prettier
refactor: simplify RSS parser
test: add unit tests for handlers
chore: update dependencies
```

## Code Review Process

All PRs require:

1. **Pass CI Checks** (when configured)
2. **Code Review** from maintainer
3. **Testing** on a development environment
4. **Documentation** updates if needed

### Review Checklist

- [ ] Code follows project style
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Security considerations addressed

## Release Process

1. Merge approved PRs to `main`
2. Tag release: `git tag -a v1.0.0 -m "Release 1.0.0"`
3. Deploy to production with `azd up`
4. Monitor Application Insights
5. Update release notes

## Community Guidelines

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md) (if available)

## Resources

- [Azure Functions Documentation](https://learn.microsoft.com/azure/azure-functions/)
- [Vue.js 3 Guide](https://vuejs.org/guide/)
- [Bicep Documentation](https://learn.microsoft.com/azure/azure-resource-manager/bicep/)
- [Pinia Documentation](https://pinia.vuejs.org/)

## Questions?

- Open a [Discussion](https://github.com/rossboast/az-updates-portal2/discussions)
- Check existing [Issues](https://github.com/rossboast/az-updates-portal2/issues)
- Review [Documentation](README.md)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to Azure Updates Portal! 🎉
