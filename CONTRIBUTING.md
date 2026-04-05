# Contributing to FinOpsIQ

We welcome contributions! Please read this guide before submitting a pull request.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/finopsiq.git`
3. Install dependencies: `npm install`
4. Copy env file: `cp .env.example .env.local` and fill in credentials
5. Start dev server: `npm run dev`

## Development Workflow

1. Create a feature branch: `git checkout -b feat/your-feature-name`
2. Make your changes
3. Run tests: `npm test`
4. Run type check: `npm run type-check`
5. Run linter: `npm run lint`
6. Commit with a meaningful message following [Conventional Commits](https://www.conventionalcommits.org/)
7. Push and open a Pull Request

## Code Standards

- **TypeScript** — All new code must be TypeScript with strict mode enabled
- **Components** — React functional components with explicit prop types
- **API Routes** — Validate all inputs with Zod, use proper HTTP status codes
- **Error Handling** — Use try/catch in API routes, report errors to Sentry
- **Testing** — Unit tests required for lib utilities and API routes
- **Styling** — Use Tailwind utility classes, avoid inline styles

## Testing Requirements

- All new API routes must have corresponding Jest tests
- UI components should have basic render tests
- E2E tests for critical user flows (login, account connect, waste scan)
- Minimum 70% code coverage for new files

## PR Process

1. PRs must pass all CI checks (type-check, lint, test, build)
2. At least one maintainer approval required
3. Squash and merge preferred
4. Update CHANGELOG.md with your changes

## Commit Message Format

```
type(scope): description

feat(waste): add confidence score to AI findings
fix(api): handle missing cloud credentials gracefully
docs(api): update endpoint documentation
```

## Questions?

Open an issue or start a GitHub Discussion.