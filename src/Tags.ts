/**
 * Typed endpoint functions for `/api/objtagoption` and `/api/objtag`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Groups from "./Groups.ts";
import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";

/**
 * A tag that can be applied to objects (upstream `ObjTagOption`).
 *
 * @since 1.0.0
 * @category Models
 */
export const ObjTagOption = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        name: Schemas.NullishString,
        color: Schemas.NullishString,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type ObjTagOption = v.InferOutput<typeof ObjTagOption>;

/**
 * An object-tag association (upstream `ObjTag`).
 *
 * Handlers that assemble a tag by hand add `name` (the tag option's name) and,
 * on the internal endpoints, `total_group_count` (how many groups hold the
 * tag, before the user's groups are filtered out). `obj` and `author` stay
 * free-form to avoid importing in a circle from the modules that import this
 * one.
 *
 * @since 1.0.0
 * @category Models
 */
export const ObjTag = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        obj_id: Schemas.NullishString,
        objtagoption_id: Schemas.NullishInteger,
        author_id: Schemas.NullishInteger,
        objtagoption: Schemas.nullish(ObjTagOption),
        groups: Schemas.nullish(v.array(Groups.Group)),
        obj: Schemas.nullish(Schemas.JsonObject),
        author: Schemas.nullish(Schemas.JsonObject),
        name: Schemas.NullishString,
        total_group_count: Schemas.NullishInteger,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type ObjTag = v.InferOutput<typeof ObjTag>;

/**
 * Result of creating an object-tag association.
 *
 * A brand-new association comes back in full; adding groups to one that
 * already exists returns only `id` and `message`, and adding nothing returns
 * an empty result.
 *
 * @since 1.0.0
 * @category Models
 */
export const ObjTagPostResponse = Schemas.model(
    v.strictObject({
        id: Schemas.NullishInteger,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        obj_id: Schemas.NullishString,
        objtagoption_id: Schemas.NullishInteger,
        author_id: Schemas.NullishInteger,
        message: Schemas.NullishString,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type ObjTagPostResponse = v.InferOutput<typeof ObjTagPostResponse>;

/**
 * Retrieve all available tag options.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchObjTagOptions = async (client: Http.Client): Promise<Array<ObjTagOption>> =>
    Http.decode(v.array(ObjTagOption), await Http.get(client, "/api/objtagoption"));

/**
 * Options for creating a tag option.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PostObjTagOptionOptions {
    /** Hex color code for display, e.g. `"#3a87ad"`. */
    readonly color?: string | undefined;
}

/**
 * Create a new tag option.
 *
 * Requires the "Manage sources" permission. Names are unique
 * case-insensitively.
 *
 * @since 1.0.0
 * @category Requests
 * @param name - Tag name; letters and numbers only.
 */
export const postObjTagOption = async (
    client: Http.Client,
    name: string,
    options: PostObjTagOptionOptions = {}
): Promise<ObjTagOption> =>
    Http.decode(ObjTagOption, await Http.post(client, "/api/objtagoption", Http.body({ name, color: options.color })));

/**
 * Options for updating a tag option.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpdateObjTagOptionOptions {
    /**
     * New hex color code, e.g. `"#3a87ad"`. If omitted, the color is left
     * unchanged.
     */
    readonly color?: string | undefined;
}

/**
 * Update an existing tag option's name and/or color.
 *
 * @since 1.0.0
 * @category Requests
 * @param tagId - ID of the tag option to update.
 * @param name - New tag name; letters and numbers only.
 */
export const updateObjTagOption = async (
    client: Http.Client,
    tagId: number,
    name: string,
    options: UpdateObjTagOptionOptions = {}
): Promise<void> => {
    await Http.patch(client, `/api/objtagoption/${tagId}`, Http.body({ name, color: options.color }));
};

/**
 * Delete a tag option.
 *
 * Requires the "Manage sources" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param tagId - ID of the tag option to delete.
 */
export const deleteObjTagOption = async (client: Http.Client, tagId: number): Promise<void> => {
    await Http.del(client, `/api/objtagoption/${tagId}`);
};

/**
 * Options for listing object-tag associations.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchObjTagsOptions {
    /** Restrict to associations on this object. */
    readonly objId?: string | undefined;
    /** Restrict to associations of this tag option. */
    readonly objtagoptionId?: number | undefined;
    /**
     * If true and `objId` is given, also return tags on the objects linked to
     * it through a super-object; each entry keeps its own `obj_id`. Defaults
     * to false.
     */
    readonly includeSuperObjs?: boolean | undefined;
}

/**
 * Retrieve object-tag associations, optionally filtered.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchObjTags = async (client: Http.Client, options: FetchObjTagsOptions = {}): Promise<Array<ObjTag>> =>
    Http.decode(
        v.array(ObjTag),
        await Http.get(client, "/api/objtag", {
            obj_id: options.objId,
            objtagoption_id: options.objtagoptionId,
            includeSuperObjs: options.includeSuperObjs === true ? true : undefined,
        })
    );

/**
 * Options for tagging an object.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PostObjTagOptions {
    /**
     * Groups that can access this tag association. Defaults to the server's
     * public group.
     */
    readonly groupIds?: ReadonlyArray<number> | undefined;
}

/**
 * Tag an object by creating an object-tag association.
 *
 * If the association already exists, the server instead adds the given groups
 * to it and returns only `id` and `message` (or an empty result if there was
 * nothing to add).
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - ID of the object to tag.
 * @param objtagoptionId - ID of the tag option to associate.
 */
export const postObjTag = async (
    client: Http.Client,
    objId: string,
    objtagoptionId: number,
    options: PostObjTagOptions = {}
): Promise<ObjTagPostResponse> =>
    Http.decode(
        ObjTagPostResponse,
        (await Http.post(
            client,
            "/api/objtag",
            Http.body({
                obj_id: objId,
                objtagoption_id: objtagoptionId,
                group_ids: options.groupIds,
            })
        )) ?? {}
    );

/**
 * Options for removing an object tag.
 *
 * @since 1.0.0
 * @category Models
 */
export interface DeleteObjTagOptions {
    /** Group IDs to remove; must be non-empty if provided. */
    readonly groupIds?: ReadonlyArray<number> | undefined;
}

/**
 * Remove group associations from an object tag.
 *
 * If `groupIds` is provided, only those groups are removed; otherwise all of
 * the user's group associations are removed. If no group associations remain
 * afterwards, the tag itself is deleted.
 *
 * @since 1.0.0
 * @category Requests
 * @param associationId - ID of the object-tag association.
 */
export const deleteObjTag = async (
    client: Http.Client,
    associationId: number,
    options: DeleteObjTagOptions = {}
): Promise<void> => {
    await Http.del(client, `/api/objtag/${associationId}`, Http.body({ group_ids: options.groupIds }));
};
