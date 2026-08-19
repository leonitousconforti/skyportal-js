/**
 * Typed endpoint functions for `/api/photometric_series`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Groups from "./Groups.ts";
import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";
import * as Streams from "./Streams.ts";

/**
 * Where in an exposure a series timestamp falls.
 *
 * @since 1.0.0
 * @category Models
 */
export const TimeStampAlignment = v.picklist(["start", "middle", "end"]);

/**
 * @since 1.0.0
 * @category Models
 */
export type TimeStampAlignment = v.InferOutput<typeof TimeStampAlignment>;

/**
 * The light curve of a series, either as a mapping of column name to values or
 * as a base64-encoded HDF5 bytestream written with `pandas.HDFStore`.
 *
 * @since 1.0.0
 * @category Models
 */
export type SeriesData = Record<string, ReadonlyArray<unknown>> | string;

/**
 * A photometric series: one light curve of one object in one series.
 *
 * `PhotometricSeries.to_dict` returns the mapper columns plus `data` (the
 * light curve in the requested `dataFormat`), `group_ids`, `stream_ids`,
 * `groups` and `streams`; the group/stream entries are trimmed to a few
 * columns. `magref` and `e_magref` are upstream hybrid properties derived from
 * `ref_flux`/`ref_fluxerr`: they are accepted on upload but are not part of
 * the serialized output. `obj`, `instrument`, `owner`, `followup_request` and
 * `assignment` are lazy-loaded relationships that these endpoints never touch,
 * so they are never returned.
 *
 * @since 1.0.0
 * @category Models
 */
export const PhotometricSeries = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        obj_id: Schemas.NullishString,
        series_name: Schemas.NullishString,
        series_obj_id: Schemas.NullishString,
        filter: Schemas.NullishString,
        channel: Schemas.NullishString,
        origin: Schemas.NullishString,
        filename: Schemas.NullishString,
        ra: Schemas.NullishNumber,
        dec: Schemas.NullishNumber,
        ra_unc: Schemas.NullishNumber,
        dec_unc: Schemas.NullishNumber,
        mjd_first: Schemas.NullishNumber,
        mjd_mid: Schemas.NullishNumber,
        mjd_last: Schemas.NullishNumber,
        mjd_last_detected: Schemas.NullishNumber,
        mag_first: Schemas.NullishNumber,
        mag_last: Schemas.NullishNumber,
        mag_last_detected: Schemas.NullishNumber,
        is_detected: Schemas.NullishBoolean,
        exp_time: Schemas.NullishNumber,
        frame_rate: Schemas.NullishNumber,
        num_exp: Schemas.NullishInteger,
        time_stamp_alignment: Schemas.nullish(TimeStampAlignment),
        limiting_mag: Schemas.NullishNumber,
        ref_flux: Schemas.NullishNumber,
        ref_fluxerr: Schemas.NullishNumber,
        magref: Schemas.NullishNumber,
        e_magref: Schemas.NullishNumber,
        mean_mag: Schemas.NullishNumber,
        rms_mag: Schemas.NullishNumber,
        robust_mag: Schemas.NullishNumber,
        robust_rms: Schemas.NullishNumber,
        median_snr: Schemas.NullishNumber,
        best_snr: Schemas.NullishNumber,
        worst_snr: Schemas.NullishNumber,
        medians: Schemas.nullish(Schemas.JsonObject),
        maxima: Schemas.nullish(Schemas.JsonObject),
        minima: Schemas.nullish(Schemas.JsonObject),
        stds: Schemas.nullish(Schemas.JsonObject),
        altdata: Schemas.nullish(Schemas.JsonObject),
        hash: Schemas.NullishString,
        autodelete: Schemas.NullishBoolean,
        instrument_id: Schemas.NullishInteger,
        followup_request_id: Schemas.NullishInteger,
        assignment_id: Schemas.NullishInteger,
        owner_id: Schemas.NullishInteger,
        group_ids: Schemas.list(Schemas.Integer),
        stream_ids: Schemas.list(Schemas.Integer),
        groups: Schemas.list(Groups.Group),
        streams: Schemas.list(Streams.Stream),
        data: Schemas.nullish(v.union([v.record(v.string(), v.array(Schemas.Json)), v.string()])),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type PhotometricSeries = v.InferOutput<typeof PhotometricSeries>;

/**
 * One page of results from a photometric series query.
 *
 * @since 1.0.0
 * @category Models
 */
export const PhotometricSeriesPage = Schemas.model(
    v.strictObject({
        series: Schemas.list(PhotometricSeries),
        totalMatches: v.optional(Schemas.Integer, 0),
        pageNumber: v.optional(Schemas.Integer, 1),
        numPerPage: v.optional(Schemas.Integer, 100),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type PhotometricSeriesPage = v.InferOutput<typeof PhotometricSeriesPage>;

/**
 * Payload for uploading or updating a photometric series.
 *
 * `data` is either a mapping of column name to list of values, or a
 * base64-encoded HDF5 bytestream written with `pandas.HDFStore`. It must
 * contain an `mjd` column and either a `flux` or a `mag` column. `ra`, `dec`,
 * `exp_time` and `filter` are inferred from the data columns when not given
 * explicitly. `data` is required when creating a series and optional when
 * updating one.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PhotometricSeriesPost {
    readonly data?: SeriesData | undefined;
    readonly series_name?: string | undefined;
    readonly series_obj_id?: string | undefined;
    readonly obj_id?: string | undefined;
    readonly instrument_id?: number | undefined;
    readonly group_ids?: ReadonlyArray<number> | "all" | undefined;
    readonly stream_ids?: ReadonlyArray<number> | undefined;
    readonly ra?: number | undefined;
    readonly dec?: number | undefined;
    readonly ra_unc?: number | undefined;
    readonly dec_unc?: number | undefined;
    readonly exp_time?: number | undefined;
    readonly filter?: string | undefined;
    readonly channel?: string | undefined;
    readonly origin?: string | undefined;
    readonly limiting_mag?: number | undefined;
    readonly magref?: number | undefined;
    readonly e_magref?: number | undefined;
    readonly ref_flux?: number | undefined;
    readonly ref_fluxerr?: number | undefined;
    readonly followup_request_id?: number | undefined;
    readonly assignment_id?: number | undefined;
    readonly time_stamp_alignment?: TimeStampAlignment | undefined;
    readonly altdata?: Record<string, unknown> | undefined;
}

/**
 * Result of uploading or updating a photometric series.
 *
 * @since 1.0.0
 * @category Models
 */
export const PhotometricSeriesPostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type PhotometricSeriesPostResponse = v.InferOutput<typeof PhotometricSeriesPostResponse>;

/**
 * Options for retrieving a single photometric series.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchPhotometricSeriesOptions {
    /**
     * How to return the light curve in the `data` field: `"json"` (the
     * default; a mapping of column name to list of values), `"hdf5"` (a
     * base64-encoded HDF5 bytestream) or `"none"` (omit the data and return
     * metadata only).
     */
    readonly dataFormat?: string | undefined;
}

/**
 * Retrieve a single photometric series by ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param photometricSeriesId - ID of the photometric series.
 */
export const fetchPhotometricSeries = async (
    client: Http.Client,
    photometricSeriesId: number,
    options: FetchPhotometricSeriesOptions = {}
): Promise<PhotometricSeries> =>
    Http.decode(
        PhotometricSeries,
        await Http.get(client, `/api/photometric_series/${photometricSeriesId}`, {
            dataFormat: options.dataFormat ?? "json",
        })
    );

/**
 * Options for a photometric series query.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchPhotometricSeriesPageOptions {
    /**
     * How to return each light curve in the `data` field: `"none"` (the
     * default for multi-series queries; metadata only), `"json"` or `"hdf5"`.
     * Requesting the data can return a very large payload unless the query is
     * narrowed down.
     */
    readonly dataFormat?: string | undefined;
    /** Page of results to return. */
    readonly pageNumber?: number | undefined;
    /** Results per page. Capped server-side at 500. */
    readonly numPerPage?: number | undefined;
    /** Column to sort by, e.g. `"id"`, `"ra"`, `"dec"` or `"saved_at"`. */
    readonly sortBy?: string | undefined;
    /** `"asc"` or `"desc"`. */
    readonly sortOrder?: string | undefined;
    /**
     * Right ascension in degrees for a cone search. Only applied when `dec`
     * and `radius` are given too.
     */
    readonly ra?: number | undefined;
    /** Declination in degrees for a cone search. */
    readonly dec?: number | undefined;
    /** Cone search radius in degrees. */
    readonly radius?: number | undefined;
    /** Substring of the SkyPortal object ID to match. */
    readonly objectId?: string | undefined;
    /** Comma-separated object IDs to exclude from the results. */
    readonly rejectedObjectId?: string | undefined;
    /** Exact series name to match. */
    readonly seriesName?: string | undefined;
    /**
     * Exact object ID used inside the series, e.g. a TESS TIC ID. This is not
     * the SkyPortal object ID.
     */
    readonly seriesObjId?: string | undefined;
    /** Bandpass to match, e.g. `"ztfg"`. */
    readonly filter?: string | undefined;
    /** Channel name or ID to match. */
    readonly channel?: string | undefined;
    /** Provenance string to match, e.g. the pipeline that produced the data. */
    readonly origin?: string | undefined;
    /**
     * Filename to match. Relative paths are resolved against the server's
     * photometric series data directory.
     */
    readonly filename?: string | undefined;
    /** Arrow-parseable date; keep only series that started before it. */
    readonly startBefore?: string | undefined;
    /** Arrow-parseable date; keep only series that started after it. */
    readonly startAfter?: string | undefined;
    /** Arrow-parseable date; keep only series whose midpoint is before it. */
    readonly midBefore?: string | undefined;
    /** Arrow-parseable date; keep only series whose midpoint is after it. */
    readonly midAfter?: string | undefined;
    /** Arrow-parseable date; keep only series that ended before it. */
    readonly endBefore?: string | undefined;
    /** Arrow-parseable date; keep only series that ended after it. */
    readonly endAfter?: string | undefined;
    /** Keep only series with (`true`) or without (`false`) detections. */
    readonly detected?: boolean | undefined;
    /** Keep only series with exactly this exposure time, in seconds. */
    readonly expTime?: number | undefined;
    /** Minimum exposure time, in seconds. */
    readonly minExpTime?: number | undefined;
    /** Maximum exposure time, in seconds. */
    readonly maxExpTime?: number | undefined;
    /** Minimum frame rate, in Hz. */
    readonly minFrameRate?: number | undefined;
    /** Maximum frame rate, in Hz. */
    readonly maxFrameRate?: number | undefined;
    /** Minimum number of exposures. */
    readonly minNumExposures?: number | undefined;
    /** Maximum number of exposures. */
    readonly maxNumExposures?: number | undefined;
    /** Keep only series taken with this instrument. */
    readonly instrumentId?: number | undefined;
    /** Keep only series taken for this follow-up request. */
    readonly followupRequestId?: number | undefined;
    /** Keep only series taken for this observing run assignment. */
    readonly assignmentId?: number | undefined;
    /** Keep only series uploaded by this user. */
    readonly ownerId?: number | undefined;
    /** Keep only series with a mean magnitude at least this bright. */
    readonly magBrighterThan?: number | undefined;
    /** Keep only series with a mean magnitude at least this faint. */
    readonly magFainterThan?: number | undefined;
    /** Keep only series with a limiting magnitude at least this bright. */
    readonly limitingMagBrighterThan?: number | undefined;
    /** Keep only series with a limiting magnitude at least this faint. */
    readonly limitingMagFainterThan?: number | undefined;
    /**
     * Keep only series that have no limiting magnitude. Only sent when true,
     * because the server treats any value it receives as enabled.
     */
    readonly limitingMagIsNaN?: boolean | undefined;
    /** Keep only series that have a magref at least this bright. */
    readonly magrefBrighterThan?: number | undefined;
    /** Keep only series that have a magref at least this faint. */
    readonly magrefFainterThan?: number | undefined;
    /** Minimum magnitude RMS. */
    readonly minRms?: number | undefined;
    /** Maximum magnitude RMS. */
    readonly maxRms?: number | undefined;
    /**
     * Filter on `robust_mag`/`robust_rms` instead of `mean_mag`/`rms_mag`.
     * Does not affect the magref filters. Only sent when true, because the
     * server treats any value it receives as enabled.
     */
    readonly useRobustMagAndRms?: boolean | undefined;
    /** Minimum median signal-to-noise ratio. */
    readonly minMedianSnr?: number | undefined;
    /** Maximum median signal-to-noise ratio. */
    readonly maxMedianSnr?: number | undefined;
    /** Minimum best signal-to-noise ratio. */
    readonly minBestSnr?: number | undefined;
    /** Maximum best signal-to-noise ratio. */
    readonly maxBestSnr?: number | undefined;
    /** Minimum worst signal-to-noise ratio. */
    readonly minWorstSnr?: number | undefined;
    /** Maximum worst signal-to-noise ratio. */
    readonly maxWorstSnr?: number | undefined;
    /**
     * MD5 hash of the series data file, useful to match a downloaded HDF5 file
     * back to its series.
     */
    readonly fileHash?: string | undefined;
}

/**
 * Retrieve one page of photometric series matching a query.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchPhotometricSeriesPage = async (
    client: Http.Client,
    options: FetchPhotometricSeriesPageOptions = {}
): Promise<PhotometricSeriesPage> =>
    Http.decode(
        PhotometricSeriesPage,
        await Http.get(client, "/api/photometric_series", {
            dataFormat: options.dataFormat ?? "none",
            pageNumber: options.pageNumber ?? 1,
            numPerPage: options.numPerPage ?? 100,
            sortBy: options.sortBy ?? "obj_id",
            sortOrder: options.sortOrder ?? "asc",
            ra: options.ra,
            dec: options.dec,
            radius: options.radius,
            objectID: options.objectId,
            rejectedObjectID: options.rejectedObjectId,
            seriesName: options.seriesName,
            seriesObjID: options.seriesObjId,
            filter: options.filter,
            channel: options.channel,
            origin: options.origin,
            filename: options.filename,
            startBefore: options.startBefore,
            startAfter: options.startAfter,
            midBefore: options.midBefore,
            midAfter: options.midAfter,
            endBefore: options.endBefore,
            endAfter: options.endAfter,
            detected: options.detected,
            expTime: options.expTime,
            minExpTime: options.minExpTime,
            maxExpTime: options.maxExpTime,
            minFrameRate: options.minFrameRate,
            maxFrameRate: options.maxFrameRate,
            minNumExposures: options.minNumExposures,
            maxNumExposures: options.maxNumExposures,
            instrumentID: options.instrumentId,
            followupRequestID: options.followupRequestId,
            assignmentID: options.assignmentId,
            ownerID: options.ownerId,
            magBrighterThan: options.magBrighterThan,
            magFainterThan: options.magFainterThan,
            limitingMagBrighterThan: options.limitingMagBrighterThan,
            limitingMagFainterThan: options.limitingMagFainterThan,
            limitingMagIsNaN: options.limitingMagIsNaN === true ? true : undefined,
            magrefBrighterThan: options.magrefBrighterThan,
            magrefFainterThan: options.magrefFainterThan,
            minRMS: options.minRms,
            maxRMS: options.maxRms,
            useRobustMagAndRMS: options.useRobustMagAndRms === true ? true : undefined,
            minMedianSNR: options.minMedianSnr,
            maxMedianSNR: options.maxMedianSnr,
            minBestSNR: options.minBestSnr,
            maxBestSNR: options.maxBestSnr,
            minWorstSNR: options.minWorstSnr,
            maxWorstSNR: options.maxWorstSnr,
            hash: options.fileHash,
        })
    );

/**
 * Upload a photometric series.
 *
 * `series_name`, `series_obj_id`, `obj_id` and `instrument_id` are required by
 * the server. If `group_ids` is omitted the series is shared with the
 * configured default group; pass `"all"` to share it with the public group.
 * The uploader's single-user group is always added.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The series to upload.
 */
export const postPhotometricSeries = async (
    client: Http.Client,
    payload: PhotometricSeriesPost
): Promise<PhotometricSeriesPostResponse> =>
    Http.decode(PhotometricSeriesPostResponse, await Http.post(client, "/api/photometric_series", Http.body(payload)));

/**
 * Update a photometric series.
 *
 * The series is reloaded, its metadata and data updated, and it is written
 * back to disk. If new `data` is supplied, `ra`, `dec`, `exp_time` and
 * `filter` are re-inferred from the data columns and override the stored
 * values unless they are given explicitly here.
 *
 * @since 1.0.0
 * @category Requests
 * @param photometricSeriesId - ID of the photometric series to update.
 * @param payload - Fields to apply; all of them are optional for an update.
 */
export const updatePhotometricSeries = async (
    client: Http.Client,
    photometricSeriesId: number,
    payload: PhotometricSeriesPost
): Promise<PhotometricSeriesPostResponse> =>
    Http.decode(
        PhotometricSeriesPostResponse,
        await Http.patch(client, `/api/photometric_series/${photometricSeriesId}`, Http.body(payload))
    );

/**
 * Delete a photometric series.
 *
 * @since 1.0.0
 * @category Requests
 * @param photometricSeriesId - ID of the photometric series to delete. If the
 *   series was stored with `autodelete` enabled, its data file is removed from
 *   disk too.
 */
export const deletePhotometricSeries = async (client: Http.Client, photometricSeriesId: number): Promise<void> => {
    await Http.del(client, `/api/photometric_series/${photometricSeriesId}`);
};
