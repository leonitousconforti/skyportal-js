/**
 * Typed endpoint functions for `/api/groups`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Filters from "./Filters.ts";
import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";
import * as Streams from "./Streams.ts";

/**
 * A group member as assembled by the `GET /api/groups/{id}` handler.
 *
 * The handler hand-builds this dict from a `GroupUser` and its `User` rather
 * than serializing either model, so it is not a 1:1 upstream model.
 *
 * @since 1.0.0
 * @category Models
 */
export const GroupMember = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        username: Schemas.NullishString,
        first_name: Schemas.NullishString,
        last_name: Schemas.NullishString,
        contact_email: Schemas.NullishString,
        contact_phone: Schemas.NullishString,
        oauth_uid: Schemas.NullishString,
        admin: Schemas.NullishBoolean,
        can_save: Schemas.NullishBoolean,
        can_share_photometry: Schemas.NullishBoolean,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type GroupMember = v.InferOutput<typeof GroupMember>;

/**
 * A SkyPortal group (upstream `Group`).
 *
 * Declared by hand rather than inferred, because `Group` and
 * {@link GroupUser} refer to each other.
 *
 * @since 1.0.0
 * @category Models
 */
export interface Group {
    readonly id: number;
    readonly created_at?: string | null | undefined;
    readonly modified?: string | null | undefined;
    readonly name: string;
    readonly nickname?: string | null | undefined;
    readonly description?: string | null | undefined;
    readonly private?: boolean | null | undefined;
    readonly auto_accept_requests?: boolean | null | undefined;
    readonly single_user_group: boolean;
    readonly streams?: Array<Streams.Stream> | null | undefined;
    readonly filters?: Array<Filters.Filter> | null | undefined;
    readonly group_users?: Array<GroupUser> | null | undefined;
    readonly users?: Array<GroupMember> | null | undefined;
}

/**
 * A user's membership of a group (upstream `GroupUser` join model).
 *
 * `user` stays a free-form object: typing it as {@link skyportal-js/Users!User}
 * would make groups -> users -> groups a circular import.
 *
 * @since 1.0.0
 * @category Models
 */
export interface GroupUser {
    readonly id: number;
    readonly created_at?: string | null | undefined;
    readonly modified?: string | null | undefined;
    readonly group_id?: number | null | undefined;
    readonly user_id?: number | null | undefined;
    readonly admin?: boolean | null | undefined;
    readonly can_save?: boolean | null | undefined;
    readonly can_share_photometry?: boolean | null | undefined;
    readonly user?: Record<string, unknown> | null | undefined;
    readonly group?: Group | null | undefined;
}

/**
 * The fields of a {@link Group}, so that models which embed a group with extra
 * join-table columns can extend them.
 *
 * @since 1.0.0
 * @category Models
 */
export const GroupEntries = {
    id: Schemas.Integer,
    created_at: Schemas.NullishTimestamp,
    modified: Schemas.NullishTimestamp,
    name: v.string(),
    nickname: Schemas.NullishString,
    description: Schemas.NullishString,
    private: Schemas.NullishBoolean,
    auto_accept_requests: Schemas.NullishBoolean,
    single_user_group: v.optional(v.boolean(), false),
    streams: Schemas.nullish(v.array(Streams.Stream)),
    filters: Schemas.nullish(v.array(Filters.Filter)),
    group_users: Schemas.nullish(v.array(v.lazy((): v.GenericSchema<unknown, GroupUser> => GroupUser))),
    users: Schemas.nullish(v.array(GroupMember)),
};

/**
 * @since 1.0.0
 * @category Models
 */
export const Group = Schemas.model(v.strictObject(GroupEntries));

/**
 * The fields of a {@link GroupUser}.
 *
 * @since 1.0.0
 * @category Models
 */
export const GroupUserEntries = {
    id: Schemas.Integer,
    created_at: Schemas.NullishTimestamp,
    modified: Schemas.NullishTimestamp,
    group_id: Schemas.NullishInteger,
    user_id: Schemas.NullishInteger,
    admin: Schemas.NullishBoolean,
    can_save: Schemas.NullishBoolean,
    can_share_photometry: Schemas.NullishBoolean,
    user: Schemas.nullish(Schemas.JsonObject),
    group: Schemas.nullish(v.lazy((): v.GenericSchema<unknown, Group> => Group)),
};

/**
 * @since 1.0.0
 * @category Models
 */
export const GroupUser = Schemas.model(v.strictObject(GroupUserEntries));

/**
 * The groups visible to the token, split by relationship to the user.
 *
 * @since 1.0.0
 * @category Models
 */
export const GroupsResponse = Schemas.model(
    v.strictObject({
        user_groups: Schemas.list(Group),
        user_accessible_groups: Schemas.list(Group),
        all_groups: Schemas.nullish(v.array(Group)),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type GroupsResponse = v.InferOutput<typeof GroupsResponse>;

/**
 * Payload for creating a group.
 *
 * @since 1.0.0
 * @category Models
 */
export interface GroupPost {
    /** Must not collide with an existing group. */
    readonly name: string;
    readonly nickname?: string | undefined;
    readonly description?: string | undefined;
    readonly auto_accept_requests?: boolean | undefined;
    /**
     * User IDs to make group admins; the current user is added as an admin
     * automatically.
     */
    readonly group_admins?: ReadonlyArray<number> | undefined;
}

/**
 * Result of creating a group.
 *
 * @since 1.0.0
 * @category Models
 */
export const GroupPostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type GroupPostResponse = v.InferOutput<typeof GroupPostResponse>;

/**
 * Result of granting a group access to a stream.
 *
 * @since 1.0.0
 * @category Models
 */
export const GroupStreamPostResponse = Schemas.model(
    v.strictObject({
        group_id: Schemas.Integer,
        stream_id: Schemas.Integer,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type GroupStreamPostResponse = v.InferOutput<typeof GroupStreamPostResponse>;

/**
 * Result of adding a user to a group.
 *
 * @since 1.0.0
 * @category Models
 */
export const GroupUserPostResponse = Schemas.model(
    v.strictObject({
        group_id: Schemas.Integer,
        user_id: Schemas.Integer,
        admin: v.boolean(),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type GroupUserPostResponse = v.InferOutput<typeof GroupUserPostResponse>;

/**
 * Options for listing groups.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchGroupsOptions {
    /** Also include each user's implicit single-user group. */
    readonly includeSingleUserGroups?: boolean | undefined;
}

/**
 * Retrieve the groups the token's user belongs to or can access.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchGroups = async (client: Http.Client, options: FetchGroupsOptions = {}): Promise<GroupsResponse> =>
    Http.decode(
        GroupsResponse,
        await Http.get(client, "/api/groups", {
            includeSingleUserGroups: options.includeSingleUserGroups ?? false,
        })
    );

/**
 * Options for retrieving a single group.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchGroupOptions {
    /**
     * Include the group's members in `users`. On by default; pass false to
     * skip the member list on large groups.
     */
    readonly includeGroupUsers?: boolean | undefined;
}

/**
 * Retrieve a single group by ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param groupId - ID of the group.
 */
export const fetchGroup = async (
    client: Http.Client,
    groupId: number,
    options: FetchGroupOptions = {}
): Promise<Group> =>
    Http.decode(
        Group,
        await Http.get(client, `/api/groups/${groupId}`, {
            includeGroupUsers: options.includeGroupUsers ?? true,
        })
    );

/**
 * Retrieve the accessible groups with an exact name.
 *
 * The `name=` form of `GET /api/groups` returns a plain list rather than the
 * user/accessible split of {@link fetchGroups}.
 *
 * @since 1.0.0
 * @category Requests
 * @param name - Exact group name to match.
 */
export const fetchGroupsByName = async (client: Http.Client, name: string): Promise<Array<Group>> =>
    Http.decode(v.array(Group), await Http.get(client, "/api/groups", { name }));

/**
 * Create a new group.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The group to create.
 */
export const postGroup = async (client: Http.Client, payload: GroupPost): Promise<GroupPostResponse> =>
    Http.decode(GroupPostResponse, await Http.post(client, "/api/groups", Http.body(payload)));

/**
 * Options for updating a group.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpdateGroupOptions {
    /** Pass `null` to clear the value; the column is unique, so `""` collides. */
    readonly nickname?: string | null | undefined;
    readonly description?: string | null | undefined;
    /** Whether the group is private. */
    readonly private?: boolean | undefined;
    /** Whether admission requests to the group are accepted automatically. */
    readonly autoAcceptRequests?: boolean | undefined;
}

/**
 * Update an existing group.
 *
 * Only the provided fields are sent; omitted fields are left unchanged.
 *
 * @since 1.0.0
 * @category Requests
 * @param groupId - ID of the group to update.
 * @param name - The group name; required by the server even if unchanged.
 */
export const updateGroup = async (
    client: Http.Client,
    groupId: number,
    name: string,
    options: UpdateGroupOptions = {}
): Promise<void> => {
    await Http.put(
        client,
        `/api/groups/${groupId}`,
        Http.body({
            name,
            nickname: options.nickname,
            description: options.description,
            private: options.private,
            auto_accept_requests: options.autoAcceptRequests,
        })
    );
};

/**
 * Delete a group.
 *
 * @since 1.0.0
 * @category Requests
 * @param groupId - ID of the group to delete.
 */
export const deleteGroup = async (client: Http.Client, groupId: number): Promise<void> => {
    await Http.del(client, `/api/groups/${groupId}`);
};

/**
 * Retrieve the server's configured public group.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchPublicGroup = async (client: Http.Client): Promise<Group> =>
    Http.decode(Group, await Http.get(client, "/api/groups/public"));

/**
 * Grant a group access to an alert stream.
 *
 * Every member of the group must already have access to the stream.
 *
 * @since 1.0.0
 * @category Requests
 * @param groupId - ID of the group.
 * @param streamId - ID of the stream to associate with the group.
 */
export const postGroupStream = async (
    client: Http.Client,
    groupId: number,
    streamId: number
): Promise<GroupStreamPostResponse> =>
    Http.decode(
        GroupStreamPostResponse,
        await Http.post(client, `/api/groups/${groupId}/streams`, { stream_id: streamId })
    );

/**
 * Remove an alert stream from a group.
 *
 * Fails if one of the group's filters still operates on the stream.
 *
 * @since 1.0.0
 * @category Requests
 * @param groupId - ID of the group.
 * @param streamId - ID of the stream to remove from the group.
 */
export const deleteGroupStream = async (client: Http.Client, groupId: number, streamId: number): Promise<void> => {
    await Http.del(client, `/api/groups/${groupId}/streams/${streamId}`);
};

/**
 * Options for adding a user to a group.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PostGroupUserOptions {
    /** Make the user a group admin. */
    readonly admin?: boolean | undefined;
    /** Allow the user to save sources to the group. Defaults to true. */
    readonly canSave?: boolean | undefined;
    /** Allow the user to share the group's photometry with other groups. */
    readonly canSharePhotometry?: boolean | undefined;
}

/**
 * Add a user to a group.
 *
 * The user must already have access to every stream of the group.
 *
 * @since 1.0.0
 * @category Requests
 * @param groupId - ID of the group.
 * @param userId - ID of the user to add.
 */
export const postGroupUser = async (
    client: Http.Client,
    groupId: number,
    userId: number,
    options: PostGroupUserOptions = {}
): Promise<GroupUserPostResponse> =>
    Http.decode(
        GroupUserPostResponse,
        await Http.post(client, `/api/groups/${groupId}/users`, {
            userID: userId,
            admin: options.admin ?? false,
            canSave: options.canSave ?? true,
            canSharePhotometry: options.canSharePhotometry ?? false,
        })
    );

/**
 * Options for updating a group member.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpdateGroupUserOptions {
    /** Whether the user is a group admin. */
    readonly admin?: boolean | undefined;
    /** Whether the user can save sources to the group. */
    readonly canSave?: boolean | undefined;
    /** Whether the user can share the group's photometry with other groups. */
    readonly canSharePhotometry?: boolean | undefined;
}

/**
 * Update a group member's admin or save-access status.
 *
 * At least one of `admin`, `canSave`, or `canSharePhotometry` must be
 * provided; omitted flags are left unchanged.
 *
 * @since 1.0.0
 * @category Requests
 * @param groupId - ID of the group.
 * @param userId - ID of the group member to update.
 */
export const updateGroupUser = async (
    client: Http.Client,
    groupId: number,
    userId: number,
    options: UpdateGroupUserOptions = {}
): Promise<void> => {
    await Http.patch(
        client,
        `/api/groups/${groupId}/users`,
        Http.body({
            userID: userId,
            admin: options.admin,
            canSave: options.canSave,
            canSharePhotometry: options.canSharePhotometry,
        })
    );
};

/**
 * Remove a user from a group.
 *
 * @since 1.0.0
 * @category Requests
 * @param groupId - ID of the group.
 * @param userId - ID of the group member to remove.
 */
export const deleteGroupUser = async (client: Http.Client, groupId: number, userId: number): Promise<void> => {
    await Http.del(client, `/api/groups/${groupId}/users/${userId}`);
};

/**
 * Add all members of other groups to the specified group.
 *
 * Users already in the target group are skipped.
 *
 * @since 1.0.0
 * @category Requests
 * @param groupId - ID of the group to add users to.
 * @param fromGroupIds - IDs of the groups whose members should be added.
 */
export const postGroupUsersFromGroups = async (
    client: Http.Client,
    groupId: number,
    fromGroupIds: ReadonlyArray<number>
): Promise<void> => {
    await Http.post(client, `/api/groups/${groupId}/usersFromGroups`, {
        fromGroupIDs: fromGroupIds,
    });
};
