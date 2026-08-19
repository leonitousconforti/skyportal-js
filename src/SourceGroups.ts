/**
 * Typed endpoint functions for `/api/source_groups`.
 *
 * @since 1.0.0
 */

import * as Http from "./Http.ts";

/**
 * Payload for saving or unsaving a source to or from groups.
 *
 * At least one of `inviteGroupIds` or `unsaveGroupIds` must be non-empty.
 * Groups the current user can access are saved immediately (`active`); the
 * others are recorded as save requests (`requested`), pending approval by a
 * member of that group.
 *
 * @since 1.0.0
 * @category Models
 */
export interface SourceGroupsPost {
    readonly objId: string;
    readonly inviteGroupIds?: ReadonlyArray<number> | undefined;
    readonly unsaveGroupIds?: ReadonlyArray<number> | undefined;
}

/**
 * Save (or request saving) a source to groups, and unsave it from others.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The object and the groups to save it to or unsave it from.
 */
export const postSourceGroups = async (client: Http.Client, payload: SourceGroupsPost): Promise<void> => {
    await Http.post(
        client,
        "/api/source_groups",
        Http.body({
            objId: payload.objId,
            inviteGroupIds: payload.inviteGroupIds ?? [],
            unsaveGroupIds: payload.unsaveGroupIds ?? [],
        })
    );
};

/**
 * Update the saved/requested state of a source within one group.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the source, e.g. `"ZTF20abcdef"`.
 * @param groupId - ID of the group whose save record is being updated. The
 *   source must already have a record for this group.
 * @param active - Whether the source is saved to the group. Flipping this from
 *   false to true records the current user as the saver.
 * @param requested - Whether the source is still requested to be saved to the
 *   group.
 */
export const updateSourceGroup = async (
    client: Http.Client,
    objId: string,
    groupId: number,
    active: boolean,
    requested: boolean
): Promise<void> => {
    await Http.patch(client, `/api/source_groups/${objId}`, {
        groupID: groupId,
        active,
        requested,
    });
};
