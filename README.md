# @gfmio/config-biome

Shared [Biome](https://biomejs.dev/) configuration for linting, formatting, and code quality across JavaScript, TypeScript, JSON, CSS, HTML, and GraphQL projects.

## Installation

```bash
npm install --save-dev @gfmio/config-biome @biomejs/biome
```

```bash
yarn add --dev @gfmio/config-biome @biomejs/biome
```

```bash
pnpm add --save-dev @gfmio/config-biome @biomejs/biome
```

```bash
bun add --dev @gfmio/config-biome @biomejs/biome
```

## Usage

Create a `biome.json` file in your project root:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.2/schema.json",
  "extends": ["@gfmio/config-biome/biome.json"],
  "root": true,
}
```

That's it! The shared configuration will be applied to your project.

### Extending the Configuration

You can override or extend any settings from the shared config:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.2/schema.json",
  "extends": ["@gfmio/config-biome/biome.json"],
  "root": true,
  "formatter": {
    "lineWidth": 100
  },
  "linter": {
    "rules": {
      "suspicious": {
        "noConsole": "error"
      }
    }
  }
}
```

## Configuration Highlights

This configuration provides opinionated defaults designed to catch bugs, enforce best practices, and maintain code quality while remaining flexible enough for various project types.

### Formatter Settings

- **Line width**: 120 characters
- **Indentation**: 2 spaces
- **Line endings**: LF (Unix-style)
- **JavaScript/TypeScript**:
  - Single quotes for strings
  - Double quotes for JSX attributes
  - Always use semicolons
  - Always use arrow function parentheses
  - Trailing commas everywhere (ES5+)
- **EditorConfig**: Respects `.editorconfig` files when present

### Linter Rules

**Strict enforcement** for:

- Correctness issues (undefined variables, unreachable code, etc.)
- Security vulnerabilities (eval, dangerouslySetInnerHTML)
- Common bugs (duplicate keys, self-assignment, etc.)
- Performance anti-patterns (accumulating spreads, unnecessary delete)

**Warnings** for:

- Explicit `any` types (helps migration to strict typing)
- Non-null assertions (potential runtime issues)
- All console statements (including `console.log`)
- Barrel files and re-export-all patterns (performance)

**Flexible** on:

- Default exports (project-dependent preference)
- forEach usage (common pattern despite performance considerations)
- Literal object keys (allows computed properties when needed)

### Language Support

- **JavaScript/TypeScript**: Full support with modern syntax
- **JSON**: Allows comments and trailing commas (JSONC-style)
- **CSS**: Supports CSS Modules and Tailwind directives
- **HTML**: Experimental full support for Vue/Svelte/Astro components
- **GraphQL**: Formatting and linting enabled
- **Grit**: Code transformation language support

### Smart Overrides

Context-aware rules for different file types:

- **Test files** (`**/*.test.ts`, `**/*.spec.ts`, `tests/**/*`):
  - Allows explicit `any` for test fixtures
  - Allows empty blocks for stub implementations
  - Relaxed async/await requirements

- **Config files** (`**/*.config.{ts,js,mjs,cjs}`):
  - Allows default exports (common convention)

- **Type definitions** (`**/*.d.ts`):
  - Disables unused variable checks

- **Scripts and CLI** (`scripts/**/*`, `cli/**/*`, `bin/**/*`):
  - Allows console statements

- **TSConfig/JSConfig** files:
  - Allows comments and trailing commas

### VCS Integration

- Git integration enabled by default
- Respects `.gitignore` patterns
- Supports `--changed` and `--since` CLI flags for incremental checking

### Excluded Directories

The following directories are force-ignored (completely excluded from all operations):

- `node_modules`
- `dist`, `build`, `out`
- `.next` (Next.js)
- `coverage` (test coverage reports)
- `.turbo` (Turborepo cache)
- Minified files (`*.min.js`, `*.min.css`)

## Common Commands

```bash
# Check all files (lint + format)
npx @biomejs/biome check .

# Check and auto-fix issues
npx @biomejs/biome check --write .

# Format only
npx @biomejs/biome format --write .

# Lint only
npx @biomejs/biome lint --write .

# Check only changed files (requires git)
npx @biomejs/biome check --changed

# CI mode (fails on warnings)
npx @biomejs/biome ci .
```

### Package Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write .",
    "format:check": "biome format ."
  }
}
```

## Editor Integration

### VS Code

Install the official [Biome VS Code extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome):

```bash
code --install-extension biomejs.biome
```

Add to your `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  }
}
```

### Other Editors

Biome has plugins for:

- [JetBrains IDEs](https://plugins.jetbrains.com/plugin/22761-biome) (WebStorm, IntelliJ, etc.)
- [Neovim](https://github.com/neovim/nvim-lspconfig/blob/master/doc/server_configurations.md#biome)
- [Sublime Text](https://github.com/biomejs/biome-sublime)
- [Zed](https://zed.dev/) (built-in support)

## CI/CD Integration

### GitHub Actions

```yaml
name: Lint

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run biome ci .
```

### Pre-commit Hook

Using [husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/lint-staged/lint-staged):

```json
{
  "devDependencies": {
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0"
  },
  "lint-staged": {
    "*": "biome check --write --no-errors-on-unmatched"
  }
}
```

```bash
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

## Migration from ESLint/Prettier

Biome can coexist with ESLint/Prettier during migration:

1. Install this config alongside existing tools
2. Run `biome check --write .` to see what changes Biome makes
3. Gradually migrate rules and remove ESLint/Prettier config
4. Remove old dependencies when ready

See the [Biome migration guide](https://biomejs.dev/guides/migrate-eslint-prettier/) for detailed instructions.

## Philosophy

This configuration follows these principles:

1. **Prevent bugs**: Strict on correctness and suspicious code patterns
2. **Encourage best practices**: Error on performance and security issues
3. **Allow flexibility**: Warn or disable opinionated style rules
4. **Support common patterns**: Smart overrides for tests, configs, scripts
5. **Reduce friction**: Sensible defaults that work for most projects
6. **Stay maintainable**: Clear structure and documented decisions

## Requirements

- Biome `^2.3.0` or later
- Node.js 16+ or Bun

## License

[MIT](LICENSE)

## Author

Frédérique Mittelstaedt ([npm@gfm.io](mailto:npm@gfm.io))

## Contributing

Issues and pull requests are welcome! This is a personal configuration, but suggestions for improvements are appreciated.

## Resources

- [Biome Documentation](https://biomejs.dev/)
- [Biome Linter Rules](https://biomejs.dev/linter/rules/)
- [Biome Formatter](https://biomejs.dev/formatter/)
- [Biome Blog](https://biomejs.dev/blog/)
