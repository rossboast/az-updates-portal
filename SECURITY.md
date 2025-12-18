# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in the Azure Updates Portal, please report it by:

1. **DO NOT** create a public GitHub issue
2. Email the maintainers with details
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested remediation (if any)

We will respond within 48 hours and work with you to address the issue.

## Security Features

### Authentication & Authorization

- **Managed Identity**: Azure Functions authenticate to CosmosDB using system-assigned managed identity
- **No Credentials in Code**: Zero hardcoded secrets, API keys, or connection strings
- **Role-Based Access Control**: Fine-grained permissions using Azure RBAC
- **Public API**: Endpoints are intentionally public for aggregating publicly available Azure updates

### Data Protection

#### In Transit
- **HTTPS Only**: All traffic enforced via TLS 1.2+
- **Strict Transport Security**: HSTS headers configured in production
- **Certificate Management**: Automated via Azure App Service

#### At Rest
- **Azure Storage**: Encrypted at rest by default
- **CosmosDB**: Encrypted at rest with Microsoft-managed keys
- **No Sensitive Data**: Application stores only public Azure update information

### Network Security

- **CORS Configuration**: Restricted origins (no wildcard in production)
- **Network Isolation**: CosmosDB allows Azure services bypass
- **Security Headers**: 
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security: max-age=31536000`
  
### Input Validation

All user inputs are validated and sanitized:
- **Query Parameters**: Validated with bounds checking
- **Category Names**: Sanitized to prevent injection
- **Limit Values**: Capped at maximum with default fallbacks
- **SQL Injection Protection**: Parameterized queries only

### Application Security

- **XSS Prevention**: Vue.js templates use text interpolation (not innerHTML)
- **No eval()**: No dynamic code evaluation
- **Dependency Management**: Regular security updates
- **Error Handling**: Sanitized error messages (no sensitive information leakage)

## Security Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Azure Front Door                  │
│            (HTTPS, TLS 1.2+, DDoS Protection)        │
└────────────────────┬────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
┌─────────▼──────────┐  ┌───────▼────────────┐
│   App Service      │  │  Azure Functions   │
│   (Web Frontend)   │  │  (API Backend)     │
│   - HTTPS Only     │  │  - Managed Identity│
│   - Security Hdr   │  │  - Input Validation│
└────────────────────┘  └─────────┬──────────┘
                                  │
                         ┌────────▼────────┐
                         │   CosmosDB      │
                         │   - Encrypted   │
                         │   - RBAC        │
                         │   - 12mo TTL    │
                         └─────────────────┘
```

## Security Best Practices

### For Contributors

1. **Never commit secrets**: Use environment variables
2. **Validate all inputs**: Trust no user input
3. **Use parameterized queries**: Prevent SQL injection
4. **Sanitize errors**: Don't leak sensitive information
5. **Keep dependencies updated**: Run `npm audit` regularly
6. **Review OWASP Top 10**: Understand common vulnerabilities
7. **Test security changes**: Run security tests before committing

### For Deployers

1. **Use latest runtime**: Keep Azure Functions runtime current
2. **Enable monitoring**: Configure Application Insights alerts
3. **Review access logs**: Regular security audits
4. **Principle of least privilege**: Minimize permissions
5. **Network restrictions**: Use private endpoints for production
6. **Regular updates**: Apply security patches promptly

## Secure Configuration

### Required Environment Variables

```bash
# CosmosDB connection (Managed Identity)
COSMOS_ENDPOINT=https://your-cosmos.documents.azure.com:443/
COSMOS_DATABASE_NAME=AzureUpdatesDB
COSMOS_CONTAINER_NAME=Updates

# Web application URL (for CORS)
WEB_APP_URL=https://your-app.azurewebsites.net

# Monitoring
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=...
```

### Optional Security Headers

Configure in Azure App Service:
- `Content-Security-Policy`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`

## Compliance

### Standards Adherence

- ✅ OWASP Top 10 (2021) guidelines
- ✅ CWE/SANS Top 25 mitigations
- ✅ Azure Security Baseline
- ✅ HTTPS/TLS best practices
- ✅ GDPR ready (no personal data collected)

### Security Testing

Regular security assessments include:
- Static code analysis
- Dependency vulnerability scanning (`npm audit`)
- Infrastructure security review
- Manual security testing
- Penetration testing (recommended annually)

## Known Limitations

1. **Public API**: Endpoints are intentionally public (read-only access to public data)
2. **No Authentication**: Not required for aggregating public Azure updates
3. **No Rate Limiting**: Currently implemented at infrastructure level only
4. **Network Access**: CosmosDB accessible from Azure services

These limitations are acceptable given the application's purpose (aggregating public information).

## Security Update Policy

- **Critical**: Patched within 24 hours
- **High**: Patched within 7 days
- **Medium**: Patched within 30 days
- **Low**: Patched in next regular release

## Audit Log

| Date | Type | Description |
|------|------|-------------|
| 2025-12-18 | Review | Comprehensive security audit completed |
| 2025-12-18 | Fix | CORS wildcard replaced with origin validation |
| 2025-12-18 | Enhancement | Security headers added to all responses |
| 2025-12-18 | Enhancement | Input validation and sanitization implemented |
| 2025-12-18 | Enhancement | CosmosDB network restrictions configured |

## Resources

- [Azure Security Documentation](https://learn.microsoft.com/azure/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Azure Security Best Practices](https://learn.microsoft.com/azure/security/fundamentals/best-practices-and-patterns)

---

**Version**: 1.0  
**Last Updated**: December 18, 2025  
**Next Review**: March 18, 2026
