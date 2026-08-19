/**
 * Typed endpoint functions for `/api/streams`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";

/**
 * An alert stream, e.g. a survey's public alerts (upstream `Stream`).
 *
 * No handler eager-loads `Stream.groups`/`users`/`filters`/`photometry`, so
 * those relationships never appear in a serialized stream and are not
 * declared.
 *
 * @since 1.0.0
 * @category Models
 */
export const Stream = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        name: v.string(),
        altdata: Schemas.nullish(Schemas.JsonObject),
        auto_join: Schemas.NullishBoolean,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type Stream = v.InferOutput<typeof Stream>;

/**
 * Result of creating a stream.
 *
 * @since 1.0.0
 * @category Models
 */
export const StreamPostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type StreamPostResponse = v.InferOutput<typeof StreamPostResponse>;

/**
 * Result of granting a user access to a stream.
 *
 * @since 1.0.0
 * @category Models
 */
export const StreamUserPostResponse = Schemas.model(
    v.strictObject({
        stream_id: Schemas.Integer,
        user_id: Schemas.Integer,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type StreamUserPostResponse = v.InferOutput<typeof StreamUserPostResponse>;

/**
 * Retrieve the alert streams visible to the token.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchStreams = async (client: Http.Client): Promise<Array<Stream>> =>
    Http.decode(v.array(Stream), await Http.get(client, "/api/streams"));

/**
 * Retrieve a single alert stream by ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param streamId - ID of the stream.
 */
export const fetchStream = async (client: Http.Client, streamId: number): Promise<Stream> =>
    Http.decode(Stream, await Http.get(client, `/api/streams/${streamId}`));

/**
 * Options for creating an alert stream.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PostStreamOptions {
    /** Misc. metadata stored as JSON, e.g. `{ collection: "ZTF_alerts", selector: [1, 2] }`. */
    readonly altdata?: Record<string, unknown> | undefined;
    /**
     * Allow any user to add themselves to the stream. Auto-join streams are
     * visible to all users.
     */
    readonly autoJoin?: boolean | undefined;
}

/**
 * Create a new alert stream. Requires the System admin ACL.
 *
 * @since 1.0.0
 * @category Requests
 * @param name - The stream name.
 */
export const postStream = async (
    client: Http.Client,
    name: string,
    options: PostStreamOptions = {}
): Promise<StreamPostResponse> =>
    Http.decode(
        StreamPostResponse,
        await Http.post(
            client,
            "/api/streams",
            Http.body({ name, auto_join: options.autoJoin ?? false, altdata: options.altdata })
        )
    );

/**
 * Options for updating an alert stream.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpdateStreamOptions {
    /** New misc. metadata stored as JSON. */
    readonly altdata?: Record<string, unknown> | undefined;
    /** Whether any user may add themselves to the stream. */
    readonly autoJoin?: boolean | undefined;
}

/**
 * Update an alert stream. Requires the System admin ACL.
 *
 * Omitted optional fields are left unchanged.
 *
 * @since 1.0.0
 * @category Requests
 * @param streamId - ID of the stream to update.
 * @param name - The stream name; required by the server even if unchanged.
 */
export const updateStream = async (
    client: Http.Client,
    streamId: number,
    name: string,
    options: UpdateStreamOptions = {}
): Promise<void> => {
    await Http.patch(
        client,
        `/api/streams/${streamId}`,
        Http.body({ name, altdata: options.altdata, auto_join: options.autoJoin })
    );
};

/**
 * Delete an alert stream. Requires the System admin ACL.
 *
 * @since 1.0.0
 * @category Requests
 * @param streamId - ID of the stream to delete.
 */
export const deleteStream = async (client: Http.Client, streamId: number): Promise<void> => {
    await Http.del(client, `/api/streams/${streamId}`);
};

/**
 * Grant a user access to an alert stream.
 *
 * System admins may add any user; a non-admin may add only themselves, and
 * only to an auto-join stream.
 *
 * @since 1.0.0
 * @category Requests
 * @param streamId - ID of the stream.
 * @param userId - ID of the user to be granted stream access.
 */
export const postStreamUser = async (
    client: Http.Client,
    streamId: number,
    userId: number
): Promise<StreamUserPostResponse> =>
    Http.decode(StreamUserPostResponse, await Http.post(client, `/api/streams/${streamId}/users`, { user_id: userId }));

/**
 * Revoke a user's access to an alert stream. Requires System admin.
 *
 * @since 1.0.0
 * @category Requests
 * @param streamId - ID of the stream.
 * @param userId - ID of the user whose stream access is revoked.
 */
export const deleteStreamUser = async (client: Http.Client, streamId: number, userId: number): Promise<void> => {
    await Http.del(client, `/api/streams/${streamId}/users/${userId}`);
};
