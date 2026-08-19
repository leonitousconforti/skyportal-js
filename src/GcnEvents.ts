/**
 * Typed endpoint functions for `/api/gcn_event`.
 *
 * Every model below whose upstream row hangs off a `GcnEvent` keeps its
 * `gcnevent` back-reference free-form: {@link GcnEvent} already types the
 * forward direction, so typing the reverse one too would make the models
 * mutually recursive.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Allocations from "./Allocations.ts";
import * as Comments from "./Comments.ts";
import * as Filters from "./Filters.ts";
import * as Groups from "./Groups.ts";
import * as Http from "./Http.ts";
import * as Localizations from "./Localizations.ts";
import * as MmaDetectors from "./MmaDetectors.ts";
import * as ObservationPlans from "./ObservationPlans.ts";
import * as Reminders from "./Reminders.ts";
import * as Schemas from "./Schemas.ts";
import * as Sources from "./Sources.ts";
import * as SurveyEfficiency from "./SurveyEfficiency.ts";
import * as Users from "./Users.ts";

/**
 * A GCN notice attached to an event (upstream `GcnNotice`).
 *
 * `content` is the raw notice body (XML, JSON or plain text): a `LargeBinary`
 * column the server decodes to a string. It is deferred, so it is absent
 * unless the handler undefers it, and the single-event endpoint drops it when
 * `excludeNoticeContent` is set.
 *
 * @since 1.0.0
 * @category Models
 */
export const GcnNotice = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        sent_by_id: Schemas.NullishInteger,
        dateobs: Schemas.NullishTimestamp,
        ivorn: Schemas.NullishString,
        notice_type: Schemas.NullishString,
        notice_format: Schemas.NullishString,
        stream: Schemas.NullishString,
        date: Schemas.NullishTimestamp,
        content: Schemas.nullish(Schemas.Json),
        has_localization: Schemas.NullishBoolean,
        localization_ingested: Schemas.NullishBoolean,
        sent_by: Schemas.nullish(Users.User),
        gcnevent: Schemas.nullish(Schemas.JsonObject),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type GcnNotice = v.InferOutput<typeof GcnNotice>;

/**
 * Properties parsed from an event notice (upstream `GcnProperty`).
 *
 * @since 1.0.0
 * @category Models
 */
export const GcnProperty = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        sent_by_id: Schemas.NullishInteger,
        dateobs: Schemas.NullishTimestamp,
        data: Schemas.nullish(Schemas.JsonObject),
        sent_by: Schemas.nullish(Users.User),
        gcnevent: Schemas.nullish(Schemas.JsonObject),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type GcnProperty = v.InferOutput<typeof GcnProperty>;

/**
 * A qualitative tag on a GCN event (upstream `GcnTag`).
 *
 * @since 1.0.0
 * @category Models
 */
export const GcnTag = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        sent_by_id: Schemas.NullishInteger,
        dateobs: Schemas.NullishTimestamp,
        text: Schemas.NullishString,
        sent_by: Schemas.nullish(Users.User),
        gcnevent: Schemas.nullish(Schemas.JsonObject),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type GcnTag = v.InferOutput<typeof GcnTag>;

/**
 * A human-readable summary of a GCN event (upstream `GcnSummary`).
 *
 * `text` is deferred server-side and is undeferred by the single-summary
 * endpoint; it reads `"pending"` until the background writer fills it in.
 *
 * @since 1.0.0
 * @category Models
 */
export const GcnSummary = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        sent_by_id: Schemas.NullishInteger,
        dateobs: Schemas.NullishTimestamp,
        group_id: Schemas.NullishInteger,
        title: Schemas.NullishString,
        text: Schemas.NullishString,
        sent_by: Schemas.nullish(Users.User),
        group: Schemas.nullish(Groups.Group),
        gcnevent: Schemas.nullish(Schemas.JsonObject),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type GcnSummary = v.InferOutput<typeof GcnSummary>;

/**
 * A structured (publishable) report on a GCN event (upstream `GcnReport`).
 *
 * `data` is a deferred JSONB column, undeferred by the single-report endpoint.
 * It holds `{ status: "pending" }` while the report is being assembled and a
 * JSON *string* once the background writer has stored the rendered report, so
 * both forms are accepted.
 *
 * @since 1.0.0
 * @category Models
 */
export const GcnReport = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        sent_by_id: Schemas.NullishInteger,
        dateobs: Schemas.NullishTimestamp,
        group_id: Schemas.NullishInteger,
        report_name: Schemas.NullishString,
        data: Schemas.nullish(v.union([Schemas.JsonObject, v.string()])),
        published: Schemas.NullishBoolean,
        sent_by: Schemas.nullish(Users.User),
        group: Schemas.nullish(Groups.Group),
        gcnevent: Schemas.nullish(Schemas.JsonObject),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type GcnReport = v.InferOutput<typeof GcnReport>;

/**
 * Whether a GCN event triggered an allocation (upstream `GcnTrigger`).
 *
 * @since 1.0.0
 * @category Models
 */
export const GcnTrigger = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        dateobs: Schemas.NullishTimestamp,
        allocation_id: Schemas.NullishInteger,
        triggered: Schemas.NullishBoolean,
        allocation: Schemas.nullish(Allocations.Allocation),
        gcnevent: Schemas.nullish(Schemas.JsonObject),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type GcnTrigger = v.InferOutput<typeof GcnTrigger>;

/**
 * A user advocating for a GCN event (upstream `GcnEventUser`).
 *
 * `username`, `first_name` and `last_name` are copied off the joined user by
 * the single-event endpoint, which returns these rows as `event_users`.
 *
 * @since 1.0.0
 * @category Models
 */
export const GcnEventUser = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        gcnevent_id: Schemas.NullishInteger,
        user_id: Schemas.NullishInteger,
        username: Schemas.NullishString,
        first_name: Schemas.NullishString,
        last_name: Schemas.NullishString,
        user: Schemas.nullish(Users.User),
        gcnevent: Schemas.nullish(Schemas.JsonObject),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type GcnEventUser = v.InferOutput<typeof GcnEventUser>;

/**
 * A localization as returned inside a GCN event payload.
 *
 * The single-event endpoint replaces the localization's `tags` and
 * `properties` with explicitly serialized lists and adds `center`; the
 * paginated endpoint returns `tags` only.
 *
 * @since 1.0.0
 * @category Models
 */
export const GcnEventLocalization = Schemas.model(
    v.strictObject({
        ...Localizations.LocalizationEntries,
        tags: Schemas.nullish(v.array(Localizations.LocalizationTag)),
        properties: Schemas.nullish(v.array(Localizations.LocalizationProperty)),
        center: Schemas.nullish(Localizations.LocalizationCenter),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type GcnEventLocalization = v.InferOutput<typeof GcnEventLocalization>;

/**
 * Alert-crossmatch progress for one event, filter and localization.
 *
 * Upstream `GcnEventCrossmatchState`. `status` is one of `"pending"`,
 * `"processing"`, `"done"` or `"failed"`, but the column is a plain string, so
 * it is not narrowed here.
 *
 * @since 1.0.0
 * @category Models
 */
export const GcnEventCrossmatchState = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        gcnevent_id: Schemas.NullishInteger,
        filter_id: Schemas.NullishInteger,
        localization_id: Schemas.NullishInteger,
        last_queried: Schemas.NullishTimestamp,
        last_alert_jd: Schemas.NullishNumber,
        status: Schemas.NullishString,
        error: Schemas.NullishString,
        archival_done: Schemas.NullishBoolean,
        n_matches: Schemas.NullishInteger,
        gcnevent: Schemas.nullish(Schemas.JsonObject),
        filter: Schemas.nullish(Filters.Filter),
        localization: Schemas.nullish(Localizations.Localization),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type GcnEventCrossmatchState = v.InferOutput<typeof GcnEventCrossmatchState>;

/**
 * A catalog query submitted for a GCN event (upstream `CatalogQuery`).
 *
 * @since 1.0.0
 * @category Models
 */
export const GcnCatalogQuery = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        requester_id: Schemas.NullishInteger,
        allocation_id: Schemas.NullishInteger,
        payload: v.optional(Schemas.JsonObject, () => ({})),
        status: Schemas.NullishString,
        requester: Schemas.nullish(Users.User),
        allocation: Schemas.nullish(Allocations.Allocation),
        target_groups: Schemas.nullish(v.array(Groups.Group)),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type GcnCatalogQuery = v.InferOutput<typeof GcnCatalogQuery>;

/**
 * A GCN event, keyed by its UTC observation time (upstream `GcnEvent`).
 *
 * `tags` (the distinct texts of the event's `GcnTag` rows) and `lightcurve` (a
 * URL parsed out of the first notice) are properties the handlers inject
 * rather than columns; the underlying `_tags` relationship is never
 * serialized. `circulars`, `gracedb_log` and `gracedb_labels` are deferred, so
 * they only appear when a handler undefers them. `event_users_ids` is a column
 * property aggregating `gcnevent_users`, and `event_users` is the same join
 * rows with the user's name copied in.
 *
 * @since 1.0.0
 * @category Models
 */
export const GcnEvent = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        sent_by_id: Schemas.NullishInteger,
        dateobs: Schemas.NullishTimestamp,
        trigger_id: Schemas.NullishString,
        aliases: Schemas.nullish(v.array(v.string())),
        tach_id: Schemas.NullishString,
        circulars: Schemas.nullish(v.record(v.string(), v.string())),
        gracedb_log: Schemas.nullish(Schemas.JsonObject),
        gracedb_labels: Schemas.nullish(Schemas.JsonObject),
        lightcurve: Schemas.NullishString,
        event_users_ids: Schemas.nullish(v.array(Schemas.Integer)),
        tags: Schemas.nullish(v.array(v.string())),
        localizations: Schemas.nullish(v.array(GcnEventLocalization)),
        gcn_notices: Schemas.nullish(v.array(GcnNotice)),
        properties: Schemas.nullish(v.array(GcnProperty)),
        summaries: Schemas.nullish(v.array(GcnSummary)),
        reports: Schemas.nullish(v.array(GcnReport)),
        comments: Schemas.nullish(v.array(Comments.Comment)),
        reminders: Schemas.nullish(v.array(Reminders.Reminder)),
        detectors: Schemas.nullish(v.array(MmaDetectors.MmaDetector)),
        gcn_triggers: Schemas.nullish(v.array(GcnTrigger)),
        event_users: Schemas.nullish(v.array(GcnEventUser)),
        gcnevent_users: Schemas.nullish(v.array(GcnEventUser)),
        users: Schemas.nullish(v.array(Users.User)),
        groups: Schemas.nullish(v.array(Groups.Group)),
        sent_by: Schemas.nullish(Users.User),
        observationplan_requests: Schemas.nullish(v.array(ObservationPlans.ObservationPlanRequest)),
        survey_efficiency_analyses: Schemas.nullish(v.array(SurveyEfficiency.SurveyEfficiencyForObservations)),
        crossmatch_states: Schemas.nullish(v.array(GcnEventCrossmatchState)),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type GcnEvent = v.InferOutput<typeof GcnEvent>;

/**
 * One page of results from a GCN events query.
 *
 * @since 1.0.0
 * @category Models
 */
export const GcnEventsPage = Schemas.model(
    v.strictObject({
        events: Schemas.list(GcnEvent),
        totalMatches: v.optional(Schemas.Integer, 0),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type GcnEventsPage = v.InferOutput<typeof GcnEventsPage>;

/**
 * Payload for ingesting a GCN event.
 *
 * Provide `xml` (a VOEvent) or `json` (a GCN JSON notice); otherwise
 * `dateobs` is required and the remaining fields describe the event. `skymap`
 * accepts a multi-order map, a base64 FITS blob, a URL, or a
 * cone/ellipse/polygon description.
 *
 * @since 1.0.0
 * @category Models
 */
export interface GcnEventPost {
    readonly xml?: string | undefined;
    readonly json?: Record<string, unknown> | undefined;
    readonly dateobs?: string | undefined;
    readonly trigger_id?: string | undefined;
    readonly aliases?: ReadonlyArray<string> | undefined;
    readonly group_ids?: ReadonlyArray<number> | undefined;
    readonly properties?: Record<string, unknown> | undefined;
    readonly tags?: ReadonlyArray<string> | undefined;
    readonly skymap?: unknown;
}

/**
 * Result of ingesting a GCN event.
 *
 * `notice_id` is null for the dictionary form.
 *
 * @since 1.0.0
 * @category Models
 */
export const GcnEventPostResponse = Schemas.model(
    v.strictObject({
        gcnevent_id: Schemas.NullishInteger,
        dateobs: Schemas.NullishString,
        notice_id: Schemas.NullishInteger,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type GcnEventPostResponse = v.InferOutput<typeof GcnEventPostResponse>;

/**
 * A response carrying only the ID of the affected GCN event.
 *
 * @since 1.0.0
 * @category Models
 */
export const GcnEventIdResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type GcnEventIdResponse = v.InferOutput<typeof GcnEventIdResponse>;

/**
 * Result of tagging a GCN event.
 *
 * @since 1.0.0
 * @category Models
 */
export const GcnEventTagPostResponse = Schemas.model(v.strictObject({ gcntag_id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type GcnEventTagPostResponse = v.InferOutput<typeof GcnEventTagPostResponse>;

/**
 * The TACH identifiers, aliases and circulars of a GCN event.
 *
 * `circulars` maps GCN circular ID to that circular's subject line.
 *
 * @since 1.0.0
 * @category Models
 */
export const GcnEventTachInfo = Schemas.model(
    v.strictObject({
        tach_id: Schemas.NullishString,
        aliases: Schemas.nullish(v.array(v.string())),
        circulars: Schemas.nullish(v.record(v.string(), v.string())),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type GcnEventTachInfo = v.InferOutput<typeof GcnEventTachInfo>;

/**
 * Result of requeueing the alert crossmatch of a GCN event.
 *
 * @since 1.0.0
 * @category Models
 */
export const GcnEventCrossmatchRequeue = Schemas.model(
    v.strictObject({
        filters_requeued: Schemas.Integer,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type GcnEventCrossmatchRequeue = v.InferOutput<typeof GcnEventCrossmatchRequeue>;

/**
 * Instrument field probabilities for a GCN event localization.
 *
 * @since 1.0.0
 * @category Models
 */
export const GcnEventInstrumentFields = Schemas.model(
    v.strictObject({
        field_ids: Schemas.list(Schemas.Integer),
        probabilities: Schemas.list(v.number()),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type GcnEventInstrumentFields = v.InferOutput<typeof GcnEventInstrumentFields>;

/**
 * Payload for generating a GCN event summary.
 *
 * `localizationCumprob` defaults to 0.95, `numberDetections` to 2,
 * `numberObservations` to 1 and `statsMethod` to `"python"` (`"db"` is the
 * alternative).
 *
 * @since 1.0.0
 * @category Models
 */
export interface GcnSummaryPost {
    readonly title: string;
    readonly groupId: number;
    readonly number?: number | undefined;
    readonly subject?: string | undefined;
    readonly userIds?: ReadonlyArray<number> | undefined;
    readonly startDate?: string | undefined;
    readonly endDate?: string | undefined;
    readonly localizationName?: string | undefined;
    readonly localizationCumprob?: number | undefined;
    readonly numberDetections?: number | undefined;
    readonly numberObservations?: number | undefined;
    readonly showSources?: boolean | undefined;
    readonly showGalaxies?: boolean | undefined;
    readonly showObservations?: boolean | undefined;
    readonly noText?: boolean | undefined;
    readonly photometryInWindow?: boolean | undefined;
    readonly statsMethod?: string | undefined;
    readonly instrumentIds?: ReadonlyArray<number> | undefined;
    readonly acknowledgements?: string | undefined;
}

/**
 * Payload for generating a GCN event report.
 *
 * `localizationCumprob` defaults to 0.95, `numberDetections` to 2 and
 * `statsMethod` to `"python"` (`"db"` is the alternative).
 *
 * @since 1.0.0
 * @category Models
 */
export interface GcnReportPost {
    readonly reportName: string;
    readonly groupId: number;
    readonly startDate?: string | undefined;
    readonly endDate?: string | undefined;
    readonly localizationName?: string | undefined;
    readonly localizationCumprob?: number | undefined;
    readonly numberDetections?: number | undefined;
    readonly showSources?: boolean | undefined;
    readonly showObservations?: boolean | undefined;
    readonly showSurveyEfficiencies?: boolean | undefined;
    readonly photometryInWindow?: boolean | undefined;
    readonly statsMethod?: string | undefined;
    readonly instrumentIds?: ReadonlyArray<number> | undefined;
}

/**
 * A rule that automatically tags matching GCN events.
 *
 * Upstream `DefaultGcnTag`. `filters` is free-form JSON; the ingester reads
 * the keys `gcn_tags`, `notice_types` and `localization_tags`.
 *
 * @since 1.0.0
 * @category Models
 */
export const DefaultGcnTag = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        requester_id: Schemas.NullishInteger,
        default_tag_name: Schemas.NullishString,
        filters: Schemas.nullish(Schemas.JsonObject),
        requester: Schemas.nullish(Users.User),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type DefaultGcnTag = v.InferOutput<typeof DefaultGcnTag>;

/**
 * Payload for creating a default GCN tag.
 *
 * `default_tag_name` must be unique. `filters` accepts the keys `gcn_tags`,
 * `notice_types` and `localization_tags`, each a list of strings.
 *
 * @since 1.0.0
 * @category Models
 */
export interface DefaultGcnTagPost {
    readonly default_tag_name: string;
    readonly filters?: Record<string, unknown> | undefined;
}

/**
 * How an object stands against a GCN event.
 *
 * @since 1.0.0
 * @category Models
 */
export const GcnEventObjStatus = v.picklist(["pending", "confirmed", "ambiguous", "rejected"]);

/**
 * @since 1.0.0
 * @category Models
 */
export type GcnEventObjStatus = v.InferOutput<typeof GcnEventObjStatus>;

/**
 * An object's standing against a GCN event (upstream `GcnEventObj`).
 *
 * @since 1.0.0
 * @category Models
 */
export const GcnEventObj = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        obj_id: Schemas.NullishString,
        dateobs: Schemas.NullishTimestamp,
        status: Schemas.nullish(GcnEventObjStatus),
        confirmer_id: Schemas.NullishInteger,
        explanation: Schemas.NullishString,
        notes: Schemas.NullishString,
        obj: Schemas.nullish(Sources.Source),
        confirmer: Schemas.nullish(Users.User),
        gcnevent: Schemas.nullish(Schemas.JsonObject),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type GcnEventObj = v.InferOutput<typeof GcnEventObj>;

/**
 * Payload for recording an object's standing against a GCN event.
 *
 * @since 1.0.0
 * @category Models
 */
export interface GcnEventObjPost {
    readonly source_id: string;
    readonly status: GcnEventObjStatus;
    readonly localization_name: string;
    readonly localization_cumprob: number;
    readonly start_date: string;
    readonly end_date: string;
    readonly explanation?: string | undefined;
    readonly notes?: string | undefined;
}

/**
 * Result of creating, updating or deleting a source-in-GCN record.
 *
 * @since 1.0.0
 * @category Models
 */
export const GcnEventObjIdResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type GcnEventObjIdResponse = v.InferOutput<typeof GcnEventObjIdResponse>;

/**
 * Payload for crossmatching an object against GCN events.
 *
 * `probability` is the integrated probability contour to search within,
 * defaulting to 0.95.
 *
 * @since 1.0.0
 * @category Models
 */
export interface GcnEventObjCrossmatchPost {
    readonly startDate: string;
    readonly endDate: string;
    readonly probability?: number | undefined;
    readonly beforeFirstDetection?: boolean | undefined;
    readonly gcnTagKeep?: ReadonlyArray<string> | undefined;
    readonly gcnTagRemove?: ReadonlyArray<string> | undefined;
    readonly localizationTagKeep?: ReadonlyArray<string> | undefined;
    readonly localizationTagRemove?: ReadonlyArray<string> | undefined;
    readonly gcnPropertiesFilter?: ReadonlyArray<string> | undefined;
    readonly localizationPropertiesFilter?: ReadonlyArray<string> | undefined;
}

/**
 * Ingest a GCN event from a VOEvent, a JSON notice or a plain object.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The event to ingest.
 */
export const postGcnEvent = async (client: Http.Client, payload: GcnEventPost): Promise<GcnEventPostResponse> =>
    Http.decode(GcnEventPostResponse, await Http.post(client, "/api/gcn_event", Http.body(payload)));

/**
 * Options for retrieving a single GCN event.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchGcnEventOptions {
    /**
     * Omit the raw notice content from each entry of `gcn_notices`. Defaults
     * to false server-side.
     */
    readonly excludeNoticeContent?: boolean | undefined;
}

/**
 * Retrieve a single GCN event, with its localizations and summaries.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp, e.g. `"2023-05-23T12:00:00"`.
 */
export const fetchGcnEvent = async (
    client: Http.Client,
    dateobs: string,
    options: FetchGcnEventOptions = {}
): Promise<GcnEvent> =>
    Http.decode(
        GcnEvent,
        await Http.get(client, `/api/gcn_event/${dateobs}`, {
            excludeNoticeContent: options.excludeNoticeContent ?? false,
        })
    );

/**
 * Options for querying GCN events.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchGcnEventsOptions {
    /** Pagination controls. The server caps the page size. */
    readonly pageNumber?: number | undefined;
    readonly numPerPage?: number | undefined;
    /** Arrow-parseable bounds on `dateobs`. */
    readonly startDate?: string | undefined;
    readonly endDate?: string | undefined;
    /**
     * Prefix of a `dateobs` (or a substring of an alias) to match. Cannot be
     * combined with {@link fetchGcnEvent}'s path lookup.
     */
    readonly partialDateobs?: string | undefined;
    /** Keep events carrying any of these GCN tags, or drop them. */
    readonly gcnTagKeep?: ReadonlyArray<string> | undefined;
    readonly gcnTagRemove?: ReadonlyArray<string> | undefined;
    /** The same, applied to the tags of the events' localizations. */
    readonly localizationTagKeep?: ReadonlyArray<string> | undefined;
    readonly localizationTagRemove?: ReadonlyArray<string> | undefined;
    /**
     * Property filters, each `"name"` or `"name: value: operator"` (operator
     * in `lt`, `le`, `eq`, `ne`, `ge`, `gt`).
     */
    readonly gcnPropertiesFilter?: ReadonlyArray<string> | undefined;
    /** The same, applied to localization properties. */
    readonly localizationPropertiesFilter?: ReadonlyArray<string> | undefined;
    /**
     * Return only events shared with at least one of these groups. This
     * narrows what the token can already read, it does not widen it.
     */
    readonly groupIds?: ReadonlyArray<number> | undefined;
    /** Only `"dateobs"` is supported. Defaults to newest first. */
    readonly sortBy?: string | undefined;
    /** `"asc"` or `"desc"`. */
    readonly sortOrder?: string | undefined;
}

/**
 * Query GCN events, one page at a time.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchGcnEvents = async (
    client: Http.Client,
    options: FetchGcnEventsOptions = {}
): Promise<GcnEventsPage> =>
    Http.decode(
        GcnEventsPage,
        await Http.get(client, "/api/gcn_event", {
            pageNumber: options.pageNumber ?? 1,
            numPerPage: options.numPerPage ?? 10,
            sortOrder: options.sortOrder ?? "asc",
            startDate: options.startDate,
            endDate: options.endDate,
            partialdateobs: options.partialDateobs,
            gcnTagKeep: Http.commaSeparated(options.gcnTagKeep),
            gcnTagRemove: Http.commaSeparated(options.gcnTagRemove),
            localizationTagKeep: Http.commaSeparated(options.localizationTagKeep),
            localizationTagRemove: Http.commaSeparated(options.localizationTagRemove),
            gcnPropertiesFilter: Http.commaSeparated(options.gcnPropertiesFilter),
            localizationPropertiesFilter: Http.commaSeparated(options.localizationPropertiesFilter),
            groupIds: Http.commaSeparated(options.groupIds),
            sortBy: options.sortBy,
        })
    );

/**
 * Delete a GCN event, along with its localizations, notices and tags.
 *
 * Requires the "System admin" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event to delete.
 */
export const deleteGcnEvent = async (client: Http.Client, dateobs: string): Promise<void> => {
    await Http.del(client, `/api/gcn_event/${dateobs}`);
};

/**
 * Add an alias to a GCN event.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event.
 * @param alias - Alias to add. The server rejects an alias the event already
 *   has.
 */
export const postGcnEventAlias = async (client: Http.Client, dateobs: string, alias: string): Promise<void> => {
    await Http.post(client, `/api/gcn_event/${dateobs}/alias`, { alias });
};

/**
 * Remove an alias from a GCN event.
 *
 * Aliases containing `LVC#` or `FERMI#` cannot be removed.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event.
 * @param alias - Alias to remove.
 */
export const deleteGcnEventAlias = async (client: Http.Client, dateobs: string, alias: string): Promise<void> => {
    await Http.del(client, `/api/gcn_event/${dateobs}/alias`, { alias });
};

/**
 * Retrieve all distinct GCN event tags.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchGcnEventTags = async (client: Http.Client): Promise<Array<string>> =>
    Http.decode(v.array(v.string()), await Http.get(client, "/api/gcn_event/tags"));

/**
 * Tag a GCN event.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event to tag.
 * @param text - The tag text.
 */
export const postGcnEventTag = async (
    client: Http.Client,
    dateobs: string,
    text: string
): Promise<GcnEventTagPostResponse> =>
    Http.decode(GcnEventTagPostResponse, await Http.post(client, "/api/gcn_event/tags", { dateobs, text }));

/**
 * Remove a tag from a GCN event.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the tagged event.
 * @param tag - Text of the tag to remove.
 */
export const deleteGcnEventTag = async (client: Http.Client, dateobs: string, tag: string): Promise<void> => {
    await Http.del(client, `/api/gcn_event/tags/${dateobs}`, { tag });
};

/**
 * Retrieve all distinct GCN event property names, sorted.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchGcnEventProperties = async (client: Http.Client): Promise<Array<string>> =>
    Http.decode(v.array(v.string()), await Http.get(client, "/api/gcn_event/properties"));

/**
 * Retrieve the survey efficiency analyses of a GCN event.
 *
 * @since 1.0.0
 * @category Requests
 * @param gcneventId - Numeric ID of the GCN event (not its `dateobs`).
 */
export const fetchGcnEventSurveyEfficiency = async (
    client: Http.Client,
    gcneventId: number
): Promise<Array<SurveyEfficiency.SurveyEfficiencyForObservations>> =>
    Http.decode(
        v.array(SurveyEfficiency.SurveyEfficiencyForObservations),
        await Http.get(client, `/api/gcn_event/${gcneventId}/survey_efficiency`)
    );

/**
 * Retrieve the observation plan requests of a GCN event.
 *
 * @since 1.0.0
 * @category Requests
 * @param gcneventId - Numeric ID of the GCN event (not its `dateobs`).
 */
export const fetchGcnEventObservationPlanRequests = async (
    client: Http.Client,
    gcneventId: number
): Promise<Array<ObservationPlans.ObservationPlanRequest>> =>
    Http.decode(
        v.array(ObservationPlans.ObservationPlanRequest),
        await Http.get(client, `/api/gcn_event/${gcneventId}/observation_plan_requests`)
    );

/**
 * Retrieve the catalog queries submitted for a GCN event.
 *
 * @since 1.0.0
 * @category Requests
 * @param gcneventId - Numeric ID of the GCN event (not its `dateobs`).
 */
export const fetchGcnEventCatalogQueries = async (
    client: Http.Client,
    gcneventId: number
): Promise<Array<GcnCatalogQuery>> =>
    Http.decode(v.array(GcnCatalogQuery), await Http.get(client, `/api/gcn_event/${gcneventId}/catalog_query`));

/**
 * Add a user as an advocate for a GCN event.
 *
 * The user is notified in SkyPortal.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event.
 * @param userId - ID of the user to add.
 */
export const postGcnEventUser = async (client: Http.Client, dateobs: string, userId: number): Promise<void> => {
    await Http.post(client, `/api/gcn_event/${dateobs}/users`, { userID: userId });
};

/**
 * Remove a user from the advocates of a GCN event.
 *
 * Only the user themselves (or a system admin) may be removed.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event.
 * @param userId - ID of the user to remove.
 */
export const deleteGcnEventUser = async (client: Http.Client, dateobs: string, userId: number): Promise<void> => {
    await Http.del(client, `/api/gcn_event/${dateobs}/users/${userId}`);
};

/**
 * Download the raw content of a GCN notice.
 *
 * The payload is XML for VOEvent notices, JSON for JSON notices, and plain
 * text otherwise.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event the notice belongs to.
 * @param noticeId - ID of the notice to download.
 */
export const fetchGcnEventNoticeDownload = (
    client: Http.Client,
    dateobs: string,
    noticeId: number
): Promise<Uint8Array> => Http.getContent(client, `/api/gcn_event/${dateobs}/notice/${noticeId}/download`);

/**
 * Scrape GraceDB for a gravitational-wave event's logs and labels.
 *
 * The scrape runs in the background; the event must already carry an `LVC#`
 * alias. Requires the "Manage GCNs" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event.
 */
export const postGcnEventGracedb = async (client: Http.Client, dateobs: string): Promise<GcnEventIdResponse> =>
    Http.decode(GcnEventIdResponse, await Http.post(client, `/api/gcn_event/${dateobs}/gracedb`));

/**
 * Scrape TACH for a GCN event's aliases and circulars.
 *
 * The scrape runs in the background. Requires the "Manage GCNs" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event.
 */
export const postGcnEventTach = async (client: Http.Client, dateobs: string): Promise<GcnEventIdResponse> =>
    Http.decode(GcnEventIdResponse, await Http.post(client, `/api/gcn_event/${dateobs}/tach`));

/**
 * Retrieve the TACH ID, aliases and circulars of a GCN event.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event.
 */
export const fetchGcnEventTach = async (client: Http.Client, dateobs: string): Promise<GcnEventTachInfo> =>
    Http.decode(GcnEventTachInfo, await Http.get(client, `/api/gcn_event/${dateobs}/tach`));

/**
 * Retrieve the per-filter alert crossmatch progress of a GCN event.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event.
 */
export const fetchGcnEventCrossmatch = async (
    client: Http.Client,
    dateobs: string
): Promise<Array<GcnEventCrossmatchState>> =>
    Http.decode(v.array(GcnEventCrossmatchState), await Http.get(client, `/api/gcn_event/${dateobs}/crossmatch`));

/**
 * Requeue the alert crossmatch of a GCN event.
 *
 * Every filter is re-queried from the start of the window, including the
 * one-shot archival pass. Existing sources and annotations are refreshed in
 * place rather than duplicated. Requires the "Manage GCNs" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event.
 */
export const postGcnEventCrossmatch = async (
    client: Http.Client,
    dateobs: string
): Promise<GcnEventCrossmatchRequeue> =>
    Http.decode(GcnEventCrossmatchRequeue, await Http.post(client, `/api/gcn_event/${dateobs}/crossmatch`));

/**
 * Options for computing instrument field probabilities.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchGcnEventInstrumentFieldsOptions {
    /**
     * Name of the localization to use. Defaults to one of the event's
     * localizations chosen by the server.
     */
    readonly localizationName?: string | undefined;
    /** Cumulative probability threshold, defaults to 0.95. */
    readonly integratedProbability?: number | undefined;
}

/**
 * Compute an instrument's field probabilities for an event localization.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event.
 * @param instrumentId - ID of the instrument whose fields are tiled against the
 *   skymap.
 */
export const fetchGcnEventInstrumentFields = async (
    client: Http.Client,
    dateobs: string,
    instrumentId: number,
    options: FetchGcnEventInstrumentFieldsOptions = {}
): Promise<GcnEventInstrumentFields> =>
    Http.decode(
        GcnEventInstrumentFields,
        await Http.get(client, `/api/gcn_event/${dateobs}/instrument/${instrumentId}`, {
            integrated_probability: options.integratedProbability ?? 0.95,
            localization_name: options.localizationName,
        })
    );

/**
 * Options for listing a GCN event's triggered allocations.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchGcnEventTriggersOptions {
    /** Restrict to a single allocation. */
    readonly allocationId?: number | undefined;
}

/**
 * Retrieve the triggered status of a GCN event, per allocation.
 *
 * Requires the "Manage allocations" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event.
 */
export const fetchGcnEventTriggers = async (
    client: Http.Client,
    dateobs: string,
    options: FetchGcnEventTriggersOptions = {}
): Promise<Array<GcnTrigger>> =>
    Http.decode(
        v.array(GcnTrigger),
        await Http.get(
            client,
            options.allocationId === undefined
                ? `/api/gcn_event/${dateobs}/triggered`
                : `/api/gcn_event/${dateobs}/triggered/${options.allocationId}`
        )
    );

/**
 * Set whether a GCN event triggered an allocation.
 *
 * The record is created if it does not exist. Requires the "Manage
 * allocations" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event.
 * @param allocationId - ID of the allocation.
 * @param triggered - The new triggered status.
 */
export const updateGcnEventTrigger = async (
    client: Http.Client,
    dateobs: string,
    allocationId: number,
    triggered: boolean
): Promise<GcnTrigger> =>
    Http.decode(
        GcnTrigger,
        await Http.put(client, `/api/gcn_event/${dateobs}/triggered/${allocationId}`, {
            triggered,
        })
    );

/**
 * Delete the triggered status of a GCN event for an allocation.
 *
 * Returns the deleted record. Requires the "Manage allocations" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event.
 * @param allocationId - ID of the allocation.
 */
export const deleteGcnEventTrigger = async (
    client: Http.Client,
    dateobs: string,
    allocationId: number
): Promise<GcnTrigger> =>
    Http.decode(GcnTrigger, await Http.del(client, `/api/gcn_event/${dateobs}/triggered/${allocationId}`));

/**
 * Generate a summary of a GCN event.
 *
 * The summary is written in the background: the record is created immediately
 * with the text `"pending"` and filled in later. Unless `noText` is set,
 * `subject` is required. A user may not have two summaries with the same title
 * for the same event and group.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event.
 * @param payload - What to include in the summary.
 */
export const postGcnSummary = async (
    client: Http.Client,
    dateobs: string,
    payload: GcnSummaryPost
): Promise<GcnEventIdResponse> =>
    Http.decode(GcnEventIdResponse, await Http.post(client, `/api/gcn_event/${dateobs}/summary`, Http.body(payload)));

/**
 * Retrieve a GCN event summary, including its text.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the summarized event.
 * @param summaryId - ID of the summary.
 */
export const fetchGcnSummary = async (client: Http.Client, dateobs: string, summaryId: number): Promise<GcnSummary> =>
    Http.decode(GcnSummary, await Http.get(client, `/api/gcn_event/${dateobs}/summary/${summaryId}`));

/**
 * Replace the text of a GCN event summary.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the summarized event.
 * @param summaryId - ID of the summary to update.
 * @param body - The new summary text.
 */
export const updateGcnSummary = async (
    client: Http.Client,
    dateobs: string,
    summaryId: number,
    body: string
): Promise<GcnSummary> =>
    Http.decode(GcnSummary, await Http.patch(client, `/api/gcn_event/${dateobs}/summary/${summaryId}`, { body }));

/**
 * Delete a GCN event summary.
 *
 * A summary that is still pending cannot be deleted within an hour of being
 * created.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the summarized event.
 * @param summaryId - ID of the summary to delete.
 */
export const deleteGcnSummary = async (client: Http.Client, dateobs: string, summaryId: number): Promise<void> => {
    await Http.del(client, `/api/gcn_event/${dateobs}/summary/${summaryId}`);
};

/**
 * Generate a report on a GCN event.
 *
 * The report is assembled in the background: the record is created immediately
 * with pending data and filled in later. A user may not have two reports with
 * the same name for the same event and group.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event.
 * @param payload - What to include in the report.
 */
export const postGcnReport = async (
    client: Http.Client,
    dateobs: string,
    payload: GcnReportPost
): Promise<GcnEventIdResponse> =>
    Http.decode(GcnEventIdResponse, await Http.post(client, `/api/gcn_event/${dateobs}/report`, Http.body(payload)));

/**
 * Retrieve the reports of a GCN event, newest first.
 *
 * The report data itself is omitted; use {@link fetchGcnReport} for it.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event.
 */
export const fetchGcnReports = async (client: Http.Client, dateobs: string): Promise<Array<GcnReport>> =>
    Http.decode(v.array(GcnReport), await Http.get(client, `/api/gcn_event/${dateobs}/report`));

/**
 * Retrieve a single GCN event report, including its data.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event.
 * @param reportId - ID of the report.
 */
export const fetchGcnReport = async (client: Http.Client, dateobs: string, reportId: number): Promise<GcnReport> =>
    Http.decode(GcnReport, await Http.get(client, `/api/gcn_event/${dateobs}/report/${reportId}`));

/**
 * Options for updating a GCN event report.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpdateGcnReportOptions {
    /** The new report data. */
    readonly data?: Record<string, unknown> | undefined;
    /** Publish (true) or unpublish (false) the report. */
    readonly published?: boolean | undefined;
}

/**
 * Update a GCN event report, or publish and unpublish it.
 *
 * Sources added to `data` are re-fetched from the database with their
 * photometry; duplicates are rejected. When `published` is omitted the server
 * regenerates the rendered report instead.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event.
 * @param reportId - ID of the report to update.
 */
export const updateGcnReport = async (
    client: Http.Client,
    dateobs: string,
    reportId: number,
    options: UpdateGcnReportOptions = {}
): Promise<GcnReport> =>
    Http.decode(
        GcnReport,
        await Http.patch(client, `/api/gcn_event/${dateobs}/report/${reportId}`, Http.body(options))
    );

/**
 * Delete a GCN event report, unpublishing it first.
 *
 * A report that is still pending cannot be deleted within an hour of being
 * created.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event.
 * @param reportId - ID of the report to delete.
 */
export const deleteGcnReport = async (client: Http.Client, dateobs: string, reportId: number): Promise<void> => {
    await Http.del(client, `/api/gcn_event/${dateobs}/report/${reportId}`);
};

/**
 * Create a rule that automatically tags matching GCN events.
 *
 * Requires the "Manage GCNs" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The rule to create.
 */
export const postDefaultGcnTag = async (client: Http.Client, payload: DefaultGcnTagPost): Promise<GcnEventIdResponse> =>
    Http.decode(GcnEventIdResponse, await Http.post(client, "/api/default_gcn_tag", Http.body(payload)));

/**
 * Retrieve a single default GCN tag.
 *
 * @since 1.0.0
 * @category Requests
 * @param defaultGcnTagId - ID of the default GCN tag.
 */
export const fetchDefaultGcnTag = async (client: Http.Client, defaultGcnTagId: number): Promise<DefaultGcnTag> =>
    Http.decode(DefaultGcnTag, await Http.get(client, `/api/default_gcn_tag/${defaultGcnTagId}`));

/**
 * Retrieve all default GCN tags.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchDefaultGcnTags = async (client: Http.Client): Promise<Array<DefaultGcnTag>> =>
    Http.decode(v.array(DefaultGcnTag), await Http.get(client, "/api/default_gcn_tag"));

/**
 * Delete a default GCN tag.
 *
 * Requires the "Manage GCNs" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param defaultGcnTagId - ID of the default GCN tag to delete.
 */
export const deleteDefaultGcnTag = async (client: Http.Client, defaultGcnTagId: number): Promise<void> => {
    await Http.del(client, `/api/default_gcn_tag/${defaultGcnTagId}`);
};

/**
 * Options for listing the objects vetted against a GCN event.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchGcnEventSourcesOptions {
    /** Restrict to these object IDs. Defaults to every vetted object. */
    readonly sourceIds?: ReadonlyArray<string> | undefined;
}

/**
 * Retrieve the objects vetted against a GCN event.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event.
 */
export const fetchGcnEventSources = async (
    client: Http.Client,
    dateobs: string,
    options: FetchGcnEventSourcesOptions = {}
): Promise<Array<GcnEventObj>> =>
    Http.decode(
        v.array(GcnEventObj),
        await Http.get(client, `/api/sources_in_gcn/${dateobs}`, {
            sourcesIDList: Http.commaSeparated(options.sourceIds),
        })
    );

/**
 * Retrieve one object's standing against a GCN event.
 *
 * The server returns a list, empty when the object has not been vetted against
 * the event.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event.
 * @param objId - Object ID, e.g. `"ZTF20abcdef"`.
 */
export const fetchGcnEventSource = async (
    client: Http.Client,
    dateobs: string,
    objId: string
): Promise<Array<GcnEventObj>> =>
    Http.decode(v.array(GcnEventObj), await Http.get(client, `/api/sources_in_gcn/${dateobs}/${objId}`));

/**
 * Record an object's standing against a GCN event.
 *
 * An existing record for the object is updated instead. The server rejects a
 * repost that changes neither status, explanation nor notes. Requires the
 * "Upload data" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event.
 * @param payload - The object and its standing.
 */
export const postGcnEventSource = async (
    client: Http.Client,
    dateobs: string,
    payload: GcnEventObjPost
): Promise<GcnEventObjIdResponse> =>
    Http.decode(GcnEventObjIdResponse, await Http.post(client, `/api/sources_in_gcn/${dateobs}`, Http.body(payload)));

/**
 * Options for updating an object's standing against a GCN event.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpdateGcnEventSourceOptions {
    /** Why the object was confirmed or rejected. */
    readonly explanation?: string | undefined;
    /** Extra information about the object. */
    readonly notes?: string | undefined;
}

/**
 * Update an object's standing against a GCN event.
 *
 * Requires the "Upload data" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event.
 * @param objId - Object ID of the vetted object.
 * @param status - One of `"pending"`, `"confirmed"`, `"ambiguous"` or
 *   `"rejected"`.
 */
export const updateGcnEventSource = async (
    client: Http.Client,
    dateobs: string,
    objId: string,
    status: GcnEventObjStatus,
    options: UpdateGcnEventSourceOptions = {}
): Promise<GcnEventObjIdResponse> =>
    Http.decode(
        GcnEventObjIdResponse,
        await Http.patch(
            client,
            `/api/sources_in_gcn/${dateobs}/${objId}`,
            Http.body({ status, explanation: options.explanation, notes: options.notes })
        )
    );

/**
 * Remove an object's standing against a GCN event.
 *
 * The object's relation to the event becomes undefined again. Returns the ID
 * of the deleted record. Requires the "Upload data" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the event.
 * @param objId - Object ID of the vetted object.
 */
export const deleteGcnEventSource = async (
    client: Http.Client,
    dateobs: string,
    objId: string
): Promise<GcnEventObjIdResponse> =>
    Http.decode(GcnEventObjIdResponse, await Http.del(client, `/api/sources_in_gcn/${dateobs}/${objId}`));

/** @internal */
const AssociatedGcns = v.object({ gcns: Schemas.list(v.string()) });

/**
 * Retrieve the `dateobs` of the GCN events an object is confirmed in.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID, e.g. `"ZTF20abcdef"`.
 */
export const fetchGcnEventsAssociatedWithSource = async (client: Http.Client, objId: string): Promise<Array<string>> =>
    Http.decode(AssociatedGcns, await Http.get(client, `/api/associated_gcns/${objId}`)).gcns;

/**
 * Crossmatch an object against the GCN events of a time window.
 *
 * The crossmatch runs in the background and records each containment as a
 * pending object-in-event association, leaving decisions already made alone.
 * The window may span at most 31 days.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID to crossmatch, e.g. `"ZTF20abcdef"`.
 * @param payload - The window and filters.
 */
export const postGcnEventObjCrossmatch = async (
    client: Http.Client,
    objId: string,
    payload: GcnEventObjCrossmatchPost
): Promise<void> => {
    await Http.post(client, `/api/sources/${objId}/gcn_event`, Http.body(payload));
};
