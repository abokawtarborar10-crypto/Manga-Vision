---
name: RTL layout boundary
description: The app’s RTL architecture separates stable physical layout from locale-aware text and navigation icons.
---

Keep the established flex layout physically stable when switching the application language. Apply RTL to text boundaries and semantic directional icons only; do not mutate native global RTL state or put the selected locale direction on the mounted root tree.

**Why:** React Native’s global RTL manager and a root `direction` style can reverse every flex row, change native icon behavior, and affect reader/page layout. That is broader than the app’s language change and can mirror artwork-adjacent controls or leave stale native layout state after switching back.

**How to apply:** Use the root shell as an explicit stable LTR layout boundary. Use `writingDirection`/text alignment on localized text, and use the directional icon helper only for back/forward/chevron/caret icons. Keep generic action icons, manga artwork, page order, and reader state independent from application locale direction.