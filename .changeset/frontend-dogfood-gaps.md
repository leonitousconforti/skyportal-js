---
"skyportal-js": minor
---

Fixes found while dogfooding the client in the SkyPortal frontend:

- `updateUser` now models every column `PATCH /api/user/{id}` assigns
  (`username`, `first_name`, `last_name`, `contact_email`, `contact_phone`,
  `affiliations`, `bio`, `is_bot`), not just `expirationDate`.
- `updateGroup` accepts an explicit `null` for `nickname`/`description`, which
  is how the unique `nickname` column is cleared.
- `Team.name`, `Allocation.group_id`/`instrument_id` and `Listing.user_id`/
  `obj_id`/`list_name` are no longer nullable: those columns are all
  `nullable=False` upstream and their handlers serialize the whole model.
- New `fetchAllocationPage`, which keeps the `totalMatches` sibling key that
  `fetchAllocation` drops, for paginating an allocation's follow-up requests.
- New `Http.unwrapEnvelope`/`Http.getEnvelope` plus `fetchSysinfoWithVersion`
  and `fetchConfigWithVersion`, exposing the `version` that SkyPortal adds to
  every response envelope beside `data`.
