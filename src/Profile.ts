/**
 * Typed endpoint functions for `/api/internal/profile`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as GroupAdmissionRequests from "./GroupAdmissionRequests.ts";
import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";
import * as Streams from "./Streams.ts";

/**
 * An API token of the profile's user (upstream baselayer `Token`).
 *
 * Hand-built by the profile handler, so it carries only these four keys.
 *
 * @since 1.0.0
 * @category Models
 */
export const ProfileToken = Schemas.model(
    v.strictObject({
        id: Schemas.NullishString,
        name: Schemas.NullishString,
        acls: Schemas.list(v.string()),
        created_at: Schemas.NullishTimestamp,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type ProfileToken = v.InferOutput<typeof ProfileToken>;

/**
 * The user associated with the API token (upstream baselayer `User`).
 *
 * The profile handler builds this dict by hand: `User.to_dict()` (the table
 * columns except `preferences`) plus the injected keys below.
 *
 * @since 1.0.0
 * @category Models
 */
export const UserProfile = Schemas.model(
    v.strictObject({
        id: Schemas.NullishInteger,
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
        roles: Schemas.list(v.string()),
        permissions: Schemas.list(v.string()),
        acls: Schemas.list(v.string()),
        tokens: Schemas.list(ProfileToken),
        preferences: v.optional(Schemas.JsonObject, () => ({})),
        gravatar_url: Schemas.NullishString,
        groupAdmissionRequests: Schemas.list(GroupAdmissionRequests.GroupAdmissionRequest),
        streams: Schemas.list(Streams.Stream),
        is_anonymous: Schemas.NullishBoolean,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type UserProfile = v.InferOutput<typeof UserProfile>;

/**
 * Payload for updating the token user's profile and preferences.
 *
 * @since 1.0.0
 * @category Models
 */
export interface ProfilePatch {
    readonly username?: string | undefined;
    readonly first_name?: string | undefined;
    readonly last_name?: string | undefined;
    readonly affiliations?: ReadonlyArray<string> | undefined;
    readonly contact_email?: string | undefined;
    readonly contact_phone?: string | undefined;
    readonly bio?: string | undefined;
    readonly is_bot?: boolean | undefined;
    readonly preferences?: Record<string, unknown> | undefined;
}

/**
 * Retrieve the profile of the user associated with the token.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchProfile = async (client: Http.Client): Promise<UserProfile> =>
    Http.decode(UserProfile, await Http.get(client, "/api/internal/profile"));

/**
 * Options for updating a profile.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpdateProfileOptions {
    /**
     * User whose profile to update; defaults to the token's own user. Updating
     * another user requires the "Manage users" ACL.
     */
    readonly userId?: number | undefined;
}

/**
 * Update a user's profile and preferences.
 *
 * Only the provided fields are sent; omitted fields are left unchanged.
 * `preferences` is merged into the stored preferences dict rather than
 * replacing it.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The fields to change.
 */
export const updateProfile = async (
    client: Http.Client,
    payload: ProfilePatch,
    options: UpdateProfileOptions = {}
): Promise<void> => {
    await Http.patch(
        client,
        options.userId === undefined ? "/api/internal/profile" : `/api/internal/profile/${options.userId}`,
        Http.body(payload)
    );
};
