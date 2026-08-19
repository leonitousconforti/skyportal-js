/**
 * Typed endpoint functions for `/api/thumbnail`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";

/**
 * Thumbnail types SkyPortal accepts (upstream `THUMBNAIL_TYPES`).
 *
 * @since 1.0.0
 * @category Models
 */
export const ThumbnailType = v.picklist([
    "new",
    "ref",
    "sub",
    "sdss",
    "dr8",
    "ls",
    "ps1",
    "sm",
    "hst",
    "chandra",
    "jwst",
    "new_gz",
    "ref_gz",
    "sub_gz",
]);

/**
 * @since 1.0.0
 * @category Models
 */
export type ThumbnailType = v.InferOutput<typeof ThumbnailType>;

/**
 * A thumbnail image centered on an object (upstream `Thumbnail`).
 *
 * @since 1.0.0
 * @category Models
 */
export const Thumbnail = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        obj_id: Schemas.NullishString,
        type: Schemas.nullish(ThumbnailType),
        file_uri: Schemas.NullishString,
        public_url: Schemas.NullishString,
        origin: Schemas.NullishString,
        survey: Schemas.NullishString,
        is_grayscale: Schemas.NullishBoolean,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type Thumbnail = v.InferOutput<typeof Thumbnail>;

/**
 * Payload for uploading a thumbnail.
 *
 * @since 1.0.0
 * @category Models
 */
export interface ThumbnailPost {
    readonly obj_id: string;
    /** Base64-encoded PNG contents. */
    readonly data: string;
    readonly ttype: ThumbnailType;
    /** The survey the cutout came from; omit for all-sky archival thumbnails. */
    readonly survey?: string | undefined;
}

/**
 * Result of uploading a thumbnail.
 *
 * @since 1.0.0
 * @category Models
 */
export const ThumbnailPostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type ThumbnailPostResponse = v.InferOutput<typeof ThumbnailPostResponse>;

/**
 * Counts of thumbnails found in the correct and incorrect folders.
 *
 * @since 1.0.0
 * @category Models
 */
export const ThumbnailPathReport = Schemas.model(
    v.strictObject({
        totalMatches: Schemas.NullishInteger,
        inCorrectFolder: Schemas.NullishInteger,
        inWrongFolder: Schemas.NullishInteger,
        numMoved: Schemas.NullishInteger,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type ThumbnailPathReport = v.InferOutput<typeof ThumbnailPathReport>;

/**
 * Retrieve a single thumbnail by ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param thumbnailId - ID of the thumbnail.
 */
export const fetchThumbnail = async (client: Http.Client, thumbnailId: number): Promise<Thumbnail> =>
    Http.decode(Thumbnail, await Http.get(client, `/api/thumbnail/${thumbnailId}`));

/**
 * Upload a thumbnail for an object.
 *
 * The server decodes the image, writes it under `static/thumbnails` and
 * rejects anything that is not a PNG between 16 and 500 pixels on a side.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The thumbnail to upload.
 */
export const postThumbnail = async (client: Http.Client, payload: ThumbnailPost): Promise<ThumbnailPostResponse> =>
    Http.decode(ThumbnailPostResponse, await Http.post(client, "/api/thumbnail", Http.body(payload)));

/**
 * Options for updating a thumbnail.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpdateThumbnailOptions {
    /** New object ID the thumbnail belongs to. */
    readonly objId?: string | undefined;
    /** New thumbnail type, e.g. `"ref"`, `"new"`, `"sub"`. */
    readonly type?: ThumbnailType | undefined;
    /** New path of the thumbnail on the machine running SkyPortal. */
    readonly fileUri?: string | undefined;
    /** New publicly accessible URL of the thumbnail. */
    readonly publicUrl?: string | undefined;
    /** New origin of the thumbnail. */
    readonly origin?: string | undefined;
    /** Whether the thumbnail is (mostly) grayscale. */
    readonly isGrayscale?: boolean | undefined;
}

/**
 * Update fields of an existing thumbnail.
 *
 * Only the provided fields are sent; omitted fields are left unchanged. The
 * image file itself is not moved or rewritten.
 *
 * @since 1.0.0
 * @category Requests
 * @param thumbnailId - ID of the thumbnail to update.
 */
export const updateThumbnail = async (
    client: Http.Client,
    thumbnailId: number,
    options: UpdateThumbnailOptions = {}
): Promise<void> => {
    await Http.put(
        client,
        `/api/thumbnail/${thumbnailId}`,
        Http.body({
            obj_id: options.objId,
            type: options.type,
            file_uri: options.fileUri,
            public_url: options.publicUrl,
            origin: options.origin,
            is_grayscale: options.isGrayscale,
        })
    );
};

/**
 * Delete a thumbnail.
 *
 * The image file on disk is removed along with the database row.
 *
 * @since 1.0.0
 * @category Requests
 * @param thumbnailId - ID of the thumbnail to delete.
 */
export const deleteThumbnail = async (client: Http.Client, thumbnailId: number): Promise<void> => {
    await Http.del(client, `/api/thumbnail/${thumbnailId}`);
};

/**
 * Options for auditing thumbnail storage paths.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchThumbnailPathsOptions {
    /**
     * Thumbnail types to check. The server defaults to `["new", "ref",
     * "sub"]`, the types stored locally.
     */
    readonly types?: ReadonlyArray<string> | undefined;
    /**
     * Number of hashed subdirectories thumbnails are expected to live in,
     * between 0 and 32. The server default is 2.
     */
    readonly requiredDepth?: number | undefined;
}

/**
 * Count thumbnails stored in the correct and incorrect folders.
 *
 * Requires the System admin ACL. Nothing is moved; this only reports.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchThumbnailPaths = async (
    client: Http.Client,
    options: FetchThumbnailPathsOptions = {}
): Promise<ThumbnailPathReport> =>
    Http.decode(
        ThumbnailPathReport,
        await Http.get(client, "/api/thumbnailPath", {
            types: options.types,
            requiredDepth: options.requiredDepth,
        })
    );

/**
 * Options for relocating thumbnails.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpdateThumbnailPathsOptions {
    /** Thumbnail types to check. The server defaults to `["new", "ref", "sub"]`. */
    readonly types?: ReadonlyArray<string> | undefined;
    /**
     * Number of hashed subdirectories thumbnails should live in, between 1 and
     * 32. The server default is 2.
     */
    readonly requiredDepth?: number | undefined;
    /** Number of thumbnails to process. Defaults to 100, capped at 1000. */
    readonly numPerPage?: number | undefined;
    /** Page to process. Defaults to 1. */
    readonly pageNumber?: number | undefined;
}

/**
 * Move thumbnails that are in the wrong folder and fix their database rows.
 *
 * Requires the System admin ACL. Files are moved on disk and their `file_uri`
 * and `public_url` updated; thumbnails whose file is missing are dropped and
 * re-fetched from the alert broker. Only one page of thumbnails is processed
 * per call, so repeat until nothing is left in the wrong folder.
 *
 * @since 1.0.0
 * @category Requests
 */
export const updateThumbnailPaths = async (
    client: Http.Client,
    options: UpdateThumbnailPathsOptions = {}
): Promise<ThumbnailPathReport> =>
    Http.decode(
        ThumbnailPathReport,
        await Http.patch(client, "/api/thumbnailPath", undefined, {
            types: options.types,
            requiredDepth: options.requiredDepth,
            numPerPage: options.numPerPage,
            pageNumber: options.pageNumber,
        })
    );

/**
 * Delete every empty subfolder under the thumbnails directory.
 *
 * Requires the System admin ACL. These folders are left behind after
 * thumbnails are moved to a different folder structure.
 *
 * @since 1.0.0
 * @category Requests
 */
export const deleteThumbnailFolders = async (client: Http.Client): Promise<void> => {
    await Http.del(client, "/api/thumbnailPath");
};
