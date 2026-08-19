/**
 * Typed endpoint functions for `/api/shifts`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Groups from "./Groups.ts";
import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";
import * as Users from "./Users.ts";

/**
 * A user's membership in a shift (upstream `ShiftUser`).
 *
 * `username`, `first_name` and `last_name` are copied up from the nested
 * `user` by the single-shift handler.
 *
 * @since 1.0.0
 * @category Models
 */
export const ShiftUserMembership = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        shift_id: Schemas.NullishInteger,
        user_id: Schemas.NullishInteger,
        admin: Schemas.NullishBoolean,
        needs_replacement: Schemas.NullishBoolean,
        user: Schemas.nullish(Users.User),
        username: Schemas.NullishString,
        first_name: Schemas.NullishString,
        last_name: Schemas.NullishString,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type ShiftUserMembership = v.InferOutput<typeof ShiftUserMembership>;

/**
 * A shift comment's author, with the gravatar URL the handler adds.
 *
 * @since 1.0.0
 * @category Models
 */
export const ShiftCommentAuthor = Schemas.model(
    v.strictObject({
        ...Users.UserEntries,
        gravatar_url: Schemas.NullishString,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type ShiftCommentAuthor = v.InferOutput<typeof ShiftCommentAuthor>;

/**
 * A comment posted about a shift (upstream `CommentOnShift`).
 *
 * The handler strips `attachment_bytes` and tags each comment with
 * `resourceType`.
 *
 * @since 1.0.0
 * @category Models
 */
export const ShiftComment = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        text: Schemas.NullishString,
        attachment_name: Schemas.NullishString,
        origin: Schemas.NullishString,
        bot: Schemas.NullishBoolean,
        author_id: Schemas.NullishInteger,
        shift_id: Schemas.NullishInteger,
        author: Schemas.nullish(ShiftCommentAuthor),
        groups: Schemas.list(Groups.Group),
        resourceType: Schemas.NullishString,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type ShiftComment = v.InferOutput<typeof ShiftComment>;

/**
 * A member of a shift's group, as returned alongside a single shift.
 *
 * @since 1.0.0
 * @category Models
 */
export const ShiftGroupMember = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        username: Schemas.NullishString,
        first_name: Schemas.NullishString,
        last_name: Schemas.NullishString,
        expiration_date: Schemas.NullishTimestamp,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type ShiftGroupMember = v.InferOutput<typeof ShiftGroupMember>;

/**
 * A shift's group, as hand-assembled by the single-shift handler.
 *
 * @since 1.0.0
 * @category Models
 */
export const ShiftGroup = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        name: Schemas.NullishString,
        has_admin_access: Schemas.NullishBoolean,
        group_users: Schemas.list(ShiftGroupMember),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type ShiftGroup = v.InferOutput<typeof ShiftGroup>;

/**
 * A group scanning shift (upstream `Shift`).
 *
 * `shift_users_ids` is a column property (an aggregate of the shift's user
 * IDs), so it is present even when no relationship is loaded.
 *
 * @since 1.0.0
 * @category Models
 */
export const Shift = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        name: Schemas.NullishString,
        description: Schemas.NullishString,
        start_date: Schemas.NullishTimestamp,
        end_date: Schemas.NullishTimestamp,
        group_id: Schemas.NullishInteger,
        required_users_number: Schemas.NullishInteger,
        shift_users_ids: Schemas.nullish(v.array(Schemas.Integer)),
        shift_users: Schemas.list(ShiftUserMembership),
        users: Schemas.list(Users.User),
        comments: Schemas.list(ShiftComment),
        reminders: Schemas.list(Schemas.JsonObject),
        group: Schemas.nullish(ShiftGroup),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type Shift = v.InferOutput<typeof Shift>;

/**
 * Payload for creating a new shift.
 *
 * `shift_admins` lists the IDs of users to make admins of the new shift.
 *
 * @since 1.0.0
 * @category Models
 */
export interface ShiftPost {
    readonly name: string;
    readonly start_date: string;
    readonly end_date: string;
    readonly group_id: number;
    readonly description?: string | undefined;
    readonly required_users_number?: number | undefined;
    readonly shift_admins?: ReadonlyArray<number> | undefined;
}

/**
 * Result of creating a new shift.
 *
 * @since 1.0.0
 * @category Models
 */
export const ShiftPostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type ShiftPostResponse = v.InferOutput<typeof ShiftPostResponse>;

/**
 * Result of adding a user to a shift.
 *
 * @since 1.0.0
 * @category Models
 */
export const ShiftUserPostResponse = Schemas.model(
    v.strictObject({
        shift_id: Schemas.Integer,
        user_id: Schemas.Integer,
        admin: v.boolean(),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type ShiftUserPostResponse = v.InferOutput<typeof ShiftUserPostResponse>;

/**
 * One section (shifts or GCN events) of a shift summary report.
 *
 * @since 1.0.0
 * @category Models
 */
export const ShiftSummarySection = Schemas.model(
    v.strictObject({
        total: Schemas.NullishInteger,
        data: Schemas.list(Schemas.JsonObject),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type ShiftSummarySection = v.InferOutput<typeof ShiftSummarySection>;

/**
 * Summary of shift-user activity over a period.
 *
 * @since 1.0.0
 * @category Models
 */
export const ShiftSummaryReport = Schemas.model(
    v.strictObject({
        shifts: Schemas.nullish(ShiftSummarySection),
        gcns: Schemas.nullish(ShiftSummarySection),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type ShiftSummaryReport = v.InferOutput<typeof ShiftSummaryReport>;

/**
 * Retrieve a single shift by ID.
 *
 * Includes the shift's users, comments, and group (with its members).
 *
 * @since 1.0.0
 * @category Requests
 * @param shiftId - ID of the shift.
 */
export const fetchShift = async (client: Http.Client, shiftId: number): Promise<Shift> =>
    Http.decode(Shift, await Http.get(client, `/api/shifts/${shiftId}`));

/**
 * Options for listing shifts.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchShiftsOptions {
    /** Restrict to shifts belonging to this group. */
    readonly groupId?: number | undefined;
    /**
     * Only return shifts starting at or after this datetime, as an ISO-format
     * string, e.g. `"2024-01-01"`.
     */
    readonly startDateLimit?: string | undefined;
    /**
     * Only return shifts ending at or after this datetime, as an ISO-format
     * string.
     */
    readonly endDateLimit?: string | undefined;
}

/**
 * Retrieve all shifts visible to the token.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchShifts = async (client: Http.Client, options: FetchShiftsOptions = {}): Promise<Array<Shift>> =>
    Http.decode(
        v.array(Shift),
        await Http.get(client, "/api/shifts", {
            group_id: options.groupId,
            start_date_limit: options.startDateLimit,
            end_date_limit: options.endDateLimit,
        })
    );

/**
 * Create a new shift.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The shift to create.
 */
export const postShift = async (client: Http.Client, payload: ShiftPost): Promise<ShiftPostResponse> =>
    Http.decode(ShiftPostResponse, await Http.post(client, "/api/shifts", Http.body(payload)));

/**
 * Options for updating a shift.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpdateShiftOptions {
    /** New name; must be non-empty. */
    readonly name?: string | undefined;
    /** New description. */
    readonly description?: string | undefined;
    /**
     * New number of users required for the shift to be considered full; must
     * be at least 1 and at least the number of users already signed up.
     */
    readonly requiredUsersNumber?: number | undefined;
}

/**
 * Update fields of an existing shift.
 *
 * Only the provided fields are sent; omitted fields are left unchanged. Only a
 * shift admin or an admin of the shift's group can edit it.
 *
 * @since 1.0.0
 * @category Requests
 * @param shiftId - ID of the shift to update.
 */
export const updateShift = async (
    client: Http.Client,
    shiftId: number,
    options: UpdateShiftOptions = {}
): Promise<void> => {
    await Http.patch(
        client,
        `/api/shifts/${shiftId}`,
        Http.body({
            name: options.name,
            description: options.description,
            required_users_number: options.requiredUsersNumber,
        })
    );
};

/**
 * Delete a shift.
 *
 * Only a shift admin or an admin of the shift's group can delete it.
 *
 * @since 1.0.0
 * @category Requests
 * @param shiftId - ID of the shift to delete.
 */
export const deleteShift = async (client: Http.Client, shiftId: number): Promise<void> => {
    await Http.del(client, `/api/shifts/${shiftId}`);
};

/**
 * Options for adding a user to a shift.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PostShiftUserOptions {
    /** Make the user an admin of the shift. */
    readonly admin?: boolean | undefined;
    /** Mark the user as needing a replacement for the shift. */
    readonly needsReplacement?: boolean | undefined;
}

/**
 * Add a user to a shift.
 *
 * Fails if the user is already a member of the shift, or if the shift has
 * reached its required number of users.
 *
 * @since 1.0.0
 * @category Requests
 * @param shiftId - ID of the shift.
 * @param userId - ID of the user to add.
 */
export const postShiftUser = async (
    client: Http.Client,
    shiftId: number,
    userId: number,
    options: PostShiftUserOptions = {}
): Promise<ShiftUserPostResponse> =>
    Http.decode(
        ShiftUserPostResponse,
        await Http.post(client, `/api/shifts/${shiftId}/users`, {
            userID: userId,
            admin: options.admin ?? false,
            needs_replacement: options.needsReplacement ?? false,
        })
    );

/**
 * Options for updating a shift member.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpdateShiftUserOptions {
    /** New admin status. If omitted, the current status is kept. */
    readonly admin?: boolean | undefined;
    /**
     * Mark the user as needing a replacement; this notifies the other members
     * of the shift's group. The server resets this flag to `false` when
     * omitted.
     */
    readonly needsReplacement?: boolean | undefined;
}

/**
 * Update a shift user's admin or needs-replacement status.
 *
 * @since 1.0.0
 * @category Requests
 * @param shiftId - ID of the shift.
 * @param userId - ID of the shift user to update.
 */
export const updateShiftUser = async (
    client: Http.Client,
    shiftId: number,
    userId: number,
    options: UpdateShiftUserOptions = {}
): Promise<void> => {
    await Http.patch(
        client,
        `/api/shifts/${shiftId}/users/${userId}`,
        Http.body({
            needs_replacement: options.needsReplacement ?? false,
            admin: options.admin,
        })
    );
};

/**
 * Remove a user from a shift.
 *
 * @since 1.0.0
 * @category Requests
 * @param shiftId - ID of the shift.
 * @param userId - ID of the user to remove.
 */
export const deleteShiftUser = async (client: Http.Client, shiftId: number, userId: number): Promise<void> => {
    await Http.del(client, `/api/shifts/${shiftId}/users/${userId}`);
};

/**
 * Options for a shift summary report.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchShiftSummaryOptions {
    /** Summarize this single shift. */
    readonly shiftId?: number | undefined;
    /**
     * Summarize shifts starting in this date range, as ISO-format date
     * strings, e.g. `"2024-01-01"`.
     */
    readonly startDate?: string | undefined;
    readonly endDate?: string | undefined;
}

/**
 * Retrieve a summary of shift-user activity over a period.
 *
 * Provide either `shiftId`, or both `startDate` and `endDate` (a period of at
 * most four weeks). The report lists the matching shifts and the GCN events
 * observed during them.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchShiftSummary = async (
    client: Http.Client,
    options: FetchShiftSummaryOptions = {}
): Promise<ShiftSummaryReport> =>
    Http.decode(
        ShiftSummaryReport,
        await Http.get(
            client,
            options.shiftId === undefined ? "/api/shifts/summary" : `/api/shifts/summary/${options.shiftId}`,
            { startDate: options.startDate, endDate: options.endDate }
        )
    );
