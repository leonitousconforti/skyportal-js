/**
 * Typed endpoint functions for `/api/sharing`.
 *
 * @since 1.0.0
 */

import * as Http from "./Http.ts";

/**
 * Options for a sharing request.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PostSharingOptions {
    /** IDs of the photometry points to share. */
    readonly photometryIds?: ReadonlyArray<number> | undefined;
    /** IDs of the spectra to share. */
    readonly spectrumIds?: ReadonlyArray<number> | undefined;
}

/**
 * Share photometry and/or spectra with additional groups or users.
 *
 * At least one of `photometryIds` or `spectrumIds` must be given. Sharing is
 * additive: groups already attached to a point or spectrum are left in place.
 * Sharing photometry you do not own requires membership in every target group
 * plus sharing rights in one of the point's current groups, unless you are a
 * system admin. Spectra can only be shared by users with update access to
 * them.
 *
 * @since 1.0.0
 * @category Requests
 * @param groupIds - IDs of the groups the data will be shared with. To share
 *   with a single user, pass that user's single-user group ID.
 */
export const postSharing = async (
    client: Http.Client,
    groupIds: ReadonlyArray<number>,
    options: PostSharingOptions = {}
): Promise<void> => {
    await Http.post(
        client,
        "/api/sharing",
        Http.body({
            groupIDs: groupIds,
            photometryIDs: options.photometryIds,
            spectrumIDs: options.spectrumIds,
        })
    );
};
