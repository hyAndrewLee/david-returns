# Simplify — Code Quality Review

Review recently changed code for quality improvements, duplication, and convention compliance.

## When to Use

Run this after completing a feature or fix to catch quality issues before they ship. Invoke by asking: "run simplify" or "simplify my changes".

## Steps

1. **Identify changed files** — run `git diff --name-only HEAD~1` (or check the files from the current session)

2. **Review each file for:**
   - Code duplication — is the same logic repeated elsewhere in the codebase? Search with explore subagents.
   - Unused imports, variables, or dead code
   - Components doing too much — should logic be extracted to a Context provider?
   - Missing error handling — are try/catch blocks handling errors explicitly?
   - Type safety — any `any` types, missing return types, or loose typing?
   - Naming — do names follow project conventions (camelCase functions, PascalCase types/components, UPPER_SNAKE_CASE constants)?

3. **Check convention compliance** against `.cursor/rules/conventions.mdc`:
   - Arrow function syntax everywhere
   - Destructured params with named types for 3+ params
   - No prop drilling — state in Context providers
   - Absolute imports with `@/` prefix
   - Grouped imports: external → internal → relative → types

4. **Check for reuse opportunities:**
   - Could any new utility be generalized and placed in `lib/`?
   - Is there an existing `components/ui/` primitive being reimplemented?
   - Are there similar patterns across files that could be unified?

5. **Report findings** — list specific issues with file paths and line numbers, then offer to fix them.

## Output Format

```
## Simplify Report

### Issues Found
- [FILE:LINE] Description of issue → Suggested fix

### Reuse Opportunities
- Description of what could be shared

### Convention Violations
- [RULE] What's wrong → What it should be

### Summary
X issues found, Y auto-fixable
```
