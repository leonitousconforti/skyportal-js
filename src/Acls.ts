/**
 * Typed endpoint functions for `/api/acls`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Http from "./Http.ts";

/**
 * Retrieve the IDs of all ACLs.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchAcls = async (client: Http.Client): Promise<Array<string>> =>
    Http.decode(v.array(v.string()), await Http.get(client, "/api/acls"));

/**
 * Grant ACLs to a user (requires the "Manage users" ACL).
 *
 * @since 1.0.0
 * @category Requests
 * @param userId - ID of the user to grant the ACLs to.
 * @param aclIds - IDs of the ACLs to grant; every ID must name an existing ACL.
 */
export const postUserAcl = async (
    client: Http.Client,
    userId: number,
    aclIds: ReadonlyArray<string>
): Promise<void> => {
    await Http.post(client, `/api/user/${userId}/acls`, { aclIds });
};

/**
 * Remove an ACL from a user (requires the "Manage users" ACL).
 *
 * @since 1.0.0
 * @category Requests
 * @param userId - ID of the user to remove the ACL from.
 * @param aclId - ID of the ACL to remove.
 */
export const deleteUserAcl = async (client: Http.Client, userId: number, aclId: string): Promise<void> => {
    await Http.del(client, `/api/user/${userId}/acls/${aclId}`);
};
