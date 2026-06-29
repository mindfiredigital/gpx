# CONTRIBUTING

Thank you for your interest in contributing to gpx! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Release Process](#release-process)

## Code of Conduct

All contributors are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites

- **bun**: v1.3.12 or newer
- **Git**: v2.30 or newer

### Local Setup

1. Fork the repository on GitHub
2. Clone your fork locally:

   ```bash
   git clone https://github.com/mindfire-test/gpx.git
   cd gpx
   ```

3. Add the upstream repository:

   ```bash
   git remote add upstream https://github.com/mindfire-test/gpx.git
   ```

4. Install dependencies:

   ```bash
   bun install
   ```

5. Build all packages:

   ```bash
   bun run build
   ```

6. Run tests:
   ```bash
   bun run test
   ```

## Development Workflow

### Create a Feature Branch

```bash
# Fetch latest from upstream
git fetch upstream

# Create a feature branch from dev
git checkout upstream/dev -b feature/your-feature-name
```

### Branch Naming Convention

Use one of these prefixes for your branch name:

- `feature/` - New features
- `fix/` - Bug fixes
- `chore/` - Maintenance tasks
- `refactor/` - Code improvements
- `docs/` - Documentation updates
- `test/` - Test improvements
- `ci/` - CI/CD related changes
- `release/` - Release branches (version number)
- `hotfix/` - Critical production fixes

**Examples:**

- `feature/add-profile-export`
- `fix/ssh-config`
- `docs/update-readme`

### Make Changes

1. Work on your feature/fix in the relevant files `src/`
2. Run linting and formatting:

   ```bash
   bun run lint
   bun run format
   ```

3. Run tests:

   ```bash
   bun run test
   ```

4. Rebuild all packages:
   ```bash
   bun run build
   ```

## Commit Guidelines

We follow **Conventional Commits** format. Each commit message consists of a **header**, **body**, and **footer**.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

Must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect code logic (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring without feature changes
- **perf**: Code changes that improve performance
- **test**: Adding or updating tests
- **build**: Changes to build system or dependencies
- **ci**: Changes to CI/CD configuration
- **chore**: Other changes that don't modify src or test files

### Subject

- Use the **imperative mood** ("add feature" not "added feature")
- Do not capitalize the first letter
- Do not add a period (.) at the end
- Limit to 50 characters
- Use lowercase

### Body (Optional)

- Explain _what_ and _why_, not _how_
- Wrap at 72 characters
- Separate from subject with a blank line
- Use bullet points for multiple changes

### Footer (Optional)

- Reference related issues: `Closes #123`, `Fixes #456`
- Note breaking changes: `BREAKING CHANGE: description`

### Example

```
feat(add-profile-export): add support for profile export

Add export logic for existing profiles.
Implements validation to check if the config for profiles exists.

Closes #21
```

## Testing

### Running Tests

```bash
# Run all tests once
bun run test

# Run with coverage
bun run test:coverage

# Run tests in watch mode (for development)
bun run test -- --watch
```

### Writing Tests

- Collocate test files with source code: `src/cli.ts` → `__tests__/cli.test.ts`
- Use descriptive test names
- Follow the **Arrange-Act-Assert** pattern
- Mock external dependencies
- Aim for >80% code coverage

## Documentation

- Update `README.md` files in affected packages
- Update root `README.md` if scope changes
- Include examples in documentation

## Pull Request Process

1. **Before creating a PR:**
   - Ensure your branch is up-to-date with `upstream/dev`
   - Verify all tests pass locally
   - Run linting and formatting

2. **Create a PR:**
   - Use a descriptive title following commit conventions
   - Fill out the PR template completely
   - Reference related issues

3. **PR Review:**
   - Address review comments promptly
   - Don't force-push without discussion
   - Keep commits organized (use `git rebase` if needed)

4. **Merging:**
   - Requires approval from at least one maintainer
   - CI must pass
   - All conversations must be resolved

## Code Style

### TypeScript

- Use `.ts` or `.tsx` for all source files
- Strict mode enabled (`"strict": true` in tsconfig.json)
- Use semantic variable/function names
- Prefer `const` over `let`, avoid `var`

### Formatting

Use Prettier (auto-formatted on save):

```bash
bun run format     # Format all files
bun run format:check  # Check formatting
```

### Linting

Use ESLint to catch issues:

```bash
bun run lint       # Check linting
bun run lint:fix   # Auto-fix linting issues
```

## Release Process

- The CI pipeline uses **Automated Semantic Versioning**. 
- Maintainers DO NOT need to manually run changeset or release scripts! 
- Releases are automatically calculated and triggered purely based on commit messages.

### How to Trigger a Release
When merging Pull Requests into `main`, ensure the commit message follows these strict prefixes:

- `fix: <message>` → **Patch Release** (v1.0.0 → v1.0.1) - *For bug fixes*
- `feat: <message>` → **Minor Release** (v1.0.0 → v1.1.0) - *For new features*
- `feat!: <message>` or `fix!: <message>` → **Major Release** (v1.0.0 → v2.0.0) - *For breaking changes*

### The Final Approval
1. When a `feat` or `fix` is merged to `main`, the CI automatically opens a **"Version Packages"** Pull Request.
2. A maintainer simply **Approves and Merges** that PR.
3. The GitHub Action automatically bumps the package version, generates the Release Notes, and publishes to npm!

## Getting Help

- **Bug Reports?** Open a [Bug Report Issue](https://github.com/mindfire-test/gpx/issues/new?template=bug_report.md)
- **Features?** Open a [Feature Request Issue](https://github.com/mindfire-test/gpx/issues/new?template=feature_request.md)

## Recognition

Thanks for contributing! Your efforts help make gpx better for everyone.

---

**Happy coding! 🎉**