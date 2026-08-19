/**
 * Typed endpoint functions for `/api/brokers`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Http from "./Http.ts";
import * as Photometry from "./Photometry.ts";
import * as Schemas from "./Schemas.ts";
import * as Streams from "./Streams.ts";

/**
 * The registered `BrokerAPI` provider classes (upstream `BROKERS`).
 *
 * @since 1.0.0
 * @category Models
 */
export const BrokerClassname = v.picklist([
    "GENERICBROKER",
    "LASAIRBROKER",
    "BABAMULBROKER",
    "BOOMBROKER",
    "FINKBROKER",
    "ALERCEBROKER",
    "ANTARESBROKER",
    "PITTGOOGLEBROKER",
    "AMPELBROKER",
]);

/**
 * @since 1.0.0
 * @category Models
 */
export type BrokerClassname = v.InferOutput<typeof BrokerClassname>;

/**
 * How a provider models filters, so a client can pick an editor.
 *
 * @since 1.0.0
 * @category Models
 */
export const BrokerFilterKind = v.picklist(["pipeline", "query", "tags", "none"]);

/**
 * @since 1.0.0
 * @category Models
 */
export type BrokerFilterKind = v.InferOutput<typeof BrokerFilterKind>;

/**
 * What a broker's provider class implements (upstream `implements()`).
 *
 * @since 1.0.0
 * @category Models
 */
export const BrokerCapabilities = Schemas.model(
    v.strictObject({
        query_alerts: Schemas.NullishBoolean,
        get_alert: Schemas.NullishBoolean,
        get_cutouts: Schemas.NullishBoolean,
        cone_search: Schemas.NullishBoolean,
        get_filters: Schemas.NullishBoolean,
        create_filter: Schemas.NullishBoolean,
        update_filter: Schemas.NullishBoolean,
        delete_filter: Schemas.NullishBoolean,
        test_filter: Schemas.NullishBoolean,
        validate_filter: Schemas.NullishBoolean,
        filter_modules: Schemas.NullishBoolean,
        run_ingestion: Schemas.NullishBoolean,
        validate_config: Schemas.NullishBoolean,
        test_connection: Schemas.NullishBoolean,
        save_as_source: Schemas.NullishBoolean,
        get_photometry: Schemas.NullishBoolean,
        /**
         * Whether `cone_search` returns reference catalogs. A data-semantics flag
         * rather than a method.
         */
        cross_match_catalogs: Schemas.NullishBoolean,
        /**
         * The dialect `test_filter` expects its pipeline in; null when the
         * provider takes no pipeline at all.
         */
        filter_pipeline: Schemas.NullishString,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type BrokerCapabilities = v.InferOutput<typeof BrokerCapabilities>;

/**
 * A configured connection to an external alert broker (upstream `Broker`).
 *
 * The endpoints hand-build this dict rather than calling `to_dict()`, so
 * `created_at`/`modified` are never returned even though the upstream row
 * carries them. `altdata` is only present for system admins, with the
 * provider's secret config fields stripped out.
 *
 * @since 1.0.0
 * @category Models
 */
export const Broker = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        name: v.string(),
        broker_classname: BrokerClassname,
        active: v.boolean(),
        default_alert_search: v.boolean(),
        default_crossmatch: v.boolean(),
        capabilities: Schemas.nullish(BrokerCapabilities),
        surveys: Schemas.list(v.string()),
        filter_kind: Schemas.nullish(BrokerFilterKind),
        /** Free-form per-instance provider configuration (endpoints, credentials). */
        altdata: Schemas.nullish(Schemas.JsonObject),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type Broker = v.InferOutput<typeof Broker>;

/**
 * Payload for registering a broker.
 *
 * `broker_classname` must be a registered provider class name.
 *
 * @since 1.0.0
 * @category Models
 */
export interface BrokerPost {
    readonly name: string;
    readonly broker_classname: BrokerClassname;
    readonly altdata?: Record<string, unknown> | undefined;
    readonly active?: boolean | undefined;
    readonly default_alert_search?: boolean | undefined;
    readonly default_crossmatch?: boolean | undefined;
}

/**
 * Result of registering a broker.
 *
 * @since 1.0.0
 * @category Models
 */
export const BrokerPostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type BrokerPostResponse = v.InferOutput<typeof BrokerPostResponse>;

/**
 * One editable version of a broker filter, as stored on the filter row.
 *
 * @since 1.0.0
 * @category Models
 */
export const BrokerFilterVersion = Schemas.model(
    v.strictObject({
        fid: Schemas.nullish(v.union([v.string(), Schemas.Integer])),
        /**
         * The version tree the broker's own filter language defines; SkyPortal
         * stores it verbatim, so its shape is the provider's, not SkyPortal's.
         */
        version: Schemas.nullish(Schemas.Json),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type BrokerFilterVersion = v.InferOutput<typeof BrokerFilterVersion>;

/**
 * A SkyPortal `Filter` as listed by the broker endpoints.
 *
 * The handlers hand-build this dict, so it carries a strict subset of the
 * upstream `Filter` columns and never `created_at`/`modified`. `altdata` stays
 * free-form: it holds the broker-side ids and the compiled native filter,
 * whose shape the broker defines.
 *
 * @since 1.0.0
 * @category Models
 */
export const BrokerFilter = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        name: Schemas.NullishString,
        group_id: Schemas.NullishInteger,
        stream_id: Schemas.NullishInteger,
        broker_id: Schemas.NullishInteger,
        autosave: Schemas.NullishBoolean,
        altdata: Schemas.nullish(Schemas.JsonObject),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type BrokerFilter = v.InferOutput<typeof BrokerFilter>;

/**
 * A broker filter enriched with its broker-side versions and state.
 *
 * `stream` is trimmed by the handler to the stream's `id` and `name`. `fv`
 * comes straight back from the broker, so its entries are shaped by the
 * provider rather than by SkyPortal. The `fv`/`active_fid`/`active`/`filters`
 * block is dropped entirely when the broker is unreachable or the filter has
 * no broker-side counterpart.
 *
 * @since 1.0.0
 * @category Models
 */
export const BrokerFilterDetail = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        name: Schemas.NullishString,
        group_id: Schemas.NullishInteger,
        broker_id: Schemas.NullishInteger,
        autosave: Schemas.NullishBoolean,
        stream: Schemas.nullish(Streams.Stream),
        altdata: Schemas.nullish(Schemas.JsonObject),
        fv: Schemas.nullish(v.array(Schemas.JsonObject)),
        active_fid: Schemas.nullish(v.union([v.string(), Schemas.Integer])),
        active: Schemas.NullishBoolean,
        filters: Schemas.nullish(v.array(BrokerFilterVersion)),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type BrokerFilterDetail = v.InferOutput<typeof BrokerFilterDetail>;

/**
 * One page of results from the broker filter catalog.
 *
 * @since 1.0.0
 * @category Models
 */
export const BrokerFiltersPage = Schemas.model(
    v.strictObject({
        filters: Schemas.list(BrokerFilter),
        totalMatches: v.optional(Schemas.Integer, 0),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type BrokerFiltersPage = v.InferOutput<typeof BrokerFiltersPage>;

/**
 * A saved query for a broker whose `filter_kind` is `"query"`.
 *
 * @since 1.0.0
 * @category Models
 */
export interface BrokerFilterQuery {
    readonly selected: string;
    readonly tables: string;
    readonly conditions?: string | undefined;
}

/**
 * Result of creating a broker filter version.
 *
 * @since 1.0.0
 * @category Models
 */
export const BrokerFilterPostResponse = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        altdata: Schemas.nullish(Schemas.JsonObject),
        autosave: Schemas.NullishBoolean,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type BrokerFilterPostResponse = v.InferOutput<typeof BrokerFilterPostResponse>;

/**
 * Result of attaching a filter to a broker.
 *
 * @since 1.0.0
 * @category Models
 */
export const BrokerFilterAttachResponse = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        broker_id: Schemas.NullishInteger,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type BrokerFilterAttachResponse = v.InferOutput<typeof BrokerFilterAttachResponse>;

/**
 * Verdict of a broker filter version validation.
 *
 * @since 1.0.0
 * @category Models
 */
export const BrokerFilterValidation = Schemas.model(
    v.strictObject({
        fid: Schemas.nullish(v.union([v.string(), Schemas.Integer])),
        passed: Schemas.NullishBoolean,
        message: Schemas.NullishString,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type BrokerFilterValidation = v.InferOutput<typeof BrokerFilterValidation>;

/**
 * Result of saving a broker alert as a source.
 *
 * @since 1.0.0
 * @category Models
 */
export const BrokerAlertSaveResponse = Schemas.model(v.strictObject({ id: v.string() }));

/**
 * @since 1.0.0
 * @category Models
 */
export type BrokerAlertSaveResponse = v.InferOutput<typeof BrokerAlertSaveResponse>;

/**
 * Retrieve every broker visible to the token.
 *
 * `altdata` is only populated for system admins, and always has the provider's
 * secret configuration fields stripped.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchBrokers = async (client: Http.Client): Promise<Array<Broker>> =>
    Http.decode(v.array(Broker), await Http.get(client, "/api/brokers"));

/**
 * Retrieve a single broker by ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param brokerId - ID of the broker.
 */
export const fetchBroker = async (client: Http.Client, brokerId: number): Promise<Broker> =>
    Http.decode(Broker, await Http.get(client, `/api/brokers/${brokerId}`));

/**
 * Register a configured connection to an external alert broker.
 *
 * Requires the System admin ACL. A broker whose provider implements
 * `test_connection` is always created inactive, since activating it is what
 * checks its credentials.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The broker to register.
 */
export const postBroker = async (client: Http.Client, payload: BrokerPost): Promise<BrokerPostResponse> =>
    Http.decode(BrokerPostResponse, await Http.post(client, "/api/brokers", Http.body(payload)));

/**
 * Options for updating a broker.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpdateBrokerOptions {
    /** New broker name. */
    readonly name?: string | undefined;
    /** Whether the broker is active. */
    readonly active?: boolean | undefined;
    /** Endpoints and credentials to overlay on the stored configuration. */
    readonly altdata?: Record<string, unknown> | undefined;
    /**
     * Make this the broker the source page searches alerts on; the server
     * clears the flag on every other broker.
     */
    readonly defaultAlertSearch?: boolean | undefined;
    /**
     * Make this the broker cross-matches are run against; the server clears
     * the flag on every other broker.
     */
    readonly defaultCrossmatch?: boolean | undefined;
}

/**
 * Update a broker.
 *
 * Requires the System admin ACL. `altdata` is merged into the stored
 * configuration, so blank or omitted values keep the stored credentials.
 * Activating a broker whose provider implements `test_connection`, or editing
 * an active one's credentials, reaches the broker first and fails if the
 * credentials are refused.
 *
 * @since 1.0.0
 * @category Requests
 * @param brokerId - ID of the broker to update.
 */
export const updateBroker = async (
    client: Http.Client,
    brokerId: number,
    options: UpdateBrokerOptions = {}
): Promise<void> => {
    await Http.patch(
        client,
        `/api/brokers/${brokerId}`,
        Http.body({
            name: options.name,
            active: options.active,
            altdata: options.altdata,
            default_alert_search: options.defaultAlertSearch,
            default_crossmatch: options.defaultCrossmatch,
        })
    );
};

/**
 * Delete a broker.
 *
 * Requires the System admin ACL.
 *
 * @since 1.0.0
 * @category Requests
 * @param brokerId - ID of the broker to delete.
 */
export const deleteBroker = async (client: Http.Client, brokerId: number): Promise<void> => {
    await Http.del(client, `/api/brokers/${brokerId}`);
};

/**
 * Options for searching a broker's alerts.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchBrokerAlertsOptions {
    /** Restrict to alerts of this object. */
    readonly objectId?: string | undefined;
    /** Restrict to this alert candidate ID. */
    readonly candid?: number | string | undefined;
    /** Cone-search filter; provide all three together. */
    readonly ra?: number | undefined;
    readonly dec?: number | undefined;
    readonly radius?: number | undefined;
    /**
     * Bound the alert JD; either bound alone is valid. Honouring these is best
     * effort, so a provider may ignore them.
     */
    readonly jdStart?: number | undefined;
    readonly jdEnd?: number | undefined;
    /** Additional provider-specific query parameters. */
    readonly extraParams?: Http.QueryParams | undefined;
}

/**
 * Search a broker's alerts.
 *
 * The query is dispatched to the broker's provider, so the accepted parameters
 * and the shape of each alert are provider-specific. The server injects the
 * requester's stream-derived access scope. The broker must be active and
 * implement `query_alerts`.
 *
 * @since 1.0.0
 * @category Requests
 * @param brokerId - ID of the broker to query.
 */
export const fetchBrokerAlerts = async (
    client: Http.Client,
    brokerId: number,
    options: FetchBrokerAlertsOptions = {}
): Promise<Array<Record<string, unknown>>> =>
    Http.decode(
        v.array(Schemas.JsonObject),
        await Http.get(client, `/api/brokers/${brokerId}/alerts`, {
            ...options.extraParams,
            objectId: options.objectId,
            candid: options.candid,
            ra: options.ra,
            dec: options.dec,
            radius: options.radius,
            jd_start: options.jdStart,
            jd_end: options.jdEnd,
        })
    );

/**
 * Options carrying additional provider-specific query parameters.
 *
 * @since 1.0.0
 * @category Models
 */
export interface BrokerExtraParamsOptions {
    /** Additional provider-specific query parameters. */
    readonly extraParams?: Http.QueryParams | undefined;
}

/**
 * Retrieve a single alert from a broker.
 *
 * Dispatched to the broker's provider, which returns the alert with its
 * auxiliary/history data if available. The broker must be active and implement
 * `get_alert`.
 *
 * @since 1.0.0
 * @category Requests
 * @param brokerId - ID of the broker to query.
 * @param alertId - Alert identifier the provider keys alerts on.
 */
export const fetchBrokerAlert = async (
    client: Http.Client,
    brokerId: number,
    alertId: string,
    options: BrokerExtraParamsOptions = {}
): Promise<Record<string, unknown>> =>
    Http.decode(
        Schemas.JsonObject,
        await Http.get(client, `/api/brokers/${brokerId}/alerts/${alertId}`, {
            ...options.extraParams,
        })
    );

/**
 * Retrieve an alert's science, template and difference cutouts.
 *
 * Dispatched to the broker's provider, which returns a JSON payload rather
 * than raw image bytes. The broker must be active and implement
 * `get_cutouts`.
 *
 * @since 1.0.0
 * @category Requests
 * @param brokerId - ID of the broker to query.
 * @param alertId - Alert identifier (e.g. candid) the provider keys cutouts on.
 */
export const fetchBrokerCutouts = async (
    client: Http.Client,
    brokerId: number,
    alertId: string,
    options: BrokerExtraParamsOptions = {}
): Promise<Record<string, unknown>> =>
    Http.decode(
        Schemas.JsonObject,
        await Http.get(client, `/api/brokers/${brokerId}/alerts/${alertId}/cutouts`, {
            ...options.extraParams,
        })
    );

/**
 * Options for broker-merged photometry.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchBrokerPhotometryOptions {
    /** Survey to fetch the broker photometry from. */
    readonly survey?: string | undefined;
    /** Photometry format, `"mag"` by default. */
    readonly format?: string | undefined;
    /** Magnitude system, `"ab"` by default. */
    readonly magsys?: string | undefined;
    /** Bypass any cached broker payload and re-fetch. */
    readonly refresh?: boolean | undefined;
}

/**
 * Retrieve an object's photometry merged with the broker's.
 *
 * The persisted, access-controlled database photometry is merged with
 * photometry fetched on demand from the broker, deduped by instrument, filter
 * and MJD. The broker half is cached per access scope and never written to the
 * database. The broker must be active and implement `get_photometry`.
 *
 * @since 1.0.0
 * @category Requests
 * @param brokerId - ID of the broker to query.
 * @param alertId - Object identifier to fetch photometry for.
 */
export const fetchBrokerPhotometry = async (
    client: Http.Client,
    brokerId: number,
    alertId: string,
    options: FetchBrokerPhotometryOptions = {}
): Promise<Array<Photometry.PhotometryPoint>> =>
    Http.decode(
        v.array(Photometry.PhotometryPoint),
        await Http.get(client, `/api/brokers/${brokerId}/alerts/${alertId}/photometry`, {
            format: options.format ?? "mag",
            magsys: options.magsys ?? "ab",
            refresh: options.refresh ?? false,
            survey: options.survey,
        })
    );

/**
 * Options for survey-addressed broker photometry.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchBrokerSurveyPhotometryOptions {
    /** Photometry format, `"mag"` by default. */
    readonly format?: string | undefined;
    /** Magnitude system, `"ab"` by default. */
    readonly magsys?: string | undefined;
    /** Bypass any cached broker payload and re-fetch. */
    readonly refresh?: boolean | undefined;
}

/**
 * Retrieve an object's photometry via the survey's own broker.
 *
 * Broker-address-free variant of {@link fetchBrokerPhotometry}: the server
 * resolves the first active broker serving `survey` that implements
 * `get_photometry`. If no such broker is configured, it degrades to the
 * object's database photometry.
 *
 * @since 1.0.0
 * @category Requests
 * @param objectId - Object identifier to fetch photometry for.
 * @param survey - Survey whose broker should serve the photometry.
 */
export const fetchBrokerSurveyPhotometry = async (
    client: Http.Client,
    objectId: string,
    survey: string,
    options: FetchBrokerSurveyPhotometryOptions = {}
): Promise<Array<Photometry.PhotometryPoint>> =>
    Http.decode(
        v.array(Photometry.PhotometryPoint),
        await Http.get(client, `/api/brokers/photometry/${objectId}`, {
            survey,
            format: options.format ?? "mag",
            magsys: options.magsys ?? "ab",
            refresh: options.refresh ?? false,
        })
    );

/**
 * Save a broker alert as a SkyPortal source.
 *
 * Requires the Upload data ACL. The object and its photometry (and cutouts,
 * when the provider can serve them) are ingested through the broker's
 * provider. The broker must be active and implement `save_as_source`.
 *
 * @since 1.0.0
 * @category Requests
 * @param brokerId - ID of the broker holding the alert.
 * @param alertId - Object identifier to save.
 * @param groupIds - Groups to save the source to; at least one is required.
 */
export const postBrokerAlertSave = async (
    client: Http.Client,
    brokerId: number,
    alertId: string,
    groupIds: ReadonlyArray<number>
): Promise<BrokerAlertSaveResponse> =>
    Http.decode(
        BrokerAlertSaveResponse,
        await Http.post(client, `/api/brokers/${brokerId}/alerts/${alertId}/save`, {
            group_ids: groupIds,
        })
    );

/**
 * Options for a broker cone search.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchBrokerConeSearchOptions {
    /** One of `"deg"`, `"arcmin"` or `"arcsec"` (the default). */
    readonly radiusUnits?: string | undefined;
}

/**
 * Cross-match a position against a broker's archival catalogs.
 *
 * Returns the matched sources keyed by catalog name (e.g. Gaia, PS1,
 * AllWISE). The broker must be active and implement `cone_search`.
 *
 * @since 1.0.0
 * @category Requests
 * @param brokerId - ID of the broker to cross-match against.
 * @param ra - Right ascension in degrees, `0 <= ra < 360`.
 * @param dec - Declination in degrees, `-90 <= dec <= 90`.
 * @param radius - Search radius, in `radiusUnits`.
 */
export const fetchBrokerConeSearch = async (
    client: Http.Client,
    brokerId: number,
    ra: number,
    dec: number,
    radius: number,
    options: FetchBrokerConeSearchOptions = {}
): Promise<Record<string, unknown>> =>
    Http.decode(
        Schemas.JsonObject,
        await Http.get(client, `/api/brokers/${brokerId}/cone_search`, {
            ra,
            dec,
            radius,
            radius_units: options.radiusUnits ?? "arcsec",
        })
    );

/**
 * Retrieve the SkyPortal filters attached to a broker.
 *
 * The broker must be active.
 *
 * @since 1.0.0
 * @category Requests
 * @param brokerId - ID of the broker.
 */
export const fetchBrokerFilters = async (client: Http.Client, brokerId: number): Promise<Array<BrokerFilter>> =>
    Http.decode(v.array(BrokerFilter), await Http.get(client, `/api/brokers/${brokerId}/filters`));

/**
 * Retrieve one broker filter with its broker-side versions and state.
 *
 * The version fields (`fv`, `active_fid`, `active`, `filters`) are only
 * populated for broker-managed filters, and are omitted when the broker is
 * unreachable.
 *
 * @since 1.0.0
 * @category Requests
 * @param brokerId - ID of the broker the filter is attached to.
 * @param filterId - ID of the SkyPortal filter.
 */
export const fetchBrokerFilter = async (
    client: Http.Client,
    brokerId: number,
    filterId: number
): Promise<BrokerFilterDetail> =>
    Http.decode(BrokerFilterDetail, await Http.get(client, `/api/brokers/${brokerId}/filters/${filterId}`));

/**
 * Options for creating a broker filter version.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PostBrokerFilterOptions {
    /** Compiled native filter forwarded to a pipeline broker. */
    readonly altdata?: Record<string, unknown> | ReadonlyArray<unknown> | undefined;
    /** Editable version tree stored alongside the broker-side version id. */
    readonly filters?: Record<string, unknown> | ReadonlyArray<unknown> | undefined;
    /** Saved query for a `"query"`-kind broker. */
    readonly query?: BrokerFilterQuery | undefined;
    /**
     * Whether the SkyPortal filter auto-saves passing objects, for a
     * `"query"`-kind broker.
     */
    readonly autosave?: boolean | undefined;
}

/**
 * Create a broker-side filter version on an existing SkyPortal filter.
 *
 * Requires the Upload data ACL. What the body must carry depends on the
 * broker's `filter_kind`: a `"query"` broker (e.g. Lasair) takes `query` and
 * stores it on the SkyPortal filter, while a `"pipeline"` broker (e.g. BOOM)
 * takes `altdata` (the compiled native filter) and `filters` (the editable
 * version tree), and the broker-side ids are stored in the filter's altdata.
 * The broker must be active.
 *
 * @since 1.0.0
 * @category Requests
 * @param brokerId - ID of the broker to create the filter version on.
 * @param filterId - ID of the existing SkyPortal filter.
 */
export const postBrokerFilter = async (
    client: Http.Client,
    brokerId: number,
    filterId: number,
    options: PostBrokerFilterOptions = {}
): Promise<BrokerFilterPostResponse> =>
    Http.decode(
        BrokerFilterPostResponse,
        await Http.post(
            client,
            `/api/brokers/${brokerId}/filters/${filterId}`,
            Http.body({
                altdata: options.altdata,
                filters: options.filters,
                query: options.query === undefined ? undefined : Http.body(options.query),
                autosave: options.autosave,
            })
        )
    );

/**
 * Options for updating a broker filter.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpdateBrokerFilterOptions {
    /** Whether the selected version runs on the broker. */
    readonly active?: boolean | undefined;
    /** Broker-side id of the version to activate. */
    readonly activeFid?: string | number | undefined;
    /** Annotate objects passing the filter. */
    readonly autoAnnotate?: boolean | undefined;
    /** Save objects passing the filter as sources. */
    readonly autoSave?: boolean | undefined;
    /** Trigger follow-up for objects passing the filter. */
    readonly autoFollowup?: boolean | undefined;
}

/**
 * Update a broker filter's activation or automation flags.
 *
 * Requires the Upload data ACL. `active` and `activeFid` must be given
 * together to change which version is active, and a version can only be
 * activated once it has a passing validation on record (see
 * {@link postBrokerFilterValidation}) unless the token belongs to a system
 * admin. The broker must be active.
 *
 * @since 1.0.0
 * @category Requests
 * @param brokerId - ID of the broker the filter is attached to.
 * @param filterId - ID of the broker-managed SkyPortal filter.
 */
export const updateBrokerFilter = async (
    client: Http.Client,
    brokerId: number,
    filterId: number,
    options: UpdateBrokerFilterOptions = {}
): Promise<void> => {
    await Http.patch(
        client,
        `/api/brokers/${brokerId}/filters/${filterId}`,
        Http.body({
            active: options.active,
            active_fid: options.activeFid,
            autoAnnotate: options.autoAnnotate,
            autoSave: options.autoSave,
            autoFollowup: options.autoFollowup,
        })
    );
};

/**
 * Delete a broker filter.
 *
 * Requires the Upload data ACL. The SkyPortal filter is deleted, and its
 * broker-side filter is deleted best-effort through the provider. The broker
 * must be active.
 *
 * @since 1.0.0
 * @category Requests
 * @param brokerId - ID of the broker the filter is attached to.
 * @param filterId - ID of the SkyPortal filter to delete.
 */
export const deleteBrokerFilter = async (client: Http.Client, brokerId: number, filterId: number): Promise<void> => {
    await Http.del(client, `/api/brokers/${brokerId}/filters/${filterId}`);
};

/**
 * Options for the broker filter catalog.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchBrokerFilterCatalogOptions {
    /** Pagination controls; the server caps `numPerPage` at 100. */
    readonly pageNumber?: number | undefined;
    readonly numPerPage?: number | undefined;
    /** Case-insensitive substring of the filter name. */
    readonly name?: string | undefined;
    /** Restrict to filters of this group. */
    readonly groupId?: number | undefined;
    /** Restrict to filters of this stream. */
    readonly streamId?: number | undefined;
    /**
     * Restrict to filters attached to this broker, or pass `"none"` for the
     * filters attached to no broker.
     */
    readonly brokerId?: number | string | undefined;
}

/**
 * Query the filters visible to the token and the broker they belong to.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchBrokerFilterCatalog = async (
    client: Http.Client,
    options: FetchBrokerFilterCatalogOptions = {}
): Promise<BrokerFiltersPage> =>
    Http.decode(
        BrokerFiltersPage,
        await Http.get(client, "/api/brokers/filters", {
            pageNumber: options.pageNumber ?? 1,
            numPerPage: options.numPerPage ?? 25,
            name: options.name,
            groupID: options.groupId,
            streamID: options.streamId,
            brokerID: options.brokerId,
        })
    );

/**
 * Attach an unattached SkyPortal filter to a broker.
 *
 * Requires the Upload data ACL. The broker must be active and must accept
 * filters, and the filter must not already belong to another broker.
 *
 * @since 1.0.0
 * @category Requests
 * @param filterId - ID of the SkyPortal filter to attach.
 * @param brokerId - ID of the broker to attach it to.
 */
export const postBrokerFilterAttach = async (
    client: Http.Client,
    filterId: number,
    brokerId: number
): Promise<BrokerFilterAttachResponse> =>
    Http.decode(
        BrokerFilterAttachResponse,
        await Http.post(client, `/api/brokers/filters/${filterId}/attach`, {
            broker_id: brokerId,
        })
    );

/**
 * Preview a filter against a broker without saving it.
 *
 * The body is filter parameters specific to the broker's `filter_kind` (e.g.
 * Lasair's `selected`/`tables`/`conditions`, BOOM's pipeline), and the result
 * is a count or a page of matching alerts. The server injects the requester's
 * stream-derived access scope. The broker must be active and implement
 * `test_filter`.
 *
 * @since 1.0.0
 * @category Requests
 * @param brokerId - ID of the broker to run the filter on.
 * @param params - Provider-specific filter parameters.
 */
export const postBrokerFilterTest = (
    client: Http.Client,
    brokerId: number,
    params: Record<string, unknown> = {}
): Promise<unknown> => Http.post(client, `/api/brokers/${brokerId}/filter/test`, params);

/**
 * Options for validating a broker filter version.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PostBrokerFilterValidationOptions {
    /**
     * Broker-side id of the version to validate; defaults to the broker's own
     * choice of version.
     */
    readonly fid?: string | number | undefined;
}

/**
 * Validate a broker filter version for activation.
 *
 * The broker runs its activation validation without changing state, and
 * SkyPortal records the verdict on the filter: activating a version through
 * {@link updateBrokerFilter} is gated on it. The broker must be active and
 * implement `validate_filter`, and the filter must be broker-managed.
 *
 * @since 1.0.0
 * @category Requests
 * @param brokerId - ID of the broker the filter is attached to.
 * @param filterId - ID of the broker-managed SkyPortal filter.
 */
export const postBrokerFilterValidation = async (
    client: Http.Client,
    brokerId: number,
    filterId: number,
    options: PostBrokerFilterValidationOptions = {}
): Promise<BrokerFilterValidation> =>
    Http.decode(
        BrokerFilterValidation,
        await Http.post(
            client,
            `/api/brokers/${brokerId}/filters/${filterId}/validate`,
            Http.body({ fid: options.fid })
        )
    );

/**
 * Options for a broker's filter-building vocabulary.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchBrokerFilterModulesOptions {
    /** Survey to return the vocabulary for. */
    readonly survey?: string | undefined;
    /**
     * `"schema"` (the default) for the full schema, or one of `"variables"`,
     * `"listVariables"`, `"switchCases"` or `"blocks"` for the stored custom
     * elements of that kind.
     */
    readonly elements?: string | undefined;
}

/**
 * Retrieve a broker's filter-building vocabulary.
 *
 * Returns the fields, operators and broker-scoped custom variables the
 * broker's filters support, which drives the filter builder. The broker must
 * be active and implement `filter_modules`.
 *
 * @since 1.0.0
 * @category Requests
 * @param brokerId - ID of the broker.
 */
export const fetchBrokerFilterModules = (
    client: Http.Client,
    brokerId: number,
    options: FetchBrokerFilterModulesOptions = {}
): Promise<unknown> =>
    Http.get(client, `/api/brokers/${brokerId}/filter_modules`, {
        elements: options.elements ?? "schema",
        survey: options.survey,
    });

/**
 * Retrieve one named module from a broker's filter-building vocabulary.
 *
 * The server returns `null` when the broker has no module of that name.
 *
 * @since 1.0.0
 * @category Requests
 * @param brokerId - ID of the broker.
 * @param name - Name of the module.
 */
export const fetchBrokerFilterModule = async (
    client: Http.Client,
    brokerId: number,
    name: string,
    options: FetchBrokerFilterModulesOptions = {}
): Promise<Record<string, unknown> | null> =>
    Http.decode(
        v.nullable(Schemas.JsonObject),
        (await Http.get(client, `/api/brokers/${brokerId}/filter_modules/${name}`, {
            elements: options.elements ?? "schema",
            survey: options.survey,
        })) ?? null
    );

/**
 * Create a broker-scoped custom filter module.
 *
 * Requires the Upload data ACL. Where the module is stored is up to the
 * broker's provider. The broker must be active and implement
 * `filter_modules`.
 *
 * @since 1.0.0
 * @category Requests
 * @param brokerId - ID of the broker to store the module on.
 * @param name - Name of the module.
 * @param elements - Kind of element: `"variables"`, `"listVariables"`,
 *   `"switchCases"` or `"blocks"`.
 * @param data - The module definition.
 */
export const postBrokerFilterModule = async (
    client: Http.Client,
    brokerId: number,
    name: string,
    elements: string,
    data: Record<string, unknown>
): Promise<void> => {
    await Http.post(client, `/api/brokers/${brokerId}/filter_modules/${name}`, {
        elements,
        data,
    });
};

/**
 * Update a broker-scoped custom filter module.
 *
 * Requires the Upload data ACL. The server errors if no module of that name
 * exists. The broker must be active and implement `filter_modules`.
 *
 * @since 1.0.0
 * @category Requests
 * @param brokerId - ID of the broker holding the module.
 * @param name - Name of the module to update.
 * @param elements - Kind of element: `"variables"`, `"listVariables"`,
 *   `"switchCases"` or `"blocks"`.
 * @param data - The new module definition, merged into the stored one.
 */
export const updateBrokerFilterModule = async (
    client: Http.Client,
    brokerId: number,
    name: string,
    elements: string,
    data: Record<string, unknown>
): Promise<void> => {
    await Http.put(client, `/api/brokers/${brokerId}/filter_modules/${name}`, {
        elements,
        data,
    });
};
