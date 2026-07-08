# Developer Guide

Welcome to the FinSight AI engineering team! This guide explains our development standards and workflow.

## 1. Code Formatting & Linting
*   We use ESLint to enforce code quality.
*   Run `npm run lint` before committing any code to the backend.
*   Ensure your IDE is configured to run Prettier on save for consistent spacing and styling.

## 2. Git Workflow
We follow standard GitHub Flow:
1. Create a feature branch from `main`: `git checkout -b feature/your-feature-name` or `bugfix/issue-description`.
2. Commit your changes with descriptive messages.
3. Push the branch and open a Pull Request (PR) against `main`.
4. Wait for CI checks (Jest & ESLint) to pass and secure at least one code review approval before merging.

## 3. Project Structure Constraints
*   **Frontend**: Do not bypass the `api/` layer. Direct Axios calls inside React components are prohibited. Always use Zustand for global state.
*   **Backend**: Do not put business logic inside routes. Follow the `Route -> Controller -> Service` data flow. Reusable helper functions belong in `helpers/` or `utils/`.

## 4. Handling Environment Variables
Never commit `.env` files or hardcode secrets in the codebase.
*   If you add a new environment variable, document it in `Installation_Guide.md` and add it to the `.env.example` file (if present).

## 5. Adding New AI Prompts
When extending the AI Advisor's capabilities, add your prompt templates to a dedicated constant file in the backend rather than inline strings in the service layer. This keeps prompts easily auditable and tweakable.
