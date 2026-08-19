/**
 * Typed endpoint functions for `/api/observation`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Http from "./Http.ts";
import * as Instruments from "./Instruments.ts";
import * as Schemas from "./Schemas.ts";

/**
 * A survey observation (upstream `ExecutedObservation`/`QueuedObservation`).
 *
 * The endpoint returns either kind depending on `observationStatus`, so the
 * executed-only fields (`observation_id`, `airmass`, `seeing`, `limmag`,
 * `target_name`, `processed_fraction`) and the queued-only ones
 * (`queue_name`, `validity_window_start` and `validity_window_end`) are all
 * optional.
 *
 * @since 1.0.0
 * @category Models
 */
export const Observation = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        instrument_id: Schemas.NullishInteger,
        instrument_field_id: Schemas.NullishInteger,
        observation_id: Schemas.NullishInteger,
        obstime: Schemas.NullishTimestamp,
        filt: Schemas.NullishString,
        exposure_time: Schemas.NullishInteger,
        airmass: Schemas.NullishNumber,
        seeing: Schemas.NullishNumber,
        limmag: Schemas.NullishNumber,
        target_name: Schemas.NullishString,
        processed_fraction: Schemas.NullishNumber,
        queue_name: Schemas.NullishString,
        validity_window_start: Schemas.NullishTimestamp,
        validity_window_end: Schemas.NullishTimestamp,
        field: Schemas.nullish(Instruments.InstrumentField),
        instrument: Schemas.nullish(Instruments.Instrument),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type Observation = v.InferOutput<typeof Observation>;

/**
 * One page of results from an observations query.
 *
 * @since 1.0.0
 * @category Models
 */
export const ObservationsPage = Schemas.model(
    v.strictObject({
        observations: Schemas.list(Observation),
        totalMatches: v.optional(Schemas.Integer, 0),
        probability: Schemas.NullishNumber,
        area: Schemas.NullishNumber,
        geojson: Schemas.nullish(v.array(Schemas.JsonObject)),
        field_ids: Schemas.nullish(v.array(Schemas.Integer)),
        min_observations_per_field: Schemas.NullishInteger,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type ObservationsPage = v.InferOutput<typeof ObservationsPage>;

/**
 * Payload for ingesting a set of executed observations.
 *
 * `observationData` maps column names to equal-length lists and must include
 * `observation_id`, `field_id` (or `RA` and `Dec`), `obstime`, `filter`, and
 * `exposure_time`.
 *
 * @since 1.0.0
 * @category Models
 */
export interface ObservationPost {
    readonly telescopeName: string;
    readonly instrumentName: string;
    readonly observationData: Record<string, ReadonlyArray<unknown>>;
}

/**
 * Result of starting a SimSurvey efficiency calculation.
 *
 * @since 1.0.0
 * @category Models
 */
export const ObservationSimSurveyResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type ObservationSimSurveyResponse = v.InferOutput<typeof ObservationSimSurveyResponse>;

/**
 * Queue names retrieved from an instrument's external API.
 *
 * @since 1.0.0
 * @category Models
 */
export const ObservationQueues = Schemas.model(
    v.strictObject({
        queue_names: Schemas.list(v.string()),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type ObservationQueues = v.InferOutput<typeof ObservationQueues>;

/**
 * Options for querying observations.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchObservationsOptions {
    /** Restrict to observations by this telescope. */
    readonly telescopeName?: string | undefined;
    /** Restrict to observations by this instrument. */
    readonly instrumentName?: string | undefined;
    /**
     * GCN event time in ISO 8601 format; restricts to observations overlapping
     * the event's localization.
     */
    readonly localizationDateobs?: string | undefined;
    /**
     * Name of the localization / skymap to use. Defaults to the event's most
     * recent localization.
     */
    readonly localizationName?: string | undefined;
    /**
     * Cumulative probability up to which to include fields. Server default
     * 0.95.
     */
    readonly localizationCumprob?: number | undefined;
    /**
     * Minimum number of observations of a field required to include it. Server
     * default 1.
     */
    readonly numberObservations?: number | undefined;
    /**
     * Include integrated probability and area (requires
     * `localizationDateobs`).
     */
    readonly returnStatistics?: boolean | undefined;
    /** `"python"` (server default) or `"db"`. */
    readonly statsMethod?: string | undefined;
    /** Log the stats computation time server-side. */
    readonly statsLogging?: boolean | undefined;
    /** Include associated GeoJSON contours and field IDs. */
    readonly includeGeoJSON?: boolean | undefined;
    /** `"executed"` (server default) or `"queued"`. */
    readonly observationStatus?: string | undefined;
    /** Pagination controls; `numPerPage` can be at most 10000. */
    readonly pageNumber?: number | undefined;
    readonly numPerPage?: number | undefined;
    /** Field to sort by, e.g. `"obstime"`. */
    readonly sortBy?: string | undefined;
    /** `"asc"` or `"desc"`. Defaults to `"asc"`. */
    readonly sortOrder?: string | undefined;
}

/**
 * Query executed (or queued) survey observations, one page at a time.
 *
 * @since 1.0.0
 * @category Requests
 * @param startDate - Start of the time range, as an ISO-format date string.
 * @param endDate - End of the time range, as an ISO-format date string.
 */
export const fetchObservations = async (
    client: Http.Client,
    startDate: string,
    endDate: string,
    options: FetchObservationsOptions = {}
): Promise<ObservationsPage> =>
    Http.decode(
        ObservationsPage,
        await Http.get(client, "/api/observation", {
            startDate,
            endDate,
            returnStatistics: options.returnStatistics ?? false,
            statsLogging: options.statsLogging ?? false,
            includeGeoJSON: options.includeGeoJSON ?? false,
            pageNumber: options.pageNumber ?? 1,
            numPerPage: options.numPerPage ?? 100,
            telescopeName: options.telescopeName,
            instrumentName: options.instrumentName,
            localizationDateobs: options.localizationDateobs,
            localizationName: options.localizationName,
            localizationCumprob: options.localizationCumprob,
            numberObservations: options.numberObservations,
            statsMethod: options.statsMethod,
            observationStatus: options.observationStatus,
            sortBy: options.sortBy,
            sortOrder: options.sortOrder,
        })
    );

/**
 * Ingest a set of executed observations for an instrument.
 *
 * Ingestion runs asynchronously server-side.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The observations to ingest.
 */
export const postObservation = async (client: Http.Client, payload: ObservationPost): Promise<void> => {
    await Http.post(client, "/api/observation", Http.body(payload));
};

/**
 * Delete an executed observation.
 *
 * @since 1.0.0
 * @category Requests
 * @param observationId - Database ID of the executed observation (not the
 *   instrument-supplied `observation_id`).
 */
export const deleteObservation = async (client: Http.Client, observationId: number): Promise<void> => {
    await Http.del(client, `/api/observation/${observationId}`);
};

/**
 * Upload executed observations from an ASCII (CSV) table.
 *
 * Ingestion runs asynchronously server-side.
 *
 * @since 1.0.0
 * @category Requests
 * @param instrumentId - ID of the instrument the observations belong to.
 * @param observationData - Comma-separated table with columns
 *   `observation_id`, `field_id` (or `RA` and `Dec`), `obstime`, `filter`, and
 *   `exposure_time`; optional columns include `airmass`, `seeing`, `limmag`,
 *   `target_name`, and `processed_fraction`.
 */
export const postObservationAscii = async (
    client: Http.Client,
    instrumentId: number,
    observationData: string
): Promise<void> => {
    await Http.post(client, "/api/observation/ascii", {
        instrumentID: instrumentId,
        observationData,
    });
};

/**
 * Options for a SimSurvey efficiency calculation.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchObservationSimSurveyOptions {
    /**
     * Name of the localization / skymap to use. Defaults to the event's most
     * recent localization.
     */
    readonly localizationName?: string | undefined;
    /**
     * Cumulative probability up to which to include fields. Server default
     * 0.95.
     */
    readonly localizationCumprob?: number | undefined;
    /**
     * Number of simulations to evaluate efficiency with. Server default 1000.
     */
    readonly numberInjections?: number | undefined;
    /** Number of detections required for a detection. Server default 1. */
    readonly numberDetections?: number | undefined;
    /** Threshold (in sigmas) required for detection. Server default 5. */
    readonly detectionThreshold?: number | undefined;
    /**
     * Phase range (in days) post event time to consider detections. Server
     * defaults 0 and 3.
     */
    readonly minimumPhase?: number | undefined;
    readonly maximumPhase?: number | undefined;
    /**
     * One of `"kilonova"` (server default), `"afterglow"`, or `"linear"`.
     */
    readonly modelName?: string | undefined;
    /** Extra injection parameters for the chosen model. */
    readonly optionalInjectionParameters?: Record<string, unknown> | undefined;
    /**
     * Groups that can view the analysis. Defaults to all of the token's
     * groups.
     */
    readonly groupIds?: ReadonlyArray<number> | undefined;
}

/**
 * Start a SimSurvey efficiency calculation over executed observations.
 *
 * The analysis runs asynchronously server-side; the returned ID can be used
 * with {@link skyportal-js/SurveyEfficiency!fetchSurveyEfficiencyForObservations}
 * and {@link fetchObservationSimSurveyPlot}.
 *
 * @since 1.0.0
 * @category Requests
 * @param instrumentId - ID of the instrument whose observations to analyze.
 * @param startDate - Start of the observation range, as an ISO-format date string.
 * @param endDate - End of the observation range, as an ISO-format date string.
 * @param localizationDateobs - GCN event time in ISO 8601 format identifying the
 *   localization.
 */
export const fetchObservationSimSurvey = async (
    client: Http.Client,
    instrumentId: number,
    startDate: string,
    endDate: string,
    localizationDateobs: string,
    options: FetchObservationSimSurveyOptions = {}
): Promise<ObservationSimSurveyResponse> =>
    Http.decode(
        ObservationSimSurveyResponse,
        await Http.get(client, `/api/observation/simsurvey/${instrumentId}`, {
            startDate,
            endDate,
            localizationDateobs,
            localizationName: options.localizationName,
            localizationCumprob: options.localizationCumprob,
            numberInjections: options.numberInjections,
            numberDetections: options.numberDetections,
            detectionThreshold: options.detectionThreshold,
            minimumPhase: options.minimumPhase,
            maximumPhase: options.maximumPhase,
            modelName: options.modelName,
            optionalInjectionParameters:
                options.optionalInjectionParameters === undefined
                    ? undefined
                    : JSON.stringify(options.optionalInjectionParameters),
            group_ids: Http.commaSeparated(options.groupIds),
        })
    );

/**
 * Delete a SimSurvey efficiency calculation.
 *
 * @since 1.0.0
 * @category Requests
 * @param surveyEfficiencyAnalysisId - ID of the survey efficiency analysis to
 *   delete.
 */
export const deleteObservationSimSurvey = async (
    client: Http.Client,
    surveyEfficiencyAnalysisId: number
): Promise<void> => {
    await Http.del(client, `/api/observation/simsurvey/${surveyEfficiencyAnalysisId}`);
};

/**
 * Download the summary plot (PDF) for a SimSurvey calculation.
 *
 * The analysis must have completed (its light curves must be available).
 *
 * @since 1.0.0
 * @category Requests
 * @param surveyEfficiencyAnalysisId - ID of the survey efficiency analysis to
 *   plot.
 */
export const fetchObservationSimSurveyPlot = (
    client: Http.Client,
    surveyEfficiencyAnalysisId: number
): Promise<Uint8Array> => Http.getContent(client, `/api/observation/simsurvey/${surveyEfficiencyAnalysisId}/plot`);

/**
 * Options for a treasuremap submission.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PostObservationTreasuremapOptions {
    /** Name of the localization / skymap to use. */
    readonly localizationName?: string | undefined;
    /**
     * Cumulative probability up to which to include fields. Server default
     * 0.95.
     */
    readonly localizationCumprob?: number | undefined;
    /**
     * Minimum number of observations of a field required to include it. Server
     * default 1.
     */
    readonly numberObservations?: number | undefined;
}

/**
 * Submit an instrument's executed observations to treasuremap.space.
 *
 * Requires an allocation on the instrument with a `TREASUREMAP_API_TOKEN` in
 * its alternative data.
 *
 * @since 1.0.0
 * @category Requests
 * @param instrumentId - ID of the instrument whose observations to submit.
 * @param startDate - Start of the observation range, as an ISO-format date string.
 * @param endDate - End of the observation range, as an ISO-format date string.
 * @param localizationDateobs - GCN event time in ISO 8601 format identifying the
 *   localization.
 */
export const postObservationTreasuremap = async (
    client: Http.Client,
    instrumentId: number,
    startDate: string,
    endDate: string,
    localizationDateobs: string,
    options: PostObservationTreasuremapOptions = {}
): Promise<void> => {
    await Http.post(
        client,
        `/api/observation/treasuremap/${instrumentId}`,
        Http.body({
            startDate,
            endDate,
            localizationDateobs,
            localizationName: options.localizationName,
            localizationCumprob: options.localizationCumprob,
        }),
        { numberObservations: options.numberObservations }
    );
};

/**
 * Cancel an instrument's pointings on treasuremap.space for an event.
 *
 * @since 1.0.0
 * @category Requests
 * @param instrumentId - ID of the instrument whose pointings to cancel.
 * @param localizationDateobs - GCN event time in ISO 8601 format identifying the
 *   event.
 */
export const deleteObservationTreasuremap = async (
    client: Http.Client,
    instrumentId: number,
    localizationDateobs: string
): Promise<void> => {
    await Http.del(client, `/api/observation/treasuremap/${instrumentId}`, {
        localizationDateobs,
    });
};

/**
 * Options for an external-API observation import.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PostObservationExternalApiOptions {
    /**
     * Time range to retrieve, as ISO-format date strings. Defaults to the last
     * three days.
     */
    readonly startDate?: string | undefined;
    readonly endDate?: string | undefined;
}

/**
 * Retrieve and ingest executed observations from an external API.
 *
 * The allocation's instrument must implement a remote observation plan API
 * with retrieval support. Ingestion runs asynchronously server-side.
 *
 * @since 1.0.0
 * @category Requests
 * @param allocationId - ID of the allocation whose instrument API to query.
 */
export const postObservationExternalApi = async (
    client: Http.Client,
    allocationId: number,
    options: PostObservationExternalApiOptions = {}
): Promise<void> => {
    await Http.post(
        client,
        "/api/observation/external_api",
        Http.body({
            allocation_id: allocationId,
            start_date: options.startDate,
            end_date: options.endDate,
        })
    );
};

/**
 * Options for retrieving queued observations from an external API.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchObservationExternalApiOptions {
    /**
     * Time range to retrieve, as ISO-format date strings. Required unless
     * `queuesOnly` is true.
     */
    readonly startDate?: string | undefined;
    readonly endDate?: string | undefined;
    /** Return the queue names only, without ingesting observations. */
    readonly queuesOnly?: boolean | undefined;
}

/**
 * Retrieve queued observations from an external API.
 *
 * The allocation's instrument must implement a remote observation plan API
 * with queue support. Unless `queuesOnly` is true, the queued observations are
 * ingested asynchronously server-side and both dates are required.
 *
 * @since 1.0.0
 * @category Requests
 * @param allocationId - ID of the allocation whose instrument API to query.
 */
export const fetchObservationExternalApi = async (
    client: Http.Client,
    allocationId: number,
    options: FetchObservationExternalApiOptions = {}
): Promise<ObservationQueues> =>
    Http.decode(
        ObservationQueues,
        await Http.get(client, `/api/observation/external_api/${allocationId}`, {
            queuesOnly: options.queuesOnly ?? false,
            startDate: options.startDate,
            endDate: options.endDate,
        })
    );

/**
 * Delete a queue of observations via an external API.
 *
 * @since 1.0.0
 * @category Requests
 * @param allocationId - ID of the allocation whose instrument API to use.
 * @param queueName - Name of the queue to remove.
 */
export const deleteObservationExternalApi = async (
    client: Http.Client,
    allocationId: number,
    queueName: string
): Promise<void> => {
    await Http.del(client, `/api/observation/external_api/${allocationId}`, {
        queueName,
    });
};
