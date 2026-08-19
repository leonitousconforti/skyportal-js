/**
 * Typed endpoint functions for `/api/listing`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";

/**
 * An object saved by a user to a named list (upstream `Listing`).
 *
 * The handler returns bare `Listing` rows, so the `user` and `obj`
 * relationships are never loaded and are not declared here.
 *
 * @since 1.0.0
 * @category Models
 */
export const Listing = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        user_id: Schemas.Integer,
        obj_id: v.string(),
        list_name: v.string(),
        params: Schemas.nullish(Schemas.JsonObject),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type Listing = v.InferOutput<typeof Listing>;

/**
 * Payload for adding an object to a user's list.
 *
 * `list_name` is user-defined and must start with an alphanumeric character or
 * underscore; `"favorites"` and `"rejected_candidates"` have special meaning
 * in the web app. `user_id` defaults to the token's own user, and only admins
 * may add listings to other users' accounts. `params` is required for the
 * `"watchlist"` list and must contain numeric `arcsec` (0 to 3600) and
 * `cadence` (1 or more) keys, plus an optional boolean `end_of_night`. A given
 * user, object, and list name combination may only be saved once.
 *
 * @since 1.0.0
 * @category Models
 */
export interface ListingPost {
    readonly obj_id: string;
    readonly list_name: string;
    readonly user_id?: number | undefined;
    readonly params?: Record<string, unknown> | undefined;
}

/**
 * Result of adding an object to a user's list.
 *
 * @since 1.0.0
 * @category Models
 */
export const ListingPostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type ListingPostResponse = v.InferOutput<typeof ListingPostResponse>;

/**
 * Options for listing a user's saved objects.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchListingsOptions {
    /** User whose listings to retrieve. Defaults to the token's own user. */
    readonly userId?: number | undefined;
    /**
     * Only return entries of this list, e.g. `"favorites"`. If omitted,
     * entries from all of the user's lists are returned.
     */
    readonly listName?: string | undefined;
}

/**
 * Retrieve the objects a user has saved to their lists.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchListings = async (client: Http.Client, options: FetchListingsOptions = {}): Promise<Array<Listing>> =>
    Http.decode(
        v.array(Listing),
        await Http.get(client, options.userId === undefined ? "/api/listing" : `/api/listing/${options.userId}`, {
            listName: options.listName,
        })
    );

/**
 * Add an object to one of a user's lists.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The entry to create.
 */
export const postListing = async (client: Http.Client, payload: ListingPost): Promise<ListingPostResponse> =>
    Http.decode(ListingPostResponse, await Http.post(client, "/api/listing", Http.body(payload)));

/**
 * Options for updating a listing.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpdateListingOptions {
    /**
     * Move the listing to this user. Only system admins may set it to another
     * user. Defaults to leaving the owner unchanged.
     */
    readonly userId?: number | undefined;
    /** Point the listing at this object instead. */
    readonly objId?: string | undefined;
    /**
     * Rename the list this entry belongs to; must start with an alphanumeric
     * character or underscore.
     */
    readonly listName?: string | undefined;
}

/**
 * Update an existing listing.
 *
 * @since 1.0.0
 * @category Requests
 * @param listingId - ID of the listing to update.
 */
export const updateListing = async (
    client: Http.Client,
    listingId: number,
    options: UpdateListingOptions = {}
): Promise<void> => {
    await Http.patch(
        client,
        `/api/listing/${listingId}`,
        Http.body({
            user_id: options.userId,
            obj_id: options.objId,
            list_name: options.listName,
        })
    );
};

/**
 * Remove a listing by ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param listingId - ID of the listing to remove.
 */
export const deleteListing = async (client: Http.Client, listingId: number): Promise<void> => {
    await Http.del(client, `/api/listing/${listingId}`);
};

/**
 * Options for removing a listing by name.
 *
 * @since 1.0.0
 * @category Models
 */
export interface DeleteListingByNameOptions {
    /** Owner of the listing. Defaults to the token's own user. */
    readonly userId?: number | undefined;
}

/**
 * Remove a listing identified by its object and list name.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the listed source.
 * @param listName - Name of the list holding the entry, e.g. `"favorites"`.
 */
export const deleteListingByName = async (
    client: Http.Client,
    objId: string,
    listName: string,
    options: DeleteListingByNameOptions = {}
): Promise<void> => {
    await Http.del(client, "/api/listing", Http.body({ obj_id: objId, list_name: listName, user_id: options.userId }));
};
