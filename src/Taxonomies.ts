/**
 * Typed endpoint functions for `/api/taxonomy`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Groups from "./Groups.ts";
import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";

/**
 * A classification taxonomy (upstream `Taxonomy`).
 *
 * `classifications` stays untyped:
 * {@link skyportal-js/Classifications!Classification} already points at
 * `Taxonomy`, so typing it would create an import cycle.
 *
 * @since 1.0.0
 * @category Models
 */
export const Taxonomy = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        name: Schemas.NullishString,
        version: Schemas.NullishString,
        provenance: Schemas.NullishString,
        isLatest: Schemas.NullishBoolean,
        hierarchy: Schemas.nullish(Schemas.JsonObject),
        groups: Schemas.nullish(v.array(Groups.Group)),
        classifications: Schemas.nullish(v.array(Schemas.JsonObject)),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type Taxonomy = v.InferOutput<typeof Taxonomy>;

/**
 * Payload for creating a taxonomy.
 *
 * Exactly one of `hierarchy` (nested JSON) or `hierarchy_file` (the same
 * structure as a YAML string) must be given, and the hierarchy is validated
 * against the `tdtax` schema. The name/version combination must not already
 * exist. `group_ids` defaults to the public group, and any group the token
 * cannot access is dropped. When `isLatest` is true every other taxonomy with
 * the same name is marked not-latest.
 *
 * @since 1.0.0
 * @category Models
 */
export interface TaxonomyPost {
    readonly name: string;
    readonly version: string;
    readonly hierarchy?: Record<string, unknown> | undefined;
    readonly hierarchy_file?: string | undefined;
    readonly group_ids?: ReadonlyArray<number> | undefined;
    readonly provenance?: string | undefined;
    /** Defaults to true. */
    readonly isLatest?: boolean | undefined;
}

/**
 * Payload for updating a taxonomy.
 *
 * @since 1.0.0
 * @category Models
 */
export interface TaxonomyPut {
    readonly name?: string | undefined;
    readonly version?: string | undefined;
    readonly provenance?: string | undefined;
    readonly isLatest?: boolean | undefined;
    readonly group_ids?: ReadonlyArray<number> | undefined;
}

/**
 * Result of creating a taxonomy.
 *
 * @since 1.0.0
 * @category Models
 */
export const TaxonomyPostResponse = Schemas.model(v.strictObject({ taxonomy_id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type TaxonomyPostResponse = v.InferOutput<typeof TaxonomyPostResponse>;

/**
 * Retrieve the taxonomies usable by the token's groups.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchTaxonomies = async (client: Http.Client): Promise<Array<Taxonomy>> =>
    Http.decode(v.array(Taxonomy), await Http.get(client, "/api/taxonomy"));

/**
 * Retrieve a single taxonomy by ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param taxonomyId - ID of the taxonomy.
 */
export const fetchTaxonomy = async (client: Http.Client, taxonomyId: number): Promise<Taxonomy> =>
    Http.decode(Taxonomy, await Http.get(client, `/api/taxonomy/${taxonomyId}`));

/**
 * Create a taxonomy.
 *
 * Requires the "Post taxonomy" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The taxonomy to create.
 */
export const postTaxonomy = async (client: Http.Client, payload: TaxonomyPost): Promise<TaxonomyPostResponse> =>
    Http.decode(
        TaxonomyPostResponse,
        await Http.post(client, "/api/taxonomy", Http.body({ isLatest: true, ...payload }))
    );

/**
 * Update a taxonomy.
 *
 * Only the provided fields are sent; omitted fields are left unchanged. The
 * hierarchy cannot be edited: post a new taxonomy instead. Groups the token
 * cannot access are dropped from `group_ids`. Requires the "Post taxonomy"
 * permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param taxonomyId - ID of the taxonomy to update.
 * @param payload - The fields to change.
 */
export const updateTaxonomy = async (client: Http.Client, taxonomyId: number, payload: TaxonomyPut): Promise<void> => {
    await Http.put(client, `/api/taxonomy/${taxonomyId}`, Http.body(payload));
};

/**
 * Delete a taxonomy.
 *
 * Fails if any classification still references the taxonomy. Requires the
 * "Delete taxonomy" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param taxonomyId - ID of the taxonomy to delete.
 */
export const deleteTaxonomy = async (client: Http.Client, taxonomyId: number): Promise<void> => {
    await Http.del(client, `/api/taxonomy/${taxonomyId}`);
};
