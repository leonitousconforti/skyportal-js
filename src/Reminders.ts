/**
 * Typed endpoint functions for `/api/{resourceType}/{id}/reminders`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Groups from "./Groups.ts";
import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";

/**
 * What a reminder is attached to. Note the route uses the singular `"source"`.
 *
 * @since 1.0.0
 * @category Models
 */
export type ReminderResourceType = "source" | "spectra" | "gcn_event" | "shift" | "earthquake";

/**
 * A reminder on any remindable resource (upstream `Reminder`).
 *
 * Upstream splits reminders across `Reminder`, `ReminderOnSpectrum`,
 * `ReminderOnGCN`, `ReminderOnShift` and `ReminderOnEarthquake`; this model is
 * the union of that family, so each type-specific foreign key is optional and
 * only the ones belonging to the reminder's own table are ever set. `user` is
 * the owner's `User.to_dict()`, and `obj`, `spectrum`, `gcn`, `shift` and
 * `earthquake` stay free-form to avoid importing in a circle from the modules
 * that import this one.
 *
 * @since 1.0.0
 * @category Models
 */
export const Reminder = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        text: Schemas.NullishString,
        origin: Schemas.NullishString,
        bot: Schemas.NullishBoolean,
        next_reminder: Schemas.NullishTimestamp,
        reminder_delay: Schemas.NullishNumber,
        number_of_reminders: Schemas.NullishInteger,
        user_id: Schemas.NullishInteger,
        user: Schemas.nullish(Schemas.JsonObject),
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
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type Reminder = v.InferOutput<typeof Reminder>;

/**
 * All reminders attached to one resource.
 *
 * @since 1.0.0
 * @category Models
 */
export const RemindersResponse = Schemas.model(
    v.strictObject({
        resourceId: v.string(),
        resourceType: v.string(),
        reminders: Schemas.list(Reminder),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type RemindersResponse = v.InferOutput<typeof RemindersResponse>;

/**
 * Payload for creating reminders on a resource.
 *
 * If `user_ids` is omitted the reminder is created for the requesting user
 * only, and if `group_ids` is omitted it is visible to all of the requesting
 * user's groups. The server defaults `reminder_delay` and
 * `number_of_reminders` to `1`.
 *
 * @since 1.0.0
 * @category Models
 */
export interface ReminderPost {
    readonly text: string;
    readonly next_reminder: string;
    readonly reminder_delay?: number | undefined;
    readonly number_of_reminders?: number | undefined;
    readonly group_ids?: ReadonlyArray<number> | undefined;
    readonly user_ids?: ReadonlyArray<number> | undefined;
}

/**
 * IDs of the reminders created by a post.
 *
 * @since 1.0.0
 * @category Models
 */
export const ReminderPostResponse = Schemas.model(
    v.strictObject({
        reminder_ids: Schemas.list(Schemas.Integer),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type ReminderPostResponse = v.InferOutput<typeof ReminderPostResponse>;

/**
 * Payload for updating an existing reminder.
 *
 * @since 1.0.0
 * @category Models
 */
export interface ReminderUpdate {
    readonly text?: string | undefined;
    readonly origin?: string | undefined;
    readonly bot?: boolean | undefined;
    readonly next_reminder?: string | undefined;
    readonly reminder_delay?: number | undefined;
    readonly number_of_reminders?: number | undefined;
    readonly group_ids?: ReadonlyArray<number> | undefined;
    readonly user_ids?: ReadonlyArray<number> | undefined;
}

/**
 * Options naming which remindable resource a reminder belongs to.
 *
 * @since 1.0.0
 * @category Models
 */
export interface ReminderResourceOptions {
    /** What the reminder is on. Defaults to `"source"`. */
    readonly resourceType?: ReminderResourceType | undefined;
}

/**
 * Retrieve every reminder attached to one resource.
 *
 * @since 1.0.0
 * @category Requests
 * @param resourceId - ID of the resource the reminders are on: an object ID for
 *   `"source"`, otherwise the integer ID of the spectrum, GCN event, shift or
 *   earthquake.
 */
export const fetchReminders = async (
    client: Http.Client,
    resourceId: string,
    options: ReminderResourceOptions = {}
): Promise<RemindersResponse> =>
    Http.decode(
        RemindersResponse,
        await Http.get(client, `/api/${options.resourceType ?? "source"}/${resourceId}/reminders`)
    );

/**
 * Retrieve a single reminder by ID.
 *
 * The server rejects the request if the reminder is not attached to
 * `resourceId`.
 *
 * @since 1.0.0
 * @category Requests
 * @param resourceId - ID of the resource the reminder is on.
 * @param reminderId - ID of the reminder to retrieve.
 */
export const fetchReminder = async (
    client: Http.Client,
    resourceId: string,
    reminderId: number,
    options: ReminderResourceOptions = {}
): Promise<Reminder> =>
    Http.decode(
        Reminder,
        await Http.get(client, `/api/${options.resourceType ?? "source"}/${resourceId}/reminders/${reminderId}`)
    );

/**
 * Create reminders on a resource, one per target user.
 *
 * @since 1.0.0
 * @category Requests
 * @param resourceId - ID of the resource to attach the reminders to.
 * @param payload - The reminder to create.
 */
export const postReminder = async (
    client: Http.Client,
    resourceId: string,
    payload: ReminderPost,
    options: ReminderResourceOptions = {}
): Promise<ReminderPostResponse> =>
    Http.decode(
        ReminderPostResponse,
        await Http.post(client, `/api/${options.resourceType ?? "source"}/${resourceId}/reminders`, Http.body(payload))
    );

/**
 * Update an existing reminder.
 *
 * Only the provided fields are sent; omitted fields are left unchanged.
 * Omitting `group_ids` resets visibility to all of the requesting user's
 * groups, and omitting `user_ids` resets the reminder to the requesting user.
 *
 * @since 1.0.0
 * @category Requests
 * @param resourceId - ID of the resource the reminder is on.
 * @param reminderId - ID of the reminder to update.
 * @param payload - The fields to change.
 */
export const updateReminder = async (
    client: Http.Client,
    resourceId: string,
    reminderId: number,
    payload: ReminderUpdate,
    options: ReminderResourceOptions = {}
): Promise<void> => {
    await Http.patch(
        client,
        `/api/${options.resourceType ?? "source"}/${resourceId}/reminders/${reminderId}`,
        Http.body(payload)
    );
};

/**
 * Delete a reminder.
 *
 * @since 1.0.0
 * @category Requests
 * @param resourceId - ID of the resource the reminder is on.
 * @param reminderId - ID of the reminder to delete.
 */
export const deleteReminder = async (
    client: Http.Client,
    resourceId: string,
    reminderId: number,
    options: ReminderResourceOptions = {}
): Promise<void> => {
    await Http.del(client, `/api/${options.resourceType ?? "source"}/${resourceId}/reminders/${reminderId}`);
};
