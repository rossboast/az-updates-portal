# Azure Application Template

A comprehensive development environment template for building Azure applications with GitHub Copilot integration. This template provides pre-configured development containers, language-specific coding standards, and AI-powered development assistants for Python, .NET, Node.js, Vue.js, Bicep, and Azure Functions.

## Features

### Development Environment
- **Dev Container**: Pre-configured container with Azure CLI, Azure Developer CLI (azd), Python, .NET, Node.js, and PowerShell
- **VS Code Integration**: Auto-installs extensions for Azure development, Bicep, GitHub Copilot, and language-specific tools
- **Multi-Language Support**: Ready for Python, .NET (C#), Node.js, Vue.js 3, and infrastructure-as-code with Bicep

### GitHub Copilot Customization
- **Custom Instructions**: Concise, action-oriented coding guidelines across all supported languages
- **Language-Specific Standards**: Tailored instructions for:
  - Python (PEP 8, type hints, docstrings)
  - C# and .NET (C# 13, async/await, SOLID principles)
  - Node.js (ES2022, Vitest testing)
  - Vue.js 3 (Composition API, TypeScript, Pinia)
  - Bicep (Azure Verified Modules, infrastructure as code)
  - Azure Functions (Flex Consumption, JavaScript v4, Python v2)
  - Playwright (E2E testing, accessibility)

### Specialized Copilot Chat Modes
- **Azure Principal Architect**: Expert guidance using Azure Well-Architected Framework principles
- **Azure Verified Modules (AVM) Bicep**: Specialized assistance for infrastructure as code
- **Playwright Tester**: E2E test generation and execution support

### Copilot Prompts & Workflows
- **Azure Cost Optimization**: Analyze IaC files and resources, generate cost optimization recommendations as GitHub issues
- **Azure Resource Health Diagnostics**: Diagnose and troubleshoot Azure resource issues
- **Playwright Test Generation**: Generate comprehensive E2E tests from website exploration
- **Playwright Website Exploration**: Automated website exploration and documentation

## Getting Started

### Prerequisites
- Visual Studio Code with Dev Containers extension
- Docker Desktop
- GitHub account with Copilot access

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rossboast/az-app-template.git
   cd az-app-template
   ```

2. **Open in Dev Container**:
   - Open the folder in VS Code
   - Click "Reopen in Container" when prompted, or use Command Palette: `Dev Containers: Reopen in Container`

3. **Start developing**:
   - All tools and extensions are pre-installed
   - GitHub Copilot will use the custom instructions automatically
   - Access specialized chat modes via `@workspace` in Copilot Chat

### Using Copilot Chat Modes

To activate a specialized chat mode in VS Code:
1. Open GitHub Copilot Chat (`Ctrl+Shift+I` or `Cmd+Shift+I`)
2. Use `@workspace` and reference the chat mode, e.g., `@workspace /mode azure-principal-architect`
3. Or use prompts directly with `@workspace` followed by the prompt name

## Repository Structure

```
.
├── .devcontainer/              # Dev container configuration
│   └── devcontainer.json       # Container setup with tools and extensions
├── .github/
│   ├── copilot-instructions.md # General Copilot guidelines
│   ├── chatmodes/              # Specialized Copilot chat modes
│   │   ├── azure-principal-architect.chatmode.md
│   │   ├── azure-verified-modules-bicep.chatmode.md
│   │   └── playwright-tester.chatmode.md
│   ├── instructions/           # Language-specific coding standards
│   │   ├── azure.instructions.md
│   │   ├── azure-functions.instructions.md
│   │   ├── bicep-avm.instructions.md
│   │   ├── csharp-dotnet.instructions.md
│   │   ├── nodejs.instructions.md
│   │   ├── playwright.instructions.md
│   │   ├── python.instructions.md
│   │   └── vuejs.instructions.md
│   └── prompts/                # AI-powered workflow prompts
│       ├── az-cost-optimize.prompt.md
│       ├── azure-resource-health-diagnose.prompt.md
│       ├── playwright-explore-website.prompt.md
│       └── playwright-generate-test.prompt.md
├── .gitignore                  # Python, Node.js, and azd exclusions
└── README.md                   # This file
```

## Customization

### Adding New Languages or Frameworks
1. Add relevant VS Code extensions to `.devcontainer/devcontainer.json`
2. Install language tools in the dev container features
3. Create instruction files in `.github/instructions/` following the existing patterns
4. Update `.gitignore` for language-specific artifacts

### Creating Custom Chat Modes
1. Create a new `.chatmode.md` file in `.github/chatmodes/`
2. Define the mode description, tools, and responsibilities
3. Follow the existing structure for consistency

### Adding Custom Prompts
1. Create a new `.prompt.md` file in `.github/prompts/`
2. Specify mode (agent/assistant), description, and workflow steps
3. Document prerequisites and success criteria

## Best Practices

- **Keep responses concise**: The template emphasizes brief, actionable guidance
- **Use type safety**: Enable TypeScript, type hints, and strict typing across all languages
- **Follow framework conventions**: Leverage modern patterns (async/await, Composition API, Azure Verified Modules)
- **Test thoroughly**: Include unit tests and E2E tests for critical functionality
- **Optimize for Azure**: Use managed identities, Azure Verified Modules, and Well-Architected Framework principles

## Contributing

This template is designed to be forked and customized for your specific needs. Key customization points:
- Dev container configuration (`.devcontainer/`)
- Copilot instructions and chat modes (`.github/`)
- Project-specific tooling and dependencies

## License

This is a template repository intended for use as a starting point for Azure applications.

## Resources

- [Azure Well-Architected Framework](https://learn.microsoft.com/azure/well-architected/)
- [Azure Verified Modules](https://azure.github.io/Azure-Verified-Modules/)
- [GitHub Copilot Documentation](https://docs.github.com/copilot)
- [Dev Containers Documentation](https://containers.dev/)
- [Azure Developer CLI (azd)](https://learn.microsoft.com/azure/developer/azure-developer-cli/)