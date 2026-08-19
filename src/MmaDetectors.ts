/**
 * Typed endpoint functions for `/api/mmadetector`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";

/**
 * The kind of multimessenger detector.
 *
 * @since 1.0.0
 * @category Models
 */
export const MmaDetectorType = v.picklist(["gravitational-wave", "neutrino", "gamma-ray-burst"]);

/**
 * @since 1.0.0
 * @category Models
 */
export type MmaDetectorType = v.InferOutput<typeof MmaDetectorType>;

/**
 * A multimessenger astronomical detector (upstream `MMADetector`).
 *
 * `events` stays untyped: {@link skyportal-js/GcnEvents!GcnEvent} already
 * points at `MMADetector`, so typing it would create an import cycle.
 *
 * Declared by hand rather than inferred, because it refers to
 * {@link MmaDetectorSpectrum} and {@link MmaDetectorTimeInterval}, which refer
 * back to it.
 *
 * @since 1.0.0
 * @category Models
 */
export interface MmaDetector {
    readonly id: number;
    readonly created_at?: string | null | undefined;
    readonly modified?: string | null | undefined;
    readonly name?: string | null | undefined;
    readonly nickname?: string | null | undefined;
    readonly type?: MmaDetectorType | null | undefined;
    readonly lat?: number | null | undefined;
    readonly lon?: number | null | undefined;
    readonly elevation?: number | null | undefined;
    readonly fixed_location?: boolean | null | undefined;
    readonly events?: Array<Record<string, unknown>> | null | undefined;
    readonly spectra?: Array<MmaDetectorSpectrum> | null | undefined;
    readonly time_intervals?: Array<MmaDetectorTimeInterval> | null | undefined;
}

/**
 * A sensitivity spectrum of a detector (upstream `MMADetectorSpectrum`).
 *
 * `owner` and `groups` stay untyped: the upstream `User` and `Group` both own
 * an `mmadetector_spectra` relationship, so typing them here would risk an
 * import cycle.
 *
 * @since 1.0.0
 * @category Models
 */
export interface MmaDetectorSpectrum {
    readonly id: number;
    readonly created_at?: string | null | undefined;
    readonly modified?: string | null | undefined;
    readonly detector_id?: number | null | undefined;
    readonly detector?: MmaDetector | null | undefined;
    readonly frequencies: Array<number>;
    readonly amplitudes: Array<number>;
    readonly start_time?: string | null | undefined;
    readonly end_time?: string | null | undefined;
    readonly owner_id?: number | null | undefined;
    readonly owner?: Record<string, unknown> | null | undefined;
    readonly groups?: Array<Record<string, unknown>> | null | undefined;
    readonly original_file_string?: string | null | undefined;
    readonly original_file_filename?: string | null | undefined;
}

/**
 * A detector data-taking interval (upstream `MMADetectorTimeInterval`).
 *
 * The time-interval endpoints build this payload by hand, so it carries only
 * these five keys rather than the model's full column set. `owner` and
 * `groups` stay untyped: the upstream `User` and `Group` both own an
 * `mmadetector_time_intervals` relationship, so typing them here would risk an
 * import cycle.
 *
 * @since 1.0.0
 * @category Models
 */
export interface MmaDetectorTimeInterval {
    readonly id: number;
    readonly time_interval: Array<string>;
    readonly owner?: Record<string, unknown> | null | undefined;
    readonly groups?: Array<Record<string, unknown>> | null | undefined;
    readonly detector?: MmaDetector | null | undefined;
}

/**
 * @since 1.0.0
 * @category Models
 */
export const MmaDetector = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        name: Schemas.NullishString,
        nickname: Schemas.NullishString,
        type: Schemas.nullish(MmaDetectorType),
        lat: Schemas.NullishNumber,
        lon: Schemas.NullishNumber,
        elevation: Schemas.NullishNumber,
        fixed_location: Schemas.NullishBoolean,
        events: Schemas.nullish(v.array(Schemas.JsonObject)),
        spectra: Schemas.nullish(
            v.array(v.lazy((): v.GenericSchema<unknown, MmaDetectorSpectrum> => MmaDetectorSpectrum))
        ),
        time_intervals: Schemas.nullish(
            v.array(v.lazy((): v.GenericSchema<unknown, MmaDetectorTimeInterval> => MmaDetectorTimeInterval))
        ),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export const MmaDetectorSpectrum = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        detector_id: Schemas.NullishInteger,
        detector: Schemas.nullish(v.lazy((): v.GenericSchema<unknown, MmaDetector> => MmaDetector)),
        frequencies: Schemas.list(v.number()),
        amplitudes: Schemas.list(v.number()),
        start_time: Schemas.NullishTimestamp,
        end_time: Schemas.NullishTimestamp,
        owner_id: Schemas.NullishInteger,
        owner: Schemas.nullish(Schemas.JsonObject),
        groups: Schemas.nullish(v.array(Schemas.JsonObject)),
        original_file_string: Schemas.NullishString,
        original_file_filename: Schemas.NullishString,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export const MmaDetectorTimeInterval = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        time_interval: Schemas.list(Schemas.Timestamp),
        owner: Schemas.nullish(Schemas.JsonObject),
        groups: Schemas.nullish(v.array(Schemas.JsonObject)),
        detector: Schemas.nullish(v.lazy((): v.GenericSchema<unknown, MmaDetector> => MmaDetector)),
    })
);

/**
 * Payload for creating an MMA detector.
 *
 * If `fixed_location` is true, `lat` must be between -90 and 90 and `lon`
 * between -180 and 180.
 *
 * @since 1.0.0
 * @category Models
 */
export interface MmaDetectorPost {
    readonly name: string;
    readonly nickname: string;
    readonly type: string;
    readonly fixed_location: boolean;
    readonly lat?: number | undefined;
    readonly lon?: number | undefined;
    readonly elevation?: number | undefined;
}

/**
 * Result of creating an MMA detector.
 *
 * @since 1.0.0
 * @category Models
 */
export const MmaDetectorPostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type MmaDetectorPostResponse = v.InferOutput<typeof MmaDetectorPostResponse>;

/**
 * Payload for uploading an MMA detector spectrum.
 *
 * If `group_ids` is omitted, the server applies its default visibility; pass
 * `"all"` to share with all accessible groups.
 *
 * @since 1.0.0
 * @category Models
 */
export interface MmaDetectorSpectrumPost {
    readonly frequencies: ReadonlyArray<number>;
    readonly amplitudes: ReadonlyArray<number>;
    readonly start_time: string;
    readonly end_time: string;
    readonly detector_id: number;
    readonly group_ids?: ReadonlyArray<number> | "all" | undefined;
}

/**
 * Result of uploading an MMA detector spectrum.
 *
 * @since 1.0.0
 * @category Models
 */
export const MmaDetectorSpectrumPostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type MmaDetectorSpectrumPostResponse = v.InferOutput<typeof MmaDetectorSpectrumPostResponse>;

/**
 * Result of uploading MMA detector time intervals.
 *
 * @since 1.0.0
 * @category Models
 */
export const MmaDetectorTimeIntervalsPostResponse = Schemas.model(
    v.strictObject({
        ids: Schemas.list(Schemas.Integer),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type MmaDetectorTimeIntervalsPostResponse = v.InferOutput<typeof MmaDetectorTimeIntervalsPostResponse>;

/**
 * Retrieve a single MMA detector by ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param mmadetectorId - ID of the MMA detector.
 */
export const fetchMmaDetector = async (client: Http.Client, mmadetectorId: number): Promise<MmaDetector> =>
    Http.decode(MmaDetector, await Http.get(client, `/api/mmadetector/${mmadetectorId}`));

/**
 * Options for listing MMA detectors.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchMmaDetectorsOptions {
    /** Restrict to detectors whose name contains this string. */
    readonly name?: string | undefined;
}

/**
 * Retrieve all MMA detectors.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchMmaDetectors = async (
    client: Http.Client,
    options: FetchMmaDetectorsOptions = {}
): Promise<Array<MmaDetector>> =>
    Http.decode(v.array(MmaDetector), await Http.get(client, "/api/mmadetector", { name: options.name }));

/**
 * Create an MMA detector.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The detector to create.
 */
export const postMmaDetector = async (
    client: Http.Client,
    payload: MmaDetectorPost
): Promise<MmaDetectorPostResponse> =>
    Http.decode(MmaDetectorPostResponse, await Http.post(client, "/api/mmadetector", Http.body(payload)));

/**
 * Options for updating an MMA detector.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpdateMmaDetectorOptions {
    /** New unabbreviated facility name. */
    readonly name?: string | undefined;
    /** New abbreviated facility name. */
    readonly nickname?: string | undefined;
    /** New detector type, e.g. `"gravitational wave"`. */
    readonly type?: string | undefined;
    /** New coordinates, in degrees. */
    readonly lat?: number | undefined;
    readonly lon?: number | undefined;
    /** Whether the detector has a fixed location. */
    readonly fixedLocation?: boolean | undefined;
}

/**
 * Update fields of an existing MMA detector.
 *
 * Only the provided fields are sent; omitted fields are left unchanged.
 *
 * @since 1.0.0
 * @category Requests
 * @param mmadetectorId - ID of the MMA detector to update.
 */
export const updateMmaDetector = async (
    client: Http.Client,
    mmadetectorId: number,
    options: UpdateMmaDetectorOptions = {}
): Promise<void> => {
    await Http.patch(
        client,
        `/api/mmadetector/${mmadetectorId}`,
        Http.body({
            name: options.name,
            nickname: options.nickname,
            type: options.type,
            lat: options.lat,
            lon: options.lon,
            fixed_location: options.fixedLocation,
        })
    );
};

/**
 * Delete an MMA detector.
 *
 * @since 1.0.0
 * @category Requests
 * @param mmadetectorId - ID of the MMA detector to delete.
 */
export const deleteMmaDetector = async (client: Http.Client, mmadetectorId: number): Promise<void> => {
    await Http.del(client, `/api/mmadetector/${mmadetectorId}`);
};

/**
 * Retrieve a single MMA detector spectrum by ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param spectrumId - ID of the MMA detector spectrum.
 */
export const fetchMmaDetectorSpectrum = async (client: Http.Client, spectrumId: number): Promise<MmaDetectorSpectrum> =>
    Http.decode(MmaDetectorSpectrum, await Http.get(client, `/api/mmadetector/spectra/${spectrumId}`));

/**
 * Options for querying MMA detector spectra or time intervals.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchMmaDetectorDataOptions {
    /**
     * Restrict to records observed before/after this time, as arrow-parseable
     * date strings, e.g. `"2020-01-01"`.
     */
    readonly observedBefore?: string | undefined;
    readonly observedAfter?: string | undefined;
    /** Restrict to records from these MMA detectors. */
    readonly detectorIds?: ReadonlyArray<number> | undefined;
    /** Restrict to records saved to these groups. */
    readonly groupIds?: ReadonlyArray<number> | undefined;
}

/** @internal */
const detectorDataParams = (options: FetchMmaDetectorDataOptions): Http.QueryParams => ({
    observedBefore: options.observedBefore,
    observedAfter: options.observedAfter,
    detectorIDs: Http.commaSeparated(options.detectorIds),
    groupIDs: Http.commaSeparated(options.groupIds),
});

/**
 * Query MMA detector spectra.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchMmaDetectorSpectra = async (
    client: Http.Client,
    options: FetchMmaDetectorDataOptions = {}
): Promise<Array<MmaDetectorSpectrum>> =>
    Http.decode(
        v.array(MmaDetectorSpectrum),
        await Http.get(client, "/api/mmadetector/spectra", detectorDataParams(options))
    );

/**
 * Upload an MMA detector spectrum.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The spectrum to upload.
 */
export const postMmaDetectorSpectrum = async (
    client: Http.Client,
    payload: MmaDetectorSpectrumPost
): Promise<MmaDetectorSpectrumPostResponse> =>
    Http.decode(
        MmaDetectorSpectrumPostResponse,
        await Http.post(client, "/api/mmadetector/spectra", Http.body(payload))
    );

/**
 * Update an MMA detector spectrum.
 *
 * @since 1.0.0
 * @category Requests
 * @param spectrumId - ID of the MMA detector spectrum to update.
 * @param payload - The new spectrum data. Groups in `group_ids` are added to
 *   the spectrum's existing groups.
 */
export const updateMmaDetectorSpectrum = async (
    client: Http.Client,
    spectrumId: number,
    payload: MmaDetectorSpectrumPost
): Promise<void> => {
    await Http.patch(client, `/api/mmadetector/spectra/${spectrumId}`, Http.body(payload));
};

/**
 * Delete an MMA detector spectrum.
 *
 * @since 1.0.0
 * @category Requests
 * @param spectrumId - ID of the MMA detector spectrum to delete.
 */
export const deleteMmaDetectorSpectrum = async (client: Http.Client, spectrumId: number): Promise<void> => {
    await Http.del(client, `/api/mmadetector/spectra/${spectrumId}`);
};

/**
 * Retrieve a single MMA detector time interval by ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param timeIntervalId - ID of the MMA detector time interval.
 */
export const fetchMmaDetectorTimeInterval = async (
    client: Http.Client,
    timeIntervalId: number
): Promise<MmaDetectorTimeInterval> =>
    Http.decode(MmaDetectorTimeInterval, await Http.get(client, `/api/mmadetector/time_intervals/${timeIntervalId}`));

/**
 * Query MMA detector time intervals.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchMmaDetectorTimeIntervals = async (
    client: Http.Client,
    options: FetchMmaDetectorDataOptions = {}
): Promise<Array<MmaDetectorTimeInterval>> =>
    Http.decode(
        v.array(MmaDetectorTimeInterval),
        await Http.get(client, "/api/mmadetector/time_intervals", detectorDataParams(options))
    );

/**
 * Options for uploading MMA detector time intervals.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PostMmaDetectorTimeIntervalsOptions {
    /**
     * Share the intervals with these groups. If omitted, the server applies
     * its default visibility; pass `"all"` to share with all accessible
     * groups.
     */
    readonly groupIds?: ReadonlyArray<number> | "all" | undefined;
}

/**
 * Upload MMA detector time intervals.
 *
 * @since 1.0.0
 * @category Requests
 * @param detectorId - ID of the MMA detector the intervals belong to.
 * @param timeIntervals - The intervals to upload, each a `[start, end]` pair of
 *   UTC time strings.
 */
export const postMmaDetectorTimeIntervals = async (
    client: Http.Client,
    detectorId: number,
    timeIntervals: ReadonlyArray<readonly [string, string]>,
    options: PostMmaDetectorTimeIntervalsOptions = {}
): Promise<MmaDetectorTimeIntervalsPostResponse> =>
    Http.decode(
        MmaDetectorTimeIntervalsPostResponse,
        await Http.post(
            client,
            "/api/mmadetector/time_intervals",
            Http.body({
                detector_id: detectorId,
                time_intervals: timeIntervals,
                group_ids: options.groupIds,
            })
        )
    );

/**
 * Options for updating an MMA detector time interval.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpdateMmaDetectorTimeIntervalOptions {
    /** New `[start, end]` pair of UTC time strings. */
    readonly timeInterval?: readonly [string, string] | undefined;
    /**
     * Groups to add to the interval's visibility; pass `"all"` for all
     * accessible groups.
     */
    readonly groupIds?: ReadonlyArray<number> | "all" | undefined;
}

/**
 * Update an MMA detector time interval.
 *
 * @since 1.0.0
 * @category Requests
 * @param timeIntervalId - ID of the MMA detector time interval to update.
 */
export const updateMmaDetectorTimeInterval = async (
    client: Http.Client,
    timeIntervalId: number,
    options: UpdateMmaDetectorTimeIntervalOptions = {}
): Promise<void> => {
    await Http.patch(
        client,
        `/api/mmadetector/time_intervals/${timeIntervalId}`,
        Http.body({ time_interval: options.timeInterval, group_ids: options.groupIds })
    );
};

/**
 * Delete an MMA detector time interval.
 *
 * @since 1.0.0
 * @category Requests
 * @param timeIntervalId - ID of the MMA detector time interval to delete.
 */
export const deleteMmaDetectorTimeInterval = async (client: Http.Client, timeIntervalId: number): Promise<void> => {
    await Http.del(client, `/api/mmadetector/time_intervals/${timeIntervalId}`);
};
