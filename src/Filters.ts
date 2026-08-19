/**
 * Typed endpoint functions for `/api/filters`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";

/**
 * An alert-stream filter belonging to a group (upstream `Filter`).
 *
 * `stream`, `group`, `broker` and `candidates` stay untyped: each of those
 * upstream models owns a `filters` (or `filter`) relationship, so typing them
 * here would risk an import cycle.
 *
 * @since 1.0.0
 * @category Models
 */
export const Filter = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        name: Schemas.NullishString,
        stream_id: Schemas.NullishInteger,
        group_id: Schemas.NullishInteger,
        broker_id: Schemas.NullishInteger,
        altdata: Schemas.nullish(Schemas.JsonObject),
        autosave: Schemas.NullishBoolean,
        stream: Schemas.nullish(Schemas.JsonObject),
        group: Schemas.nullish(Schemas.JsonObject),
        broker: Schemas.nullish(Schemas.JsonObject),
        candidates: Schemas.nullish(v.array(Schemas.JsonObject)),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type Filter = v.InferOutput<typeof Filter>;

/**
 * Payload for creating a filter.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FilterPost {
    readonly name: string;
    readonly stream_id: number;
    readonly group_id: number;
    /** The broker the filter runs on, if any. */
    readonly broker_id?: number | undefined;
    /** Arbitrary extra JSON. */
    readonly altdata?: Record<string, unknown> | undefined;
}

/**
 * Payload for updating a filter.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FilterPatch {
    readonly name?: string | undefined;
    readonly altdata?: Record<string, unknown> | undefined;
    readonly group_id?: number | undefined;
    readonly stream_id?: number | undefined;
    readonly autosave?: boolean | undefined;
}

/**
 * Result of creating a filter.
 *
 * @since 1.0.0
 * @category Models
 */
export const FilterPostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type FilterPostResponse = v.InferOutput<typeof FilterPostResponse>;

/**
 * Retrieve all filters belonging to the token's groups.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchFilters = async (client: Http.Client): Promise<Array<Filter>> =>
    Http.decode(v.array(Filter), await Http.get(client, "/api/filters"));

/**
 * Retrieve a single filter by ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param filterId - ID of the filter.
 */
export const fetchFilter = async (client: Http.Client, filterId: number): Promise<Filter> =>
    Http.decode(Filter, await Http.get(client, `/api/filters/${filterId}`));

/**
 * Create a filter.
 *
 * Requires the "Upload data" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The filter to create.
 */
export const postFilter = async (client: Http.Client, payload: FilterPost): Promise<FilterPostResponse> =>
    Http.decode(FilterPostResponse, await Http.post(client, "/api/filters", Http.body(payload)));

/**
 * Update a filter.
 *
 * Only the provided fields are sent; omitted fields are left unchanged.
 * `group_id` and `stream_id` cannot be changed and are accepted only when they
 * match the filter's current values. Renaming a filter that is attached to a
 * broker also renames it on the broker, and fails if the broker rejects the
 * rename. `autosave` controls whether objects passing the filter during broker
 * ingestion are saved as sources to the filter's group. Requires the "Upload
 * data" permission and group- or system-admin access to the filter's group.
 *
 * @since 1.0.0
 * @category Requests
 * @param filterId - ID of the filter to update.
 * @param payload - The fields to change.
 */
export const updateFilter = async (client: Http.Client, filterId: number, payload: FilterPatch): Promise<void> => {
    await Http.patch(client, `/api/filters/${filterId}`, Http.body(payload));
};

/**
 * Delete a filter.
 *
 * Requires the "Upload data" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param filterId - ID of the filter to delete.
 */
export const deleteFilter = async (client: Http.Client, filterId: number): Promise<void> => {
    await Http.del(client, `/api/filters/${filterId}`);
};
