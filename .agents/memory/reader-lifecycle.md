---
name: Reader lifecycle stability
description: Prevent chapter reloads caused by context callback identity changes during progress persistence.
---

Reader chapter-loading effects must not depend on callbacks whose identity changes when reading progress updates. Keep progress lookups ref-backed and stable; normal viewability/current-page updates must never clear pages or reset the reader.

**Why:** Saving progress updates the library context. If `getProgress` is recreated from the progress object, the load effect runs again, clears the page list, and returns to page 0 around the second or third image.

**How to apply:** When reviewing reader load dependencies, use stable chapter/source identifiers and stable context callbacks. Treat any dependency that changes with scroll progress as a reload regression risk.