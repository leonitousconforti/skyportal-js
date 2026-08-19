/**
 * Typed endpoint functions for `/api/observing_run`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Assignments from "./Assignments.ts";
import * as Groups from "./Groups.ts";
import * as Http from "./Http.ts";
import * as Instruments from "./Instruments.ts";
import * as Schemas from "./Schemas.ts";
import * as Telescopes from "./Telescopes.ts";
import * as Users from "./Users.ts";

/**
 * A classical observing run (upstream `ObservingRun`).
 *
 * `sources` stays free-form because typing its entries as
 * {@link skyportal-js/Sources!Source} would create an import cycle. The list
 * endpoint returns `to_dict()` output (columns plus the eager-loaded
 * `instrument`); the single-run endpoint returns a hand-built dict that swaps
 * `created_at`/`modified`/`run_end_utc` for `ephemeris` and the run's
 * `assignments`.
 *
 * @since 1.0.0
 * @category Models
 */
export const ObservingRun = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        instrument_id: Schemas.NullishInteger,
        calendar_date: Schemas.NullishString,
        run_end_utc: Schemas.NullishTimestamp,
        pi: Schemas.NullishString,
        observers: Schemas.NullishString,
        duration: Schemas.NullishInteger,
        group_id: Schemas.NullishInteger,
        owner_id: Schemas.NullishInteger,
        ephemeris: Schemas.nullish(Telescopes.Ephemeris),
        instrument: Schemas.nullish(Instruments.Instrument),
        group: Schemas.nullish(Groups.Group),
        owner: Schemas.nullish(Users.User),
        assignments: Schemas.list(Assignments.Assignment),
        sources: Schemas.list(Schemas.JsonObject),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type ObservingRun = v.InferOutput<typeof ObservingRun>;

/**
 * Payload for creating an observing run.
 *
 * `calendar_date` is the local calendar date of the run in ISO format, e.g.
 * `"2026-09-01"`; `duration` is the number of nights.
 *
 * @since 1.0.0
 * @category Models
 */
export interface ObservingRunPost {
    readonly instrument_id: number;
    readonly calendar_date: string;
    readonly pi?: string | undefined;
    readonly observers?: string | undefined;
    readonly duration?: number | undefined;
    readonly group_id?: number | undefined;
}

/**
 * Payload for updating an observing run; every field is optional.
 *
 * @since 1.0.0
 * @category Models
 */
export interface ObservingRunUpdate {
    readonly instrument_id?: number | undefined;
    readonly calendar_date?: string | undefined;
    readonly pi?: string | undefined;
    readonly observers?: string | undefined;
    readonly duration?: number | undefined;
    readonly group_id?: number | undefined;
}

/**
 * Result of creating an observing run.
 *
 * @since 1.0.0
 * @category Models
 */
export const ObservingRunPostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type ObservingRunPostResponse = v.InferOutput<typeof ObservingRunPostResponse>;

/**
 * Retrieve all observing runs.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchObservingRuns = async (client: Http.Client): Promise<Array<ObservingRun>> =>
    Http.decode(v.array(ObservingRun), await Http.get(client, "/api/observing_run"));

/**
 * Retrieve a single observing run by ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param runId - ID of the observing run.
 */
export const fetchObservingRun = async (client: Http.Client, runId: number): Promise<ObservingRun> =>
    Http.decode(ObservingRun, await Http.get(client, `/api/observing_run/${runId}`));

/**
 * Create an observing run.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The run to create.
 */
export const postObservingRun = async (
    client: Http.Client,
    payload: ObservingRunPost
): Promise<ObservingRunPostResponse> =>
    Http.decode(ObservingRunPostResponse, await Http.post(client, "/api/observing_run", Http.body(payload)));

/**
 * Delete an observing run.
 *
 * @since 1.0.0
 * @category Requests
 * @param runId - ID of the observing run to delete.
 */
export const deleteObservingRun = async (client: Http.Client, runId: number): Promise<void> => {
    await Http.del(client, `/api/observing_run/${runId}`);
};

/**
 * Update an observing run.
 *
 * The run's end time is recomputed server-side afterwards.
 *
 * @since 1.0.0
 * @category Requests
 * @param runId - ID of the observing run to update. Only the owner of a run may
 *   modify it.
 * @param payload - Fields to change.
 */
export const updateObservingRun = async (
    client: Http.Client,
    runId: number,
    payload: ObservingRunUpdate
): Promise<void> => {
    await Http.put(client, `/api/observing_run/${runId}`, Http.body(payload));
};

/**
 * Bulk-restatus the assignments of an observing run.
 *
 * Every assignment on the run whose status equals `currentStatus` is moved to
 * `newStatus`; the others are left alone.
 *
 * @since 1.0.0
 * @category Requests
 * @param runId - ID of the observing run.
 * @param currentStatus - Status an assignment must currently have to be
 *   updated, e.g. `"pending"`.
 * @param newStatus - Status to apply, e.g. `"not observed"`.
 */
export const updateObservingRunNotObserved = async (
    client: Http.Client,
    runId: number,
    currentStatus: string,
    newStatus: string
): Promise<void> => {
    await Http.put(client, `/api/observing_run/${runId}/not_observed`, {
        current_status: currentStatus,
        new_status: newStatus,
    });
};
