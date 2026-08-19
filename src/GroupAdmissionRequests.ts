/**
 * Typed endpoint functions for `/api/group_admission_requests`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Groups from "./Groups.ts";
import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";
import * as Users from "./Users.ts";

/**
 * The state of a group admission request.
 *
 * @since 1.0.0
 * @category Models
 */
export const GroupAdmissionRequestStatus = v.picklist(["pending", "accepted", "declined"]);

/**
 * @since 1.0.0
 * @category Models
 */
export type GroupAdmissionRequestStatus = v.InferOutput<typeof GroupAdmissionRequestStatus>;

/**
 * A request to join a group (upstream `GroupAdmissionRequest`).
 *
 * @since 1.0.0
 * @category Models
 */
export const GroupAdmissionRequest = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        user_id: Schemas.NullishInteger,
        group_id: Schemas.NullishInteger,
        status: Schemas.nullish(GroupAdmissionRequestStatus),
        user: Schemas.nullish(Users.User),
        group: Schemas.nullish(Groups.Group),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type GroupAdmissionRequest = v.InferOutput<typeof GroupAdmissionRequest>;

/**
 * Result of creating a group admission request.
 *
 * @since 1.0.0
 * @category Models
 */
export const GroupAdmissionRequestPostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type GroupAdmissionRequestPostResponse = v.InferOutput<typeof GroupAdmissionRequestPostResponse>;

/**
 * Retrieve a single group admission request by ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param admissionRequestId - ID of the admission request. Only the requesting
 *   user and admins of the target group may read it.
 */
export const fetchGroupAdmissionRequest = async (
    client: Http.Client,
    admissionRequestId: number
): Promise<GroupAdmissionRequest> =>
    Http.decode(GroupAdmissionRequest, await Http.get(client, `/api/group_admission_requests/${admissionRequestId}`));

/**
 * Options for listing group admission requests.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchGroupAdmissionRequestsOptions {
    /** Only return requests to join this group. */
    readonly groupId?: number | undefined;
}

/**
 * Retrieve the group admission requests visible to the token.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchGroupAdmissionRequests = async (
    client: Http.Client,
    options: FetchGroupAdmissionRequestsOptions = {}
): Promise<Array<GroupAdmissionRequest>> =>
    Http.decode(
        v.array(GroupAdmissionRequest),
        await Http.get(client, "/api/group_admission_requests", { groupID: options.groupId })
    );

/**
 * Request admission to a group.
 *
 * @since 1.0.0
 * @category Requests
 * @param groupId - ID of the group to join. It must not be a single-user group,
 *   and the requesting user must already have access to all of its streams.
 * @param userId - ID of the requesting user; requests cannot be made on behalf
 *   of others. If the group auto-accepts requests, the request is created as
 *   `"accepted"` and the user is added to the group immediately.
 */
export const postGroupAdmissionRequest = async (
    client: Http.Client,
    groupId: number,
    userId: number
): Promise<GroupAdmissionRequestPostResponse> =>
    Http.decode(
        GroupAdmissionRequestPostResponse,
        await Http.post(client, "/api/group_admission_requests", {
            groupID: groupId,
            userID: userId,
        })
    );

/**
 * Accept, decline, or reset a group admission request.
 *
 * @since 1.0.0
 * @category Requests
 * @param admissionRequestId - ID of the admission request. Only admins of the
 *   target group may change its status.
 * @param status - One of `"pending"`, `"accepted"`, or `"declined"`. The
 *   requesting user is notified of the new status.
 */
export const updateGroupAdmissionRequest = async (
    client: Http.Client,
    admissionRequestId: number,
    status: GroupAdmissionRequestStatus
): Promise<void> => {
    await Http.patch(client, `/api/group_admission_requests/${admissionRequestId}`, { status });
};

/**
 * Withdraw a group admission request.
 *
 * @since 1.0.0
 * @category Requests
 * @param admissionRequestId - ID of the admission request. Only the requesting
 *   user may delete it.
 */
export const deleteGroupAdmissionRequest = async (client: Http.Client, admissionRequestId: number): Promise<void> => {
    await Http.del(client, `/api/group_admission_requests/${admissionRequestId}`);
};
