---
mode: 'agent'
description: 'Analyze Azure resource health, diagnose issues from logs and telemetry, and create a remediation plan for identified problems.'
---

# Azure Resource Health & Issue Diagnosis

This workflow analyzes a specific Azure resource to assess its health status, diagnose potential issues using logs and telemetry data, and develop a comprehensive remediation plan for any problems discovered.

## Prerequisites

- Azure MCP server configured and authenticated
- Target Azure resource identified (name and optionally resource group/subscription)
- Resource must be deployed and running to generate logs/telemetry
- Prefer Azure MCP tools (`azmcp-*`) over direct Azure CLI when available

## Key Steps

1. **Get Azure Best Practices** - Load diagnostic and troubleshooting best practices
2. **Resource Discovery** - Locate and identify the target Azure resource
3. **Health Status Assessment** - Evaluate current resource health and availability
4. **Log & Telemetry Analysis** - Analyze logs and telemetry to identify issues
5. **Root Cause Analysis** - Categorize issues and determine root causes
6. **Generate Remediation Plan** - Create comprehensive plan with immediate and long-term actions
7. **User Confirmation & Report** - Present findings and get approval for actions

## Success Criteria

- ✅ Resource health status accurately assessed
- ✅ All significant issues identified and categorized
- ✅ Root cause analysis completed for major problems
- ✅ Actionable remediation plan with specific steps provided
- ✅ Monitoring and prevention recommendations included
