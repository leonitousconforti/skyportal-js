/**
 * Typed endpoint functions for `/api/user`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Groups from "./Groups.ts";
import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";
import * as Streams from "./Streams.ts";

/**
 * The fields of a {@link User}.
 *
 * @since 1.0.0
 * @category Models
 */
export const UserEntries = {
    id: Schemas.Integer,
    created_at: Schemas.NullishTimestamp,
    modified: Schemas.NullishTimestamp,
    username: v.string(),
    first_name: Schemas.NullishString,
    last_name: Schemas.NullishString,
    bio: Schemas.NullishString,
    affiliations: Schemas.list(v.string()),
    contact_email: Schemas.NullishString,
    contact_phone: Schemas.NullishString,
    oauth_uid: Schemas.NullishString,
    is_bot: Schemas.NullishBoolean,
    expiration_date: Schemas.NullishTimestamp,
    permissions: Schemas.list(v.string()),
    roles: Schemas.list(v.string()),
    acls: Schemas.list(v.string()),
    gravatar_url: Schemas.NullishString,
    groups: Schemas.nullish(v.array(Groups.Group)),
    streams: Schemas.nullish(v.array(Streams.Stream)),
};

/**
 * A SkyPortal user (upstream baselayer `User`).
 *
 * SkyPortal overrides `User.to_dict` to return the table columns only, minus
 * `preferences`; `roles`/`acls`/`permissions`/`gravatar_url` and, for system
 * admins, `groups`/`streams` are injected by the handler.
 *
 * @since 1.0.0
 * @category Models
 */
export const User = Schemas.model(v.strictObject(UserEntries));

/**
 * @since 1.0.0
 * @category Models
 */
export type User = v.InferOutput<typeof User>;

/**
 * One page of results from a users query.
 *
 * @since 1.0.0
 * @category Models
 */
export const UsersPage = Schemas.model(
    v.strictObject({
        users: v.array(User),
        totalMatches: Schemas.Integer,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type UsersPage = v.InferOutput<typeof UsersPage>;

/**
 * Options for querying users.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchUsersOptions {
    /** Pagination controls. */
    readonly pageNumber?: number | undefined;
    /** Page size; defaults to the server's page size. */
    readonly numPerPage?: number | undefined;
    readonly firstName?: string | undefined;
    readonly lastName?: string | undefined;
    readonly username?: string | undefined;
    readonly email?: string | undefined;
    /** Keep users holding this role. */
    readonly role?: string | undefined;
    /** Keep users holding this ACL. */
    readonly acl?: string | undefined;
    /** Keep users belonging to the group with this name. */
    readonly group?: string | undefined;
    /** Keep users belonging to the stream with this name. */
    readonly stream?: string | undefined;
    /** Also include deactivated (expired) accounts. */
    readonly includeExpired?: boolean | undefined;
    /**
     * Column to sort on; one of "username", "firstName", "lastName",
     * "contactEmail", or "createdAt".
     */
    readonly sortBy?: string | undefined;
    /** "asc" or "desc". */
    readonly sortOrder?: string | undefined;
}

/**
 * Query users, one page at a time.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchUsers = async (client: Http.Client, options: FetchUsersOptions = {}): Promise<UsersPage> =>
    Http.decode(
        UsersPage,
        await Http.get(client, "/api/user", {
            pageNumber: options.pageNumber ?? 1,
            numPerPage: options.numPerPage,
            firstName: options.firstName,
            lastName: options.lastName,
            username: options.username,
            email: options.email,
            role: options.role,
            acl: options.acl,
            group: options.group,
            stream: options.stream,
            includeExpired: options.includeExpired ?? false,
            sortBy: options.sortBy ?? "username",
            sortOrder: options.sortOrder ?? "asc",
        })
    );

/**
 * Retrieve a single user by ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param userId - ID of the user.
 */
export const fetchUser = async (client: Http.Client, userId: number): Promise<User> =>
    Http.decode(User, await Http.get(client, `/api/user/${userId}`));

/**
 * Payload for adding a new user.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UserPost {
    readonly username: string;
    readonly first_name?: string | undefined;
    readonly last_name?: string | undefined;
    readonly affiliations?: ReadonlyArray<string> | undefined;
    readonly contact_email?: string | undefined;
    readonly contact_phone?: string | undefined;
    readonly oauth_uid?: string | undefined;
    /** If omitted, the server assigns its configured default role. */
    readonly roles?: ReadonlyArray<string> | undefined;
    /**
     * Pairs of `[groupId, admin]`. If omitted, the server adds the user to its
     * default groups.
     */
    readonly groupIDsAndAdmin?: ReadonlyArray<readonly [number, boolean]> | undefined;
}

/**
 * Result of adding a new user.
 *
 * @since 1.0.0
 * @category Models
 */
export const UserPostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type UserPostResponse = v.InferOutput<typeof UserPostResponse>;

/**
 * Add a new user (requires the "Manage users" ACL).
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The user to add.
 */
export const postUser = async (client: Http.Client, payload: UserPost): Promise<UserPostResponse> =>
    Http.decode(UserPostResponse, await Http.post(client, "/api/user", Http.body(payload)));

/**
 * Options for updating a user record.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpdateUserOptions {
    /**
     * Arrow-parseable date string (e.g. `"2020-01-01"`). After this date the
     * account is deactivated and cannot access the application. Pass `null`
     * explicitly to clear an existing expiration date; omit it to leave the
     * current value alone.
     */
    readonly expirationDate?: string | null | undefined;
}

/**
 * Update a user record (requires the "Manage users" ACL).
 *
 * @since 1.0.0
 * @category Requests
 * @param userId - ID of the user to update.
 */
export const updateUser = async (
    client: Http.Client,
    userId: number,
    options: UpdateUserOptions = {}
): Promise<void> => {
    await Http.patch(client, `/api/user/${userId}`, Http.body(options));
};

/**
 * Delete a user (requires the "Manage users" ACL).
 *
 * @since 1.0.0
 * @category Requests
 * @param userId - ID of the user to delete.
 */
export const deleteUser = async (client: Http.Client, userId: number): Promise<void> => {
    await Http.del(client, `/api/user/${userId}`);
};
