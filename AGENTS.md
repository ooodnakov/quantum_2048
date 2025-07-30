# Project Overview
Quantum 2048 is a JavaScript implementation of the classic 2048 puzzle with experimental twists such as phase shift blocks and portal tiles. The project is primarily written in vanilla JS with Jest for unit tests. Main directories include the game source files, static assets, and test suites.

# Project Structure
- `app.js` – core game logic and exported helpers
- `index.html` – simple page to load the game
- `style.css` – layout and visual styling
- `tests/` – Jest unit tests covering game logic and UI helpers
- `eslint.config.mjs` – ESLint configuration

# Code Style & Conventions
- Language: JavaScript (ESM/CommonJS)
- Linting: `eslint` with rules defined in `eslint.config.mjs`
- Use camelCase for variables/functions and PascalCase for classes
- Include JSDoc style comments for complex functions

# Build & Test Commands
- **Install deps:** `npm install`
- **Lint:** `npm run lint`
- **Test:** `npm test`
- **Coverage:** `npm test -- --coverage`

# PR / Git Guidelines
- PR titles follow `[Feat]: <summary>` or `[Fix]: <summary>` format
- Provide a concise summary and mention important test notes in the description

# Testing Protocol
- Run Jest via `npm test`
- Use Jest's mocking utilities; avoid real network requests
- Keep coverage above 80%

# Sandbox / Security Notes
Codex runs in an isolated environment. Internet access may be restricted, so tests must not rely on external resources.

# Hierarchy / Overrides
Nested `AGENTS.md` files override instructions from parent directories.

# Programmatic Checks
Always run `npm run lint` and `npm test` before committing.

# Miscellaneous
- The game uses minimal HTML/CSS without frameworks
- Do not log secrets or persist credentials

# Example
```
# Project Overview
Summary of the project...
# Project Structure
- src/
- tests/
...
```
