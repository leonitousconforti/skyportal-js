/**
 * Typed endpoint functions for `/api/teams`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";

/**
 * A group belonging to a team, as assembled by the team handler.
 *
 * @since 1.0.0
 * @category Models
 */
export const TeamGroup = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        name: Schemas.NullishString,
        nickname: Schemas.NullishString,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type TeamGroup = v.InferOutput<typeof TeamGroup>;

/**
 * A user who is a member of one of a team's groups.
 *
 * @since 1.0.0
 * @category Models
 */
export const TeamMember = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        username: Schemas.NullishString,
        first_name: Schemas.NullishString,
        last_name: Schemas.NullishString,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type TeamMember = v.InferOutput<typeof TeamMember>;

/**
 * A collaboration-level grouping of groups (upstream `Team`).
 *
 * `groups`, `num_members` and `users` are hand-built by the handler's
 * `team_to_dict`; `users` is omitted from the list endpoint.
 *
 * @since 1.0.0
 * @category Models
 */
export const Team = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        name: Schemas.NullishString,
        nickname: Schemas.NullishString,
        description: Schemas.NullishString,
        primary_color: Schemas.NullishString,
        secondary_color: Schemas.NullishString,
        logo_url: Schemas.NullishString,
        background_url: Schemas.NullishString,
        groups: Schemas.list(TeamGroup),
        num_members: Schemas.NullishInteger,
        users: Schemas.nullish(v.array(TeamMember)),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type Team = v.InferOutput<typeof Team>;

/**
 * Payload for creating a team.
 *
 * `name` must be non-empty and unique, and the current user must be an admin
 * of every group in `group_ids`. Membership is derived: a user belongs to the
 * team if they belong to one of its groups.
 *
 * @since 1.0.0
 * @category Models
 */
export interface TeamPost {
    readonly name: string;
    readonly nickname?: string | undefined;
    readonly description?: string | undefined;
    readonly primary_color?: string | undefined;
    readonly secondary_color?: string | undefined;
    readonly logo_url?: string | undefined;
    readonly background_url?: string | undefined;
    readonly group_ids?: ReadonlyArray<number> | undefined;
}

/**
 * Payload for updating a team.
 *
 * Passing `null` for a field clears it server-side while omitting it leaves it
 * unchanged. When `group_ids` is set it replaces the team's groups, and the
 * user must be an admin of each group added or removed. `name`, if set, may
 * not be empty.
 *
 * @since 1.0.0
 * @category Models
 */
export interface TeamPut {
    readonly name?: string | undefined;
    readonly nickname?: string | null | undefined;
    readonly description?: string | null | undefined;
    readonly primary_color?: string | null | undefined;
    readonly secondary_color?: string | null | undefined;
    readonly logo_url?: string | null | undefined;
    readonly background_url?: string | null | undefined;
    readonly group_ids?: ReadonlyArray<number> | undefined;
}

/**
 * Result of creating a team.
 *
 * @since 1.0.0
 * @category Models
 */
export const TeamPostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type TeamPostResponse = v.InferOutput<typeof TeamPostResponse>;

/**
 * Result of updating a team.
 *
 * @since 1.0.0
 * @category Models
 */
export const TeamPutResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type TeamPutResponse = v.InferOutput<typeof TeamPutResponse>;

/** @internal */
const TeamsResponse = v.strictObject({ teams: Schemas.list(Team) });

/**
 * Retrieve the teams the token's user can access, ordered by name.
 *
 * The listing omits the per-team member roster; only `num_members` is
 * returned. Use {@link fetchTeam} for the full roster.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchTeams = async (client: Http.Client): Promise<Array<Team>> =>
    Http.decode(TeamsResponse, await Http.get(client, "/api/teams")).teams;

/**
 * Retrieve a single team, its groups, and its derived member roster.
 *
 * @since 1.0.0
 * @category Requests
 * @param teamId - ID of the team. Readable by members of any of the team's
 *   groups.
 */
export const fetchTeam = async (client: Http.Client, teamId: number): Promise<Team> =>
    Http.decode(Team, await Http.get(client, `/api/teams/${teamId}`));

/**
 * Create a team from a set of existing groups.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The team to create.
 */
export const postTeam = async (client: Http.Client, payload: TeamPost): Promise<TeamPostResponse> =>
    Http.decode(TeamPostResponse, await Http.post(client, "/api/teams", Http.body(payload)));

/**
 * Update a team's fields and/or its set of groups.
 *
 * Only the fields explicitly set on `payload` are sent.
 *
 * @since 1.0.0
 * @category Requests
 * @param teamId - ID of the team to update.
 * @param payload - The fields to change.
 */
export const updateTeam = async (client: Http.Client, teamId: number, payload: TeamPut): Promise<TeamPutResponse> =>
    Http.decode(TeamPutResponse, await Http.put(client, `/api/teams/${teamId}`, Http.body(payload)));

/**
 * Delete a team, leaving its groups and their data untouched.
 *
 * @since 1.0.0
 * @category Requests
 * @param teamId - ID of the team to delete. The user must be an admin of one of
 *   the team's groups.
 */
export const deleteTeam = async (client: Http.Client, teamId: number): Promise<void> => {
    await Http.del(client, `/api/teams/${teamId}`);
};
