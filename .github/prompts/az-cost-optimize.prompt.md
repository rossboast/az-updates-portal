---
mode: 'agent'
description: 'Analyze Azure resources used in the app (IaC files and/or resources in a target rg) and optimize costs - creating GitHub issues for identified optimizations.'
---

# Azure Cost Optimize

This workflow analyzes Infrastructure-as-Code (IaC) files and Azure resources to generate cost optimization recommendations. It creates individual GitHub issues for each optimization opportunity plus one EPIC issue to coordinate implementation, enabling efficient tracking and execution of cost savings initiatives.

## Prerequisites

- Azure MCP server configured and authenticated
- GitHub MCP server configured and authenticated  
- Target GitHub repository identified
- Azure resources deployed (IaC files optional but helpful)
- Prefer Azure MCP tools (`azmcp-*`) over direct Azure CLI when available

## Key Steps

1. **Get Azure Best Practices** - Retrieve cost optimization best practices
2. **Discover Azure Infrastructure** - Dynamically discover resources and configurations
3. **Collect Usage Metrics & Validate Costs** - Gather utilization data and verify actual costs
4. **Generate Cost Optimization Recommendations** - Analyze and identify optimization opportunities
5. **User Confirmation** - Present summary and get approval
6. **Create Individual Issues** - Create separate GitHub issues for each optimization
7. **Create EPIC Issue** - Create master issue to track all work

## Success Criteria

- ✅ All cost estimates verified against actual resource configurations and Azure pricing
- ✅ Individual issues created for each optimization (trackable and assignable)
- ✅ EPIC issue provides comprehensive coordination and tracking
- ✅ All recommendations include specific, executable Azure CLI commands
- ✅ Priority scoring enables ROI-focused implementation
