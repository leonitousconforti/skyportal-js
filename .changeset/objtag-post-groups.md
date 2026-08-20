---
"skyportal-js": patch
---

Model the `groups` that `POST /api/objtag` returns. The handler assigns the
groups to the new association before serializing it, so they ride along on the
response; strict decoding rejected them, which made a tag that the server had
actually created look like a failure to the caller.
