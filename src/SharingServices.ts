/**
 * Typed endpoint functions for `/api/sharing_service`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Http from "./Http.ts";
import * as Instruments from "./Instruments.ts";
import * as Schemas from "./Schemas.ts";
import * as Sources from "./Sources.ts";
import * as Streams from "./Streams.ts";

/**
 * Which photometry a sharing service publishes (upstream
 * `PHOTOMETRY_OPTIONS`).
 *
 * The server fills in every option it knows about, defaulting each to true, so
 * a stored value always carries the full set.
 *
 * @since 1.0.0
 * @category Models
 */
export const PhotometryOptions = Schemas.model(
    v.strictObject({
        first_and_last_detections: Schemas.NullishBoolean,
        auto_sharing_allow_archival: Schemas.NullishBoolean,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type PhotometryOptions = v.InferOutput<typeof PhotometryOptions>;

/**
 * A coauthor of a service's submissions (upstream `SharingServiceCoauthor`).
 *
 * @since 1.0.0
 * @category Models
 */
export const SharingServiceCoauthor = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        sharing_service_id: Schemas.NullishInteger,
        user_id: Schemas.NullishInteger,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SharingServiceCoauthor = v.InferOutput<typeof SharingServiceCoauthor>;

/**
 * An auto-publisher (upstream `SharingServiceGroupAutoPublisher`).
 *
 * `user_id` is a column property derived from `group_user_id` rather than a
 * stored column.
 *
 * @since 1.0.0
 * @category Models
 */
export const SharingServiceGroupAutoPublisher = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        sharing_service_group_id: Schemas.NullishInteger,
        group_user_id: Schemas.NullishInteger,
        user_id: Schemas.NullishInteger,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SharingServiceGroupAutoPublisher = v.InferOutput<typeof SharingServiceGroupAutoPublisher>;

/**
 * A group's access to a service (upstream `SharingServiceGroup`).
 *
 * The `group` and `sharing_service` relationships are never eager-loaded by
 * the endpoints, so they never appear and are not declared.
 *
 * @since 1.0.0
 * @category Models
 */
export const SharingServiceGroup = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        sharing_service_id: Schemas.NullishInteger,
        group_id: Schemas.NullishInteger,
        owner: Schemas.NullishBoolean,
        auto_share_to_tns: Schemas.NullishBoolean,
        auto_share_to_hermes: Schemas.NullishBoolean,
        auto_sharing_allow_bots: Schemas.NullishBoolean,
        auto_publishers: Schemas.list(SharingServiceGroupAutoPublisher),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SharingServiceGroup = v.InferOutput<typeof SharingServiceGroup>;

/**
 * A service publishing objects externally (upstream `SharingService`).
 *
 * `owner_group_ids` is not a column: the endpoint derives it from the owning
 * entries of `groups` and injects it. The encrypted TNS credentials
 * (`_tns_altdata`) are never serialized, and the `submissions` relationship is
 * never eager-loaded, so neither is declared.
 *
 * @since 1.0.0
 * @category Models
 */
export const SharingService = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        name: Schemas.NullishString,
        acknowledgments: Schemas.NullishString,
        testing: Schemas.NullishBoolean,
        photometry_options: Schemas.nullish(PhotometryOptions),
        enable_sharing_with_tns: Schemas.NullishBoolean,
        enable_sharing_with_hermes: Schemas.NullishBoolean,
        tns_bot_name: Schemas.NullishString,
        tns_bot_id: Schemas.NullishInteger,
        tns_source_group_id: Schemas.NullishInteger,
        publish_existing_tns_objects: Schemas.NullishBoolean,
        owner_group_ids: Schemas.list(Schemas.Integer),
        groups: Schemas.list(SharingServiceGroup),
        coauthors: Schemas.list(SharingServiceCoauthor),
        instruments: Schemas.list(Instruments.Instrument),
        streams: Schemas.list(Streams.Stream),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SharingService = v.InferOutput<typeof SharingService>;

/**
 * A publication request (upstream `SharingServiceSubmission`).
 *
 * `tns_name` is not a column: the endpoint copies it off the submitted object.
 * `tns_payload`, `tns_response` and `hermes_response` are deferred upstream and
 * only appear when explicitly requested. The `user` and `sharing_service`
 * relationships are never eager-loaded, so they are not declared.
 *
 * @since 1.0.0
 * @category Models
 */
export const SharingServiceSubmission = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        sharing_service_id: Schemas.NullishInteger,
        obj_id: Schemas.NullishString,
        obj: Schemas.nullish(Sources.Source),
        tns_name: Schemas.NullishString,
        user_id: Schemas.NullishInteger,
        custom_publishing_string: Schemas.NullishString,
        custom_remarks_string: Schemas.NullishString,
        publish_to_tns: Schemas.NullishBoolean,
        tns_status: Schemas.NullishString,
        tns_submission_id: Schemas.NullishInteger,
        tns_payload: Schemas.nullish(Schemas.JsonObject),
        tns_response: Schemas.nullish(Schemas.JsonObject),
        publish_to_hermes: Schemas.NullishBoolean,
        hermes_status: Schemas.NullishString,
        hermes_response: Schemas.nullish(Schemas.JsonObject),
        archival: Schemas.NullishBoolean,
        archival_comment: Schemas.NullishString,
        auto_submission: Schemas.NullishBoolean,
        instrument_ids: Schemas.nullish(v.array(Schemas.Integer)),
        stream_ids: Schemas.nullish(v.array(Schemas.Integer)),
        photometry_options: Schemas.nullish(PhotometryOptions),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SharingServiceSubmission = v.InferOutput<typeof SharingServiceSubmission>;

/**
 * One page of results from a sharing service submissions query.
 *
 * @since 1.0.0
 * @category Models
 */
export const SharingServiceSubmissionsPage = Schemas.model(
    v.strictObject({
        sharing_service_id: Schemas.NullishInteger,
        submissions: Schemas.list(SharingServiceSubmission),
        totalMatches: v.optional(Schemas.Integer, 0),
        pageNumber: v.optional(Schemas.Integer, 1),
        numPerPage: v.optional(Schemas.Integer, 100),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SharingServiceSubmissionsPage = v.InferOutput<typeof SharingServiceSubmissionsPage>;

/**
 * Payload for creating or updating a sharing service.
 *
 * @since 1.0.0
 * @category Models
 */
export interface SharingServicePost {
    readonly name: string;
    readonly owner_group_ids?: ReadonlyArray<number> | undefined;
    readonly instrument_ids?: ReadonlyArray<number> | undefined;
    readonly stream_ids?: ReadonlyArray<number> | undefined;
    readonly acknowledgments?: string | undefined;
    readonly testing?: boolean | undefined;
    readonly photometry_options?: PhotometryOptions | undefined;
    readonly enable_sharing_with_tns?: boolean | undefined;
    readonly enable_sharing_with_hermes?: boolean | undefined;
    readonly tns_bot_name?: string | undefined;
    readonly tns_bot_id?: number | undefined;
    readonly tns_source_group_id?: number | undefined;
    readonly _tns_altdata?: Record<string, unknown> | undefined;
    readonly publish_existing_tns_objects?: boolean | undefined;
}

/**
 * Payload for requesting the publication of an object.
 *
 * At least one of `publish_to_tns` and `publish_to_hermes` must be true,
 * `publishers` must be a non-empty string, and `archival_comment` is required
 * when `archival` is true.
 *
 * @since 1.0.0
 * @category Models
 */
export interface SharingServiceSubmissionPost {
    readonly obj_id: string;
    readonly sharing_service_id: number;
    readonly publishers: string;
    readonly remarks?: string | undefined;
    readonly archival?: boolean | undefined;
    readonly archival_comment?: string | undefined;
    readonly instrument_ids?: ReadonlyArray<number> | undefined;
    readonly stream_ids?: ReadonlyArray<number> | undefined;
    readonly photometry_options?: PhotometryOptions | undefined;
    readonly publish_to_tns?: boolean | undefined;
    readonly publish_to_hermes?: boolean | undefined;
}

/**
 * Result of creating or updating a sharing service.
 *
 * @since 1.0.0
 * @category Models
 */
export const SharingServicePutResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type SharingServicePutResponse = v.InferOutput<typeof SharingServicePutResponse>;

/**
 * Result of adding a coauthor to a sharing service.
 *
 * @since 1.0.0
 * @category Models
 */
export const SharingServiceCoauthorPostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type SharingServiceCoauthorPostResponse = v.InferOutput<typeof SharingServiceCoauthorPostResponse>;

/**
 * Result of granting or editing a group's access to a service.
 *
 * @since 1.0.0
 * @category Models
 */
export const SharingServiceGroupPutResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type SharingServiceGroupPutResponse = v.InferOutput<typeof SharingServiceGroupPutResponse>;

/**
 * Result of adding auto-publishers to a sharing service group.
 *
 * @since 1.0.0
 * @category Models
 */
export const SharingServiceAutoPublishersPostResponse = Schemas.model(
    v.strictObject({
        ids: Schemas.list(Schemas.Integer),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SharingServiceAutoPublishersPostResponse = v.InferOutput<typeof SharingServiceAutoPublishersPostResponse>;

/**
 * Retrieve all sharing services visible to the token.
 *
 * Only services shared with one of the caller's groups are returned, unless
 * the caller is a system admin. The TNS credentials (`_tns_altdata`) are never
 * included in the response.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchSharingServices = async (client: Http.Client): Promise<Array<SharingService>> =>
    Http.decode(v.array(SharingService), await Http.get(client, "/api/sharing_service"));

/**
 * Retrieve a single sharing service by ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param sharingServiceId - ID of the sharing service.
 */
export const fetchSharingService = async (client: Http.Client, sharingServiceId: number): Promise<SharingService> =>
    Http.decode(SharingService, await Http.get(client, `/api/sharing_service/${sharingServiceId}`));

/**
 * Create a sharing service.
 *
 * `name` must be unique and at least one instrument must be given.
 * `owner_group_ids` lists the groups that will own the service; owner groups
 * are created with all their auto-sharing flags off. If
 * `enable_sharing_with_tns` is true, then `tns_bot_id`, `tns_source_group_id`
 * and a `_tns_altdata` containing an `api_key` are all required. `testing`
 * defaults to true server-side, meaning payloads are stored but nothing is
 * actually published.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The service to create.
 */
export const postSharingService = async (
    client: Http.Client,
    payload: SharingServicePost
): Promise<SharingServicePutResponse> =>
    Http.decode(SharingServicePutResponse, await Http.put(client, "/api/sharing_service", Http.body(payload)));

/**
 * Update an existing sharing service.
 *
 * Omitted fields are left unchanged, so `name` may simply repeat the current
 * name. `owner_group_ids` is ignored here; use
 * {@link updateSharingServiceGroup} to change ownership. Instruments are only
 * replaced when `instrument_ids` is non-empty, while `stream_ids` always
 * replaces the current streams. Disabling TNS or Hermes sharing also clears
 * the matching auto-sharing flags on every group of the service.
 *
 * @since 1.0.0
 * @category Requests
 * @param sharingServiceId - ID of the sharing service to update.
 * @param payload - The new values.
 */
export const updateSharingService = async (
    client: Http.Client,
    sharingServiceId: number,
    payload: SharingServicePost
): Promise<SharingServicePutResponse> =>
    Http.decode(
        SharingServicePutResponse,
        await Http.put(client, `/api/sharing_service/${sharingServiceId}`, Http.body(payload))
    );

/**
 * Delete a sharing service.
 *
 * @since 1.0.0
 * @category Requests
 * @param sharingServiceId - ID of the sharing service to delete. Only a member
 *   of one of its owner groups may delete it.
 */
export const deleteSharingService = async (client: Http.Client, sharingServiceId: number): Promise<void> => {
    await Http.del(client, `/api/sharing_service/${sharingServiceId}`);
};

/**
 * Request the publication of an object through a sharing service.
 *
 * Submitting the same object to the same destination twice through the same
 * service is rejected. The submission is queued and processed asynchronously;
 * poll {@link fetchSharingServiceSubmissions} for its status.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The submission to queue.
 */
export const postSharingServiceSubmission = async (
    client: Http.Client,
    payload: SharingServiceSubmissionPost
): Promise<void> => {
    await Http.post(client, "/api/sharing_service/submission", Http.body(payload));
};

/**
 * Retrieve a single sharing service submission by ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param sharingServiceSubmissionId - ID of the submission.
 * @param sharingServiceId - ID of the sharing service the submission belongs
 *   to. Required by the endpoint even though the submission ID is unique.
 */
export const fetchSharingServiceSubmission = async (
    client: Http.Client,
    sharingServiceSubmissionId: number,
    sharingServiceId: number
): Promise<SharingServiceSubmission> =>
    Http.decode(
        SharingServiceSubmission,
        await Http.get(client, `/api/sharing_service/submission/${sharingServiceSubmissionId}`, {
            sharing_service_id: sharingServiceId,
        })
    );

/**
 * Options for querying a sharing service's submissions.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchSharingServiceSubmissionsOptions {
    /** Pagination controls. Submissions are returned newest first. */
    readonly pageNumber?: number | undefined;
    readonly numPerPage?: number | undefined;
    /** Include the payload sent to TNS, which is deferred by default. */
    readonly includePayload?: boolean | undefined;
    /**
     * Include the raw response from the external service, which is deferred by
     * default.
     */
    readonly includeResponse?: boolean | undefined;
    /** Restrict to submissions of this object. */
    readonly objectId?: string | undefined;
}

/**
 * Query the submissions of a sharing service, one page at a time.
 *
 * @since 1.0.0
 * @category Requests
 * @param sharingServiceId - ID of the sharing service whose submissions are
 *   queried.
 */
export const fetchSharingServiceSubmissions = async (
    client: Http.Client,
    sharingServiceId: number,
    options: FetchSharingServiceSubmissionsOptions = {}
): Promise<SharingServiceSubmissionsPage> =>
    Http.decode(
        SharingServiceSubmissionsPage,
        await Http.get(client, "/api/sharing_service/submission", {
            sharing_service_id: sharingServiceId,
            pageNumber: options.pageNumber ?? 1,
            numPerPage: options.numPerPage ?? 100,
            include_payload: options.includePayload ?? false,
            include_response: options.includeResponse ?? false,
            objectID: options.objectId,
        })
    );

/**
 * Add a coauthor to a sharing service.
 *
 * @since 1.0.0
 * @category Requests
 * @param sharingServiceId - ID of the sharing service.
 * @param userId - ID of the user to credit as a coauthor. The user must have at
 *   least one affiliation set in their profile and must not be a bot.
 */
export const postSharingServiceCoauthor = async (
    client: Http.Client,
    sharingServiceId: number,
    userId: number
): Promise<SharingServiceCoauthorPostResponse> =>
    Http.decode(
        SharingServiceCoauthorPostResponse,
        await Http.post(client, `/api/sharing_service/${sharingServiceId}/coauthor/${userId}`)
    );

/**
 * Remove a coauthor from a sharing service.
 *
 * @since 1.0.0
 * @category Requests
 * @param sharingServiceId - ID of the sharing service.
 * @param userId - ID of the user to remove as a coauthor.
 */
export const deleteSharingServiceCoauthor = async (
    client: Http.Client,
    sharingServiceId: number,
    userId: number
): Promise<void> => {
    await Http.del(client, `/api/sharing_service/${sharingServiceId}/coauthor/${userId}`);
};

/**
 * Options for a group's access to a sharing service.
 *
 * When the group already has access, at least one of the options must be
 * given; otherwise omitted options default to false on the new access.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpdateSharingServiceGroupOptions {
    /**
     * Whether the group owns the sharing service. Ownership cannot be removed
     * from the only owning group.
     */
    readonly owner?: boolean | undefined;
    /**
     * Whether new sources saved to the group are published automatically.
     */
    readonly autoShareToTns?: boolean | undefined;
    readonly autoShareToHermes?: boolean | undefined;
    /**
     * Whether bot users may act as auto-publishers. It cannot be turned off
     * while a bot is still listed as an auto-publisher.
     */
    readonly autoSharingAllowBots?: boolean | undefined;
}

/**
 * Give a group access to a sharing service, or edit its settings.
 *
 * @since 1.0.0
 * @category Requests
 * @param sharingServiceId - ID of the sharing service.
 * @param groupId - ID of the group to add or edit.
 */
export const updateSharingServiceGroup = async (
    client: Http.Client,
    sharingServiceId: number,
    groupId: number,
    options: UpdateSharingServiceGroupOptions = {}
): Promise<SharingServiceGroupPutResponse> =>
    Http.decode(
        SharingServiceGroupPutResponse,
        await Http.put(
            client,
            `/api/sharing_service/${sharingServiceId}/group/${groupId}`,
            Http.body({
                owner: options.owner,
                auto_share_to_tns: options.autoShareToTns,
                auto_share_to_hermes: options.autoShareToHermes,
                auto_sharing_allow_bots: options.autoSharingAllowBots,
            })
        )
    );

/**
 * Remove a group's access to a sharing service.
 *
 * @since 1.0.0
 * @category Requests
 * @param sharingServiceId - ID of the sharing service.
 * @param groupId - ID of the group to remove. The only group owning the service
 *   cannot be removed; add another owner group first.
 */
export const deleteSharingServiceGroup = async (
    client: Http.Client,
    sharingServiceId: number,
    groupId: number
): Promise<void> => {
    await Http.del(client, `/api/sharing_service/${sharingServiceId}/group/${groupId}`);
};

/**
 * Add auto-publishers to a group of a sharing service.
 *
 * @since 1.0.0
 * @category Requests
 * @param sharingServiceId - ID of the sharing service.
 * @param groupId - ID of the group, which must already have access to the
 *   service.
 * @param userIds - IDs of the users to add. Each must be a member of the group
 *   and have at least one affiliation set in their profile. Bot users are only
 *   accepted when the group has `auto_sharing_allow_bots` set. The request
 *   fails as a whole if any user is rejected.
 */
export const postSharingServiceAutoPublishers = async (
    client: Http.Client,
    sharingServiceId: number,
    groupId: number,
    userIds: ReadonlyArray<number>
): Promise<SharingServiceAutoPublishersPostResponse> =>
    Http.decode(
        SharingServiceAutoPublishersPostResponse,
        await Http.post(client, `/api/sharing_service/${sharingServiceId}/group/${groupId}/auto_publisher`, {
            user_ids: userIds,
        })
    );

/**
 * Remove auto-publishers from a group of a sharing service.
 *
 * @since 1.0.0
 * @category Requests
 * @param sharingServiceId - ID of the sharing service.
 * @param groupId - ID of the group.
 * @param userIds - IDs of the users to remove. Each must currently be an
 *   auto-publisher of the group; the request fails as a whole otherwise.
 */
export const deleteSharingServiceAutoPublishers = async (
    client: Http.Client,
    sharingServiceId: number,
    groupId: number,
    userIds: ReadonlyArray<number>
): Promise<void> => {
    await Http.del(client, `/api/sharing_service/${sharingServiceId}/group/${groupId}/auto_publisher`, {
        user_ids: userIds,
    });
};
