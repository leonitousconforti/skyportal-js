/**
 * Typed endpoint functions for `/api/instrument`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";
import * as Telescopes from "./Telescopes.ts";

/**
 * One field (pointing) of an instrument (upstream `InstrumentField`).
 *
 * `contour` and `contour_summary` are deferred server-side and only present
 * when the request asked for GeoJSON. `airmass` is injected by the instrument
 * endpoint when the fields are sliced by a localization.
 *
 * @since 1.0.0
 * @category Models
 */
export const InstrumentField = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        instrument_id: Schemas.NullishInteger,
        field_id: Schemas.NullishInteger,
        ra: Schemas.NullishNumber,
        dec: Schemas.NullishNumber,
        contour: Schemas.nullish(Schemas.JsonObject),
        contour_summary: Schemas.nullish(Schemas.JsonObject),
        reference_filters: Schemas.nullish(v.array(v.string())),
        reference_filter_mags: Schemas.nullish(v.array(v.number())),
        tiles: Schemas.nullish(v.array(Schemas.JsonObject)),
        airmass: Schemas.NullishNumber,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type InstrumentField = v.InferOutput<typeof InstrumentField>;

/**
 * The kind of instrument.
 *
 * @since 1.0.0
 * @category Models
 */
export const InstrumentType = v.picklist(["imager", "spectrograph", "imaging spectrograph"]);

/**
 * @since 1.0.0
 * @category Models
 */
export type InstrumentType = v.InferOutput<typeof InstrumentType>;

/**
 * A SkyPortal instrument (upstream `Instrument`).
 *
 * `allocations` stays untyped: {@link skyportal-js/Allocations!Allocation}
 * points back at `Instrument`, so typing it here would create an import cycle.
 * `log_exists`, `number_of_fields` and `region_summary` are injected by the
 * instrument endpoints rather than being columns.
 *
 * @since 1.0.0
 * @category Models
 */
export const Instrument = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        name: Schemas.NullishString,
        type: Schemas.nullish(InstrumentType),
        band: Schemas.NullishString,
        telescope_id: Schemas.NullishInteger,
        telescope: Schemas.nullish(Telescopes.Telescope),
        filters: Schemas.list(v.string()),
        sensitivity_data: Schemas.nullish(Schemas.JsonObject),
        configuration_data: Schemas.nullish(Schemas.JsonObject),
        status: Schemas.nullish(Schemas.JsonObject),
        last_status_update: Schemas.NullishTimestamp,
        api_classname: Schemas.NullishString,
        api_classname_obsplan: Schemas.NullishString,
        listener_classname: Schemas.NullishString,
        treasuremap_id: Schemas.NullishInteger,
        tns_id: Schemas.NullishInteger,
        across_id: Schemas.NullishString,
        region: Schemas.NullishString,
        has_fields: Schemas.NullishBoolean,
        has_region: Schemas.NullishBoolean,
        fields: Schemas.nullish(v.array(InstrumentField)),
        allocations: Schemas.nullish(v.array(Schemas.JsonObject)),
        log_exists: Schemas.NullishBoolean,
        number_of_fields: Schemas.NullishInteger,
        region_summary: Schemas.NullishString,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type Instrument = v.InferOutput<typeof Instrument>;

/**
 * A log uploaded for an instrument (upstream `InstrumentLog`).
 *
 * @since 1.0.0
 * @category Models
 */
export const InstrumentLog = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        instrument_id: Schemas.NullishInteger,
        instrument: Schemas.nullish(Instrument),
        start_date: Schemas.NullishTimestamp,
        end_date: Schemas.NullishTimestamp,
        log: Schemas.nullish(Schemas.JsonObject),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type InstrumentLog = v.InferOutput<typeof InstrumentLog>;

/**
 * Per-field data for an instrument, mapping `ID`, `RA` and `Dec` to per-field
 * lists, or the equivalent as a CSV string.
 *
 * @since 1.0.0
 * @category Models
 */
export type FieldData = Record<string, ReadonlyArray<unknown>> | string;

/**
 * Payload for creating an instrument.
 *
 * `type` must be one of `"imager"`, `"spectrograph"`, or `"imaging
 * spectrograph"`, and the instrument name must be unique for the telescope.
 * `sensitivity_data` and `configuration_data` are keyed by filter name, and
 * `sensitivity_data` filters must be a subset of `filters`. Supply at most one
 * of `field_region` (a serialized ds9 region) or `field_fov_type` (`"circle"`
 * or `"rectangle"`, which requires `field_fov_attributes`: a radius, or a
 * width and a height, in degrees). `field_data` requires one of the two region
 * options; the fields themselves are generated asynchronously after the
 * response is returned. `references` maps `field` and `filter` (and optionally
 * `limmag`) to per-reference lists.
 *
 * @since 1.0.0
 * @category Models
 */
export interface InstrumentPost {
    readonly name: string;
    readonly type: string;
    readonly telescope_id: number;
    readonly band?: string | undefined;
    readonly filters?: ReadonlyArray<string> | undefined;
    readonly sensitivity_data?: Record<string, unknown> | undefined;
    readonly configuration_data?: Record<string, unknown> | undefined;
    readonly api_classname?: string | undefined;
    readonly api_classname_obsplan?: string | undefined;
    readonly listener_classname?: string | undefined;
    readonly treasuremap_id?: number | undefined;
    readonly tns_id?: number | undefined;
    readonly across_id?: string | undefined;
    readonly region?: string | undefined;
    readonly field_data?: FieldData | undefined;
    readonly field_region?: string | undefined;
    readonly field_fov_type?: string | undefined;
    readonly field_fov_attributes?: ReadonlyArray<number> | number | undefined;
    readonly references?: FieldData | undefined;
}

/**
 * Payload for updating an instrument.
 *
 * @since 1.0.0
 * @category Models
 */
export interface InstrumentPut {
    readonly name?: string | undefined;
    readonly type?: string | undefined;
    readonly telescope_id?: number | undefined;
    readonly band?: string | undefined;
    readonly filters?: ReadonlyArray<string> | undefined;
    readonly sensitivity_data?: Record<string, unknown> | undefined;
    readonly configuration_data?: Record<string, unknown> | undefined;
    readonly api_classname?: string | undefined;
    readonly api_classname_obsplan?: string | undefined;
    readonly listener_classname?: string | undefined;
    readonly treasuremap_id?: number | undefined;
    readonly tns_id?: number | undefined;
    readonly across_id?: string | undefined;
    readonly region?: string | undefined;
    readonly field_data?: FieldData | undefined;
    readonly field_region?: string | undefined;
    readonly field_fov_type?: string | undefined;
    readonly field_fov_attributes?: ReadonlyArray<number> | number | undefined;
    readonly references?: FieldData | undefined;
}

/**
 * Result of creating an instrument.
 *
 * @since 1.0.0
 * @category Models
 */
export const InstrumentPostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type InstrumentPostResponse = v.InferOutput<typeof InstrumentPostResponse>;

/**
 * Result of uploading an instrument log.
 *
 * @since 1.0.0
 * @category Models
 */
export const InstrumentLogPostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type InstrumentLogPostResponse = v.InferOutput<typeof InstrumentLogPostResponse>;

/**
 * Options for listing instruments.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchInstrumentsOptions {
    /** Exact instrument name to match. */
    readonly name?: string | undefined;
}

/**
 * Retrieve instruments, optionally filtered by exact name.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchInstruments = async (
    client: Http.Client,
    options: FetchInstrumentsOptions = {}
): Promise<Array<Instrument>> =>
    Http.decode(v.array(Instrument), await Http.get(client, "/api/instrument", { name: options.name }));

/**
 * Options for retrieving a single instrument.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchInstrumentOptions {
    /** Include each field's GeoJSON contour in `fields[].contour`. */
    readonly includeGeoJSON?: boolean | undefined;
    /** Include each field's summary contour in `fields[].contour_summary`. */
    readonly includeGeoJSONSummary?: boolean | undefined;
    /** Include the instrument's ds9 region string in `region`. */
    readonly includeRegion?: boolean | undefined;
    /**
     * Recompute the localization's field overlap instead of using the server's
     * cached field list.
     */
    readonly ignoreCache?: boolean | undefined;
    /**
     * Restrict the returned `fields` to those overlapping the localization of
     * the GCN event with this `dateobs`, in ISO 8601 format
     * (`YYYY-MM-DDTHH:MM:SS.sss`).
     */
    readonly localizationDateobs?: string | undefined;
    /**
     * Name of the localization / skymap to use. Defaults to the event's most
     * recent localization.
     */
    readonly localizationName?: string | undefined;
    /**
     * Cumulative probability up to which to include fields. Server default is
     * 0.95.
     */
    readonly localizationCumprob?: number | undefined;
    /**
     * Time to use for each field's airmass calculation, in ISO 8601 format.
     * Defaults to `localizationDateobs`.
     */
    readonly airmassTime?: string | undefined;
}

/**
 * Retrieve a single instrument by ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param instrumentId - ID of the instrument.
 */
export const fetchInstrument = async (
    client: Http.Client,
    instrumentId: number,
    options: FetchInstrumentOptions = {}
): Promise<Instrument> =>
    Http.decode(
        Instrument,
        await Http.get(client, `/api/instrument/${instrumentId}`, {
            includeGeoJSON: options.includeGeoJSON ?? false,
            includeGeoJSONSummary: options.includeGeoJSONSummary ?? false,
            includeRegion: options.includeRegion ?? false,
            ignoreCache: options.ignoreCache ?? false,
            localizationDateobs: options.localizationDateobs,
            localizationName: options.localizationName,
            localizationCumprob: options.localizationCumprob,
            airmassTime: options.airmassTime,
        })
    );

/**
 * Create an instrument.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The instrument to create.
 */
export const postInstrument = async (client: Http.Client, payload: InstrumentPost): Promise<InstrumentPostResponse> =>
    Http.decode(InstrumentPostResponse, await Http.post(client, "/api/instrument", Http.body(payload)));

/**
 * Update an instrument.
 *
 * Only the provided fields are sent; omitted fields are left unchanged.
 * Requires the "Manage instruments" permission. A filter cannot be removed
 * while photometry taken in it still references the instrument. Passing
 * `field_data` regenerates the instrument's fields asynchronously, using
 * `field_region`/`field_fov_type` if given and otherwise the instrument's
 * existing region.
 *
 * @since 1.0.0
 * @category Requests
 * @param instrumentId - ID of the instrument to update.
 * @param payload - The fields to change.
 */
export const updateInstrument = async (
    client: Http.Client,
    instrumentId: number,
    payload: InstrumentPut
): Promise<void> => {
    await Http.put(client, `/api/instrument/${instrumentId}`, Http.body(payload));
};

/**
 * Delete an instrument.
 *
 * Requires the "Manage instruments" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param instrumentId - ID of the instrument to delete.
 */
export const deleteInstrument = async (client: Http.Client, instrumentId: number): Promise<void> => {
    await Http.del(client, `/api/instrument/${instrumentId}`);
};

/**
 * Delete every field associated with an instrument.
 *
 * The instrument itself is kept; only its fields are removed and its
 * `has_fields` flag is updated. Requires the "Manage instruments" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param instrumentId - ID of the instrument whose fields to delete.
 */
export const deleteInstrumentFields = async (client: Http.Client, instrumentId: number): Promise<void> => {
    await Http.del(client, `/api/instrument/${instrumentId}/fields`);
};

/**
 * Options for listing an instrument's logs.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchInstrumentLogsOptions {
    /** Arrow-parseable date string; keep logs ending at or after this time. */
    readonly startDate?: string | undefined;
    /** Arrow-parseable date string; keep logs starting at or before this time. */
    readonly endDate?: string | undefined;
}

/**
 * Retrieve the logs uploaded for an instrument.
 *
 * @since 1.0.0
 * @category Requests
 * @param instrumentId - ID of the instrument.
 */
export const fetchInstrumentLogs = async (
    client: Http.Client,
    instrumentId: number,
    options: FetchInstrumentLogsOptions = {}
): Promise<Array<InstrumentLog>> =>
    Http.decode(
        v.array(InstrumentLog),
        await Http.get(client, `/api/instrument/${instrumentId}/log`, {
            startDate: options.startDate,
            endDate: options.endDate,
        })
    );

/**
 * Upload log messages for an instrument.
 *
 * @since 1.0.0
 * @category Requests
 * @param instrumentId - ID of the instrument the log belongs to.
 * @param startDate - Arrow-parseable date string for the start of the log period.
 * @param endDate - Arrow-parseable date string for the end of the log period.
 * @param log - The log messages as nested JSON, or as a parseable string of log
 *   lines that the server converts to JSON.
 */
export const postInstrumentLog = async (
    client: Http.Client,
    instrumentId: number,
    startDate: string,
    endDate: string,
    log: Record<string, unknown> | string
): Promise<InstrumentLogPostResponse> =>
    Http.decode(
        InstrumentLogPostResponse,
        await Http.post(client, `/api/instrument/${instrumentId}/log`, {
            start_date: startDate,
            end_date: endDate,
            log,
        })
    );

/**
 * Pull instrument logs from an allocation's remote instrument API.
 *
 * The retrieved logs are stored server-side rather than returned. Despite
 * living under the instrument path, the path ID is an allocation ID. The
 * allocation's instrument must define an API class implementing
 * `retrieve_log`. Requires the "Upload data" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param allocationId - ID of the allocation to retrieve logs for.
 * @param startDate - Arrow-parseable date string for the start of the log period.
 * @param endDate - Arrow-parseable date string for the end of the log period.
 */
export const fetchInstrumentLogExternalApi = async (
    client: Http.Client,
    allocationId: number,
    startDate: string,
    endDate: string
): Promise<void> => {
    await Http.get(client, `/api/instrument/${allocationId}/external_api`, {
        startDate,
        endDate,
    });
};

/**
 * Options for updating an instrument's status.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpdateInstrumentStatusOptions {
    /** The new status. Keys with empty values are dropped server-side. */
    readonly status?: Record<string, unknown> | undefined;
}

/**
 * Update an instrument's status.
 *
 * When `status` is omitted or empty, the status is instead refreshed from the
 * instrument's remote API, which requires an allocation whose `altdata` holds
 * `ssh_host`, `ssh_username`, and `ssh_password`. Either way the instrument
 * must define an API class implementing `update_status`. Requires the "Upload
 * data" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param instrumentId - ID of the instrument to update.
 */
export const updateInstrumentStatus = async (
    client: Http.Client,
    instrumentId: number,
    options: UpdateInstrumentStatusOptions = {}
): Promise<void> => {
    await Http.put(client, `/api/instrument/${instrumentId}/status`, Http.body(options));
};
