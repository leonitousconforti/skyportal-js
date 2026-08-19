/**
 * Typed endpoint functions for `/api/public_pages`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Groups from "./Groups.ts";
import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";

/**
 * Whether one data section of a public source page is published.
 *
 * @since 1.0.0
 * @category Models
 */
export const PublicSectionVisibility = v.picklist(["public", "private", "no data"]);

/**
 * @since 1.0.0
 * @category Models
 */
export type PublicSectionVisibility = v.InferOutput<typeof PublicSectionVisibility>;

/**
 * Visibility state of each data section of a public source page.
 *
 * @since 1.0.0
 * @category Models
 */
export const PublicSourcePageOptions = Schemas.model(
    v.strictObject({
        photometry: Schemas.nullish(PublicSectionVisibility),
        classifications: Schemas.nullish(PublicSectionVisibility),
        spectroscopy: Schemas.nullish(PublicSectionVisibility),
        summary: Schemas.nullish(PublicSectionVisibility),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type PublicSourcePageOptions = v.InferOutput<typeof PublicSourcePageOptions>;

/**
 * A published snapshot of a source (upstream `PublicSourcePage`).
 *
 * Upstream overrides `to_dict` to return exactly these keys, so the `data`,
 * `is_auto_published` and `release_id` columns and the `release` relationship
 * never reach the client; `release_link_name` is derived from the release
 * instead.
 *
 * @since 1.0.0
 * @category Models
 */
export const PublicSourcePage = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        source_id: Schemas.NullishString,
        release_link_name: Schemas.NullishString,
        is_visible: Schemas.NullishBoolean,
        created_at: Schemas.NullishTimestamp,
        hash: Schemas.NullishString,
        options: Schemas.nullish(PublicSourcePageOptions),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type PublicSourcePage = v.InferOutput<typeof PublicSourcePage>;

/**
 * Result of publishing a public source page.
 *
 * @since 1.0.0
 * @category Models
 */
export const PublicSourcePagePostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type PublicSourcePagePostResponse = v.InferOutput<typeof PublicSourcePagePostResponse>;

/**
 * A public release of source pages (upstream `PublicRelease`).
 *
 * `group_ids` is injected by the handler and lists only the owning groups the
 * calling user can access; `groups` and `source_pages` are relationships that
 * only appear when a handler eager-loads them.
 *
 * @since 1.0.0
 * @category Models
 */
export const PublicRelease = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        name: Schemas.NullishString,
        link_name: Schemas.NullishString,
        description: Schemas.NullishString,
        is_visible: Schemas.NullishBoolean,
        auto_publish_enabled: Schemas.NullishBoolean,
        options: Schemas.nullish(Schemas.JsonObject),
        group_ids: Schemas.list(Schemas.Integer),
        groups: Schemas.nullish(v.array(Groups.Group)),
        source_pages: Schemas.nullish(v.array(PublicSourcePage)),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type PublicRelease = v.InferOutput<typeof PublicRelease>;

/**
 * Payload for creating a public release.
 *
 * `link_name` must be URL-safe (alphanumerics, dashes, underscores, periods
 * and plus signs only) and unique across releases. `is_visible` defaults to
 * true and `auto_publish_enabled` to false.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PublicReleasePost {
    readonly name: string;
    readonly link_name: string;
    readonly group_ids: ReadonlyArray<number>;
    readonly description?: string | undefined;
    readonly options?: Record<string, unknown> | undefined;
    readonly is_visible?: boolean | undefined;
    readonly auto_publish_enabled?: boolean | undefined;
}

/**
 * Payload for updating a public release.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PublicReleaseUpdate {
    readonly name: string;
    readonly group_ids: ReadonlyArray<number>;
    readonly description?: string | undefined;
    readonly options?: Record<string, unknown> | undefined;
    readonly is_visible?: boolean | undefined;
    readonly auto_publish_enabled?: boolean | undefined;
}

/**
 * Result of creating a public release.
 *
 * @since 1.0.0
 * @category Models
 */
export const PublicReleasePostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type PublicReleasePostResponse = v.InferOutput<typeof PublicReleasePostResponse>;

/**
 * Retrieve the visible public pages of a source, newest first.
 *
 * @since 1.0.0
 * @category Requests
 * @param sourceId - Object ID of the source, e.g. `"ZTF20abcdef"`.
 */
export const fetchPublicSourcePages = async (client: Http.Client, sourceId: string): Promise<Array<PublicSourcePage>> =>
    Http.decode(v.array(PublicSourcePage), await Http.get(client, `/api/public_pages/source/${sourceId}`));

/**
 * Options for publishing a public source page.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PostPublicSourcePageOptions {
    /**
     * ID of the public release the page belongs to. Omit for a standalone
     * page.
     */
    readonly releaseId?: number | undefined;
}

/**
 * Publish a public page for a source.
 *
 * The server hashes the published data and rejects the request if a page with
 * identical data, options and release already exists. The rendered page is
 * only generated when the page has no release or its release is visible.
 *
 * @since 1.0.0
 * @category Requests
 * @param sourceId - Object ID of the source to publish.
 * @param options - Options controlling what is published. Recognized keys are
 *   `"groups"` and `"streams"` (ID lists restricting the data pulled in) and
 *   the booleans `"include_summary"`, `"include_photometry"`,
 *   `"include_spectroscopy"` and `"include_classifications"`.
 */
export const postPublicSourcePage = async (
    client: Http.Client,
    sourceId: string,
    options: Record<string, unknown>,
    pageOptions: PostPublicSourcePageOptions = {}
): Promise<PublicSourcePagePostResponse> =>
    Http.decode(
        PublicSourcePagePostResponse,
        await Http.post(
            client,
            `/api/public_pages/source/${sourceId}`,
            Http.body({ options, release_id: pageOptions.releaseId })
        )
    );

/**
 * Delete a public source page and drop it from the page cache.
 *
 * @since 1.0.0
 * @category Requests
 * @param pageId - ID of the public source page to delete.
 */
export const deletePublicSourcePage = async (client: Http.Client, pageId: number): Promise<void> => {
    await Http.del(client, `/api/public_pages/source/${pageId}`);
};

/**
 * Retrieve all public releases, ordered by name.
 *
 * Each release's `group_ids` lists only the owning groups the calling user can
 * access.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchPublicReleases = async (client: Http.Client): Promise<Array<PublicRelease>> =>
    Http.decode(v.array(PublicRelease), await Http.get(client, "/api/public_pages/release"));

/**
 * Create a public release.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The release to create.
 */
export const postPublicRelease = async (
    client: Http.Client,
    payload: PublicReleasePost
): Promise<PublicReleasePostResponse> =>
    Http.decode(PublicReleasePostResponse, await Http.post(client, "/api/public_pages/release", Http.body(payload)));

/**
 * Update a public release.
 *
 * The server rewrites every listed field, so omitted optional fields are reset
 * to their defaults (empty description, empty options, visible, auto-publish
 * disabled) rather than left unchanged. `link_name` cannot be changed. Making
 * a visible release invisible drops its source pages from the page cache.
 *
 * @since 1.0.0
 * @category Requests
 * @param releaseId - ID of the release to update.
 * @param payload - The new release state.
 */
export const updatePublicRelease = async (
    client: Http.Client,
    releaseId: number,
    payload: PublicReleaseUpdate
): Promise<void> => {
    await Http.patch(client, `/api/public_pages/release/${releaseId}`, Http.body(payload));
};

/**
 * Delete a public release.
 *
 * The release must have no public source pages left in it.
 *
 * @since 1.0.0
 * @category Requests
 * @param releaseId - ID of the release to delete.
 */
export const deletePublicRelease = async (client: Http.Client, releaseId: number): Promise<void> => {
    await Http.del(client, `/api/public_pages/release/${releaseId}`);
};
