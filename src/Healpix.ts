/**
 * Typed endpoint functions for `/api/healpix`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";

/**
 * Counts of objects with and without a HEALPix index.
 *
 * @since 1.0.0
 * @category Models
 */
export const HealpixCounts = Schemas.model(
    v.strictObject({
        totalWithoutHealpix: v.optional(Schemas.Integer, 0),
        totalWithHealpix: v.optional(Schemas.Integer, 0),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type HealpixCounts = v.InferOutput<typeof HealpixCounts>;

/**
 * Result of a HEALPix backfill batch.
 *
 * @since 1.0.0
 * @category Models
 */
export const HealpixUpdate = Schemas.model(
    v.strictObject({
        totalMatches: v.optional(Schemas.Integer, 0),
        pageNumber: v.optional(Schemas.Integer, 1),
        numPerPage: v.optional(Schemas.Integer, 100),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type HealpixUpdate = v.InferOutput<typeof HealpixUpdate>;

/**
 * Count the objects with and without a HEALPix index.
 *
 * Requires the System admin ACL.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchHealpixCounts = async (client: Http.Client): Promise<HealpixCounts> =>
    Http.decode(HealpixCounts, await Http.get(client, "/api/healpix"));

/**
 * Options for a HEALPix backfill batch.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PostHealpixUpdateOptions {
    /**
     * Pagination controls; the server defaults to page 1 and 100 per page, and
     * caps `numPerPage` at 500.
     */
    readonly pageNumber?: number | undefined;
    readonly numPerPage?: number | undefined;
}

/**
 * Compute HEALPix indices for one batch of objects that lack them.
 *
 * Requires the System admin ACL. `totalMatches` in the response counts the
 * objects still missing a HEALPix index before this batch ran.
 *
 * @since 1.0.0
 * @category Requests
 */
export const postHealpixUpdate = async (
    client: Http.Client,
    options: PostHealpixUpdateOptions = {}
): Promise<HealpixUpdate> =>
    Http.decode(
        HealpixUpdate,
        await Http.post(client, "/api/healpix", undefined, {
            pageNumber: options.pageNumber ?? 1,
            numPerPage: options.numPerPage ?? 100,
        })
    );
