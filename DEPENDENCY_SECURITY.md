# Dependency Security Report

**Last Updated:** January 8, 2026  
**Status:** Active Monitoring

## Executive Summary

All **high** and **critical** severity vulnerabilities have been resolved. Remaining **moderate** severity vulnerabilities are in development dependencies only and do not affect production security.

## Current Vulnerability Status

### API Dependencies (`/api`)

| Package | Severity | Status | Impact | Notes |
|---------|----------|--------|--------|-------|
| jws | HIGH | ✅ FIXED | Auth bypass | Updated to 3.2.3+ |
| esbuild | MODERATE | ⚠️ DEV ONLY | Dev server exposure | Not deployed to production |
| vite | MODERATE | ⚠️ DEV ONLY | File system bypass (Windows) | Not deployed to production |

**Total Vulnerabilities:**
- Critical: 0
- High: 0 (1 fixed)
- Moderate: 4 (development only)
- Low: 0

### Web Dependencies (`/web`)

| Package | Severity | Status | Impact | Notes |
|---------|----------|--------|--------|-------|
| esbuild | MODERATE | ⚠️ DEV ONLY | Dev server exposure | Not deployed to production |
| vite | MODERATE | ⚠️ DEV ONLY | File system bypass (Windows) | Not deployed to production |

**Total Vulnerabilities:**
- Critical: 0
- High: 0
- Moderate: 2 (development only)
- Low: 0

## Fixed Vulnerabilities

### 1. jws - HMAC Signature Bypass (HIGH) ✅

**CVE:** GHSA-869p-cjfg-cm3x  
**CVSS Score:** 7.5  
**Fixed Version:** 3.2.3  
**Fix Date:** January 8, 2026

**Description:**  
The `jws` package (used by `jsonwebtoken` which is a transitive dependency of `@azure/identity`) had a vulnerability where HMAC signatures could be improperly verified, potentially allowing authentication bypass.

**Remediation:**  
Fixed automatically via `npm audit fix`. The package was updated to version 3.2.3 which properly validates HMAC signatures.

**Production Impact:** None (was a transitive dev dependency)

## Remaining Vulnerabilities (Development Only)

### 1. esbuild - Development Server Exposure (MODERATE) ⚠️

**CVE:** GHSA-67mh-4wv8-2f99  
**CVSS Score:** 5.3  
**Affected Version:** <=0.24.2  
**Status:** Monitoring

**Description:**  
During local development, the esbuild development server could allow unauthorized websites to send requests and read responses.

**Production Impact:** **NONE**
- esbuild is a development dependency only
- Not included in production builds
- Only affects local development environments
- Azure Functions and App Service do not use esbuild

**Mitigation:**
- Only run development servers on localhost
- Do not expose development ports to the internet
- Use `npm audit fix --force` for breaking update (optional)

### 2. vite - File System Bypass (MODERATE) ⚠️

**CVE:** GHSA-93m4-6634-74q7  
**CVSS Score:** Not Rated  
**Affected Version:** 5.2.6 - 5.4.20  
**Status:** Monitoring

**Description:**  
On Windows systems, the Vite development server could allow bypassing `server.fs.deny` restrictions using backslashes.

**Production Impact:** **NONE**
- Vite is a development dependency only
- Not used in production Azure deployments
- Only affects Windows development environments
- Production builds use static files

**Mitigation:**
- Only affects Windows development
- Use `npm audit fix --force` for breaking update (optional)
- Production deployments unaffected

## Dependency Management Best Practices

### Current Practices ✅

1. **Regular Audits**: Run `npm audit` before deployments
2. **Automatic Updates**: Use `npm audit fix` for non-breaking changes
3. **Dependency Review**: New dependencies reviewed for security
4. **Minimal Dependencies**: Only essential packages included
5. **Production vs Dev**: Clear separation of dependency types

### Update Policy

| Severity | Dependency Type | Action | Timeline |
|----------|----------------|--------|----------|
| Critical | Production | Immediate patch | 24 hours |
| Critical | Development | Urgent update | 48 hours |
| High | Production | Priority patch | 7 days |
| High | Development | Regular update | 14 days |
| Moderate | Production | Scheduled update | 30 days |
| Moderate | Development | Next cycle | 90 days |
| Low | Any | Routine maintenance | Next release |

## Running Security Audits

### Check for Vulnerabilities

```bash
# API dependencies
cd api && npm audit

# Web dependencies  
cd web && npm audit

# Generate JSON report
npm audit --json > audit-report.json
```

### Fix Vulnerabilities

```bash
# Non-breaking fixes (safe)
npm audit fix

# Breaking fixes (requires testing)
npm audit fix --force

# Dry run to preview changes
npm audit fix --dry-run
```

### Production Dependency Check

```bash
# Check only production dependencies
npm audit --production

# Verify no critical/high in production
npm audit --production --audit-level=high
```

## CI/CD Integration

### Recommended GitHub Actions

```yaml
name: Security Audit
on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: API Audit
        run: |
          cd api
          npm audit --production --audit-level=high
          
      - name: Web Audit
        run: |
          cd web
          npm audit --production --audit-level=high
```

## Vulnerability Tracking

### Fixed Issues History

| Date | Package | Severity | Version | Action |
|------|---------|----------|---------|--------|
| 2026-01-08 | jws | HIGH | 3.2.3 | Updated via npm audit fix |

### Accepted Risks

| Package | Severity | Reason | Review Date |
|---------|----------|--------|-------------|
| esbuild | MODERATE | Dev dependency only | 2026-01-08 |
| vite | MODERATE | Dev dependency only | 2026-01-08 |

## Security Contact

For security concerns regarding dependencies:
- Create a private security advisory on GitHub
- Email: [security contact]
- Include: Package name, version, CVE/GHSA ID

## Related Documentation

- [SECURITY.md](./SECURITY.md) - General security policy
- [SECURITY_REVIEW.md](./SECURITY_REVIEW.md) - Comprehensive security audit
- [npm audit documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [GitHub Advisory Database](https://github.com/advisories)

## Automated Monitoring

**Tools in Use:**
- npm audit (built-in)
- GitHub Dependabot (enabled)
- Azure Security Center (production)

**Update Schedule:**
- Weekly: Automated dependency checks
- Monthly: Manual security review
- Quarterly: Comprehensive audit
- Annually: Third-party security assessment

---

**Next Review:** February 8, 2026  
**Review Frequency:** Monthly or after any critical advisory
