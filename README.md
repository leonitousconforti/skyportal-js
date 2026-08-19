# skyportal-js

First-party TypeScript client for the [SkyPortal](https://skyportal.io) API.

A port of [skyportal-py](https://github.com/leonitousconforti/skyportal-py):
the same endpoint surface, the same names, the same strict models.

## Usage

Each endpoint is a plain function with explicit types for path parameters,
query arguments, payloads, and responses ([valibot](https://valibot.dev)
schemas). `createClient` returns a `SkyPortal` client: a `fetch`-based
transport preconfigured with the instance's base URL and token header, with
every endpoint function bound as a method.

```ts
import { createClient } from "skyportal-js/Client";
import { Sources } from "skyportal-js";

const client = createClient("https://skyportal.example.com", { token: "your-api-token" });
// or, for instances that allow anonymous viewing:
const anon = createClient("https://skyportal.example.com");

const me = await client.fetchProfile(); // -> UserProfile
const page = await client.fetchSources({ numPerPage: 10 }); // -> SourcesPage
const source = await client.fetchSource("ZTF20abcdef"); // -> Source
await client.postSource({ id: "ZTF20abcdef", ra: 10.5, dec: -20.25 });

const myGroups = await client.fetchGroups(); // -> GroupsResponse
const candidates = await client.fetchCandidates({ groupIds: [1] }); // -> CandidatesPage
const lightcurve = await client.fetchPhotometry("ZTF20abcdef"); // -> Array<PhotometryPoint>
const notes = await client.fetchComments("ZTF20abcdef"); // -> Array<Comment>
const labels = await client.fetchClassifications("ZTF20abcdef"); // -> Array<Classification>
const spectra = await client.fetchSpectra("ZTF20abcdef"); // -> Array<Spectrum>
const auto = await client.fetchAnnotations("ZTF20abcdef"); // -> Array<Annotation>
await client.postComment("ZTF20abcdef", "spectrum looks like a SN Ia");

const scopes = await client.fetchTelescopes(); // -> Array<Telescope>
const cameras = await client.fetchInstruments(); // -> Array<Instrument>
const schemes = await client.fetchTaxonomies(); // -> Array<Taxonomy>
const alertFilters = await client.fetchFilters(); // -> Array<Filter>
const people = await client.fetchUsers(); // -> UsersPage
const feeds = await client.fetchStreams(); // -> Array<Stream>

// follow-up requests and observing runs
const time = await client.fetchAllocations({ instrumentId: 2 }); // -> Array<Allocation>
const pending = await client.fetchFollowupRequests({ status: "pending" });
await client.postFollowupRequest({
    obj_id: "ZTF20abcdef",
    allocation_id: 1,
    payload: { priority: 3, exposure_time: 300 },
});
const runs = await client.fetchObservingRuns(); // -> Array<ObservingRun>
await client.postObservingRun({ instrument_id: 2, calendar_date: "2026-09-01" });

// updating and deleting
await client.updateSource("ZTF20abcdef", { redshift: 0.123 });
await client.updateComment("ZTF20abcdef", 42, { text: "actually a SN IIn" });
await client.deleteComment("ZTF20abcdef", 42);
await client.deleteClassification(7);
await client.deletePhotometry(1234);
await client.deleteSpectrum(56);

// multimessenger follow-up
const events = await client.fetchGcnEvents(); // -> GcnEventsPage
const skymap = await client.fetchLocalizationSkymap("2023-01-01T00:00:00", "bayestar.fits.gz"); // -> Uint8Array
const plans = await client.fetchObservationPlans(); // -> ObservationPlanRequestsPage
const done = await client.fetchObservations("2026-01-01", "2026-02-01", {
    telescopeName: "ZTF",
}); // -> ObservationsPage

// collaboration
const myShifts = await client.fetchShifts(); // -> Array<Shift>
await client.postReminder("ZTF20abcdef", {
    text: "check the spectrum",
    next_reminder: "2026-09-01",
});
const favourites = await client.fetchListings(); // -> Array<Listing>

// equivalently, call the functions directly with any client:
const same = await Sources.fetchSource(client, "ZTF20abcdef");
```

The full endpoint surface is broad: every module maps to one SkyPortal API
resource, and every function on it maps to one HTTP verb on one route. Import
the module to see what is available (`import { GcnEvents } from
"skyportal-js"`), or call the bound method on the client.

## Conventions

Ported from Python, with the two adjustments TypeScript asks for:

- **Keyword arguments become an options object.** Python's `*` keyword-only
  parameters are collected into a trailing `options` argument, named in
  camelCase and mapped to the endpoint's wire parameter: `fetch_sources(...,
num_per_page=10, has_tns_name=True)` becomes `fetchSources({ numPerPage: 10,
hasTnsName: true })`. Required positional parameters stay positional.
- **Model and payload fields keep their wire names.** A response field is
  spelled exactly as SkyPortal sends it (`obj_id`, `created_at`,
  `totalMatches`), so there is no rename layer between you and the API.

Timestamps stay the ISO 8601 strings SkyPortal sends rather than being parsed
into `Date`: the server is inconsistent about trailing `Z` and sub-second
precision, and timestamps travel back out unchanged on update payloads.

All models are strict: unknown fields in a server response raise a
`SkyPortalValidationError`, so SkyPortal schema drift surfaces immediately
instead of silently producing partial data. Error responses raise
`SkyPortalError` with the server's message and HTTP status code. For endpoints
without a typed function yet, use the transport directly and `unwrap` the
envelope:

```ts
import { Http } from "skyportal-js";

const streams = await Http.get(client, "/api/streams");
```

## Development

The dev environment is managed with [nix](https://nixos.org) and
[pnpm](https://pnpm.io):

```sh
nix develop # or `direnv allow` with nix-direnv
pnpm install
pnpm codegen # regenerate src/index.ts
pnpm check   # typecheck
pnpm lint    # oxlint + oxfmt
pnpm test    # vitest
pnpm build   # tsc + babel into dist/
```
