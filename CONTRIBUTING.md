# Contributing to FinOpsIQ

Thank you for your interest in contributing! This document covers our development workflow.

## Development Setup

```bash
git clone https://github.com/21leahcimhtiek-oss/finopsiq
cd finopsiq
npm install
cp .env.example .env.local
# Fill in credentials
npm run dev
```

## Code Standards

- **TypeScript**: strict mode, no `any` types
- **Formatting**: Prettier (run `npx prettier --write .`)
- **Linting**: ESLint with Next.js config (`npm run lint`)
- **Testing**: Jest for unit, Playwright for E2E. PRs require tests for new features.

## Branch Strategy

- `main` — production, protected, CI required
- `develop` — integration branch
- `feat/your-feature` — feature branches, branch from `develop`
- `fix/issue-number` — bug fix branches

## Pull Request Process

1. Branch from `develop`
2. Write tests for your changes
3. Run `npm run typecheck && npm test && npm run lint`
4. Open PR against `develop` with a clear description
5. One approval required from a maintainer
6. Squash merge preferred

## Reporting Issues

Use GitHub Issues with the appropriate template:
- **Bug report**: include steps to reproduce, expected vs actual behavior
- **Feature request**: describe the use case and proposed solution

## Security Vulnerabilities

Do NOT open a public issue. Email security@finopsiq.io with details.
We aim to acknowledge within 24 hours and patch within 7 days.

## Code of Conduct

Be respectful, constructive, and collaborative. We follow the Contributor Covenant.