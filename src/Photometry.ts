/**
 * Typed endpoint functions for photometry.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Annotations from "./Annotations.ts";
import * as Groups from "./Groups.ts";
import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";
import * as Streams from "./Streams.ts";
import * as Users from "./Users.ts";

/**
 * A measurement field of {@link PhotometryPost}, which accepts either a scalar
 * or a column of values to upload many points at once.
 *
 * @since 1.0.0
 * @category Models
 */
export type OneOrMany<TValue> = TValue | ReadonlyArray<TValue>;

/**
 * A validated/rejected mark on a photometry point.
 *
 * @since 1.0.0
 * @category Models
 */
export const PhotometryValidation = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        photometry_id: Schemas.NullishInteger,
        validated: Schemas.NullishBoolean,
        validator_id: Schemas.NullishInteger,
        explanation: Schemas.NullishString,
        notes: Schemas.NullishString,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type PhotometryValidation = v.InferOutput<typeof PhotometryValidation>;

/**
 * The fields of a photometry point as built by the API's `serialize` helper.
 *
 * `serialize` never returns `Photometry.to_dict()`: it hand-builds a dict
 * whose keys depend on the `format` query parameter. `mag`, `magerr` and
 * `limiting_mag` are only present for `format="mag"`, `flux`, `fluxerr` and
 * `zp` only for `format="flux"`, and both sets for `format="both"`. The
 * `ref_*`/`tot_*`/`mag(ref|tot)` block is only present when the point has a
 * reference flux, and the `extinction`/`mag_corr`/`flux_corr` keys only when
 * the caller asked for extinction. `groups`, `annotations`, `owner`, `streams`
 * and `validations` are each opt-in per endpoint, and the
 * `owner`/`groups`/`streams` entries are trimmed to a few columns.
 *
 * @since 1.0.0
 * @category Models
 */
export const SerializedPhotometryEntries = {
    id: Schemas.Integer,
    obj_id: Schemas.NullishString,
    ra: Schemas.NullishNumber,
    dec: Schemas.NullishNumber,
    ra_unc: Schemas.NullishNumber,
    dec_unc: Schemas.NullishNumber,
    filter: Schemas.NullishString,
    mjd: Schemas.NullishNumber,
    snr: Schemas.NullishNumber,
    instrument_id: Schemas.NullishInteger,
    instrument_name: Schemas.NullishString,
    origin: Schemas.NullishString,
    altdata: Schemas.nullish(Schemas.JsonObject),
    created_at: Schemas.NullishTimestamp,
    groups: Schemas.list(Groups.Group),
    annotations: Schemas.list(Annotations.AnnotationDetail),
    owner: Schemas.nullish(Users.User),
    streams: Schemas.list(Streams.Stream),
    validations: Schemas.list(PhotometryValidation),
    magsys: Schemas.NullishString,
    mag: Schemas.NullishNumber,
    magerr: Schemas.NullishNumber,
    limiting_mag: Schemas.NullishNumber,
    flux: Schemas.NullishNumber,
    fluxerr: Schemas.NullishNumber,
    zp: Schemas.NullishNumber,
    ref_flux: Schemas.NullishNumber,
    ref_fluxerr: Schemas.NullishNumber,
    tot_flux: Schemas.NullishNumber,
    tot_fluxerr: Schemas.NullishNumber,
    magref: Schemas.NullishNumber,
    magtot: Schemas.NullishNumber,
    e_magref: Schemas.NullishNumber,
    e_magtot: Schemas.NullishNumber,
    extinction: Schemas.NullishNumber,
    mag_corr: Schemas.NullishNumber,
    flux_corr: Schemas.NullishNumber,
};

/**
 * A single photometry point of a source (upstream `Photometry`).
 *
 * `GET /api/sources/{objId}/photometry` returns individual photometry points
 * *and* the rows of the object's photometric series in one list, so this model
 * also carries the extra keys a series row has: `instrument` and `telescope`
 * (names, not objects) and, when the caller asked to phase-fold, `phase`. A
 * series row can also carry arbitrary auxiliary columns from the uploaded data
 * file, which cannot be modelled. `format="plot"` returns a strict subset of
 * these keys.
 *
 * @since 1.0.0
 * @category Models
 */
export const PhotometryPoint = Schemas.model(
    v.strictObject({
        ...SerializedPhotometryEntries,
        instrument: Schemas.NullishString,
        telescope: Schemas.NullishString,
        phase: Schemas.NullishNumber,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type PhotometryPoint = v.InferOutput<typeof PhotometryPoint>;

/**
 * A photometry point as serialized by the date-range query.
 *
 * `GET /api/photometry/range` calls `serialize` with its defaults, so this is
 * the plain serialized point: the same keys as {@link PhotometryPoint} minus
 * the photometric-series extras.
 *
 * @since 1.0.0
 * @category Models
 */
export const PhotometryRangePoint = Schemas.model(v.strictObject(SerializedPhotometryEntries));

/**
 * @since 1.0.0
 * @category Models
 */
export type PhotometryRangePoint = v.InferOutput<typeof PhotometryRangePoint>;

/**
 * Payload for posting one or many photometry points.
 *
 * Provide either `mag`/`magerr` (magnitude space) or `flux`/`fluxerr`/`zp`
 * (flux space). For non-detections, leave the measurement fields unset and
 * provide `limiting_mag`. Every measurement field also accepts a 1D list to
 * upload many points at once; scalars are broadcast across the lists, and a
 * `null` entry inside a `mag`/`flux` list marks that point as a non-detection.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PhotometryPost {
    readonly obj_id: OneOrMany<string>;
    readonly mjd: OneOrMany<number>;
    readonly instrument_id: OneOrMany<number>;
    readonly filter: OneOrMany<string>;
    /** Defaults to `"ab"`. */
    readonly magsys?: OneOrMany<string> | undefined;
    readonly mag?: OneOrMany<number | null> | undefined;
    readonly magerr?: OneOrMany<number | null> | undefined;
    readonly limiting_mag?: OneOrMany<number | null> | undefined;
    readonly limiting_mag_nsigma?: OneOrMany<number | null> | undefined;
    readonly magref?: OneOrMany<number | null> | undefined;
    readonly e_magref?: OneOrMany<number | null> | undefined;
    readonly flux?: OneOrMany<number | null> | undefined;
    readonly fluxerr?: OneOrMany<number | null> | undefined;
    readonly zp?: OneOrMany<number | null> | undefined;
    readonly ref_flux?: OneOrMany<number | null> | undefined;
    readonly ref_fluxerr?: OneOrMany<number | null> | undefined;
    readonly ref_zp?: OneOrMany<number | null> | undefined;
    readonly ra?: OneOrMany<number | null> | undefined;
    readonly dec?: OneOrMany<number | null> | undefined;
    readonly ra_unc?: OneOrMany<number | null> | undefined;
    readonly dec_unc?: OneOrMany<number | null> | undefined;
    readonly origin?: OneOrMany<string | null> | undefined;
    readonly assignment_id?: number | undefined;
    readonly altdata?: OneOrMany<Record<string, unknown> | null> | undefined;
    readonly extinction_corrected?: boolean | undefined;
    readonly group_ids?: ReadonlyArray<number> | "all" | undefined;
    readonly stream_ids?: ReadonlyArray<number> | undefined;
}

/**
 * Result of posting photometry.
 *
 * @since 1.0.0
 * @category Models
 */
export const PhotometryPostResponse = Schemas.model(
    v.strictObject({
        ids: Schemas.list(Schemas.Integer),
        upload_id: Schemas.NullishString,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type PhotometryPostResponse = v.InferOutput<typeof PhotometryPostResponse>;

/**
 * Payload for updating an existing photometry point.
 *
 * Every field is optional: the server loads the point, applies the given
 * fields, and re-validates the result as either a flux-space
 * (`flux`/`fluxerr`/`zp`) or magnitude-space (`mag`/`magerr`) measurement.
 * Only the fields explicitly set on the payload are sent, so passing `null`
 * explicitly (e.g. `{ mag: null, magerr: null }` to turn a detection into a
 * non-detection) sends a null, while omitting a field leaves it unchanged.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PhotometryUpdate {
    readonly obj_id?: string | null | undefined;
    readonly mjd?: number | null | undefined;
    readonly instrument_id?: number | null | undefined;
    readonly filter?: string | null | undefined;
    readonly magsys?: string | null | undefined;
    readonly mag?: number | null | undefined;
    readonly magerr?: number | null | undefined;
    readonly limiting_mag?: number | null | undefined;
    readonly magref?: number | null | undefined;
    readonly e_magref?: number | null | undefined;
    readonly flux?: number | null | undefined;
    readonly fluxerr?: number | null | undefined;
    readonly zp?: number | null | undefined;
    readonly ref_flux?: number | null | undefined;
    readonly ref_fluxerr?: number | null | undefined;
    readonly ref_zp?: number | null | undefined;
    readonly ra?: number | null | undefined;
    readonly dec?: number | null | undefined;
    readonly ra_unc?: number | null | undefined;
    readonly dec_unc?: number | null | undefined;
    readonly origin?: string | null | undefined;
    readonly alert_id?: number | null | undefined;
    readonly assignment_id?: number | null | undefined;
    readonly altdata?: Record<string, unknown> | null | undefined;
    /** Replaces the point's groups. */
    readonly group_ids?: ReadonlyArray<number> | undefined;
    /** Only adds streams; it never removes them. */
    readonly stream_ids?: ReadonlyArray<number> | undefined;
}

/**
 * Result of creating, updating or deleting a photometry validation.
 *
 * @since 1.0.0
 * @category Models
 */
export const PhotometryValidationResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type PhotometryValidationResponse = v.InferOutput<typeof PhotometryValidationResponse>;

/**
 * Options for retrieving a source's photometry.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchPhotometryOptions {
    /** Return photometry in `"mag"` or `"flux"` space. */
    readonly format?: string | undefined;
    /** Magnitude system, `"ab"` or `"vega"`. */
    readonly magsys?: string | undefined;
    /**
     * Also return the Galactic extinction at each point and the corrected
     * measurement, in `extinction` and `mag_corr`/`flux_corr`.
     */
    readonly includeExtinction?: boolean | undefined;
    /** Also return each point's validation records in `validations`. */
    readonly includeValidationInfo?: boolean | undefined;
    /** Also return each point's annotations in `annotations`. */
    readonly includeAnnotationInfo?: boolean | undefined;
    /** Also return the point's uploading user in `owner`. */
    readonly includeOwnerInfo?: boolean | undefined;
    /** Also return the streams each point belongs to in `streams`. */
    readonly includeStreamInfo?: boolean | undefined;
    /**
     * Aggregate photometry from every object linked through the source's
     * SuperObj.
     */
    readonly includeSuperObjsPhotometry?: boolean | undefined;
    /**
     * Drop duplicate `(mjd, filter)` points, keeping the most recently created
     * one.
     */
    readonly deduplicatePhotometry?: boolean | undefined;
    /**
     * Return `"individual"` points, photometric `"series"` rows, or `"both"`.
     */
    readonly individualOrSeries?: string | undefined;
    /**
     * Phase-fold the photometry on the object's most recent `period`
     * annotation, in `phase`. The server errors if the object has no period
     * annotation.
     */
    readonly phaseFoldData?: boolean | undefined;
}

/**
 * Retrieve the photometry of a source.
 *
 * The server returns the object's individual photometry points *and* the rows
 * of its photometric series in the same list.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the source, e.g. `"ZTF20abcdef"`.
 */
export const fetchPhotometry = async (
    client: Http.Client,
    objId: string,
    options: FetchPhotometryOptions = {}
): Promise<Array<PhotometryPoint>> =>
    Http.decode(
        v.array(PhotometryPoint),
        await Http.get(client, `/api/sources/${objId}/photometry`, {
            format: options.format ?? "mag",
            magsys: options.magsys ?? "ab",
            includeExtinction: options.includeExtinction ?? false,
            includeValidationInfo: options.includeValidationInfo ?? false,
            includeAnnotationInfo: options.includeAnnotationInfo ?? false,
            includeOwnerInfo: options.includeOwnerInfo ?? false,
            includeStreamInfo: options.includeStreamInfo ?? false,
            includeSuperObjsPhotometry: options.includeSuperObjsPhotometry ?? false,
            deduplicatePhotometry: options.deduplicatePhotometry ?? false,
            individualOrSeries: options.individualOrSeries ?? "both",
            phaseFoldData: options.phaseFoldData ?? false,
        })
    );

/**
 * Options for posting photometry.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PostPhotometryOptions {
    /**
     * Ask the server to push a photometry refresh to any frontend that has the
     * object open.
     */
    readonly refresh?: boolean | undefined;
}

/**
 * Post a photometry point.
 *
 * If `group_ids` is omitted, the server applies its default visibility. The
 * response carries the `upload_id` of the batch, which
 * {@link bulkDeletePhotometry} can undo.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The photometry point to post.
 */
export const postPhotometry = async (
    client: Http.Client,
    payload: PhotometryPost,
    options: PostPhotometryOptions = {}
): Promise<PhotometryPostResponse> =>
    Http.decode(
        PhotometryPostResponse,
        await Http.post(
            client,
            "/api/photometry",
            Http.body(payload),
            options.refresh === true ? { refresh: true } : undefined
        )
    );

/**
 * Options for an upsert.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpsertPhotometryOptions {
    /**
     * Ask the server to push a photometry refresh to any frontend that
     * currently has the source open.
     */
    readonly refresh?: boolean | undefined;
    /**
     * Match duplicates on `mjd`, `instrument_id`, `filter` and `origin` alone,
     * ignoring flux. Reserved to super admins, since a loose match can
     * overwrite data irrecoverably.
     */
    readonly duplicateIgnoreFlux?: boolean | undefined;
    /**
     * Replace the flux of matched duplicates with the uploaded values. Only
     * applies together with `duplicateIgnoreFlux`, and only to points that
     * already carry an origin.
     */
    readonly overwriteFlux?: boolean | undefined;
}

/**
 * Upload photometry, updating any points that already exist.
 *
 * Unlike {@link postPhotometry}, which fails on a duplicate, this resolves
 * duplicates against the points already stored.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The photometry point to upload.
 */
export const upsertPhotometry = async (
    client: Http.Client,
    payload: PhotometryPost,
    options: UpsertPhotometryOptions = {}
): Promise<PhotometryPostResponse> =>
    Http.decode(
        PhotometryPostResponse,
        await Http.put(client, "/api/photometry", Http.body(payload), {
            refresh: options.refresh ?? false,
            duplicate_ignore_flux: options.duplicateIgnoreFlux ?? false,
            overwrite_flux: options.overwriteFlux ?? false,
        })
    );

/**
 * Options for retrieving a single photometry point.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchPhotometryPointOptions {
    /** Return the point in `"mag"` or `"flux"` space. */
    readonly format?: string | undefined;
    /** Magnitude system, `"ab"` or `"vega"`. */
    readonly magsys?: string | undefined;
}

/**
 * Retrieve a single photometry point by ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param photometryId - ID of the photometry point.
 */
export const fetchPhotometryPoint = async (
    client: Http.Client,
    photometryId: number,
    options: FetchPhotometryPointOptions = {}
): Promise<PhotometryPoint> =>
    Http.decode(
        PhotometryPoint,
        await Http.get(client, `/api/photometry/${photometryId}`, {
            format: options.format ?? "mag",
            magsys: options.magsys ?? "ab",
        })
    );

/**
 * Delete a photometry point.
 *
 * @since 1.0.0
 * @category Requests
 * @param photometryId - ID of the photometry point to delete.
 */
export const deletePhotometry = async (client: Http.Client, photometryId: number): Promise<void> => {
    await Http.del(client, `/api/photometry/${photometryId}`);
};

/**
 * Options for updating a photometry point.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpdatePhotometryOptions {
    /**
     * Ask the server to push a source refresh to connected frontends. The
     * parameter is only sent when true, because the server treats any value it
     * receives as a request to refresh.
     */
    readonly refresh?: boolean | undefined;
}

/**
 * Update an existing photometry point.
 *
 * Updating requires being the point's owner or holding the "Manage photometry"
 * permission, which is stricter than read access.
 *
 * @since 1.0.0
 * @category Requests
 * @param photometryId - ID of the photometry point to update.
 * @param payload - Fields to apply.
 */
export const updatePhotometry = async (
    client: Http.Client,
    photometryId: number,
    payload: PhotometryUpdate,
    options: UpdatePhotometryOptions = {}
): Promise<void> => {
    await Http.patch(
        client,
        `/api/photometry/${photometryId}`,
        Http.body(payload),
        options.refresh === true ? { refresh: true } : undefined
    );
};

/**
 * Options for a photometry date-range query.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchPhotometryRangeOptions {
    /**
     * Only return photometry from these instruments. If omitted, all
     * accessible instruments are queried.
     */
    readonly instrumentIds?: ReadonlyArray<number> | undefined;
    /**
     * UT datetime string; return only photometry taken at or after it. Omit
     * for an open-ended interval.
     */
    readonly minDate?: string | undefined;
    /**
     * UT datetime string; return only photometry taken at or before it. Omit
     * for an open-ended interval.
     */
    readonly maxDate?: string | undefined;
    /** Return photometry in `"mag"` or `"flux"` space. */
    readonly format?: string | undefined;
    /** Magnitude system of the output, e.g. `"ab"` or `"vega"`. */
    readonly magsys?: string | undefined;
}

/**
 * Retrieve photometry taken by given instruments over a date range.
 *
 * This endpoint is a `GET` that carries its filters in a JSON request body
 * rather than in the query string.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchPhotometryRange = async (
    client: Http.Client,
    options: FetchPhotometryRangeOptions = {}
): Promise<Array<PhotometryRangePoint>> =>
    Http.decode(
        v.array(PhotometryRangePoint),
        await Http.get(
            client,
            "/api/photometry/range",
            { format: options.format ?? "mag", magsys: options.magsys ?? "ab" },
            Http.body({
                instrument_ids: options.instrumentIds,
                min_date: options.minDate,
                max_date: options.maxDate,
            })
        )
    );

/**
 * Retrieve the distinct photometry origins.
 *
 * This endpoint is deprecated upstream: the server currently answers every
 * request with an error, so this call raises
 * {@link skyportal-js/Http!SkyPortalError}.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchPhotometryOrigins = async (client: Http.Client): Promise<Array<string>> =>
    Http.decode(v.array(v.string()), await Http.get(client, "/api/photometry/origins"));

/**
 * Delete every photometry point from a bulk upload.
 *
 * @since 1.0.0
 * @category Requests
 * @param uploadId - The upload ID returned when the photometry was uploaded in
 *   bulk. Requires the "Delete bulk photometry" permission.
 */
export const bulkDeletePhotometry = async (client: Http.Client, uploadId: string): Promise<string> =>
    Http.decode(v.string(), await Http.del(client, `/api/photometry/bulk_delete/${uploadId}`));

/**
 * Options for a photometry validation.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PhotometryValidationOptions {
    /**
     * `true` to validate the point, `false` to reject it. Leave unset to
     * record an undefined status.
     */
    readonly validated?: boolean | undefined;
    /** Why the point was validated or rejected. */
    readonly explanation?: string | undefined;
    /** Free-form notes about the validation. */
    readonly notes?: string | undefined;
    /** Magnitude system used in the refresh pushed to connected frontends. */
    readonly magsys?: string | undefined;
}

/**
 * Validate or reject a photometry point.
 *
 * Requires the server to be configured with `misc.photometry_validation`
 * enabled. If the point already has a validation, it is updated in place.
 *
 * @since 1.0.0
 * @category Requests
 * @param photometryId - ID of the photometry point.
 */
export const postPhotometryValidation = async (
    client: Http.Client,
    photometryId: number,
    options: PhotometryValidationOptions = {}
): Promise<PhotometryValidationResponse> =>
    Http.decode(
        PhotometryValidationResponse,
        await Http.post(client, `/api/photometry/${photometryId}/validation`, Http.body(options))
    );

/**
 * Update the validated/rejected status of a photometry point.
 *
 * Requires the server to be configured with `misc.photometry_validation`
 * enabled, and fails if the point has no validation yet; use
 * {@link postPhotometryValidation} to create one. Omitting `validated` clears
 * the status to undefined; omitting `explanation` or `notes` leaves them
 * unchanged.
 *
 * @since 1.0.0
 * @category Requests
 * @param photometryId - ID of the photometry point.
 */
export const updatePhotometryValidation = async (
    client: Http.Client,
    photometryId: number,
    options: PhotometryValidationOptions = {}
): Promise<PhotometryValidationResponse> =>
    Http.decode(
        PhotometryValidationResponse,
        await Http.patch(client, `/api/photometry/${photometryId}/validation`, Http.body(options))
    );

/**
 * Remove the validated/rejected status of a photometry point.
 *
 * The point's status becomes undefined again. Requires the server to be
 * configured with `misc.photometry_validation` enabled.
 *
 * @since 1.0.0
 * @category Requests
 * @param photometryId - ID of the photometry point.
 */
export const deletePhotometryValidation = async (
    client: Http.Client,
    photometryId: number
): Promise<PhotometryValidationResponse> =>
    Http.decode(PhotometryValidationResponse, await Http.del(client, `/api/photometry/${photometryId}/validation`));
