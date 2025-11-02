# Biome v2.3.2 Expert Configuration Guide

## Project Context

This project creates shareable Biome configurations for use across multiple projects via npm package distribution. The configuration in `biome.json` serves as a base config that other projects can extend using the `extends` property.

## Core Biome v2.3.2 Knowledge

### Configuration Architecture

1. **Shareable Config Pattern**
   - Set `"root": false` in shared configs to allow consuming projects to extend them
   - Consuming projects reference via `"extends": ["@gfmio/config-biome/biome.json"]`
   - Properties in consuming configs override inherited values
   - The `extends` array processes left-to-right (least to most specific)

2. **Schema Version Awareness**
   - Current schema: `https://biomejs.dev/schemas/2.0.5/schema.json`
   - Note: Schema versioning may lag behind release versions (2.0.5 schema covers 2.3.x features)
   - Always verify schema compatibility when updating Biome versions

### File Pattern Best Practices

**Glob Pattern Hierarchy:**

- `includes`: Positive patterns defining files to process
- `!pattern`: Negative patterns (exceptions) - files ignored for linting/formatting but still indexed for type checking
- `!!pattern`: Force-ignore patterns - completely excluded from all Biome operations (use for `dist/`, `build/`, `.next/`)

**Pattern Syntax Rules:**

- `**` must be a complete path component (valid: `src/**`, invalid: `**.js`)
- Matching all files in a folder requires `/**` suffix (e.g., `dist/**`)
- Order matters: more specific patterns should come after general ones
- Negated patterns (`!`) are exceptions only, not standalone exclusions

**Performance Optimization:**

- Use `!!` force-ignore for build output directories to prevent indexing overhead
- Set `files.maxSize` (default 1MB) to skip large generated files
- Enable `files.ignoreUnknown: false` to get warnings about unprocessable files

### VCS Integration Strategy

```json
{
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true,
    "defaultBranch": "main"
  }
}
```

- `useIgnoreFile: true` respects `.gitignore` patterns automatically
- `defaultBranch` enables `--changed` and `--since` CLI flags for incremental checking
- VCS integration prevents processing of git-ignored files, improving performance

### Formatter Configuration Principles

**Global vs. Language-Specific:**

- Set base formatting in `formatter` (applies to all languages)
- Override per-language in `javascript`, `json`, `css`, etc.
- Language-specific settings take precedence over global settings

**Critical Settings for Shared Configs:**

- `lineWidth`: Balance between readability (80-100) and screen space (120-140)
- `indentStyle` + `indentWidth`: Must align with project conventions (spaces more common in modern JS)
- `lineEnding`: Use `"lf"` for cross-platform consistency, or `"auto"` for OS-native
- `attributePosition`: `"auto"` allows single-line when short, multiline when long

**JavaScript/TypeScript Specifics:**

- `quoteStyle`: `"single"` (modern JS convention) vs `"double"` (JSON-compatible)
- `jsxQuoteStyle`: Typically `"double"` to distinguish from JS strings
- `trailingCommas: "all"`: Enables cleaner git diffs (ES5+ compatibility)
- `semicolons: "always"`: Safer default (vs `"asNeeded"` which relies on ASI rules)
- `arrowParentheses: "always"`: Consistent style, easier to add types later

### Linter Rule Configuration Strategy

**Rule Organization:**

- `recommended: true` enables stable, non-controversial rules
- Configure categories: `correctness`, `suspicious`, `style`, `complexity`, `a11y`, `performance`, `security`, `nursery`
- Category-level settings apply to all rules in that category
- Individual rule configs override category defaults

**Rule Severity Levels:**

- `"error"`: Blocks CI, requires immediate fix
- `"warn"`: Reports but allows CI to pass, good for transitional rules
- `"off"`: Explicitly disabled (documents intentional deviation)
- `{ "level": "error", "options": {...} }`: Rule with custom configuration

**Shared Config Best Practices:**

- Be opinionated but pragmatic (strict for correctness, flexible for style)
- Use `"warn"` for nursery rules (experimental, may have false positives)
- Disable rules that conflict with common patterns (e.g., `noForEach: "off"`)
- Document non-obvious choices in comments (use `biome.jsonc` if needed)

**Override Patterns for Shared Configs:**

```json
{
  "overrides": [
    {
      "includes": ["**/*.test.ts", "**/*.spec.ts", "tests/**/*"],
      "linter": {
        "rules": {
          "suspicious": {
            "noExplicitAny": "off",
            "useAwait": "off"
          }
        }
      }
    },
    {
      "includes": ["**/*.config.{ts,js,mjs,cjs}"],
      "linter": {
        "rules": {
          "style": {
            "noDefaultExport": "off"
          }
        }
      }
    },
    {
      "includes": ["**/*.d.ts"],
      "linter": {
        "rules": {
          "correctness": {
            "noUnusedVariables": "off"
          }
        }
      }
    }
  ]
}
```

### Modern Biome v2.3+ Features

**Vue/Svelte/Astro Support (Experimental):**

- Enable via `"html": { "experimentalFullSupportEnabled": true }`
- Formats/lints `<script>` (JS/TS) and `<style>` (CSS) tags
- Configure `indentScriptAndStyle: false` to match Prettier behavior
- Still experimental due to framework-specific syntax edge cases

**CSS Features:**

- `css.parser.cssModules: true` for CSS Modules syntax
- `css.parser.tailwindDirectives: true` for Tailwind v4 (`@utility`, `@theme`, `@apply`)
- CSS formatting supports standard options (indent, line width, quotes)

**Enhanced Ignore Patterns:**

- Use `!` for type-check-only files (linting/formatting skipped, but indexed)
- Use `!!` for complete exclusion (build outputs, node_modules)
- Migration: Run `biome migrate --write` to update deprecated `files.experimentalScannerIgnores`

**EditorConfig Integration:**

- `formatter.useEditorconfig: true` respects `.editorconfig` files
- Biome config takes precedence when both exist
- Ignored for `.editorconfig` above the config file (prevents home directory pollution)

### Assist Actions

```json
{
  "assist": {
    "enabled": true,
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

- `organizeImports`: Automatically sorts and groups imports
- Integrates with editor "organize imports" commands
- Helpful for maintaining consistent import order across projects

## Working with This Project

### Configuration Development Workflow

1. **Testing Changes:**

   ```bash
   # Test config locally
   npx @biomejs/biome check .

   # Format files
   npx @biomejs/biome format --write .

   # Lint with fixes
   npx @biomejs/biome lint --write .
   ```

2. **Version Updates:**
   - Update `@biomejs/biome` in both `devDependencies` and `peerDependencies`
   - Update `$schema` URL if schema version changes
   - Run `npx @biomejs/biome migrate --write` to apply migrations
   - Test in a sample project before publishing

3. **Publishing Workflow:**
   - Ensure `biome.json` is in `files` array in `package.json`
   - Export config via `"exports": { "./biome.json": "./biome.json" }`
   - Version bump reflects semantic changes (minor = new rules, patch = tweaks)

### Common Configuration Adjustments

**Making Config More Strict:**

- Change `"warn"` to `"error"` for rules
- Enable additional `nursery` rules that have matured
- Lower `lineWidth` for narrower code style
- Enable `strictCase: true` in `useNamingConvention`

**Making Config More Lenient:**

- Change `"error"` to `"warn"` or `"off"`
- Add file-pattern-specific overrides for special cases
- Increase `files.maxSize` for projects with large files
- Use `ignoreUnknown: true` to suppress unknown file warnings

**Adding Framework Support:**

```json
{
  "javascript": {
    "jsx": {
      "runtime": "transparent"  // React 17+ (new JSX transform)
    }
  },
  "linter": {
    "rules": {
      "a11y": {
        "useKeyWithClickEvents": "error",
        "useValidAnchor": "error"
      }
    }
  }
}
```

### Debugging Configuration Issues

**Schema Validation:**

- Ensure `$schema` URL is accessible and current
- Check for typos in property names (schema provides autocomplete)
- Verify rule names match current Biome version (rules can be promoted/deprecated)

**Rule Behavior:**

- Use `npx @biomejs/biome explain <rule-name>` to understand rules
- Check rule documentation at `https://biomejs.dev/linter/rules/`
- Test rules in isolation before adding to shared config

**Override Resolution:**

- Remember: First matching override wins
- More specific patterns should come first in `overrides` array
- Use `includes` for positive matching, not `excludes` (doesn't exist)

**Performance Issues:**

- Add `!!` force-ignore for large directories (`node_modules`, `dist`)
- Increase `files.maxSize` cautiously (affects memory usage)
- Use `--diagnostic-level=info` to see what files are processed

## Critical Behaviors for Shared Configs

### Do's

- ✓ Set `"root": false` to allow extension
- ✓ Be opinionated about correctness rules (`correctness`, `suspicious`)
- ✓ Provide sensible defaults that work for 80% of projects
- ✓ Use overrides for common special cases (tests, configs, type definitions)
- ✓ Document reasoning for non-obvious rule configurations
- ✓ Keep peerDependencies range reasonable (e.g., `^2.3.0` not `^2.3.2`)
- ✓ Test config in multiple project types before publishing
- ✓ Version config package when making breaking changes

### Don'ts

- ✗ Don't set `"root": true` in shared configs (prevents extension)
- ✗ Don't be overly strict on style rules (projects vary)
- ✗ Don't enable all nursery rules (unstable, may change)
- ✗ Don't hardcode project-specific paths in includes/excludes
- ✗ Don't assume specific directory structures (use pattern-based overrides)
- ✗ Don't pin exact Biome versions (prevents updates)
- ✗ Don't change rule severities without version bumps

## Quick Reference: CLI Commands

```bash
# Check all files
biome check .

# Check with automatic fixes
biome check --write .

# Format only
biome format --write .

# Lint only
biome lint --write .

# Check changed files (requires VCS integration)
biome check --changed

# Explain a rule
biome explain noConsole

# Migrate config to latest version
biome migrate --write

# Init new config (with auto-detection)
biome init

# Use specific config file
biome check --config-path=./custom.biome.json .

# CI-friendly: error on warnings
biome ci .
```

## Advanced Configuration Patterns

### Monorepo Setup

**Root config (`biome.json`):**

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.5/schema.json",
  "extends": ["@gfmio/config-biome/biome.json"],
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  }
}
```

**Package-specific config (`packages/app/biome.json`):**

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.5/schema.json",
  "root": false,
  "extends": ["../../biome.json"],
  "linter": {
    "rules": {
      "style": {
        "noDefaultExport": "off"
      }
    }
  }
}
```

### Multi-Language Projects

```json
{
  "formatter": {
    "enabled": true,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "all"
    }
  },
  "json": {
    "formatter": {
      "trailingCommas": "none"
    },
    "parser": {
      "allowComments": true,
      "allowTrailingCommas": true
    }
  },
  "css": {
    "parser": {
      "cssModules": true,
      "tailwindDirectives": true
    }
  },
  "html": {
    "experimentalFullSupportEnabled": true,
    "formatter": {
      "indentScriptAndStyle": false
    }
  }
}
```

### Progressive Strictness

Start lenient, gradually tighten:

**Phase 1: Adoption**

```json
{
  "linter": {
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "warn",
        "noConsole": "warn"
      }
    }
  }
}
```

**Phase 2: Enforcement**

```json
{
  "linter": {
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "error",
        "noConsole": { "level": "error", "options": { "allow": ["log"] } }
      },
      "nursery": {
        "useSortedClasses": "warn"
      }
    }
  }
}
```

## Staying Current

### Version Tracking

- Follow Biome releases: <https://biomejs.dev/blog/>
- Check changelog for promoted/deprecated rules
- Run migration command with each major/minor update

### Rule Evolution

- Nursery → Stable: Re-evaluate severity when rules promote
- Deprecated rules: Remove or replace with alternatives
- New rules: Assess fit for shared config philosophy

### Community Patterns

- Review popular configs: `biome-config` on npm
- Monitor Biome discussions: <https://github.com/biomejs/biome/discussions>
- Stay informed on ecosystem changes (React, Vue, etc.)

## Philosophy for This Project

This shared config should:

1. **Prevent bugs** (strict on correctness/suspicious categories)
2. **Encourage best practices** (error on performance, security issues)
3. **Allow flexibility** (warn or disable opinionated style rules)
4. **Support common patterns** (test files, config files, type definitions via overrides)
5. **Reduce friction** (sensible defaults, minimal required overrides)
6. **Stay maintainable** (clear structure, documented decisions, easy updates)

When adding or modifying rules, ask:

- Does this catch real bugs or bad practices?
- Will this create excessive false positives?
- Is this better as "error", "warn", or "off"?
- Should this apply everywhere or use overrides?
- Is this future-proof as Biome and ecosystem evolve?
