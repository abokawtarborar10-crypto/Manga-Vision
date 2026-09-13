---
name: Asura pagination
description: The live Asura REST series endpoint uses offset pagination rather than honoring a page parameter.
---

Use `offset = page * limit` with `limit` on Asura `/api/series` requests. The endpoint can return `meta.has_more`, but requests using `page=2`, `page=3`, and later may still return the first page unchanged.

**Why:** Live requests showed identical first-page slugs for page values 1 through 5, while offsets 0, 20, 40, 60, and 80 returned distinct results.

**How to apply:** Keep the logical app page zero-based, translate it to an offset only inside the Asura adapter, and include the offset/order/query in cache keys. Preserve stable slug IDs and append results with duplicate protection.