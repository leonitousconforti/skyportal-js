/**
 * Typed endpoint functions for `/api/telescope`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";

/**
 * Sun/twilight times computed for a telescope's site.
 *
 * Returned by the single-allocation endpoint. Every value is `null` when the
 * telescope has no usable observer (no fixed location, or missing
 * coordinates), in which case the server sends an empty object instead.
 *
 * @since 1.0.0
 * @category Models
 */
export const Ephemeris = Schemas.model(
    v.strictObject({
        sunset_utc: Schemas.NullishString,
        sunrise_utc: Schemas.NullishString,
        twilight_morning_astronomical_utc: Schemas.NullishString,
        twilight_evening_astronomical_utc: Schemas.NullishString,
        twilight_morning_nautical_utc: Schemas.NullishString,
        twilight_evening_nautical_utc: Schemas.NullishString,
        utc_offset_hours: Schemas.NullishNumber,
        sunset_unix_ms: Schemas.NullishNumber,
        sunrise_unix_ms: Schemas.NullishNumber,
        twilight_morning_astronomical_unix_ms: Schemas.NullishNumber,
        twilight_evening_astronomical_unix_ms: Schemas.NullishNumber,
        twilight_morning_nautical_unix_ms: Schemas.NullishNumber,
        twilight_evening_nautical_unix_ms: Schemas.NullishNumber,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type Ephemeris = v.InferOutput<typeof Ephemeris>;

/**
 * A SkyPortal telescope (upstream `Telescope`).
 *
 * `instruments` and `allocations` stay untyped: typing them with
 * {@link skyportal-js/Instruments!Instrument} /
 * {@link skyportal-js/Allocations!Allocation} would create an import cycle, as
 * both of those models point back at `Telescope`.
 *
 * @since 1.0.0
 * @category Models
 */
export const Telescope = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        name: Schemas.NullishString,
        nickname: Schemas.NullishString,
        lat: Schemas.NullishNumber,
        lon: Schemas.NullishNumber,
        elevation: Schemas.NullishNumber,
        mpc_obscode: Schemas.NullishString,
        diameter: Schemas.NullishNumber,
        skycam_link: Schemas.NullishString,
        weather_link: Schemas.NullishString,
        robotic: Schemas.NullishBoolean,
        fixed_location: Schemas.NullishBoolean,
        instruments: Schemas.nullish(v.array(Schemas.JsonObject)),
        allocations: Schemas.nullish(v.array(Schemas.JsonObject)),
        is_night_astronomical: Schemas.NullishBoolean,
        morning: Schemas.nullish(v.union([v.string(), v.boolean()])),
        evening: Schemas.nullish(v.union([v.string(), v.boolean()])),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type Telescope = v.InferOutput<typeof Telescope>;

/**
 * Options for listing telescopes.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchTelescopesOptions {
    /** Exact telescope name to match. */
    readonly name?: string | undefined;
    /** Keep telescopes whose latitude lies in this range, in degrees. */
    readonly latitudeMin?: number | undefined;
    readonly latitudeMax?: number | undefined;
    /** Keep telescopes whose longitude lies in this range, in degrees. */
    readonly longitudeMin?: number | undefined;
    readonly longitudeMax?: number | undefined;
}

/**
 * Retrieve telescopes, optionally filtered by name or location box.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchTelescopes = async (
    client: Http.Client,
    options: FetchTelescopesOptions = {}
): Promise<Array<Telescope>> =>
    Http.decode(
        v.array(Telescope),
        await Http.get(client, "/api/telescope", {
            name: options.name,
            latitudeMin: options.latitudeMin,
            latitudeMax: options.latitudeMax,
            longitudeMin: options.longitudeMin,
            longitudeMax: options.longitudeMax,
        })
    );

/**
 * Retrieve a single telescope by ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param telescopeId - ID of the telescope.
 */
export const fetchTelescope = async (client: Http.Client, telescopeId: number): Promise<Telescope> =>
    Http.decode(Telescope, await Http.get(client, `/api/telescope/${telescopeId}`));

/**
 * Payload for creating a telescope.
 *
 * `name` is the unabbreviated facility name, `nickname` the abbreviated one,
 * and `diameter` is in meters. `fixed_location` defaults to true server-side,
 * in which case `lat`, `lon`, and `elevation` are required.
 *
 * @since 1.0.0
 * @category Models
 */
export interface TelescopePost {
    readonly name: string;
    readonly nickname: string;
    readonly diameter: number;
    readonly lat?: number | undefined;
    readonly lon?: number | undefined;
    readonly elevation?: number | undefined;
    readonly skycam_link?: string | undefined;
    readonly weather_link?: string | undefined;
    readonly robotic?: boolean | undefined;
    readonly fixed_location?: boolean | undefined;
}

/**
 * Result of creating a telescope.
 *
 * @since 1.0.0
 * @category Models
 */
export const TelescopePostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type TelescopePostResponse = v.InferOutput<typeof TelescopePostResponse>;

/**
 * Payload for updating a telescope.
 *
 * @since 1.0.0
 * @category Models
 */
export interface TelescopePut {
    readonly name?: string | undefined;
    readonly nickname?: string | undefined;
    readonly diameter?: number | undefined;
    readonly lat?: number | undefined;
    readonly lon?: number | undefined;
    readonly elevation?: number | undefined;
    readonly skycam_link?: string | undefined;
    readonly weather_link?: string | undefined;
    readonly robotic?: boolean | undefined;
    readonly fixed_location?: boolean | undefined;
}

/**
 * Create a telescope.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The telescope to create.
 */
export const postTelescope = async (client: Http.Client, payload: TelescopePost): Promise<TelescopePostResponse> =>
    Http.decode(
        TelescopePostResponse,
        await Http.post(client, "/api/telescope", Http.body({ robotic: false, ...payload }))
    );

/**
 * Update a telescope.
 *
 * Only the provided fields are sent; omitted fields are left unchanged.
 * Requires the "Manage telescopes" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param telescopeId - ID of the telescope to update.
 * @param payload - The fields to change.
 */
export const updateTelescope = async (
    client: Http.Client,
    telescopeId: number,
    payload: TelescopePut
): Promise<void> => {
    await Http.put(client, `/api/telescope/${telescopeId}`, Http.body(payload));
};

/**
 * Delete a telescope.
 *
 * Requires the "Manage telescopes" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param telescopeId - ID of the telescope to delete.
 */
export const deleteTelescope = async (client: Http.Client, telescopeId: number): Promise<void> => {
    await Http.del(client, `/api/telescope/${telescopeId}`);
};
