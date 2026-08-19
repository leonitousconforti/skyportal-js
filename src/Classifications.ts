/**
 * Typed endpoint functions for classifications.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Groups from "./Groups.ts";
import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";
import * as Taxonomies from "./Taxonomies.ts";

/**
 * A vote on a classification (upstream `ClassificationVote`).
 *
 * @since 1.0.0
 * @category Models
 */
export const ClassificationVote = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        classification_id: Schemas.NullishInteger,
        voter_id: Schemas.NullishInteger,
        vote: Schemas.NullishInteger,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type ClassificationVote = v.InferOutput<typeof ClassificationVote>;

/**
 * An edit of a classification's probability (upstream `ClassificationEdit`).
 *
 * @since 1.0.0
 * @category Models
 */
export const ClassificationEdit = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        classification_id: Schemas.NullishInteger,
        editor_id: Schemas.NullishInteger,
        editor_name: Schemas.NullishString,
        old_probability: Schemas.NullishNumber,
        new_probability: Schemas.NullishNumber,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type ClassificationEdit = v.InferOutput<typeof ClassificationEdit>;

/**
 * A classification of a source (upstream `Classification`).
 *
 * `obj` stays free-form because typing it as
 * {@link skyportal-js/Sources!Source} would import in a circle: `Sources`
 * already imports this module.
 *
 * @since 1.0.0
 * @category Models
 */
export const Classification = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        obj_id: v.string(),
        classification: v.string(),
        taxonomy_id: Schemas.Integer,
        probability: Schemas.NullishNumber,
        author_name: Schemas.NullishString,
        author_id: Schemas.NullishInteger,
        origin: Schemas.NullishString,
        ml: Schemas.NullishBoolean,
        taxonomy: Schemas.nullish(Taxonomies.Taxonomy),
        votes: Schemas.nullish(v.array(ClassificationVote)),
        edits: Schemas.nullish(v.array(ClassificationEdit)),
        groups: Schemas.nullish(v.array(Groups.Group)),
        author: Schemas.nullish(Schemas.JsonObject),
        obj: Schemas.nullish(Schemas.JsonObject),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type Classification = v.InferOutput<typeof Classification>;

/**
 * Payload for posting a classification.
 *
 * `classification` must be a class in the taxonomy identified by
 * `taxonomy_id`. If `group_ids` is omitted, the server applies its default
 * visibility.
 *
 * @since 1.0.0
 * @category Models
 */
export interface ClassificationPost {
    readonly obj_id: string;
    readonly classification: string;
    readonly taxonomy_id: number;
    readonly origin?: string | undefined;
    readonly probability?: number | undefined;
    readonly ml?: boolean | undefined;
    readonly group_ids?: ReadonlyArray<number> | undefined;
    readonly vote?: boolean | undefined;
    readonly label?: boolean | undefined;
}

/**
 * Result of posting a classification.
 *
 * @since 1.0.0
 * @category Models
 */
export const ClassificationPostResponse = Schemas.model(
    v.strictObject({
        classification_id: Schemas.Integer,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type ClassificationPostResponse = v.InferOutput<typeof ClassificationPostResponse>;

/**
 * Result of posting a batch of classifications.
 *
 * @since 1.0.0
 * @category Models
 */
export const ClassificationsPostResponse = Schemas.model(
    v.strictObject({
        classification_ids: Schemas.list(Schemas.Integer),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type ClassificationsPostResponse = v.InferOutput<typeof ClassificationsPostResponse>;

/**
 * One page of results from a classifications query.
 *
 * @since 1.0.0
 * @category Models
 */
export const ClassificationsPage = Schemas.model(
    v.strictObject({
        classifications: Schemas.list(Classification),
        totalMatches: v.optional(Schemas.Integer, 0),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type ClassificationsPage = v.InferOutput<typeof ClassificationsPage>;

/**
 * Payload for updating a classification.
 *
 * @since 1.0.0
 * @category Models
 */
export interface ClassificationUpdate {
    readonly classification?: string | undefined;
    readonly taxonomy_id?: number | undefined;
    readonly probability?: number | undefined;
    readonly origin?: string | undefined;
    readonly ml?: boolean | undefined;
    /** If provided, replaces the set of groups that can view the classification. */
    readonly group_ids?: ReadonlyArray<number> | undefined;
}

/**
 * Options for listing a source's classifications.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchClassificationsOptions {
    /**
     * Aggregate classifications from every object linked through the source's
     * SuperObj.
     */
    readonly includeSuperObjs?: boolean | undefined;
}

/**
 * Retrieve the classifications of a source.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the source, e.g. `"ZTF20abcdef"`.
 */
export const fetchClassifications = async (
    client: Http.Client,
    objId: string,
    options: FetchClassificationsOptions = {}
): Promise<Array<Classification>> =>
    Http.decode(
        v.array(Classification),
        await Http.get(client, `/api/sources/${objId}/classifications`, {
            includeSuperObjs: options.includeSuperObjs ?? false,
        })
    );

/**
 * Post a classification of a source.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The classification to post.
 */
export const postClassification = async (
    client: Http.Client,
    payload: ClassificationPost
): Promise<ClassificationPostResponse> =>
    Http.decode(ClassificationPostResponse, await Http.post(client, "/api/classification", Http.body(payload)));

/**
 * Post several classifications in one request.
 *
 * @since 1.0.0
 * @category Requests
 * @param payloads - The classifications to post; same semantics as
 *   {@link postClassification}, applied per entry.
 */
export const postClassifications = async (
    client: Http.Client,
    payloads: ReadonlyArray<ClassificationPost>
): Promise<ClassificationsPostResponse> =>
    Http.decode(
        ClassificationsPostResponse,
        await Http.post(client, "/api/classification", {
            classifications: payloads.map((payload) => Http.body(payload)),
        })
    );

/**
 * Delete a classification.
 *
 * @since 1.0.0
 * @category Requests
 * @param classificationId - ID of the classification to delete.
 */
export const deleteClassification = async (client: Http.Client, classificationId: number): Promise<void> => {
    await Http.del(client, `/api/classification/${classificationId}`);
};

/**
 * Options for retrieving a single classification.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchClassificationOptions {
    /** Include the associated taxonomy in the response. */
    readonly includeTaxonomy?: boolean | undefined;
}

/**
 * Retrieve a single classification by ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param classificationId - ID of the classification.
 */
export const fetchClassification = async (
    client: Http.Client,
    classificationId: number,
    options: FetchClassificationOptions = {}
): Promise<Classification> =>
    Http.decode(
        Classification,
        await Http.get(client, `/api/classification/${classificationId}`, {
            includeTaxonomy: options.includeTaxonomy ?? false,
        })
    );

/**
 * Options for querying all accessible classifications.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchClassificationsQueryOptions {
    /**
     * Pagination controls. `numPerPage` defaults to 100 and is capped
     * server-side at 500.
     */
    readonly pageNumber?: number | undefined;
    readonly numPerPage?: number | undefined;
    /**
     * Restrict to classifications created in this date range, as ISO-format
     * date strings, e.g. `"2020-01-01"`.
     */
    readonly startDate?: string | undefined;
    readonly endDate?: string | undefined;
    /** Include each classification's associated taxonomy. */
    readonly includeTaxonomy?: boolean | undefined;
}

/**
 * Query all accessible classifications, one page at a time.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchClassificationsQuery = async (
    client: Http.Client,
    options: FetchClassificationsQueryOptions = {}
): Promise<ClassificationsPage> =>
    Http.decode(
        ClassificationsPage,
        await Http.get(client, "/api/classification", {
            pageNumber: options.pageNumber ?? 1,
            numPerPage: options.numPerPage ?? 100,
            includeTaxonomy: options.includeTaxonomy ?? false,
            startDate: options.startDate,
            endDate: options.endDate,
        })
    );

/**
 * Update a classification.
 *
 * Only the provided fields are sent. Note that the server treats an omitted
 * `ml` flag as `false`, so pass `ml: true` on every update of a
 * machine-learning classification to preserve it.
 *
 * @since 1.0.0
 * @category Requests
 * @param classificationId - ID of the classification to update.
 * @param payload - The fields to change.
 */
export const updateClassification = async (
    client: Http.Client,
    classificationId: number,
    payload: ClassificationUpdate
): Promise<void> => {
    await Http.put(client, `/api/classification/${classificationId}`, Http.body(payload));
};

/**
 * Options for deleting a source's classifications.
 *
 * @since 1.0.0
 * @category Models
 */
export interface DeleteSourceClassificationsOptions {
    /**
     * Whether to also record a source label for the deleting user in each
     * affected group. The server defaults to `true`.
     */
    readonly label?: boolean | undefined;
}

/**
 * Delete all of a source's classifications.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the source whose classifications are deleted.
 */
export const deleteSourceClassifications = async (
    client: Http.Client,
    objId: string,
    options: DeleteSourceClassificationsOptions = {}
): Promise<void> => {
    await Http.del(
        client,
        `/api/sources/${objId}/classifications`,
        options.label === undefined ? undefined : { label: options.label }
    );
};

/**
 * Vote on a classification.
 *
 * A user has at most one vote per classification; voting again overwrites the
 * previous vote.
 *
 * @since 1.0.0
 * @category Requests
 * @param classificationId - ID of the classification to vote on.
 * @param vote - The vote value, generally `1` (upvote) or `-1` (downvote).
 */
export const postClassificationVote = async (
    client: Http.Client,
    classificationId: number,
    vote: number
): Promise<void> => {
    await Http.post(client, `/api/classification/votes/${classificationId}`, { vote });
};

/**
 * Delete the token user's vote on a classification.
 *
 * @since 1.0.0
 * @category Requests
 * @param classificationId - ID of the classification whose vote is removed.
 */
export const deleteClassificationVote = async (client: Http.Client, classificationId: number): Promise<void> => {
    await Http.del(client, `/api/classification/votes/${classificationId}`);
};

/**
 * Options for listing classified sources.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchSourcesByClassificationOptions {
    /**
     * Restrict to classifications created in this date range, as ISO-format
     * date strings, e.g. `"2020-01-01"`.
     */
    readonly startDate?: string | undefined;
    readonly endDate?: string | undefined;
}

/**
 * Retrieve the object IDs of sources that have classifications.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchSourcesByClassification = async (
    client: Http.Client,
    options: FetchSourcesByClassificationOptions = {}
): Promise<Array<string>> =>
    Http.decode(
        v.array(v.string()),
        await Http.get(client, "/api/classification/sources", {
            startDate: options.startDate,
            endDate: options.endDate,
        })
    );
