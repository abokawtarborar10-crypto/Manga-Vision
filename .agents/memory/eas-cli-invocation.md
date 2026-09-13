---
name: EAS CLI invocation
description: The npm package name for Expo Application Services is eas-cli, not eas.
---

Use `npx eas-cli` when invoking Expo Application Services from an npm-managed artifact. `npx eas` resolves the unrelated npm package named `eas` and fails before the EAS command starts.

**Why:** npm's executable lookup treats the command after `npx` as a package name when it is not already installed, and the unrelated `eas` package does not expose the EAS CLI binary.

**How to apply:** Use `npx eas-cli ...` for one-off builds, or install `eas-cli` explicitly if the project needs a pinned local CLI.