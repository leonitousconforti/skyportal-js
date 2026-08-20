---
"skyportal-js": patch
---

Model `Comment.system`, the flag marking a comment the app posted rather than
its author typing it. It was added to SkyPortal after 0.3.0, and strict
decoding meant any comment carrying it failed, taking the whole source payload
with it.
