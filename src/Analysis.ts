/**
 * Typed endpoint functions for `/api/analysis_service` and
 * `/api/obj/analysis`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Groups from "./Groups.ts";
import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";
import * as Users from "./Users.ts";

/**
 * What an analysis service computes.
 *
 * @since 1.0.0
 * @category Models
 */
export const AnalysisType = v.picklist(["lightcurve_fitting", "spectrum_fitting", "meta_analysis"]);

/**
 * @since 1.0.0
 * @category Models
 */
export type AnalysisType = v.InferOutput<typeof AnalysisType>;

/**
 * A kind of input an analysis service consumes.
 *
 * @since 1.0.0
 * @category Models
 */
export const AnalysisInputType = v.picklist([
    "photometry",
    "spectra",
    "redshift",
    "annotations",
    "comments",
    "classifications",
]);

/**
 * @since 1.0.0
 * @category Models
 */
export type AnalysisInputType = v.InferOutput<typeof AnalysisInputType>;

/**
 * How SkyPortal authenticates against an analysis service.
 *
 * @since 1.0.0
 * @category Models
 */
export const AuthenticationType = v.picklist([
    "none",
    "header_token",
    "api_key",
    "HTTPBasicAuth",
    "HTTPDigestAuth",
    "OAuth1",
]);

/**
 * @since 1.0.0
 * @category Models
 */
export type AuthenticationType = v.InferOutput<typeof AuthenticationType>;

/**
 * The lifecycle state of an analysis run.
 *
 * @since 1.0.0
 * @category Models
 */
export const WebhookStatus = v.picklist(["queued", "pending", "completed", "failure", "cancelled", "timed_out"]);

/**
 * @since 1.0.0
 * @category Models
 */
export type WebhookStatus = v.InferOutput<typeof WebhookStatus>;

/**
 * An external analysis service (upstream `AnalysisService`).
 *
 * `_authinfo` is an underscore-prefixed column and so is never part of
 * `to_dict()`; the `obj_analyses` and `default_analyses` backrefs are never
 * eager-loaded by the handlers.
 *
 * @since 1.0.0
 * @category Models
 */
export const AnalysisService = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        name: Schemas.NullishString,
        display_name: Schemas.NullishString,
        description: Schemas.NullishString,
        version: Schemas.NullishString,
        contact_name: Schemas.NullishString,
        contact_email: Schemas.NullishString,
        url: Schemas.NullishString,
        optional_analysis_parameters: Schemas.nullish(v.union([Schemas.JsonObject, v.string()])),
        authentication_type: Schemas.nullish(AuthenticationType),
        enabled: Schemas.NullishBoolean,
        analysis_type: Schemas.nullish(AnalysisType),
        input_data_types: Schemas.list(AnalysisInputType),
        timeout: Schemas.NullishNumber,
        upload_only: Schemas.NullishBoolean,
        display_on_resource_dropdown: Schemas.NullishBoolean,
        is_summary: Schemas.NullishBoolean,
        groups: Schemas.list(Groups.Group),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type AnalysisService = v.InferOutput<typeof AnalysisService>;

/**
 * Payload for registering a new analysis service.
 *
 * `optional_analysis_parameters` and `_authinfo` must be JSON-encoded strings;
 * `_authinfo` is required unless `authentication_type` is `"none"`. If
 * `group_ids` is omitted, the service is made accessible to all of the token's
 * groups.
 *
 * @since 1.0.0
 * @category Models
 */
export interface AnalysisServicePost {
    readonly name: string;
    readonly url: string;
    readonly authentication_type: AuthenticationType;
    readonly analysis_type: AnalysisType;
    readonly input_data_types: ReadonlyArray<AnalysisInputType>;
    readonly display_name?: string | undefined;
    readonly description?: string | undefined;
    readonly version?: string | undefined;
    readonly contact_name?: string | undefined;
    readonly contact_email?: string | undefined;
    readonly optional_analysis_parameters?: string | undefined;
    readonly _authinfo?: string | undefined;
    readonly enabled?: boolean | undefined;
    readonly timeout?: number | undefined;
    readonly upload_only?: boolean | undefined;
    readonly is_summary?: boolean | undefined;
    readonly display_on_resource_dropdown?: boolean | undefined;
    readonly group_ids?: ReadonlyArray<number> | undefined;
}

/**
 * Payload for a partial update of an analysis service.
 *
 * @since 1.0.0
 * @category Models
 */
export interface AnalysisServiceUpdate {
    readonly name?: string | undefined;
    readonly url?: string | undefined;
    readonly authentication_type?: AuthenticationType | undefined;
    readonly analysis_type?: AnalysisType | undefined;
    readonly input_data_types?: ReadonlyArray<AnalysisInputType> | undefined;
    readonly display_name?: string | undefined;
    readonly description?: string | undefined;
    readonly version?: string | undefined;
    readonly contact_name?: string | undefined;
    readonly contact_email?: string | undefined;
    readonly optional_analysis_parameters?: string | undefined;
    readonly authinfo?: Record<string, unknown> | undefined;
    readonly enabled?: boolean | undefined;
    readonly timeout?: number | undefined;
    readonly upload_only?: boolean | undefined;
    readonly is_summary?: boolean | undefined;
    readonly display_on_resource_dropdown?: boolean | undefined;
    readonly group_ids?: ReadonlyArray<number> | undefined;
}

/**
 * Result of registering an analysis service.
 *
 * @since 1.0.0
 * @category Models
 */
export const AnalysisServicePostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type AnalysisServicePostResponse = v.InferOutput<typeof AnalysisServicePostResponse>;

/**
 * An analysis run on an object (upstream `ObjAnalysis`).
 *
 * `_unique_id` and `_full_name` are underscore-prefixed columns and so never
 * appear in `to_dict()`; `_full_name` is surfaced separately as `filename`
 * when `includeFilename` is set.
 *
 * `analysis_service_name`, `analysis_service_description`, `num_plots`,
 * `filename`, `data`, `model_lightcurve`, `model_lightcurves`, `model_name`
 * and `n_detections` are injected by the handler rather than being columns.
 * The listing endpoint without `objID` returns only `id`, `obj_id`, `status`,
 * `status_message`, `created_at`, `last_activity` and `analysis_service_id`
 * (plus the two service-name keys).
 *
 * @since 1.0.0
 * @category Models
 */
export const ObjAnalysis = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        obj_id: Schemas.NullishString,
        author_id: Schemas.NullishInteger,
        analysis_service_id: Schemas.NullishInteger,
        hash: Schemas.NullishString,
        show_parameters: Schemas.NullishBoolean,
        show_plots: Schemas.NullishBoolean,
        show_corner: Schemas.NullishBoolean,
        analysis_parameters: Schemas.nullish(Schemas.JsonObject),
        input_filters: Schemas.nullish(Schemas.JsonObject),
        invalid_after: Schemas.NullishTimestamp,
        token: Schemas.NullishString,
        handled_by_url: Schemas.NullishString,
        status: Schemas.nullish(WebhookStatus),
        status_message: Schemas.NullishString,
        duration: Schemas.NullishNumber,
        last_activity: Schemas.NullishTimestamp,
        analysis_service_name: Schemas.NullishString,
        analysis_service_description: Schemas.NullishString,
        num_plots: Schemas.NullishInteger,
        filename: Schemas.NullishString,
        groups: Schemas.list(Groups.Group),
        data: Schemas.nullish(Schemas.JsonObject),
        model_lightcurve: Schemas.nullish(Schemas.Json),
        model_lightcurves: Schemas.nullish(Schemas.Json),
        model_name: Schemas.NullishString,
        n_detections: Schemas.NullishInteger,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type ObjAnalysis = v.InferOutput<typeof ObjAnalysis>;

/**
 * Payload for starting an analysis run.
 *
 * `analysis_parameters` keys must be declared by the service's
 * `optional_analysis_parameters`. If `group_ids` is omitted, results are
 * visible to all of the token's groups.
 *
 * @since 1.0.0
 * @category Models
 */
export interface AnalysisPost {
    readonly analysis_parameters?: Record<string, unknown> | undefined;
    readonly show_parameters?: boolean | undefined;
    readonly show_plots?: boolean | undefined;
    readonly show_corner?: boolean | undefined;
    readonly input_filters?: Record<string, unknown> | undefined;
    readonly group_ids?: ReadonlyArray<number> | undefined;
}

/**
 * Result of starting an analysis run.
 *
 * @since 1.0.0
 * @category Models
 */
export const AnalysisPostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type AnalysisPostResponse = v.InferOutput<typeof AnalysisPostResponse>;

/**
 * Payload for uploading results to an upload-only analysis service.
 *
 * `analysis` holds the results data (e.g. `{ results: ... }`); `message`
 * becomes the status message. If `group_ids` is omitted, results are visible
 * to all of the token's groups.
 *
 * @since 1.0.0
 * @category Models
 */
export interface AnalysisUploadPost {
    readonly analysis?: Record<string, unknown> | undefined;
    readonly message?: string | undefined;
    readonly show_parameters?: boolean | undefined;
    readonly show_plots?: boolean | undefined;
    readonly show_corner?: boolean | undefined;
    readonly group_ids?: ReadonlyArray<number> | undefined;
}

/**
 * Result of uploading an upload-only analysis.
 *
 * @since 1.0.0
 * @category Models
 */
export const AnalysisUploadResponse = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        message: Schemas.NullishString,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type AnalysisUploadResponse = v.InferOutput<typeof AnalysisUploadResponse>;

/**
 * A default analysis (upstream `DefaultAnalysis`).
 *
 * The handler eager-loads `groups`, `author` and `analysis_service`.
 *
 * @since 1.0.0
 * @category Models
 */
export const DefaultAnalysis = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        analysis_service_id: Schemas.NullishInteger,
        author_id: Schemas.NullishInteger,
        show_parameters: Schemas.NullishBoolean,
        show_plots: Schemas.NullishBoolean,
        show_corner: Schemas.NullishBoolean,
        default_analysis_parameters: Schemas.nullish(Schemas.JsonObject),
        source_filter: Schemas.nullish(Schemas.JsonObject),
        stats: Schemas.nullish(Schemas.JsonObject),
        groups: Schemas.list(Groups.Group),
        author: Schemas.nullish(Users.User),
        analysis_service: Schemas.nullish(AnalysisService),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type DefaultAnalysis = v.InferOutput<typeof DefaultAnalysis>;

/**
 * Payload for creating or updating a default analysis.
 *
 * `daily_limit` defaults to 10 and must be between 1 and 1000. If `group_ids`
 * is omitted, the server uses all of the token's groups.
 *
 * @since 1.0.0
 * @category Models
 */
export interface DefaultAnalysisPost {
    readonly default_analysis_parameters?: Record<string, unknown> | undefined;
    readonly source_filter?: Record<string, unknown> | undefined;
    readonly daily_limit?: number | undefined;
    readonly show_parameters?: boolean | undefined;
    readonly show_plots?: boolean | undefined;
    readonly show_corner?: boolean | undefined;
    readonly group_ids?: ReadonlyArray<number> | undefined;
}

/**
 * Result of creating a default analysis.
 *
 * @since 1.0.0
 * @category Models
 */
export const DefaultAnalysisPostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type DefaultAnalysisPostResponse = v.InferOutput<typeof DefaultAnalysisPostResponse>;

/**
 * Retrieve a single analysis service by ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param analysisServiceId - ID of the analysis service.
 */
export const fetchAnalysisService = async (client: Http.Client, analysisServiceId: number): Promise<AnalysisService> =>
    Http.decode(AnalysisService, await Http.get(client, `/api/analysis_service/${analysisServiceId}`));

/**
 * Retrieve all analysis services visible to the token.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchAnalysisServices = async (client: Http.Client): Promise<Array<AnalysisService>> =>
    Http.decode(v.array(AnalysisService), await Http.get(client, "/api/analysis_service"));

/**
 * Register a new analysis service.
 *
 * Requires the "Manage Analysis Services" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The service to register.
 */
export const postAnalysisService = async (
    client: Http.Client,
    payload: AnalysisServicePost
): Promise<AnalysisServicePostResponse> =>
    Http.decode(AnalysisServicePostResponse, await Http.post(client, "/api/analysis_service", Http.body(payload)));

/**
 * Update an analysis service.
 *
 * Only the provided fields are sent; omitted fields are left unchanged.
 * Requires the "Manage Analysis Services" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param analysisServiceId - ID of the analysis service to update.
 * @param payload - The fields to update.
 */
export const updateAnalysisService = async (
    client: Http.Client,
    analysisServiceId: number,
    payload: AnalysisServiceUpdate
): Promise<void> => {
    await Http.patch(client, `/api/analysis_service/${analysisServiceId}`, Http.body(payload));
};

/**
 * Delete an analysis service.
 *
 * Requires the "Manage Analysis Services" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param analysisServiceId - ID of the analysis service to delete.
 */
export const deleteAnalysisService = async (client: Http.Client, analysisServiceId: number): Promise<void> => {
    await Http.del(client, `/api/analysis_service/${analysisServiceId}`);
};

/**
 * Retrieve a single default analysis by ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param analysisServiceId - ID of the analysis service the default analysis
 *   belongs to.
 * @param defaultAnalysisId - ID of the default analysis.
 */
export const fetchDefaultAnalysis = async (
    client: Http.Client,
    analysisServiceId: number,
    defaultAnalysisId: number
): Promise<DefaultAnalysis> =>
    Http.decode(
        DefaultAnalysis,
        await Http.get(client, `/api/analysis_service/${analysisServiceId}/default_analysis/${defaultAnalysisId}`)
    );

/**
 * Retrieve the default analyses of an analysis service.
 *
 * @since 1.0.0
 * @category Requests
 * @param analysisServiceId - ID of the analysis service.
 */
export const fetchDefaultAnalyses = async (
    client: Http.Client,
    analysisServiceId: number
): Promise<Array<DefaultAnalysis>> =>
    Http.decode(
        v.array(DefaultAnalysis),
        await Http.get(client, `/api/analysis_service/${analysisServiceId}/default_analysis`)
    );

/**
 * Create a default analysis for an analysis service.
 *
 * @since 1.0.0
 * @category Requests
 * @param analysisServiceId - ID of the analysis service to attach the default
 *   analysis to.
 * @param payload - The default analysis to create.
 */
export const postDefaultAnalysis = async (
    client: Http.Client,
    analysisServiceId: number,
    payload: DefaultAnalysisPost
): Promise<DefaultAnalysisPostResponse> =>
    Http.decode(
        DefaultAnalysisPostResponse,
        await Http.post(client, `/api/analysis_service/${analysisServiceId}/default_analysis`, Http.body(payload))
    );

/**
 * Update a default analysis.
 *
 * Only the provided fields are sent; omitted fields are left unchanged.
 *
 * @since 1.0.0
 * @category Requests
 * @param analysisServiceId - ID of the analysis service the default analysis
 *   belongs to.
 * @param defaultAnalysisId - ID of the default analysis to update.
 * @param payload - The fields to update.
 */
export const updateDefaultAnalysis = async (
    client: Http.Client,
    analysisServiceId: number,
    defaultAnalysisId: number,
    payload: DefaultAnalysisPost
): Promise<void> => {
    await Http.patch(
        client,
        `/api/analysis_service/${analysisServiceId}/default_analysis/${defaultAnalysisId}`,
        Http.body(payload)
    );
};

/**
 * Delete a default analysis.
 *
 * @since 1.0.0
 * @category Requests
 * @param analysisServiceId - ID of the analysis service the default analysis
 *   belongs to.
 * @param defaultAnalysisId - ID of the default analysis to delete.
 */
export const deleteDefaultAnalysis = async (
    client: Http.Client,
    analysisServiceId: number,
    defaultAnalysisId: number
): Promise<void> => {
    await Http.del(client, `/api/analysis_service/${analysisServiceId}/default_analysis/${defaultAnalysisId}`);
};

/**
 * Start an analysis run on an object.
 *
 * Requires the "Run Analyses" permission. The server assembles the input data,
 * calls the external service asynchronously, and returns the new analysis ID
 * immediately; poll {@link fetchAnalysis} for the status.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID to analyze.
 * @param analysisServiceId - ID of the analysis service to run. Must not be an
 *   upload-only service (use {@link postAnalysisUpload} for those).
 * @param payload - Run options.
 */
export const postAnalysis = async (
    client: Http.Client,
    objId: string,
    analysisServiceId: number,
    payload: AnalysisPost = {}
): Promise<AnalysisPostResponse> =>
    Http.decode(
        AnalysisPostResponse,
        await Http.post(client, `/api/obj/${objId}/analysis/${analysisServiceId}`, Http.body(payload))
    );

/**
 * Options for retrieving a single analysis.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchAnalysisOptions {
    /** Include the analysis data in the response; can be large. */
    readonly includeAnalysisData?: boolean | undefined;
    /** Include the server-side filename of the analysis data. */
    readonly includeFilename?: boolean | undefined;
}

/**
 * Retrieve a single analysis by ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param analysisId - ID of the analysis.
 */
export const fetchAnalysis = async (
    client: Http.Client,
    analysisId: number,
    options: FetchAnalysisOptions = {}
): Promise<ObjAnalysis> =>
    Http.decode(
        ObjAnalysis,
        await Http.get(client, `/api/obj/analysis/${analysisId}`, {
            includeAnalysisData: options.includeAnalysisData ?? false,
            includeFilename: options.includeFilename ?? false,
        })
    );

/**
 * Options for listing analyses.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchAnalysesOptions {
    /** Restrict to analyses whose object ID contains this string. */
    readonly objId?: string | undefined;
    /** Restrict to analyses run with this analysis service. */
    readonly analysisServiceId?: number | undefined;
    /** Only return analyses from services with `is_summary` set. */
    readonly summaryOnly?: boolean | undefined;
    /**
     * Include the server-side filename of the analysis data. Only applies when
     * `objId` is provided.
     */
    readonly includeFilename?: boolean | undefined;
}

/**
 * Retrieve analyses, optionally restricted to one object.
 *
 * Without `objId`, the server returns a minimal record per analysis (IDs,
 * status, and timestamps only).
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchAnalyses = async (
    client: Http.Client,
    options: FetchAnalysesOptions = {}
): Promise<Array<ObjAnalysis>> =>
    Http.decode(
        v.array(ObjAnalysis),
        await Http.get(client, "/api/obj/analysis", {
            summaryOnly: options.summaryOnly ?? false,
            includeFilename: options.includeFilename ?? false,
            objID: options.objId,
            analysisServiceID: options.analysisServiceId,
        })
    );

/**
 * Delete an analysis and its stored data.
 *
 * Requires the "Run Analyses" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param analysisId - ID of the analysis to delete.
 */
export const deleteAnalysis = async (client: Http.Client, analysisId: number): Promise<void> => {
    await Http.del(client, `/api/obj/analysis/${analysisId}`);
};

/**
 * Upload results for an upload-only analysis service.
 *
 * Requires the "Run Analyses" permission. The analysis is stored as completed
 * without calling any external service.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID the analysis belongs to.
 * @param analysisServiceId - ID of the analysis service; must be an upload-only
 *   service.
 * @param payload - The results to store.
 */
export const postAnalysisUpload = async (
    client: Http.Client,
    objId: string,
    analysisServiceId: number,
    payload: AnalysisUploadPost
): Promise<AnalysisUploadResponse> =>
    Http.decode(
        AnalysisUploadResponse,
        await Http.post(client, `/api/obj/${objId}/analysis_upload/${analysisServiceId}`, Http.body(payload))
    );

/**
 * Retrieve the results data of a completed analysis.
 *
 * @since 1.0.0
 * @category Requests
 * @param analysisId - ID of the analysis.
 */
export const fetchAnalysisResults = (client: Http.Client, analysisId: number): Promise<unknown> =>
    Http.get(client, `/api/obj/analysis/${analysisId}/results`);

/**
 * Download the results data of a completed analysis as a JSON file.
 *
 * Unlike {@link fetchAnalysisResults}, the server sends the results as a file
 * rather than inside the usual response envelope.
 *
 * @since 1.0.0
 * @category Requests
 * @param analysisId - ID of the analysis.
 */
export const fetchAnalysisResultsFile = (client: Http.Client, analysisId: number): Promise<Uint8Array> =>
    Http.getContent(client, `/api/obj/analysis/${analysisId}/results`, {
        download: "true",
    });

/**
 * Options for downloading an analysis plot.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchAnalysisPlotOptions {
    /**
     * Which plot to download, starting at 0. The number of available plots is
     * the `num_plots` field of {@link fetchAnalysis}.
     */
    readonly plotNumber?: number | undefined;
}

/**
 * Download one plot produced by an analysis.
 *
 * @since 1.0.0
 * @category Requests
 * @param analysisId - ID of the analysis.
 */
export const fetchAnalysisPlot = (
    client: Http.Client,
    analysisId: number,
    options: FetchAnalysisPlotOptions = {}
): Promise<Uint8Array> => Http.getContent(client, `/api/obj/analysis/${analysisId}/plots/${options.plotNumber ?? 0}`);
