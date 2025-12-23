# 🔐 Security Policy for @bizai Packages

## 📋 Overview

This document outlines the **package-specific** security policies, procedures, and best practices for all packages under the `@bizai` npm organization. All packages are published as **private to the organization** by default, managed through npm's organization features.

> **Note**: This policy supplements but does not replace the comprehensive organizational security policy. It focuses specifically on **npm package development, publishing, and maintenance**.

---

## 🛡️ Package Security Standards

### 🔐 Authentication & Authorization
- **Two-Factor Authentication (2FA)**: Mandatory for all npm accounts with publish permissions to `@bizai` scope
- **Granular Access Tokens**: CI/CD uses scoped tokens with minimal required permissions
- **Token Policies**:
  - Maximum lifespan: 90 days for write tokens
  - IP range restrictions for production tokens
  - Automatic revocation after use in compromised environments
- **Session Management**: npm login sessions expire after 2 hours, requiring reauthentication

### 📦 Package Development Security
- **Dependency Scanning**: All packages must pass `npm audit` before publishing
- **License Compliance**: Regular checks using `npm license-checker`
- **Secret Detection**: Pre-commit hooks to detect accidental secret commits
- **Build Artifact Verification**: SHA checksums for all published packages

---

## 🚨 Reporting Security Issues in @bizai Packages

### Contact Points
1. **Primary**: npm Organization Security Settings → Report Vulnerability
2. **Secondary**: Repository Issues with `[SECURITY]` label
3. **Emergency**: security@bizai.factory (for critical vulnerabilities)

### What to Report
- **Critical**: Exposed API keys or secrets in published package code
- **High**: Known vulnerable dependencies in package `package.json`
- **Medium**: Insecure configuration patterns in package distribution
- **Low**: Deprecated API usage or weak cryptographic implementations

### Response Timeline
| Severity | Initial Response | Patch Release |
|----------|-----------------|---------------|
| Critical | < 2 hours | < 24 hours |
| High | < 8 hours | < 72 hours |
| Medium | < 48 hours | Next scheduled release |
| Low | < 1 week | Next major/minor release |

---

## 🔄 Security Update Process for Packages

### For Published Packages
```bash
# Standard security update workflow
1. npm audit --audit-level=high           # Identify vulnerabilities
2. npm update <vulnerable-package>        # Update if safe
3. npm run build                          # Rebuild package
4. npm test                              # Verify functionality
5. npm version patch                     # Increment version
6. npm publish                           # Publish secure version
7. npm deprecate <old-version> "Security update" # Mark old version
```

Pre-publish Security Checklist

· npm audit returns no critical/high vulnerabilities
· .npmignore excludes all sensitive files (.env, config/, secrets/)
· No hardcoded secrets in src/ or dist/ directories
· Dependencies are pinned with exact versions or using lockfiles
· Package signature verification enabled (if applicable)

---

📊 Package-Specific Security Controls

@bizai/shared

Risk Level: Low
Sensitive Content: None
Publishing Requirements:

· No runtime secrets
· Only TypeScript types/utilities
· Can be published as "access": "public" if needed
· No external API dependencies with secrets

@bizai/database

Risk Level: Medium
Sensitive Content: Schema definitions, migration patterns
Controls:

· Database connection strings MUST be environment variables only
· Example configurations must use placeholder values (<your-db-host>)
· Migration scripts should not contain production data samples
· SQL injection prevention documentation required in README

@bizai/ai-core

Risk Level: High
Sensitive Content: AI provider patterns, model configurations
Critical Controls:

· NO API KEYS in source code or configuration files
· Provider configuration via dependency injection only
· Environment variable validation at initialization
· Rate limiting and usage quota enforcement
· Audit logging for all AI model invocations

---

🛠️ Development Security Requirements

Secure Development Checklist

```typescript
// Example: Secure configuration pattern for @bizai/ai-core
export class AIConfig {
  private readonly apiKey: string;
  
  constructor() {
    // Environment variables ONLY
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    
    if (!this.apiKey) {
      throw new Error('API key must be set via HUGGINGFACE_API_KEY env var');
    }
  }
}
```

Pre-commit Security Hooks

```json
{
  "scripts": {
    "security:scan": "npm audit && npx @npmcli/arborist audit",
    "security:secrets": "npx detect-secrets-hook --baseline .secrets.baseline",
    "security:licenses": "npx license-checker --summary",
    "precommit": "npm run security:scan && npm run security:secrets"
  }
}
```

.npmignore Requirements (Per Package)
```npmignore
# ملف .npmignore بسيط وفعّال

# 1. ملفات النظام والبيئة
.DS_Store
Thumbs.db
*.log
.env*
.env.local

# 2. مجلدات البناء
.next/
dist/
build/
out/
node_modules/

# 3. ملفات التطوير
.vscode/
.idea/
.turbo/
.vercel/

# 4. الاختبارات
**/*.test.*
**/*.spec.*
__tests__/
coverage/

# 5. ملفات Git
.git/

# 6. ملفات الوسائط الكبيرة
*.mp4
*.mov
*.zip

# ⭐ الملفات المهمة (ستبقى تلقائياً):
# - package.json
# - README.md
# - LICENSE
# - app/
# - components/
# - lib/
# - public/
# - next.config.js
# - tsconfig.json
```
Every @bizai package MUST exclude:

```gitignore
# REQUIRED exclusions
.env*
*.config.js
*.config.ts
secrets/
credentials/
tests/__fixtures__/
src/*.secret.*

# RECOMMENDED exclusions
src/                    # If publishing compiled code only
coverage/
*.log
```

---

🚀 Incident Response for Package Security

Suspected Token Compromise

1. Immediate Action: Revoke token via npm token delete <token-id>
2. Investigation: Review npm audit logs for unauthorized publishes
3. Containment: Deprecate any potentially compromised package versions
4. Recovery: Issue new tokens with tighter restrictions

Unauthorized Package Publication

```bash
# Emergency response commands
npm deprecate @bizai/shared@1.0.0 "SECURITY: This version may be compromised"
npm owner remove <compromised-account> @bizai/shared
npm access revoke <team-name> @bizai/shared
```

Data Exposure in Published Package

1. Assessment: Determine exposure scope and sensitivity
2. Notification: Alert npm security team via official channels
3. Remediation: Unpublish affected versions (contact npm support if needed)
4. Prevention: Update .npmignore and pre-publish checks

---

📈 Monitoring & Compliance for @bizai Packages

Active Monitoring

Metric Tool Frequency Alert Threshold
Dependency vulnerabilities npm audit Daily Any critical vulnerability
License compliance license-checker Weekly GPL/AGPL dependencies
Secret exposure detect-secrets Pre-commit Any new secret
Package downloads npm analytics Monthly Unusual download patterns

Compliance Requirements

· Monthly: Review all active tokens and permissions
· Quarterly: Full security audit of all package code
· Bi-annually: Third-party security assessment
· Annually: Policy review and update

Access Review Schedule

```yaml
access_reviews:
  team_permissions: monthly
  token_validity: weekly
  publish_logs: daily
  dependency_access: quarterly
```

---

🔗 npm-Specific Security Resources

npm Organization Security Features

· Organization 2FA Enforcement: Mandatory for all members
· Package Access Controls: Team-based permissions
· Audit Logs: All publish and access events
· Token Management: Granular control via CLI and UI
· WebAuthn Support: For phishing-resistant authentication

Useful npm Commands

```bash
# Security-focused npm commands
npm audit                          # Check for vulnerabilities
npm audit fix                      # Attempt to fix vulnerabilities
npm token list                     # List all active tokens
npm access ls-packages @bizai      # List packages in organization
npm owner ls @bizai/shared         # List package owners
npm deprecate <pkg> "<message>"    # Mark package version as deprecated
```

Integration with GitHub Security

```yaml
# Example GitHub Actions security workflow
name: Security Scan
on: [push, pull_request]
jobs:
  npm-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm audit --audit-level=high
```

---

📞 Emergency Contacts & Escalation

Primary Contacts

· npm Organization Owners: Via npm dashboard → Organization Settings
· Security Lead: Designated in npm organization as "Security Manager"
· GitHub Repository Admins: For source code security issues

Escalation Path

1. Level 1: Package maintainer (immediate response expected)
2. Level 2: npm Organization owners (if no response in 2 hours)
3. Level 3: Corporate security team (for critical incidents)
4. Level 4: npm Security Team via official report form

Communication Channels

· Non-urgent: GitHub Issues with [SECURITY] label
· Urgent: security@bizai.factory
· Critical: npm security report form + emergency phone tree

---

📄 Policy Management

Version Control

· Current Version: 2.0 (npm Package Focus)
· Effective Date: December 2024
· Next Review: June 2025
· Previous Version: 1.0 (General Organizational Policy)

Change Log

Version Date Changes
2.0 Dec 2024 npm package-specific focus, added token management, publishing controls
1.0 Nov 2024 Initial comprehensive security policy

Approval & Distribution

· Approved By: npm Organization Owners
· Distribution: All @bizai package maintainers and contributors
· Acknowledgement Required: Yes, for all organization members with publish rights

---

🎯 Quick Reference - Security Musts

✅ DO

· Use npm audit before every publish
· Enable 2FA on your npm account
· Use granular tokens for CI/CD
· Review .npmignore before publishing
· Report vulnerabilities immediately

❌ DON'T

· Commit secrets or API keys
· Use * for dependency versions
· Share npm tokens in code or logs
· Ignore npm audit warnings
· Delay security patch releases

---

Last Updated: December 2025
Applicable To: All packages under @bizai scope
Review Cycle: Semi-annual
Compliance: Mandatory for all publish operations

```
