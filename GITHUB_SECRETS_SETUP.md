# GitHub Secrets Setup Guide

This document explains how to set up the required GitHub secrets for the automated agent workflows.

## Required Secrets

### 1. CLAUDE_CODE_OAUTH_TOKEN (or CLAUDE_API_KEY)

**Used by**: Code Review GitHub Action (`.github/workflows/code-review.yml`)

**Purpose**: Authenticates Claude Code to perform automated code reviews on pull requests.

**How to obtain**:
- **Option A: OAuth Token (Recommended)**
  1. Visit [Claude Code OAuth Settings](https://claude.ai/settings/oauth)
  2. Generate a new OAuth token
  3. Copy the token value

- **Option B: API Key**
  1. Visit [Anthropic Console](https://console.anthropic.com/)
  2. Navigate to API Keys section
  3. Create a new API key
  4. Copy the key value

**How to add to GitHub**:
1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `CLAUDE_CODE_OAUTH_TOKEN` (or `CLAUDE_API_KEY`)
5. Value: Paste the token/key you copied
6. Click **Add secret**

---

### 2. ANTHROPIC_API_KEY

**Used by**: Security Review GitHub Action (`.github/workflows/security-review.yml`)

**Purpose**: Authenticates Claude API to perform automated security vulnerability scanning on pull requests.

**How to obtain**:
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Navigate to **API Keys** section
3. Create a new API key
4. Copy the key value (it starts with `sk-ant-`)

**How to add to GitHub**:
1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `ANTHROPIC_API_KEY`
5. Value: Paste the API key you copied
6. Click **Add secret**

---

## Verification

After adding the secrets, you can verify they're set up correctly:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. You should see both secrets listed (values are hidden)
3. The next pull request will trigger the workflows automatically

## Workflow Configuration

The workflows are configured in:
- **Code Review**: `.github/workflows/code-review.yml`
- **Security Review**: `.github/workflows/security-review.yml`
- **CI**: `.github/workflows/ci.yml` (already working)

## Testing the Agents

### Test Code Review Agent
1. Create a new branch: `git checkout -b test-code-review`
2. Make some code changes
3. Push to GitHub: `git push origin test-code-review`
4. Open a pull request
5. The code review agent will automatically comment on your PR

### Test Security Review Agent
1. The security review runs on the same PR as code review
2. It will add a comment with security findings (if any)

### Test Slash Commands Locally
1. In Claude Code CLI, type `/review` to trigger code review
2. Type `/design-review` to trigger design review
3. Type `/security-review` to trigger security review

## Cost Considerations

- Code reviews use **Claude Opus 4.1** model
- Security reviews use **Claude Opus 4.1** model
- Each PR review costs approximately $0.50-$2.00 depending on PR size
- Monitor your usage in [Anthropic Console](https://console.anthropic.com/)

## Troubleshooting

### "Secret not found" error
- Verify the secret name matches exactly (case-sensitive)
- Re-add the secret if needed

### "Authentication failed" error
- Verify the API key/token is valid
- Check if the key has expired
- Generate a new key if needed

### Workflow not triggering
- Check that workflows are enabled in **Settings** → **Actions**
- Verify the workflow YAML files are in `.github/workflows/`
- Check the workflow run logs in **Actions** tab

## Security Best Practices

1. **Never commit secrets** to your repository
2. **Rotate keys regularly** (every 90 days recommended)
3. **Use OAuth tokens** when possible (more secure than API keys)
4. **Monitor API usage** to detect unauthorized access
5. **Revoke keys immediately** if compromised

## Additional Resources

- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Claude Code Documentation](https://docs.claude.com/claude-code)
- [GitHub Actions Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
