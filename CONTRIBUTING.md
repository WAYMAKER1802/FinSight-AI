# Contributing to FinSight AI 🤝

Thank you for your interest in contributing! We welcome all forms of contributions.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/your-username/finsight-ai.git`
3. **Create a branch**: `git checkout -b feature/your-feature-name`
4. **Make your changes** following our guidelines
5. **Test** your changes thoroughly
6. **Commit** with conventional commits: `git commit -m "feat: add portfolio export"`
7. **Push** to your fork: `git push origin feature/your-feature-name`
8. **Open a PR** against the `develop` branch

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: new feature
fix: bug fix
docs: documentation changes
style: formatting, no code change
refactor: code restructuring
test: adding tests
chore: maintenance tasks
perf: performance improvements
```

## Code Standards

### Backend (Node.js)
- ESLint + Prettier formatting
- Meaningful variable names (no single letters except loop indices)
- JSDoc comments for all exported functions
- `async/await` over callbacks
- All routes must have input validation middleware

### Frontend (React + TypeScript)
- Strict TypeScript — no `any` types
- Functional components only
- Custom hooks for business logic
- Component props must be typed with interfaces
- CSS via Tailwind — no inline styles except dynamic values

## Pull Request Checklist

- [ ] Tests pass (`npm test`)
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] Added tests for new features
- [ ] Updated documentation if needed
- [ ] Followed the commit convention
- [ ] PR description explains the **why**, not just the **what**

## Reporting Issues

Use GitHub Issues with the appropriate label:
- `bug` — Something isn't working
- `enhancement` — Feature request
- `documentation` — Docs improvement
- `question` — General question

## Code of Conduct

Be respectful, inclusive, and collaborative. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).
