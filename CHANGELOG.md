# skyportal-js

## 0.3.1

### Patch Changes

- ac59e99: Model `Comment.system`, the flag marking a comment the app posted rather than
  its author typing it. It was added to SkyPortal after 0.3.0, and strict
  decoding meant any comment carrying it failed, taking the whole source payload
  with it.

## 0.3.0

### Minor Changes

- 80e8bb9: Fixes found while dogfooding the client in the SkyPortal frontend:

    - `Comment.channel` is now part of the comment model. It was only exposed as a
      request option, so any source page carrying comments failed to decode.
    - `updateUser` now models every column `PATCH /api/user/{id}` assigns
      (`username`, `first_name`, `last_name`, `contact_email`, `contact_phone`,
      `affiliations`, `bio`, `is_bot`), not just `expirationDate`.
    - `updateGroup` accepts an explicit `null` for `nickname`/`description`, which
      is how the unique `nickname` column is cleared.
    - Model fields whose columns are `nullable=False` upstream are no longer
      nullable, since their handlers serialize the whole model: `Team.name`,
      `Allocation.group_id`/`instrument_id`, `Listing.user_id`/`obj_id`/`list_name`,
      `UserProfile.id`, `BulkSpectrum.obj_id`, `Broker.name`/`broker_classname`/
      `active`/`default_alert_search`/`default_crossmatch`, and
      `BrokerFilter.name`/`group_id`/`stream_id`.
    - New `fetchAllocationPage`, which keeps the `totalMatches` sibling key that
      `fetchAllocation` drops, for paginating an allocation's follow-up requests.
    - New `Http.unwrapEnvelope`/`Http.getEnvelope` plus `fetchSysinfoWithVersion`
      and `fetchConfigWithVersion`, exposing the `version` that SkyPortal adds to
      every response envelope beside `data`.
    - `fetchSources` gains the 17 filter params `SourceHandler.get` reads but the
      client did not send: `TNSname`, `includeThumbnails`, `includeColorMagnitude`,
      `includeDetectionStats`, `includeLabellers`, `includeComments`,
      `includeAnalyses`, `includePhotometry`, `deduplicatePhotometry`,
      `includePhotometryExists`, `includePeriodExists`, `includeCandidates`,
      `includeGCNCrossmatches`, `includeGCNNotes`, `includeAssociatedObjs`,
      `includeSuperObjs` and `includeTags`.
    - `postPhotometry` can send `refresh`, which the handler reads to push a
      photometry refresh to connected frontends (`upsertPhotometry` already could).
    - The follow-up request watch/unwatch endpoints accept `refreshSource` and
      `refreshRequests`, which the handlers read to decide what to push to
      connected frontends.
    - `postComment`/`updateComment` accept `channel`, the conversation a source
      comment belongs to, and the new `fetchCommentChannels`/`deleteCommentChannel`
      cover `/api/sources/{obj_id}/comments/channels`.
    - `updateSource` models the rest of the `Obj` columns `PATCH /api/sources/{id}`
      loads through the Obj schema: `alias`, `t0`, `redshift_error`,
      `redshift_origin`, `tns_name`, `varstar`, `is_roid`, `mpc_name`, `host_id`.

## 0.2.0

### Minor Changes

- 96b2585: First release: a TypeScript port of skyportal-py covering all 56 SkyPortal API resources.
