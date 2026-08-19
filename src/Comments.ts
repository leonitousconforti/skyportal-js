/**
 * Typed endpoint functions for source comments.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Groups from "./Groups.ts";
import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";

/**
 * What a comment is attached to.
 *
 * @since 1.0.0
 * @category Models
 */
export type CommentResourceType = "sources" | "spectra" | "gcn_event" | "shift" | "earthquake";

/**
 * The fields of a {@link Comment}.
 *
 * @since 1.0.0
 * @category Models
 */
export const CommentEntries = {
    id: Schemas.Integer,
    created_at: Schemas.NullishTimestamp,
    modified: Schemas.NullishTimestamp,
    text: Schemas.NullishString,
    attachment_name: Schemas.NullishString,
    attachment_bytes: Schemas.nullish(Schemas.Json),
    origin: Schemas.NullishString,
    bot: Schemas.NullishBoolean,
    author_id: Schemas.NullishInteger,
    author: Schemas.nullish(Schemas.JsonObject),
    groups: Schemas.nullish(v.array(Groups.Group)),
    obj_id: Schemas.NullishString,
    spectrum_id: Schemas.NullishInteger,
    gcn_id: Schemas.NullishInteger,
    earthquake_id: Schemas.NullishInteger,
    shift_id: Schemas.NullishInteger,
    obj: Schemas.nullish(Schemas.JsonObject),
    spectrum: Schemas.nullish(Schemas.JsonObject),
    gcn: Schemas.nullish(Schemas.JsonObject),
    shift: Schemas.nullish(Schemas.JsonObject),
    earthquake: Schemas.nullish(Schemas.JsonObject),
    dateobs: Schemas.NullishTimestamp,
    resourceType: Schemas.NullishString,
};

/**
 * A comment on any commentable resource (upstream `Comment`).
 *
 * Upstream splits comments across `Comment`, `CommentOnSpectrum`,
 * `CommentOnGCN`, `CommentOnShift` and `CommentOnEarthquake`; this model is
 * the union of that family, so each type-specific foreign key is optional and
 * only the ones belonging to the comment's own table are ever set. `author` is
 * the author's `User.to_dict()` (plus a `gravatar_url` key on the source
 * endpoints), and `obj`, `gcn`, `spectrum`, `shift` and `earthquake` stay
 * free-form to avoid importing in a circle from the modules that import this
 * one.
 *
 * @since 1.0.0
 * @category Models
 */
export const Comment = Schemas.model(v.strictObject(CommentEntries));

/**
 * @since 1.0.0
 * @category Models
 */
export type Comment = v.InferOutput<typeof Comment>;

/**
 * A single comment, as returned by the single-comment endpoint.
 *
 * The list and single-GET routes both return `Comment.to_dict()` plus
 * `resourceType`, so this is {@link Comment} under the name the single-comment
 * endpoint is documented with.
 *
 * @since 1.0.0
 * @category Models
 */
export const CommentDetail = Schemas.model(v.strictObject(CommentEntries));

/**
 * @since 1.0.0
 * @category Models
 */
export type CommentDetail = v.InferOutput<typeof CommentDetail>;

/**
 * Result of posting a comment.
 *
 * @since 1.0.0
 * @category Models
 */
export const CommentPostResponse = Schemas.model(
    v.strictObject({
        comment_id: Schemas.Integer,
        message: Schemas.NullishString,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type CommentPostResponse = v.InferOutput<typeof CommentPostResponse>;

/**
 * The decoded contents of a comment attachment.
 *
 * @since 1.0.0
 * @category Models
 */
export const CommentAttachment = Schemas.model(
    v.strictObject({
        commentId: Schemas.Integer,
        attachment: Schemas.NullishString,
        attachmentName: Schemas.NullishString,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type CommentAttachment = v.InferOutput<typeof CommentAttachment>;

/**
 * How many comments still hold their attachment in the database.
 *
 * @since 1.0.0
 * @category Models
 */
export const CommentAttachmentCounts = Schemas.model(
    v.strictObject({
        totalWithoutAttachmentBytes: v.optional(Schemas.Integer, 0),
        totalWithAttachmentBytes: v.optional(Schemas.Integer, 0),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type CommentAttachmentCounts = v.InferOutput<typeof CommentAttachmentCounts>;

/**
 * Result of moving one page of comment attachments to disk.
 *
 * @since 1.0.0
 * @category Models
 */
export const CommentAttachmentBatch = Schemas.model(
    v.strictObject({
        totalMatches: v.optional(Schemas.Integer, 0),
        pageNumber: v.optional(Schemas.Integer, 1),
        numPerPage: v.optional(Schemas.Integer, 100),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type CommentAttachmentBatch = v.InferOutput<typeof CommentAttachmentBatch>;

/**
 * Options for listing comments.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchCommentsOptions {
    /** What the comments are on. Defaults to `"sources"`. */
    readonly resourceType?: CommentResourceType | undefined;
    /**
     * Restrict to comments whose text contains this string; matching comments
     * come back newest first.
     */
    readonly text?: string | undefined;
    /**
     * Restrict to source comments on this channel. Only applies when
     * `resourceType` is `"sources"`; without it the server returns only
     * channel-less comments.
     */
    readonly channel?: string | undefined;
    /**
     * Pagination controls; the server caps the page size and only paginates
     * when `text` is provided.
     */
    readonly pageNumber?: number | undefined;
    readonly numPerPage?: number | undefined;
}

/**
 * Retrieve the comments on a commentable resource.
 *
 * @since 1.0.0
 * @category Requests
 * @param resourceId - ID of the commented resource: an object ID for sources,
 *   otherwise an integer ID.
 */
export const fetchComments = async (
    client: Http.Client,
    resourceId: string | number,
    options: FetchCommentsOptions = {}
): Promise<Array<Comment>> =>
    Http.decode(
        v.array(Comment),
        await Http.get(client, `/api/${options.resourceType ?? "sources"}/${resourceId}/comments`, {
            pageNumber: options.pageNumber ?? 1,
            numPerPage: options.numPerPage ?? 25,
            text: options.text,
            channel: options.channel,
        })
    );

/**
 * Options for posting a comment.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PostCommentOptions {
    /** What to comment on. Defaults to `"sources"`. */
    readonly resourceType?: CommentResourceType | undefined;
    /**
     * Restrict the comment's visibility to these groups. If omitted, the
     * server applies its default visibility.
     */
    readonly groupIds?: ReadonlyArray<number> | undefined;
}

/**
 * Post a comment on a commentable resource.
 *
 * @since 1.0.0
 * @category Requests
 * @param resourceId - ID of the resource to comment on: an object ID for
 *   sources, otherwise an integer ID.
 * @param text - The comment text.
 */
export const postComment = async (
    client: Http.Client,
    resourceId: string | number,
    text: string,
    options: PostCommentOptions = {}
): Promise<CommentPostResponse> =>
    Http.decode(
        CommentPostResponse,
        await Http.post(
            client,
            `/api/${options.resourceType ?? "sources"}/${resourceId}/comments`,
            Http.body({ text, group_ids: options.groupIds })
        )
    );

/**
 * Options for updating a comment.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpdateCommentOptions {
    /** The new comment text. */
    readonly text?: string | undefined;
    /** What the comment is on. Defaults to `"sources"`. */
    readonly resourceType?: CommentResourceType | undefined;
    /** Filename of the replacement attachment. */
    readonly attachmentName?: string | undefined;
    /**
     * Base64-encoded contents of the replacement attachment, optionally still
     * carrying a `data:...;base64,` prefix.
     */
    readonly attachmentBody?: string | undefined;
    /**
     * Restrict the comment's visibility to these groups. If omitted, the
     * visibility is left unchanged.
     */
    readonly groupIds?: ReadonlyArray<number> | undefined;
}

/**
 * Update a comment on a commentable resource.
 *
 * Omitted fields are left unchanged; provide at least one. To replace the
 * attachment, give `attachmentName` and `attachmentBody` together.
 *
 * @since 1.0.0
 * @category Requests
 * @param resourceId - ID of the commented resource.
 * @param commentId - ID of the comment to update.
 */
export const updateComment = async (
    client: Http.Client,
    resourceId: string | number,
    commentId: number,
    options: UpdateCommentOptions = {}
): Promise<void> => {
    const attachment =
        options.attachmentName === undefined && options.attachmentBody === undefined
            ? undefined
            : { name: options.attachmentName ?? null, body: options.attachmentBody ?? null };
    await Http.put(
        client,
        `/api/${options.resourceType ?? "sources"}/${resourceId}/comments/${commentId}`,
        Http.body({ text: options.text, attachment, group_ids: options.groupIds })
    );
};

/**
 * Options naming which commentable resource a comment belongs to.
 *
 * @since 1.0.0
 * @category Models
 */
export interface CommentResourceOptions {
    /** What the comment is on. Defaults to `"sources"`. */
    readonly resourceType?: CommentResourceType | undefined;
}

/**
 * Delete a comment on a commentable resource.
 *
 * @since 1.0.0
 * @category Requests
 * @param resourceId - ID of the commented resource.
 * @param commentId - ID of the comment to delete.
 */
export const deleteComment = async (
    client: Http.Client,
    resourceId: string | number,
    commentId: number,
    options: CommentResourceOptions = {}
): Promise<void> => {
    await Http.del(client, `/api/${options.resourceType ?? "sources"}/${resourceId}/comments/${commentId}`);
};

/**
 * Retrieve a single comment on any commentable resource.
 *
 * @since 1.0.0
 * @category Requests
 * @param resourceId - ID of the commented resource; it must match the comment's
 *   own resource.
 * @param commentId - ID of the comment.
 */
export const fetchComment = async (
    client: Http.Client,
    resourceId: string | number,
    commentId: number,
    options: CommentResourceOptions = {}
): Promise<CommentDetail> =>
    Http.decode(
        CommentDetail,
        await Http.get(client, `/api/${options.resourceType ?? "sources"}/${resourceId}/comments/${commentId}`)
    );

/**
 * Post a comment carrying a file attachment.
 *
 * @since 1.0.0
 * @category Requests
 * @param resourceId - ID of the resource to comment on.
 * @param text - The comment text.
 * @param attachmentName - Filename of the attachment; its extension decides
 *   whether the server can render a preview later.
 * @param attachmentBody - Base64-encoded file contents, optionally still
 *   carrying a `data:...;base64,` prefix.
 */
export const postCommentWithAttachment = async (
    client: Http.Client,
    resourceId: string | number,
    text: string,
    attachmentName: string,
    attachmentBody: string,
    options: PostCommentOptions = {}
): Promise<CommentPostResponse> =>
    Http.decode(
        CommentPostResponse,
        await Http.post(
            client,
            `/api/${options.resourceType ?? "sources"}/${resourceId}/comments`,
            Http.body({
                text,
                attachment: { name: attachmentName, body: attachmentBody },
                group_ids: options.groupIds,
            })
        )
    );

/**
 * Options for downloading a comment attachment.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchCommentAttachmentOptions {
    /** What the comment is on. Defaults to `"sources"`. */
    readonly resourceType?: CommentResourceType | undefined;
    /**
     * Return a renderable preview instead of the raw file: FITS files come
     * back as PNG, and other types must be in the server's list of previewable
     * extensions.
     */
    readonly preview?: boolean | undefined;
}

/** @internal */
const attachmentParams = (preview: boolean | undefined): Http.QueryParams =>
    preview === true ? { download: "", preview: "true" } : { download: "true" };

/**
 * Download a comment's attachment as raw bytes.
 *
 * @since 1.0.0
 * @category Requests
 * @param resourceId - ID of the commented resource; it must match the comment's
 *   own resource.
 * @param commentId - ID of the comment holding the attachment.
 */
export const fetchCommentAttachment = (
    client: Http.Client,
    resourceId: string | number,
    commentId: number,
    options: FetchCommentAttachmentOptions = {}
): Promise<Uint8Array> =>
    Http.getContent(
        client,
        `/api/${options.resourceType ?? "sources"}/${resourceId}/comments/${commentId}/attachment`,
        attachmentParams(options.preview)
    );

/**
 * Download a comment's attachment from the `.pdf` alias route.
 *
 * This serves exactly the same bytes as {@link fetchCommentAttachment}; the
 * suffixed URL exists only so that PDF viewers which key off the file
 * extension can load it.
 *
 * @since 1.0.0
 * @category Requests
 * @param resourceId - ID of the commented resource.
 * @param commentId - ID of the comment holding the attachment.
 */
export const fetchCommentAttachmentPdf = (
    client: Http.Client,
    resourceId: string | number,
    commentId: number,
    options: FetchCommentAttachmentOptions = {}
): Promise<Uint8Array> =>
    Http.getContent(
        client,
        `/api/${options.resourceType ?? "sources"}/${resourceId}/comments/${commentId}/attachment.pdf`,
        attachmentParams(options.preview)
    );

/**
 * Retrieve a comment's attachment decoded as text.
 *
 * Only useful for text-like attachments; binary files raise a decoding error
 * on the server. Use {@link fetchCommentAttachment} otherwise.
 *
 * @since 1.0.0
 * @category Requests
 * @param resourceId - ID of the commented resource.
 * @param commentId - ID of the comment holding the attachment.
 */
export const fetchCommentAttachmentText = async (
    client: Http.Client,
    resourceId: string | number,
    commentId: number,
    options: CommentResourceOptions = {}
): Promise<CommentAttachment> =>
    Http.decode(
        CommentAttachment,
        await Http.get(
            client,
            `/api/${options.resourceType ?? "sources"}/${resourceId}/comments/${commentId}/attachment`,
            { download: "", preview: "" }
        )
    );

/**
 * Count comments whose attachment is still stored in the database.
 *
 * Requires the System admin ACL.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchCommentAttachmentCounts = async (client: Http.Client): Promise<CommentAttachmentCounts> =>
    Http.decode(CommentAttachmentCounts, await Http.get(client, "/api/comment_attachment"));

/**
 * Options for the comment-attachment migration batch.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PostCommentAttachmentBatchOptions {
    /**
     * Pagination controls over the comments that still hold attachment bytes.
     * `numPerPage` is capped at 500 by the server.
     */
    readonly pageNumber?: number | undefined;
    readonly numPerPage?: number | undefined;
}

/**
 * Move one page of in-database comment attachments onto disk.
 *
 * Requires the System admin ACL. Because migrated comments drop out of the
 * result set, repeated calls with `pageNumber: 1` walk the whole backlog.
 *
 * @since 1.0.0
 * @category Requests
 */
export const postCommentAttachmentBatch = async (
    client: Http.Client,
    options: PostCommentAttachmentBatchOptions = {}
): Promise<CommentAttachmentBatch> =>
    Http.decode(
        CommentAttachmentBatch,
        await Http.post(client, "/api/comment_attachment", undefined, {
            pageNumber: options.pageNumber ?? 1,
            numPerPage: options.numPerPage ?? 100,
        })
    );
