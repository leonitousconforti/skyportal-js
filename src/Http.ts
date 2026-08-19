/**
 * Envelope unwrapping, error handling, and the low-level request surface every
 * endpoint function is built on.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

/**
 * A value that can be sent as a query-string parameter. Arrays are encoded as
 * a repeated key, the form SkyPortal's Tornado handlers read with
 * `get_query_arguments`.
 *
 * @since 1.0.0
 * @category Models
 */
export type QueryValue = string | number | boolean | ReadonlyArray<string | number | boolean> | null | undefined;

/**
 * The query parameters of a request, before `null`/`undefined` values are
 * dropped.
 *
 * @since 1.0.0
 * @category Models
 */
export type QueryParams = Record<string, QueryValue>;

/**
 * Everything an endpoint function needs to describe one HTTP call.
 *
 * @since 1.0.0
 * @category Models
 */
export interface RequestOptions {
    readonly method: "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE";
    readonly path: string;
    readonly query?: QueryParams | undefined;
    readonly body?: unknown;
    readonly formData?: FormData | undefined;
    readonly signal?: AbortSignal | undefined;
}

/**
 * The transport an endpoint function talks to.
 *
 * Endpoint functions take this as their first argument, so anything with a
 * `request` method works: the client from
 * {@link skyportal-js/Client!createClient}, or a stub in a test.
 *
 * @since 1.0.0
 * @category Models
 */
export interface Client {
    readonly baseUrl: string;
    readonly request: (options: RequestOptions) => Promise<Response>;
}

/**
 * Raised when the SkyPortal API returns an error response.
 *
 * @since 1.0.0
 * @category Errors
 */
export class SkyPortalError extends Error {
    /**
     * @since 1.0.0
     */
    override readonly name = "SkyPortalError";

    /**
     * HTTP status code of the response, when there was one.
     *
     * @since 1.0.0
     */
    readonly statusCode: number | undefined;

    /**
     * @since 1.0.0
     */
    constructor(message: string, statusCode?: number) {
        super(message);
        this.statusCode = statusCode;
    }
}

/**
 * Raised when a response does not match the schema this client expects.
 *
 * Every model is strict: unknown fields in a server response are an error
 * rather than something to ignore, so that SkyPortal schema drift surfaces
 * immediately instead of silently producing partial data.
 *
 * @since 1.0.0
 * @category Errors
 */
export class SkyPortalValidationError extends Error {
    /**
     * @since 1.0.0
     */
    override readonly name = "SkyPortalValidationError";

    /**
     * The individual valibot issues, in the order they were found.
     *
     * @since 1.0.0
     */
    readonly issues: ReadonlyArray<v.BaseIssue<unknown>>;

    /**
     * @since 1.0.0
     */
    constructor(message: string, issues: ReadonlyArray<v.BaseIssue<unknown>>) {
        super(message);
        this.issues = issues;
    }
}

/**
 * Validate `data` against `schema`, raising {@link SkyPortalValidationError} on
 * a mismatch.
 *
 * @since 1.0.0
 * @category Decoding
 */
export const decode = <TSchema extends v.GenericSchema>(schema: TSchema, data: unknown): v.InferOutput<TSchema> => {
    const result = v.safeParse(schema, data);
    if (result.success) {
        return result.output;
    }
    throw new SkyPortalValidationError(
        `SkyPortal returned data this client does not understand: ${result.issues
            .map((issue) => `${v.getDotPath(issue) ?? "<root>"}: ${issue.message}`)
            .join("; ")}`,
        result.issues
    );
};

/** @internal */
const Envelope = v.looseObject({
    status: v.optional(v.string()),
    data: v.optional(v.unknown()),
    message: v.optional(v.nullable(v.string())),
});

/** @internal */
const envelopeOf = (payload: unknown): v.InferOutput<typeof Envelope> => {
    const result = v.safeParse(Envelope, payload);
    return result.success ? result.output : {};
};

/**
 * Return the `data` field of a SkyPortal response envelope.
 *
 * @since 1.0.0
 * @category Decoding
 */
export const unwrap = async (response: Response): Promise<unknown> => {
    let payload: unknown;
    try {
        payload = await response.json();
    } catch {
        throw new SkyPortalError(`SkyPortal returned a non-JSON response (HTTP ${response.status})`, response.status);
    }

    const envelope = envelopeOf(payload);
    if (response.ok && envelope.status === "success") {
        return envelope.data;
    }

    throw new SkyPortalError(
        envelope.message !== null && envelope.message !== undefined && envelope.message !== ""
            ? envelope.message
            : `HTTP ${response.status}`,
        response.status
    );
};

/**
 * Return the raw body of a binary SkyPortal response.
 *
 * Endpoints that return a file (plots, skymaps, finding charts) send bytes
 * rather than a JSON envelope, so their errors are unwrapped separately.
 *
 * @since 1.0.0
 * @category Decoding
 */
export const unwrapContent = async (response: Response): Promise<Uint8Array> => {
    if (response.ok) {
        return new Uint8Array(await response.arrayBuffer());
    }

    let message = `HTTP ${response.status}`;
    try {
        const envelope = envelopeOf(await response.json());
        if (envelope.message !== null && envelope.message !== undefined && envelope.message !== "") {
            message = envelope.message;
        }
    } catch {
        // The error body was not JSON either; the status line is all we have.
    }
    throw new SkyPortalError(message, response.status);
};

/**
 * Drop the `null` and `undefined` entries of a query-parameter record, so that
 * omitted options never reach the wire.
 *
 * @since 1.0.0
 * @category Requests
 */
export const params = (query: QueryParams): QueryParams => {
    const provided: QueryParams = {};
    for (const [key, value] of Object.entries(query)) {
        if (value !== null && value !== undefined) {
            provided[key] = value;
        }
    }
    return provided;
};

/**
 * Join a list into the comma-separated form SkyPortal expects for repeated
 * query parameters, or return `undefined` when the list was not provided.
 *
 * @since 1.0.0
 * @category Requests
 */
export const commaSeparated = (values: ReadonlyArray<string | number> | null | undefined): string | undefined =>
    values === null || values === undefined ? undefined : values.join(",");

/** @internal */
const send = async (client: Client, options: RequestOptions): Promise<unknown> => unwrap(await client.request(options));

/**
 * Issue a GET request and unwrap its envelope.
 *
 * A body may be supplied: a handful of SkyPortal endpoints carry their filters
 * in a JSON body on a `GET`.
 *
 * @since 1.0.0
 * @category Requests
 */
export const get = (client: Client, path: string, query?: QueryParams, body?: unknown): Promise<unknown> =>
    send(client, { method: "GET", path, body, query: query && params(query) });

/**
 * Issue a POST request and unwrap its envelope.
 *
 * @since 1.0.0
 * @category Requests
 */
export const post = (client: Client, path: string, body?: unknown, query?: QueryParams): Promise<unknown> =>
    send(client, { method: "POST", path, body, query: query && params(query) });

/**
 * Issue a PUT request and unwrap its envelope.
 *
 * @since 1.0.0
 * @category Requests
 */
export const put = (client: Client, path: string, body?: unknown, query?: QueryParams): Promise<unknown> =>
    send(client, { method: "PUT", path, body, query: query && params(query) });

/**
 * Issue a PATCH request and unwrap its envelope.
 *
 * @since 1.0.0
 * @category Requests
 */
export const patch = (client: Client, path: string, body?: unknown, query?: QueryParams): Promise<unknown> =>
    send(client, { method: "PATCH", path, body, query: query && params(query) });

/**
 * Issue a DELETE request and unwrap its envelope.
 *
 * `delete` is a reserved word, so this one is spelled out.
 *
 * @since 1.0.0
 * @category Requests
 */
export const del = (client: Client, path: string, body?: unknown, query?: QueryParams): Promise<unknown> =>
    send(client, { method: "DELETE", path, body, query: query && params(query) });

/**
 * Issue a HEAD request and report whether the response was a success.
 *
 * SkyPortal uses `HEAD` for existence checks, which carry no body.
 *
 * @since 1.0.0
 * @category Requests
 */
export const head = async (client: Client, path: string, query?: QueryParams): Promise<boolean> =>
    (await client.request({ method: "HEAD", path, query: query && params(query) })).ok;

/**
 * Issue a POST request carrying multipart form data and unwrap its envelope.
 *
 * @since 1.0.0
 * @category Requests
 */
export const postForm = (client: Client, path: string, formData: FormData): Promise<unknown> =>
    send(client, { method: "POST", path, formData });

/**
 * Issue a GET request for an endpoint that returns a file rather than a JSON
 * envelope.
 *
 * @since 1.0.0
 * @category Requests
 */
export const getContent = async (client: Client, path: string, query?: QueryParams): Promise<Uint8Array> =>
    unwrapContent(await client.request({ method: "GET", path, query: query && params(query) }));

/**
 * Strip the fields a payload did not set, mirroring pydantic's
 * `exclude_none=True`: SkyPortal treats a missing key and an explicit `null`
 * differently on its update endpoints.
 *
 * @since 1.0.0
 * @category Requests
 */
export const body = (payload: object): Record<string, unknown> => {
    const provided: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(payload)) {
        if (value !== undefined) {
            provided[key] = value;
        }
    }
    return provided;
};
