/**
 * Typed endpoint functions for `/api/earthquake`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Comments from "./Comments.ts";
import * as Http from "./Http.ts";
import * as Reminders from "./Reminders.ts";
import * as Schemas from "./Schemas.ts";
import * as Users from "./Users.ts";

/**
 * A single notice about an earthquake (upstream `EarthquakeNotice`).
 *
 * `content` is the raw QuakeML document; it is a deferred `LargeBinary`
 * column, so it is only present on the single-event endpoint (which undefers
 * it) and arrives UTF-8 decoded.
 *
 * @since 1.0.0
 * @category Models
 */
export const EarthquakeNotice = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        sent_by_id: Schemas.NullishInteger,
        sent_by: Schemas.nullish(Users.User),
        content: Schemas.nullish(Schemas.Json),
        event_id: Schemas.NullishString,
        lat: Schemas.NullishNumber,
        lon: Schemas.NullishNumber,
        depth: Schemas.NullishNumber,
        magnitude: Schemas.NullishNumber,
        date: Schemas.NullishTimestamp,
        country: Schemas.NullishString,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type EarthquakeNotice = v.InferOutput<typeof EarthquakeNotice>;

/**
 * A predicted seismic arrival (upstream `EarthquakePrediction`).
 *
 * @since 1.0.0
 * @category Models
 */
export const EarthquakePrediction = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        event_id: Schemas.NullishInteger,
        detector_id: Schemas.NullishInteger,
        d: Schemas.NullishNumber,
        p: Schemas.NullishTimestamp,
        s: Schemas.NullishTimestamp,
        r2p0: Schemas.NullishTimestamp,
        r3p5: Schemas.NullishTimestamp,
        r5p0: Schemas.NullishTimestamp,
        rfamp: Schemas.NullishNumber,
        lockloss: Schemas.NullishNumber,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type EarthquakePrediction = v.InferOutput<typeof EarthquakePrediction>;

/**
 * A measured ground velocity (upstream `EarthquakeMeasured`).
 *
 * @since 1.0.0
 * @category Models
 */
export const EarthquakeMeasurement = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        event_id: Schemas.NullishInteger,
        detector_id: Schemas.NullishInteger,
        rfamp: Schemas.NullishNumber,
        lockloss: Schemas.NullishInteger,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type EarthquakeMeasurement = v.InferOutput<typeof EarthquakeMeasurement>;

/**
 * An earthquake event (upstream `EarthquakeEvent`).
 *
 * The single-event endpoint replaces `comments` with hand-built dicts that
 * drop `attachment_bytes` and add `author` and `resourceType`.
 *
 * @since 1.0.0
 * @category Models
 */
export const Earthquake = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        sent_by_id: Schemas.NullishInteger,
        sent_by: Schemas.nullish(Users.User),
        event_id: Schemas.NullishString,
        event_uri: Schemas.NullishString,
        status: Schemas.NullishString,
        notices: Schemas.list(EarthquakeNotice),
        predictions: Schemas.list(EarthquakePrediction),
        measurements: Schemas.list(EarthquakeMeasurement),
        comments: Schemas.list(Comments.Comment),
        reminders: Schemas.list(Reminders.Reminder),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type Earthquake = v.InferOutput<typeof Earthquake>;

/**
 * One page of results from an earthquake events query.
 *
 * @since 1.0.0
 * @category Models
 */
export const EarthquakesPage = Schemas.model(
    v.strictObject({
        events: Schemas.list(Earthquake),
        totalMatches: v.optional(Schemas.Integer, 0),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type EarthquakesPage = v.InferOutput<typeof EarthquakesPage>;

/**
 * Payload for ingesting an earthquake event.
 *
 * Provide either `xml` (raw QuakeML) or all of `date`, `event_id`,
 * `latitude`, `longitude`, `depth` and `magnitude`.
 *
 * @since 1.0.0
 * @category Models
 */
export interface EarthquakePost {
    readonly xml?: string | undefined;
    readonly event_id?: string | undefined;
    readonly date?: string | undefined;
    readonly latitude?: number | undefined;
    readonly longitude?: number | undefined;
    readonly depth?: number | undefined;
    readonly magnitude?: number | undefined;
}

/**
 * Result of ingesting an earthquake event.
 *
 * @since 1.0.0
 * @category Models
 */
export const EarthquakePostResponse = Schemas.model(
    v.strictObject({
        id: Schemas.nullish(v.union([v.string(), Schemas.Integer])),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type EarthquakePostResponse = v.InferOutput<typeof EarthquakePostResponse>;

/**
 * Retrieve a single earthquake event by its event ID.
 *
 * The response includes the event's notices (with raw QuakeML content),
 * predictions and comments, each sorted newest first.
 *
 * @since 1.0.0
 * @category Requests
 * @param eventId - Earthquake event ID, e.g. `"us7000abcd"`.
 */
export const fetchEarthquake = async (client: Http.Client, eventId: string): Promise<Earthquake> =>
    Http.decode(Earthquake, await Http.get(client, `/api/earthquake/${eventId}`));

/**
 * Options for querying earthquake events.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchEarthquakesOptions {
    /**
     * Arrow-parseable date strings (e.g. `"2020-01-01"`) filtering on the date
     * of the event's notices.
     */
    readonly startDate?: string | undefined;
    readonly endDate?: string | undefined;
    /** Keep only events whose status contains this string. */
    readonly statusKeep?: string | undefined;
    /** Drop events whose status contains this string. */
    readonly statusRemove?: string | undefined;
    /**
     * Pagination controls; the server defaults to page 1 and 100 per page.
     */
    readonly pageNumber?: number | undefined;
    readonly numPerPage?: number | undefined;
}

/**
 * Query earthquake events, one page at a time.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchEarthquakes = async (
    client: Http.Client,
    options: FetchEarthquakesOptions = {}
): Promise<EarthquakesPage> =>
    Http.decode(
        EarthquakesPage,
        await Http.get(client, "/api/earthquake", {
            pageNumber: options.pageNumber ?? 1,
            numPerPage: options.numPerPage ?? 100,
            startDate: options.startDate,
            endDate: options.endDate,
            statusKeep: options.statusKeep,
            statusRemove: options.statusRemove,
        })
    );

/**
 * Retrieve the distinct status tags used by earthquake events.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchEarthquakeStatuses = async (client: Http.Client): Promise<Array<string>> =>
    Http.decode(v.array(v.string()), await Http.get(client, "/api/earthquake/status"));

/**
 * Ingest an earthquake event.
 *
 * Posting again for a known event adds another notice; only the original
 * poster may update an existing event.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The earthquake to ingest.
 */
export const postEarthquake = async (client: Http.Client, payload: EarthquakePost): Promise<EarthquakePostResponse> =>
    Http.decode(EarthquakePostResponse, await Http.post(client, "/api/earthquake", Http.body(payload)));

/**
 * Delete an earthquake event.
 *
 * @since 1.0.0
 * @category Requests
 * @param eventId - Earthquake event ID to delete.
 */
export const deleteEarthquake = async (client: Http.Client, eventId: string): Promise<void> => {
    await Http.del(client, `/api/earthquake/${eventId}`);
};

/**
 * Run and store a seismic arrival prediction for one detector.
 *
 * The prediction uses the event's most recent notice, so the event must
 * already have one, and the detector must be at a fixed location.
 *
 * @since 1.0.0
 * @category Requests
 * @param eventId - Earthquake event ID.
 * @param mmadetectorId - ID of the MMA detector to predict arrivals for.
 */
export const postEarthquakePrediction = async (
    client: Http.Client,
    eventId: string,
    mmadetectorId: number
): Promise<void> => {
    await Http.post(client, `/api/earthquake/${eventId}/mmadetector/${mmadetectorId}/predictions`);
};

/**
 * Retrieve the ground velocity measurement for one detector.
 *
 * @since 1.0.0
 * @category Requests
 * @param eventId - Earthquake event ID.
 * @param mmadetectorId - ID of the MMA detector the measurement belongs to.
 */
export const fetchEarthquakeMeasurement = async (
    client: Http.Client,
    eventId: string,
    mmadetectorId: number
): Promise<EarthquakeMeasurement> =>
    Http.decode(
        EarthquakeMeasurement,
        await Http.get(client, `/api/earthquake/${eventId}/mmadetector/${mmadetectorId}/measurements`)
    );

/**
 * Options for an earthquake ground-velocity measurement.
 *
 * @since 1.0.0
 * @category Models
 */
export interface EarthquakeMeasurementOptions {
    /** Measured earthquake amplitude, in m/s. */
    readonly rfamp?: number | undefined;
    /** Measured lockloss: 0 (no lockloss) or 1 (lockloss). */
    readonly lockloss?: number | undefined;
}

/**
 * Post a ground velocity measurement for one detector.
 *
 * At least one of `rfamp` or `lockloss` is required. Only one measurement may
 * exist per earthquake and detector; use {@link updateEarthquakeMeasurement}
 * to change an existing one.
 *
 * @since 1.0.0
 * @category Requests
 * @param eventId - Earthquake event ID.
 * @param mmadetectorId - ID of the MMA detector the measurement belongs to.
 */
export const postEarthquakeMeasurement = async (
    client: Http.Client,
    eventId: string,
    mmadetectorId: number,
    options: EarthquakeMeasurementOptions = {}
): Promise<void> => {
    await Http.post(client, `/api/earthquake/${eventId}/mmadetector/${mmadetectorId}/measurements`, Http.body(options));
};

/**
 * Update the ground velocity measurement for one detector.
 *
 * At least one of `rfamp` or `lockloss` is required; omitted fields are left
 * unchanged.
 *
 * @since 1.0.0
 * @category Requests
 * @param eventId - Earthquake event ID.
 * @param mmadetectorId - ID of the MMA detector the measurement belongs to.
 */
export const updateEarthquakeMeasurement = async (
    client: Http.Client,
    eventId: string,
    mmadetectorId: number,
    options: EarthquakeMeasurementOptions = {}
): Promise<void> => {
    await Http.patch(
        client,
        `/api/earthquake/${eventId}/mmadetector/${mmadetectorId}/measurements`,
        Http.body(options)
    );
};

/**
 * Delete the ground velocity measurement for one detector.
 *
 * @since 1.0.0
 * @category Requests
 * @param eventId - Earthquake event ID.
 * @param mmadetectorId - ID of the MMA detector the measurement belongs to.
 */
export const deleteEarthquakeMeasurement = async (
    client: Http.Client,
    eventId: string,
    mmadetectorId: number
): Promise<void> => {
    await Http.del(client, `/api/earthquake/${eventId}/mmadetector/${mmadetectorId}/measurements`);
};
