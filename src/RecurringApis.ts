/**
 * Typed endpoint functions for `/api/recurring_api`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";
import * as Users from "./Users.ts";

/**
 * A recurring API call scheduled by a user (upstream `RecurringAPI`).
 *
 * `owner` is always loaded (`lazy="selectin"` upstream). `payload` is
 * free-form JSON, and the single-object endpoint returns it exactly as stored,
 * which may still be a JSON string.
 *
 * @since 1.0.0
 * @category Models
 */
export const RecurringApi = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        endpoint: Schemas.NullishString,
        method: Schemas.NullishString,
        payload: Schemas.nullish(v.union([Schemas.JsonObject, v.string()])),
        next_call: Schemas.NullishTimestamp,
        call_delay: Schemas.NullishNumber,
        number_of_retries: Schemas.NullishInteger,
        active: Schemas.NullishBoolean,
        owner_id: Schemas.NullishInteger,
        owner: Schemas.nullish(Users.User),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type RecurringApi = v.InferOutput<typeof RecurringApi>;

/**
 * Payload for scheduling a recurring API call.
 *
 * `method` is upper-cased by the server and must end up as `"GET"` or
 * `"POST"`, `payload` must be a valid JSON string, `next_call` is any
 * arrow-parseable timestamp, `call_delay` is in days, and `number_of_retries`
 * may not exceed `10`.
 *
 * @since 1.0.0
 * @category Models
 */
export interface RecurringApiPost {
    readonly endpoint: string;
    readonly method: string;
    readonly next_call: string;
    readonly call_delay: number;
    readonly payload: string;
    readonly number_of_retries?: number | undefined;
}

/**
 * Result of scheduling a recurring API call.
 *
 * @since 1.0.0
 * @category Models
 */
export const RecurringApiPostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type RecurringApiPostResponse = v.InferOutput<typeof RecurringApiPostResponse>;

/**
 * Retrieve every recurring API call the token can access.
 *
 * The server decodes each `payload` from its stored JSON string, so `payload`
 * is an object here even though it is a string on creation.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchRecurringApis = async (client: Http.Client): Promise<Array<RecurringApi>> =>
    Http.decode(v.array(RecurringApi), await Http.get(client, "/api/recurring_api"));

/**
 * Retrieve a single recurring API call by ID.
 *
 * Unlike {@link fetchRecurringApis}, the server returns `payload` exactly as
 * stored.
 *
 * @since 1.0.0
 * @category Requests
 * @param recurringApiId - ID of the recurring API call to retrieve.
 */
export const fetchRecurringApi = async (client: Http.Client, recurringApiId: number): Promise<RecurringApi> =>
    Http.decode(RecurringApi, await Http.get(client, `/api/recurring_api/${recurringApiId}`));

/**
 * Schedule a recurring API call (requires "Manage Recurring APIs").
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The call to schedule.
 */
export const postRecurringApi = async (
    client: Http.Client,
    payload: RecurringApiPost
): Promise<RecurringApiPostResponse> =>
    Http.decode(RecurringApiPostResponse, await Http.post(client, "/api/recurring_api", Http.body(payload)));

/**
 * Delete a recurring API call (requires "Manage Recurring APIs").
 *
 * @since 1.0.0
 * @category Requests
 * @param recurringApiId - ID of the recurring API call to delete; only its
 *   owner may delete it.
 */
export const deleteRecurringApi = async (client: Http.Client, recurringApiId: number): Promise<void> => {
    await Http.del(client, `/api/recurring_api/${recurringApiId}`);
};
