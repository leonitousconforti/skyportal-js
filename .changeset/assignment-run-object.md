---
"skyportal-js": patch
---

Accept an assignment's `run` as either an ID or the whole observing run. The
source payload eager-loads `ClassicalAssignment.run`, so it serializes as a
nested object there, while `/api/assignment` returns a bare primary key.
