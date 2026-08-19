/**
 * Typed endpoint functions for `/api/followup_request`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Allocations from "./Allocations.ts";
import * as Groups from "./Groups.ts";
import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";
import * as Users from "./Users.ts";

/**
 * A serialized exchange with a facility (upstream `FacilityTransaction`).
 *
 * `followup_request` and `observation_plan_request` are the parent rows; they
 * stay free-form to avoid a circular import back into this module and into
 * {@link skyportal-js/ObservationPlans}.
 *
 * @since 1.0.0
 * @category Models
 */
export const FacilityTransaction = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        request: Schemas.nullish(Schemas.JsonObject),
        response: Schemas.nullish(Schemas.JsonObject),
        followup_request_id: Schemas.NullishInteger,
        observation_plan_request_id: Schemas.NullishInteger,
        initiator_id: Schemas.NullishInteger,
        initiator: Schemas.nullish(Users.User),
        followup_request: Schemas.nullish(Schemas.JsonObject),
        observation_plan_request: Schemas.nullish(Schemas.JsonObject),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type FacilityTransaction = v.InferOutput<typeof FacilityTransaction>;

/**
 * A queued facility call (upstream `FacilityTransactionRequest`).
 *
 * @since 1.0.0
 * @category Models
 */
export const FacilityTransactionRequest = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        last_query: Schemas.NullishTimestamp,
        method: Schemas.NullishString,
        endpoint: Schemas.NullishString,
        data: Schemas.nullish(Schemas.JsonObject),
        params: Schemas.nullish(Schemas.JsonObject),
        headers: Schemas.nullish(Schemas.JsonObject),
        status: Schemas.NullishString,
        followup_request_id: Schemas.NullishInteger,
        observation_plan_request_id: Schemas.NullishInteger,
        initiator_id: Schemas.NullishInteger,
        initiator: Schemas.nullish(Users.User),
        followup_request: Schemas.nullish(Schemas.JsonObject),
        observation_plan_request: Schemas.nullish(Schemas.JsonObject),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type FacilityTransactionRequest = v.InferOutput<typeof FacilityTransactionRequest>;

/**
 * A user watching a follow-up request (upstream `FollowupRequestUser`).
 *
 * @since 1.0.0
 * @category Models
 */
export const FollowupRequestWatcher = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        followuprequest_id: Schemas.NullishInteger,
        user_id: Schemas.NullishInteger,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type FollowupRequestWatcher = v.InferOutput<typeof FollowupRequestWatcher>;

/**
 * The fields of a {@link FollowupRequest}.
 *
 * @since 1.0.0
 * @category Models
 */
export const FollowupRequestEntries = {
    id: Schemas.Integer,
    created_at: Schemas.NullishTimestamp,
    modified: Schemas.NullishTimestamp,
    obj_id: Schemas.NullishString,
    allocation_id: Schemas.NullishInteger,
    requester_id: Schemas.NullishInteger,
    last_modified_by_id: Schemas.NullishInteger,
    payload: v.optional(Schemas.JsonObject, () => ({})),
    status: Schemas.NullishString,
    comment: Schemas.NullishString,
    obj: Schemas.nullish(Schemas.JsonObject),
    allocation: Schemas.nullish(Allocations.Allocation),
    requester: Schemas.nullish(Users.User),
    last_modified_by: Schemas.nullish(Users.User),
    target_groups: Schemas.list(Groups.Group),
    watchers: Schemas.list(FollowupRequestWatcher),
    transactions: Schemas.list(FacilityTransaction),
    transaction_requests: Schemas.list(FacilityTransactionRequest),
    photometry: Schemas.list(Schemas.JsonObject),
    photometric_series: Schemas.list(Schemas.JsonObject),
    spectra: Schemas.list(Schemas.JsonObject),
    rise_time_utc: Schemas.nullish(v.union([v.string(), v.array(v.string())])),
    set_time_utc: Schemas.nullish(v.union([v.string(), v.array(v.string())])),
};

/**
 * A follow-up observation request (upstream `FollowupRequest`).
 *
 * `obj` stays free-form because typing it as
 * {@link skyportal-js/Sources!Source} would create an import cycle; the same
 * applies to `photometry`, `photometric_series` and `spectra`, which all point
 * back at the requesting object.
 *
 * @since 1.0.0
 * @category Models
 */
export const FollowupRequest = Schemas.model(v.strictObject(FollowupRequestEntries));

/**
 * @since 1.0.0
 * @category Models
 */
export type FollowupRequest = v.InferOutput<typeof FollowupRequest>;

/**
 * One page of results from a follow-up requests query.
 *
 * @since 1.0.0
 * @category Models
 */
export const FollowupRequestsPage = Schemas.model(
    v.strictObject({
        followup_requests: Schemas.list(FollowupRequest),
        totalMatches: v.optional(Schemas.Integer, 0),
        pageNumber: v.optional(Schemas.Integer, 1),
        numPerPage: v.optional(Schemas.Integer, 100),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type FollowupRequestsPage = v.InferOutput<typeof FollowupRequestsPage>;

/**
 * Payload for submitting a follow-up request.
 *
 * `payload` holds the instrument-specific request parameters; the allocation's
 * instrument API defines its schema. If `target_group_ids` is omitted, the
 * server applies its default visibility to the results.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FollowupRequestPost {
    readonly obj_id: string;
    readonly allocation_id: number;
    readonly payload: Record<string, unknown>;
    readonly target_group_ids?: ReadonlyArray<number> | undefined;
}

/**
 * Result of submitting a follow-up request.
 *
 * @since 1.0.0
 * @category Models
 */
export const FollowupRequestPostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type FollowupRequestPostResponse = v.InferOutput<typeof FollowupRequestPostResponse>;

/**
 * A default follow-up request (upstream `DefaultFollowupRequest`).
 *
 * @since 1.0.0
 * @category Models
 */
export const DefaultFollowupRequest = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        requester_id: Schemas.NullishInteger,
        allocation_id: Schemas.NullishInteger,
        payload: v.optional(Schemas.JsonObject, () => ({})),
        default_followup_name: Schemas.NullishString,
        source_filter: Schemas.nullish(v.union([Schemas.JsonObject, v.string()])),
        constraints: Schemas.nullish(Schemas.JsonObject),
        priority_order: Schemas.NullishString,
        validity_days: Schemas.NullishInteger,
        comment: Schemas.NullishString,
        implements_update: Schemas.NullishBoolean,
        allocation: Schemas.nullish(Allocations.Allocation),
        requester: Schemas.nullish(Users.User),
        target_groups: Schemas.list(Groups.Group),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type DefaultFollowupRequest = v.InferOutput<typeof DefaultFollowupRequest>;

/**
 * Payload for creating a default follow-up request.
 *
 * `payload` holds the instrument-specific request parameters and must not
 * contain `start_date` or `end_date` (the server fills the real window when
 * the request fires on source save). `source_filter` decides which saved
 * sources trigger the request and is required.
 *
 * @since 1.0.0
 * @category Models
 */
export interface DefaultFollowupRequestPost {
    readonly allocation_id: number;
    readonly payload: Record<string, unknown>;
    readonly default_followup_name: string;
    readonly source_filter: Record<string, unknown>;
    readonly target_group_ids?: ReadonlyArray<number> | undefined;
    readonly comment?: string | undefined;
    readonly implements_update?: boolean | undefined;
    readonly priority_order?: string | undefined;
    readonly validity_days?: number | undefined;
    readonly radius?: number | undefined;
    readonly not_if_duplicates?: boolean | undefined;
    readonly source_group_ids?: ReadonlyArray<number> | undefined;
    readonly ignore_source_group_ids?: ReadonlyArray<number> | undefined;
    readonly not_if_classified?: boolean | undefined;
    readonly not_if_spectra_exist?: boolean | undefined;
    readonly not_if_tns_classified?: boolean | undefined;
    readonly not_if_tns_reported?: number | undefined;
    readonly not_if_assignment_exists?: boolean | undefined;
    readonly ignore_allocation_ids?: ReadonlyArray<number> | undefined;
}

/**
 * Result of creating a default follow-up request.
 *
 * @since 1.0.0
 * @category Models
 */
export const DefaultFollowupRequestPostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type DefaultFollowupRequestPostResponse = v.InferOutput<typeof DefaultFollowupRequestPostResponse>;

/**
 * Status of a follow-up request after a photometry retrieval.
 *
 * @since 1.0.0
 * @category Models
 */
export const PhotometryRequestStatus = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        request_status: Schemas.NullishString,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type PhotometryRequestStatus = v.InferOutput<typeof PhotometryRequestStatus>;

/**
 * Options for retrieving a single follow-up request.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchFollowupRequestOptions {
    /**
     * Load the target object's thumbnails with the request. On by default;
     * pass false to skip them.
     */
    readonly includeObjThumbnails?: boolean | undefined;
}

/**
 * Retrieve a single follow-up request by ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param followupRequestId - ID of the follow-up request.
 */
export const fetchFollowupRequest = async (
    client: Http.Client,
    followupRequestId: number,
    options: FetchFollowupRequestOptions = {}
): Promise<FollowupRequest> =>
    Http.decode(
        FollowupRequest,
        await Http.get(client, `/api/followup_request/${followupRequestId}`, {
            includeObjThumbnails: options.includeObjThumbnails ?? true,
        })
    );

/**
 * Options for querying follow-up requests.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchFollowupRequestsOptions {
    /** Pagination controls. */
    readonly pageNumber?: number | undefined;
    readonly numPerPage?: number | undefined;
    /** Restrict to requests whose object ID contains this string. */
    readonly sourceId?: string | undefined;
    /**
     * Restrict to requests on this instrument. Ignored if `allocationId` is
     * provided.
     */
    readonly instrumentId?: number | undefined;
    /** Restrict to requests under this allocation. */
    readonly allocationId?: number | undefined;
    /** Restrict to requests whose status matches this string. */
    readonly status?: string | undefined;
    /**
     * Restrict to requests created in this date range, as ISO-format date
     * strings, e.g. `"2020-01-01"`.
     */
    readonly startDate?: string | undefined;
    readonly endDate?: string | undefined;
    /**
     * Restrict to requests whose payload observation window falls in this date
     * range, as ISO-format date strings.
     */
    readonly observationStartDate?: string | undefined;
    readonly observationEndDate?: string | undefined;
    /** Restrict to requests with payload priority at or above this value. */
    readonly priorityThreshold?: number | undefined;
    /** Restrict to requests made by these user IDs. */
    readonly requesters?: ReadonlyArray<number> | undefined;
    /**
     * Field to sort by; one of `"created_at"`, `"modified"`, `"status"` or
     * `"obj"`.
     */
    readonly sortBy?: string | undefined;
    /** `"asc"` or `"desc"`. */
    readonly sortOrder?: string | undefined;
}

/**
 * Query follow-up requests, one page at a time.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchFollowupRequests = async (
    client: Http.Client,
    options: FetchFollowupRequestsOptions = {}
): Promise<FollowupRequestsPage> =>
    Http.decode(
        FollowupRequestsPage,
        await Http.get(client, "/api/followup_request", {
            pageNumber: options.pageNumber ?? 1,
            numPerPage: options.numPerPage ?? 100,
            sortBy: options.sortBy ?? "created_at",
            sortOrder: options.sortOrder ?? "asc",
            sourceID: options.sourceId,
            instrumentID: options.instrumentId,
            allocationID: options.allocationId,
            status: options.status,
            startDate: options.startDate,
            endDate: options.endDate,
            observationStartDate: options.observationStartDate,
            observationEndDate: options.observationEndDate,
            priorityThreshold: options.priorityThreshold,
            requesters: Http.commaSeparated(options.requesters),
        })
    );

/**
 * Submit a follow-up request.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The request to submit.
 */
export const postFollowupRequest = async (
    client: Http.Client,
    payload: FollowupRequestPost
): Promise<FollowupRequestPostResponse> =>
    Http.decode(FollowupRequestPostResponse, await Http.post(client, "/api/followup_request", Http.body(payload)));

/**
 * Delete a follow-up request.
 *
 * @since 1.0.0
 * @category Requests
 * @param followupRequestId - ID of the follow-up request to delete.
 */
export const deleteFollowupRequest = async (client: Http.Client, followupRequestId: number): Promise<void> => {
    await Http.del(client, `/api/followup_request/${followupRequestId}`);
};

/**
 * Options for updating a follow-up request.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpdateFollowupRequestOptions {
    /** New status for the request. */
    readonly status?: string | undefined;
    /** Object ID of the target. Required when `status` is omitted. */
    readonly objId?: string | undefined;
    /** Allocation for the request. Required when `status` is omitted. */
    readonly allocationId?: number | undefined;
    /**
     * Instrument-specific request parameters; the allocation's instrument API
     * defines its schema.
     */
    readonly payload?: Record<string, unknown> | undefined;
    /**
     * Restrict the results' visibility to these groups. If omitted, the
     * visibility is left unchanged.
     */
    readonly targetGroupIds?: ReadonlyArray<number> | undefined;
}

/**
 * Update a follow-up request.
 *
 * If `status` is given, the server updates the stored fields directly without
 * contacting the instrument. Otherwise `objId` and `allocationId` are required
 * and the request is updated (or re-submitted, if it previously failed or was
 * rejected) through the instrument's facility API.
 *
 * @since 1.0.0
 * @category Requests
 * @param followupRequestId - ID of the follow-up request to update.
 */
export const updateFollowupRequest = async (
    client: Http.Client,
    followupRequestId: number,
    options: UpdateFollowupRequestOptions = {}
): Promise<void> => {
    await Http.put(
        client,
        `/api/followup_request/${followupRequestId}`,
        Http.body({
            status: options.status,
            obj_id: options.objId,
            allocation_id: options.allocationId,
            payload: options.payload,
            target_group_ids: options.targetGroupIds,
        })
    );
};

/**
 * Set the comment on a follow-up request.
 *
 * @since 1.0.0
 * @category Requests
 * @param followupRequestId - ID of the follow-up request.
 * @param comment - The comment text. Pass `null` (or an empty string) to clear
 *   the request's comment.
 */
export const postFollowupRequestComment = async (
    client: Http.Client,
    followupRequestId: number,
    comment: string | null
): Promise<void> => {
    await Http.put(client, `/api/followup_request/${followupRequestId}/comment`, {
        comment,
    });
};

/**
 * Add a follow-up request to the token user's watch list.
 *
 * The server rejects the call if the user is already watching the request.
 *
 * @since 1.0.0
 * @category Requests
 * @param followupRequestId - ID of the follow-up request to watch.
 */
export interface FollowupRequestWatcherOptions {
    /**
     * Push a source refresh to connected frontends. Defaults to true
     * server-side.
     */
    readonly refreshSource?: boolean | undefined;
    /** Push a follow-up request refresh to connected frontends. */
    readonly refreshRequests?: boolean | undefined;
}

export const postFollowupRequestWatcher = async (
    client: Http.Client,
    followupRequestId: number,
    options: FollowupRequestWatcherOptions = {}
): Promise<void> => {
    await Http.post(
        client,
        `/api/followup_request/watch/${followupRequestId}`,
        Http.body({ refreshSource: options.refreshSource, refreshRequests: options.refreshRequests })
    );
};

/**
 * Remove a follow-up request from the token user's watch list.
 *
 * @since 1.0.0
 * @category Requests
 * @param followupRequestId - ID of the follow-up request to stop watching.
 */
export const deleteFollowupRequestWatcher = async (
    client: Http.Client,
    followupRequestId: number,
    options: FollowupRequestWatcherOptions = {}
): Promise<void> => {
    await Http.del(
        client,
        `/api/followup_request/watch/${followupRequestId}`,
        Http.body({ refreshSource: options.refreshSource, refreshRequests: options.refreshRequests })
    );
};

/**
 * Options for building a follow-up schedule.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchFollowupRequestScheduleOptions {
    /**
     * File format of the schedule: `"csv"` (default), `"png"`, or `"pdf"`.
     */
    readonly outputFormat?: string | undefined;
    /** Restrict to requests whose object ID contains this string. */
    readonly sourceId?: string | undefined;
    /**
     * Restrict to requests created in this date range, as ISO-format date
     * strings, e.g. `"2020-01-01"`.
     */
    readonly startDate?: string | undefined;
    readonly endDate?: string | undefined;
    /** Restrict to requests whose status matches this string. */
    readonly status?: string | undefined;
    /** Restrict to requests with payload priority at or above this value. */
    readonly priorityThreshold?: number | undefined;
    /** Scheduler time resolution in seconds. Server default is 20. */
    readonly timeResolution?: number | undefined;
    /**
     * Observation window, as ISO-format date strings. Server defaults are now
     * and 12 hours from now.
     */
    readonly observationStartDate?: string | undefined;
    readonly observationEndDate?: string | undefined;
    /** Include standard stars in the schedule. */
    readonly includeStandards?: boolean | undefined;
    /** Schedule only standard stars, no follow-up requests. */
    readonly standardsOnly?: boolean | undefined;
    /**
     * Origin of the standard stars, as defined in the server config. Server
     * default is `"ESO"`.
     */
    readonly standardType?: string | undefined;
    /**
     * Highest and lowest standard-star magnitude to include, e.g. `"(12,9)"`.
     */
    readonly magnitudeRange?: string | undefined;
}

/**
 * Build an observation schedule for an instrument's follow-up requests.
 *
 * Returns the schedule file contents as bytes; the server needs at least one
 * request (or standard) to schedule.
 *
 * @since 1.0.0
 * @category Requests
 * @param instrumentId - ID of the instrument to schedule.
 */
export const fetchFollowupRequestSchedule = (
    client: Http.Client,
    instrumentId: number,
    options: FetchFollowupRequestScheduleOptions = {}
): Promise<Uint8Array> =>
    Http.getContent(client, `/api/followup_request/schedule/${instrumentId}`, {
        output_format: options.outputFormat ?? "csv",
        sourceID: options.sourceId,
        startDate: options.startDate,
        endDate: options.endDate,
        status: options.status,
        priorityThreshold: options.priorityThreshold,
        timeResolution: options.timeResolution,
        observationStartDate: options.observationStartDate,
        observationEndDate: options.observationEndDate,
        includeStandards: options.includeStandards === true ? "true" : undefined,
        standardsOnly: options.standardsOnly === true ? "true" : undefined,
        standardType: options.standardType,
        magnitudeRange: options.magnitudeRange,
    });

/**
 * Options for reprioritizing follow-up requests.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpdateFollowupRequestPrioritizationOptions {
    /** Priority source: `"magnitude"` (server default) or `"localization"`. */
    readonly priorityType?: string | undefined;
    /**
     * Ordering for brightness-based prioritization: `"ascending"` (brightest
     * first, server default) or `"descending"`.
     */
    readonly magnitudeOrdering?: string | undefined;
    /**
     * Localization to weight by. Required when `priorityType` is
     * `"localization"`.
     */
    readonly localizationId?: number | undefined;
    /** Priority bounds for the instrument. Server defaults are 1 and 5. */
    readonly minimumPriority?: number | undefined;
    readonly maximumPriority?: number | undefined;
}

/**
 * Automatically reprioritize a set of follow-up requests.
 *
 * @since 1.0.0
 * @category Requests
 * @param requestIds - IDs of the follow-up requests to reprioritize.
 */
export const updateFollowupRequestPrioritization = async (
    client: Http.Client,
    requestIds: ReadonlyArray<number>,
    options: UpdateFollowupRequestPrioritizationOptions = {}
): Promise<void> => {
    await Http.put(
        client,
        "/api/followup_request/prioritization",
        Http.body({
            requestIds,
            priorityType: options.priorityType,
            magnitudeOrdering: options.magnitudeOrdering,
            localizationId: options.localizationId,
            minimumPriority: options.minimumPriority,
            maximumPriority: options.maximumPriority,
        })
    );
};

/**
 * Retrieve a single default follow-up request by ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param defaultFollowupRequestId - ID of the default follow-up request.
 */
export const fetchDefaultFollowupRequest = async (
    client: Http.Client,
    defaultFollowupRequestId: number
): Promise<DefaultFollowupRequest> =>
    Http.decode(
        DefaultFollowupRequest,
        await Http.get(client, `/api/default_followup_request/${defaultFollowupRequestId}`)
    );

/**
 * Retrieve all default follow-up requests visible to the token.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchDefaultFollowupRequests = async (client: Http.Client): Promise<Array<DefaultFollowupRequest>> =>
    Http.decode(v.array(DefaultFollowupRequest), await Http.get(client, "/api/default_followup_request"));

/**
 * Create a default follow-up request.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The default request to create.
 */
export const postDefaultFollowupRequest = async (
    client: Http.Client,
    payload: DefaultFollowupRequestPost
): Promise<DefaultFollowupRequestPostResponse> =>
    Http.decode(
        DefaultFollowupRequestPostResponse,
        await Http.post(client, "/api/default_followup_request", Http.body(payload))
    );

/**
 * Delete a default follow-up request.
 *
 * @since 1.0.0
 * @category Requests
 * @param defaultFollowupRequestId - ID of the default follow-up request to
 *   delete.
 */
export const deleteDefaultFollowupRequest = async (
    client: Http.Client,
    defaultFollowupRequestId: number
): Promise<void> => {
    await Http.del(client, `/api/default_followup_request/${defaultFollowupRequestId}`);
};

/**
 * Options for a follow-up photometry retrieval.
 *
 * @since 1.0.0
 * @category Models
 */
export interface RequestFollowupPhotometryOptions {
    /**
     * Have the facility API push a source refresh to the frontend after
     * retrieval. On by default.
     */
    readonly refreshSource?: boolean | undefined;
    /** Also push a refresh of the source's follow-up requests. */
    readonly refreshRequests?: boolean | undefined;
}

/**
 * Retrieve photometry for a follow-up request from its facility.
 *
 * Asks the instrument's facility API to fetch the photometry produced by the
 * request; the instrument must implement retrieval.
 *
 * @since 1.0.0
 * @category Requests
 * @param followupRequestId - ID of the follow-up request.
 */
export const requestFollowupPhotometry = async (
    client: Http.Client,
    followupRequestId: number,
    options: RequestFollowupPhotometryOptions = {}
): Promise<PhotometryRequestStatus> =>
    Http.decode(
        PhotometryRequestStatus,
        await Http.get(client, `/api/photometry_request/${followupRequestId}`, {
            refreshSource: options.refreshSource ?? true,
            refreshRequests: options.refreshRequests ?? false,
        })
    );

/**
 * Post a message from a remote facility about a follow-up request.
 *
 * The request's instrument must have a Listener API; `message` must match that
 * listener's schema, and the token needs the listener's ACL.
 *
 * @since 1.0.0
 * @category Requests
 * @param followupRequestId - ID of the follow-up request the message refers to.
 * @param message - Listener-specific message content, merged into the request
 *   body alongside `followup_request_id`.
 */
export const postFacilityMessage = async (
    client: Http.Client,
    followupRequestId: number,
    message: Record<string, unknown>
): Promise<void> => {
    await Http.post(client, "/api/facility", {
        followup_request_id: followupRequestId,
        ...message,
    });
};
