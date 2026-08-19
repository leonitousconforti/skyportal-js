/**
 * Typed endpoint functions for `/api/sources`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Analysis from "./Analysis.ts";
import * as Annotations from "./Annotations.ts";
import * as Assignments from "./Assignments.ts";
import * as Candidates from "./Candidates.ts";
import * as Classifications from "./Classifications.ts";
import * as Comments from "./Comments.ts";
import * as Filters from "./Filters.ts";
import * as FollowupRequests from "./FollowupRequests.ts";
import * as Galaxies from "./Galaxies.ts";
import * as Groups from "./Groups.ts";
import * as Http from "./Http.ts";
import * as Photometry from "./Photometry.ts";
import * as Schemas from "./Schemas.ts";
import * as Tags from "./Tags.ts";
import * as Thumbnails from "./Thumbnails.ts";
import * as Users from "./Users.ts";

/**
 * A group a source is saved to, with its `sources` join-table record.
 *
 * @since 1.0.0
 * @category Models
 */
export const SourceSavedGroup = Schemas.model(
    v.strictObject({
        ...Groups.GroupEntries,
        active: Schemas.NullishBoolean,
        requested: Schemas.NullishBoolean,
        saved_at: Schemas.NullishTimestamp,
        saved_by: Schemas.nullish(Users.User),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SourceSavedGroup = v.InferOutput<typeof SourceSavedGroup>;

/**
 * An annotation as returned on a source (upstream `Annotation`).
 *
 * `get_source` tags every annotation with the resource it belongs to.
 *
 * @since 1.0.0
 * @category Models
 */
export const SourceAnnotation = Schemas.model(
    v.strictObject({
        ...Annotations.AnnotationEntries,
        type: Schemas.NullishString,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SourceAnnotation = v.InferOutput<typeof SourceAnnotation>;

/**
 * Another saved source within 4 arcsec of this one (upstream `Obj`).
 *
 * @since 1.0.0
 * @category Models
 */
export const SourceDuplicate = Schemas.model(
    v.strictObject({
        obj_id: v.string(),
        ra: Schemas.NullishNumber,
        dec: Schemas.NullishNumber,
        separation: Schemas.NullishNumber,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SourceDuplicate = v.InferOutput<typeof SourceDuplicate>;

/**
 * An object linked to this source through a `SuperObj`.
 *
 * @since 1.0.0
 * @category Models
 */
export const SourceAssociatedObj = Schemas.model(
    v.strictObject({
        obj_id: v.string(),
        ra: Schemas.NullishNumber,
        dec: Schemas.NullishNumber,
        separation: Schemas.NullishNumber,
        super_obj_id: Schemas.NullishInteger,
        super_obj_name: Schemas.NullishString,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SourceAssociatedObj = v.InferOutput<typeof SourceAssociatedObj>;

/**
 * How a source stands against a GCN event, as the source handler words it.
 *
 * @since 1.0.0
 * @category Models
 */
export const GcnNoteStatus = v.picklist(["highlighted", "rejected", "ambiguous", "pending", "not vetted"]);

/**
 * @since 1.0.0
 * @category Models
 */
export type GcnNoteStatus = v.InferOutput<typeof GcnNoteStatus>;

/**
 * A source's vetting note for one GCN event (upstream `GcnEventObj`).
 *
 * @since 1.0.0
 * @category Models
 */
export const SourceGcnNote = Schemas.model(
    v.strictObject({
        dateobs: Schemas.NullishTimestamp,
        explanation: Schemas.NullishString,
        notes: Schemas.NullishString,
        status: Schemas.nullish(GcnNoteStatus),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SourceGcnNote = v.InferOutput<typeof SourceGcnNote>;

/**
 * A filter passage as returned on a source (upstream `Candidate`).
 *
 * @since 1.0.0
 * @category Models
 */
export const SourceCandidate = Schemas.model(
    v.strictObject({
        ...Candidates.CandidateRecordEntries,
        filter: Schemas.nullish(Filters.Filter),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SourceCandidate = v.InferOutput<typeof SourceCandidate>;

/**
 * A follow-up request as returned on a source (upstream `FollowupRequest`).
 *
 * `get_source` replaces the transaction rows with the decoded JSON bodies of
 * their responses, and only for admins.
 *
 * @since 1.0.0
 * @category Models
 */
export const SourceFollowupRequest = Schemas.model(
    v.strictObject({
        ...FollowupRequests.FollowupRequestEntries,
        transactions: Schemas.list(Schemas.Json),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SourceFollowupRequest = v.InferOutput<typeof SourceFollowupRequest>;

/**
 * A color and absolute magnitude derived from one catalog cross-match.
 *
 * @since 1.0.0
 * @category Models
 */
export const SourceColorMag = Schemas.model(
    v.strictObject({
        origin: Schemas.NullishString,
        color: Schemas.NullishNumber,
        abs_mag: Schemas.NullishNumber,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SourceColorMag = v.InferOutput<typeof SourceColorMag>;

/**
 * Aggregate photometry statistics for one object (upstream `PhotStat`).
 *
 * @since 1.0.0
 * @category Models
 */
export const PhotStat = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        last_update: Schemas.NullishTimestamp,
        last_full_update: Schemas.NullishTimestamp,
        /** Not a column: set on the instance by `PhotStatHandler.get`. */
        last_phot_add_time: Schemas.NullishTimestamp,
        obj_id: Schemas.NullishString,
        num_obs_global: Schemas.NullishInteger,
        num_obs_per_filter: Schemas.nullish(Schemas.JsonObject),
        num_det_global: Schemas.NullishInteger,
        num_det_no_forced_phot_global: Schemas.NullishInteger,
        num_det_per_filter: Schemas.nullish(Schemas.JsonObject),
        first_detected_mjd: Schemas.NullishNumber,
        first_detected_mag: Schemas.NullishNumber,
        first_detected_filter: Schemas.NullishString,
        last_detected_mjd: Schemas.NullishNumber,
        last_detected_mag: Schemas.NullishNumber,
        last_detected_filter: Schemas.NullishString,
        first_detected_no_forced_phot_mjd: Schemas.NullishNumber,
        first_detected_no_forced_phot_mag: Schemas.NullishNumber,
        first_detected_no_forced_phot_filter: Schemas.NullishString,
        last_detected_no_forced_phot_mjd: Schemas.NullishNumber,
        last_detected_no_forced_phot_mag: Schemas.NullishNumber,
        last_detected_no_forced_phot_filter: Schemas.NullishString,
        recent_obs_mjd: Schemas.NullishNumber,
        predetection_mjds: Schemas.nullish(v.array(v.number())),
        last_non_detection_mjd: Schemas.NullishNumber,
        time_to_non_detection: Schemas.NullishNumber,
        mean_mag_global: Schemas.NullishNumber,
        mean_mag_per_filter: Schemas.nullish(Schemas.JsonObject),
        mean_color: Schemas.nullish(Schemas.JsonObject),
        peak_mjd_global: Schemas.NullishNumber,
        peak_mjd_per_filter: Schemas.nullish(Schemas.JsonObject),
        peak_mag_global: Schemas.NullishNumber,
        peak_mag_per_filter: Schemas.nullish(Schemas.JsonObject),
        faintest_mag_global: Schemas.NullishNumber,
        faintest_mag_per_filter: Schemas.nullish(Schemas.JsonObject),
        deepest_limit_global: Schemas.NullishNumber,
        deepest_limit_per_filter: Schemas.nullish(Schemas.JsonObject),
        rise_rate: Schemas.NullishNumber,
        decay_rate: Schemas.NullishNumber,
        mag_rms_global: Schemas.NullishNumber,
        mag_rms_per_filter: Schemas.nullish(Schemas.JsonObject),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type PhotStat = v.InferOutput<typeof PhotStat>;

/**
 * A SkyPortal source (upstream `Obj`).
 *
 * @since 1.0.0
 * @category Models
 */
export const Source = Schemas.model(
    v.strictObject({
        // -- Mapper columns of `Obj` --------------------------------------------
        id: v.string(),
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        ra: Schemas.NullishNumber,
        dec: Schemas.NullishNumber,
        ra_dis: Schemas.NullishNumber,
        dec_dis: Schemas.NullishNumber,
        ra_err: Schemas.NullishNumber,
        dec_err: Schemas.NullishNumber,
        offset: Schemas.NullishNumber,
        t0: Schemas.NullishNumber,
        redshift: Schemas.NullishNumber,
        redshift_error: Schemas.NullishNumber,
        redshift_origin: Schemas.NullishString,
        redshift_history: Schemas.nullish(v.array(Schemas.JsonObject)),
        host_id: Schemas.NullishInteger,
        summary: Schemas.NullishString,
        summary_history: Schemas.nullish(v.array(Schemas.JsonObject)),
        altdata: Schemas.nullish(Schemas.JsonObject),
        dist_nearest_source: Schemas.NullishNumber,
        mag_nearest_source: Schemas.NullishNumber,
        e_mag_nearest_source: Schemas.NullishNumber,
        transient: Schemas.NullishBoolean,
        varstar: Schemas.NullishBoolean,
        is_roid: Schemas.NullishBoolean,
        mpc_name: Schemas.NullishString,
        tns_name: Schemas.NullishString,
        tns_info: Schemas.nullish(Schemas.JsonObject),
        score: Schemas.NullishNumber,
        origin: Schemas.NullishString,
        alias: Schemas.nullish(v.array(v.string())),
        healpix: Schemas.NullishInteger,
        detect_photometry_count: Schemas.NullishInteger,
        /** `Obj.to_dict` strips this; the source handlers add it back by hand. */
        internal_key: Schemas.NullishString,

        // -- Values the handlers compute and inject ------------------------------
        gal_lat: Schemas.NullishNumber,
        gal_lon: Schemas.NullishNumber,
        luminosity_distance: Schemas.NullishNumber,
        dm: Schemas.NullishNumber,
        angular_diameter_distance: Schemas.NullishNumber,
        ebv: Schemas.NullishNumber,
        first_detected: Schemas.NullishTimestamp,
        last_detected: Schemas.NullishTimestamp,
        host_offset: Schemas.NullishNumber,
        host_distance: Schemas.NullishNumber,
        /** `period_exists` on a single source, `period` in a sources listing. */
        period_exists: Schemas.NullishBoolean,
        period: Schemas.NullishBoolean,
        photometry_exists: Schemas.NullishBoolean,
        spectrum_exists: Schemas.NullishBoolean,
        comment_exists: Schemas.NullishBoolean,
        /** Names of galaxies within 10 arcsec; null for moving objects. */
        galaxies: Schemas.nullish(v.array(v.string())),
        duplicates: Schemas.list(SourceDuplicate),
        associated_objs: Schemas.list(SourceAssociatedObj),
        color_magnitude: Schemas.list(SourceColorMag),
        gcn_notes: Schemas.list(SourceGcnNote),
        tags: Schemas.list(Tags.ObjTag),

        // -- Nested records ------------------------------------------------------
        groups: Schemas.list(SourceSavedGroup),
        thumbnails: Schemas.list(Thumbnails.Thumbnail),
        photstats: Schemas.list(PhotStat),
        annotations: Schemas.list(SourceAnnotation),
        classifications: Schemas.list(Classifications.Classification),
        comments: Schemas.list(Comments.Comment),
        photometry: Schemas.list(Photometry.PhotometryPoint),
        host: Schemas.nullish(Galaxies.Galaxy),
        followup_requests: Schemas.list(SourceFollowupRequest),
        assignments: Schemas.list(Assignments.Assignment),
        analyses: Schemas.list(Analysis.ObjAnalysis),
        candidates: Schemas.list(SourceCandidate),
        /**
         * `GcnEvent` rows with an added `dateobs_mjd`; left free-form because
         * `GcnEvents` cannot import `Sources` without a cycle.
         */
        gcn_crossmatch: Schemas.list(Schemas.JsonObject),
        /** Users on a single source, `SourceLabel` rows in a sources listing. */
        labellers: Schemas.list(Schemas.JsonObject),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type Source = v.InferOutput<typeof Source>;

/**
 * One page of results from a sources query.
 *
 * @since 1.0.0
 * @category Models
 */
export const SourcesPage = Schemas.model(
    v.strictObject({
        sources: v.array(Source),
        totalMatches: Schemas.Integer,
        pageNumber: v.optional(Schemas.Integer, 1),
        numPerPage: v.optional(Schemas.Integer, 100),
        /** Echoed back when exactly one group was queried for. */
        group_id: Schemas.NullishInteger,
        /** Returned when `useCache` is set; pass it back to replay the query. */
        queryID: Schemas.NullishString,
        geojson: Schemas.nullish(Schemas.JsonObject),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SourcesPage = v.InferOutput<typeof SourcesPage>;

/**
 * A row of the save-summary form of the sources query.
 *
 * The upstream `Source` join-table record between an object and the group it
 * is saved to, rather than the object itself.
 *
 * @since 1.0.0
 * @category Models
 */
export const SavedSource = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        obj_id: v.string(),
        group_id: Schemas.NullishInteger,
        saved_by_id: Schemas.NullishInteger,
        saved_at: Schemas.NullishTimestamp,
        active: Schemas.NullishBoolean,
        requested: Schemas.NullishBoolean,
        unsaved_by_id: Schemas.NullishInteger,
        unsaved_at: Schemas.NullishTimestamp,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SavedSource = v.InferOutput<typeof SavedSource>;

/**
 * One page of results from a save-summary sources query.
 *
 * @since 1.0.0
 * @category Models
 */
export const SourcesSaveSummaryPage = Schemas.model(
    v.strictObject({
        sources: Schemas.list(SavedSource),
        totalMatches: Schemas.NullishInteger,
        pageNumber: v.optional(Schemas.Integer, 1),
        numPerPage: v.optional(Schemas.Integer, 100),
        group_id: Schemas.NullishInteger,
        queryID: Schemas.NullishString,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SourcesSaveSummaryPage = v.InferOutput<typeof SourcesSaveSummaryPage>;

/**
 * Payload for saving a new source (upstream `ObjPost`).
 *
 * `ra` and `dec` are required for an object that does not exist yet; for one
 * that does, any field given is applied as an update. If `group_ids` is
 * omitted, the server saves the source to all of the token's groups.
 *
 * @since 1.0.0
 * @category Models
 */
export interface SourcePost {
    readonly id: string;
    readonly ra?: number | undefined;
    readonly dec?: number | undefined;
    readonly ra_dis?: number | undefined;
    readonly dec_dis?: number | undefined;
    readonly ra_err?: number | undefined;
    readonly dec_err?: number | undefined;
    readonly offset?: number | undefined;
    readonly t0?: number | undefined;
    readonly redshift?: number | undefined;
    readonly redshift_error?: number | undefined;
    readonly redshift_origin?: string | undefined;
    readonly host_id?: number | undefined;
    readonly summary?: string | undefined;
    readonly summary_history?: ReadonlyArray<Record<string, unknown>> | undefined;
    readonly altdata?: Record<string, unknown> | undefined;
    readonly dist_nearest_source?: number | undefined;
    readonly mag_nearest_source?: number | undefined;
    readonly e_mag_nearest_source?: number | undefined;
    readonly transient?: boolean | undefined;
    readonly varstar?: boolean | undefined;
    readonly is_roid?: boolean | undefined;
    readonly mpc_name?: string | undefined;
    readonly tns_name?: string | undefined;
    readonly tns_info?: Record<string, unknown> | undefined;
    readonly score?: number | undefined;
    readonly origin?: string | undefined;
    readonly alias?: ReadonlyArray<string> | undefined;
    readonly detect_photometry_count?: number | undefined;
    readonly group_ids?: ReadonlyArray<number> | undefined;
    readonly refresh_source?: boolean | undefined;
    readonly ignore_if_in_group_ids?: Record<string, ReadonlyArray<number>> | undefined;
    readonly saver_per_group_id?: Record<string, number> | undefined;
}

/**
 * Result of saving a new source.
 *
 * @since 1.0.0
 * @category Models
 */
export const SourcePostResponse = Schemas.model(
    v.strictObject({
        id: v.string(),
        saved_to_groups: Schemas.list(Schemas.Integer),
        warnings: Schemas.list(v.string()),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SourcePostResponse = v.InferOutput<typeof SourcePostResponse>;

/**
 * One line of an offset-star starlist.
 *
 * @since 1.0.0
 * @category Models
 */
export const SourceOffsetStar = Schemas.model(
    v.strictObject({
        str: v.string(),
        name: Schemas.NullishString,
        ra: Schemas.NullishNumber,
        dec: Schemas.NullishNumber,
        dras: Schemas.NullishString,
        ddecs: Schemas.NullishString,
        mag: Schemas.NullishNumber,
        pa: Schemas.NullishNumber,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SourceOffsetStar = v.InferOutput<typeof SourceOffsetStar>;

/**
 * Offset stars for a source, in a facility's starlist format.
 *
 * @since 1.0.0
 * @category Models
 */
export const SourceOffsets = Schemas.model(
    v.strictObject({
        facility: Schemas.NullishString,
        starlist_str: Schemas.NullishString,
        starlist_info: Schemas.list(SourceOffsetStar),
        ra: Schemas.NullishNumber,
        dec: Schemas.NullishNumber,
        noffsets: Schemas.NullishInteger,
        queries_issued: Schemas.NullishInteger,
        query: Schemas.NullishString,
        used_ztfref: Schemas.NullishBoolean,
        gaia_available: Schemas.NullishBoolean,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SourceOffsets = v.InferOutput<typeof SourceOffsets>;

/**
 * Default offset-star parameters for one finding-chart facility.
 *
 * @since 1.0.0
 * @category Models
 */
export const FinderChartFacility = Schemas.model(
    v.strictObject({
        radius_degrees: Schemas.NullishNumber,
        mag_limit: Schemas.NullishNumber,
        mag_min: Schemas.NullishNumber,
        min_sep_arcsec: Schemas.NullishNumber,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type FinderChartFacility = v.InferOutput<typeof FinderChartFacility>;

/**
 * A finding chart returned as JSON rather than as a file.
 *
 * @since 1.0.0
 * @category Models
 */
export const SourceFinderChart = Schemas.model(
    v.strictObject({
        finding_chart: v.string(),
        starlist: Schemas.list(SourceOffsetStar),
        public_url: Schemas.NullishString,
        public_url_expires_at: Schemas.NullishTimestamp,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SourceFinderChart = v.InferOutput<typeof SourceFinderChart>;

/**
 * Payload for crossmatching a source against GCN events.
 *
 * `startDate` and `endDate` are required and must be within 31 days of each
 * other.
 *
 * @since 1.0.0
 * @category Models
 */
export interface SourceGcnEventCrossmatchPost {
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
 * Payload for a Minor Planet Center crossmatch.
 *
 * The server defaults to observatory code `"500"` (geocentric), the current
 * time, a limiting magnitude of 24.0, and a search radius of 1 arcmin.
 *
 * @since 1.0.0
 * @category Models
 */
export interface SourceMpcQueryPost {
    readonly obscode?: string | undefined;
    readonly date?: string | undefined;
    readonly limiting_magnitude?: number | undefined;
    readonly search_radius?: number | undefined;
}

/**
 * Payload for sending a source notification.
 *
 * `level` is `"soft"` to send an email, `"hard"` to send an email and an SMS.
 *
 * @since 1.0.0
 * @category Models
 */
export interface SourceNotificationPost {
    readonly sourceId: string;
    readonly groupIds: ReadonlyArray<number>;
    readonly level: "soft" | "hard";
    readonly additionalNotes?: string | undefined;
}

/**
 * Result of sending a source notification.
 *
 * @since 1.0.0
 * @category Models
 */
export const SourceNotificationPostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type SourceNotificationPostResponse = v.InferOutput<typeof SourceNotificationPostResponse>;

/**
 * Whether a source already exists by name or by position.
 *
 * @since 1.0.0
 * @category Models
 */
export const SourceExists = Schemas.model(
    v.strictObject({
        source_exists: v.boolean(),
        message: Schemas.NullishString,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SourceExists = v.InferOutput<typeof SourceExists>;

/**
 * Counts of objects with and without photometry statistics.
 *
 * @since 1.0.0
 * @category Models
 */
export const PhotStatCounts = Schemas.model(
    v.strictObject({
        totalWithPhotStats: Schemas.Integer,
        totalWithoutPhotStats: Schemas.Integer,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type PhotStatCounts = v.InferOutput<typeof PhotStatCounts>;

/**
 * Pagination summary of a batch photometry-statistics update.
 *
 * @since 1.0.0
 * @category Models
 */
export const PhotStatsBatch = Schemas.model(
    v.strictObject({
        totalMatches: Schemas.Integer,
        pageNumber: v.optional(Schemas.Integer, 1),
        numPerPage: v.optional(Schemas.Integer, 100),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type PhotStatsBatch = v.InferOutput<typeof PhotStatsBatch>;

/**
 * A photometry-statistics field that can be plotted.
 *
 * @since 1.0.0
 * @category Models
 */
export const PhotStatAggregateField = Schemas.model(
    v.strictObject({
        value: v.string(),
        label: Schemas.NullishString,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type PhotStatAggregateField = v.InferOutput<typeof PhotStatAggregateField>;

/**
 * One source's photometry statistics, ready for plotting.
 *
 * @since 1.0.0
 * @category Models
 */
export const PhotStatAggregatePoint = Schemas.model(
    v.strictObject({
        id: v.string(),
        ra: Schemas.NullishNumber,
        dec: Schemas.NullishNumber,
        redshift: Schemas.NullishNumber,
        classification: Schemas.NullishString,
        first_detected_mjd: Schemas.NullishNumber,
        peak_mjd: Schemas.NullishNumber,
        tns_discovery_date: Schemas.NullishString,
        x: Schemas.NullishNumber,
        y: Schemas.NullishNumber,
        z: Schemas.NullishNumber,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type PhotStatAggregatePoint = v.InferOutput<typeof PhotStatAggregatePoint>;

/**
 * Bulk photometry statistics across many sources.
 *
 * @since 1.0.0
 * @category Models
 */
export const PhotStatAggregate = Schemas.model(
    v.strictObject({
        fields: Schemas.list(PhotStatAggregateField),
        points: Schemas.list(PhotStatAggregatePoint),
        count: v.optional(Schemas.Integer, 0),
        truncated: v.optional(v.boolean(), false),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type PhotStatAggregate = v.InferOutput<typeof PhotStatAggregate>;

/**
 * Options for retrieving a single source.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchSourceOptions {
    /**
     * Additionally require the source to carry this TNS name (with or without
     * the space, e.g. `"2024 abc"`).
     */
    readonly tnsName?: string | undefined;
    /** Include thumbnail data in the response. */
    readonly includeThumbnails?: boolean | undefined;
    /** Include the source's photometry in `photometry`. */
    readonly includePhotometry?: boolean | undefined;
    /**
     * Include the source's color/absolute-magnitude data in `color_magnitude`.
     */
    readonly includeColorMagnitude?: boolean | undefined;
    /** Include whether any photometry exists, in `photometry_exists`. */
    readonly includePhotometryExists?: boolean | undefined;
    /** Include whether any spectrum exists, in `spectrum_exists`. */
    readonly includeSpectrumExists?: boolean | undefined;
    /** Include whether any comment exists, in `comment_exists`. */
    readonly includeCommentExists?: boolean | undefined;
    /** Include the aggregate photometry statistics in `photstats`. */
    readonly includeDetectionStats?: boolean | undefined;
    /** Include whether a period annotation exists, in `period_exists`. */
    readonly includePeriodExists?: boolean | undefined;
    /** Include the users who labelled the source, in `labellers`. */
    readonly includeLabellers?: boolean | undefined;
    /** Include the source's GCN event crossmatches, in `gcn_crossmatch`. */
    readonly includeGCNCrossmatches?: boolean | undefined;
    /** Include the source's GCN vetting notes, in `gcn_notes`. */
    readonly includeGCNNotes?: boolean | undefined;
    /** Include the source's analyses in `analyses`. */
    readonly includeAnalyses?: boolean | undefined;
    /** Include the source's comments in `comments`. */
    readonly includeComments?: boolean | undefined;
    /** Include the source's filter passages in `candidates`. */
    readonly includeCandidates?: boolean | undefined;
    /**
     * Include the source's tags in `tags`. Defaults to true, matching the
     * server.
     */
    readonly includeTags?: boolean | undefined;
    /**
     * Include the objects linked through a SuperObj in `associated_objs`.
     * Defaults to true, matching the server.
     */
    readonly includeAssociatedObjs?: boolean | undefined;
    /**
     * Aggregate data from every object linked through the source's SuperObj
     * (see `associated_objs`).
     */
    readonly includeSuperObjs?: boolean | undefined;
    /** Also include groups whose save is only requested, in `groups`. */
    readonly includeRequested?: boolean | undefined;
    /** Only include groups whose save is requested but not yet active. */
    readonly pendingOnly?: boolean | undefined;
    /**
     * With `includePhotometry`, drop photometry points duplicated within a
     * short time window.
     */
    readonly deduplicatePhotometry?: boolean | undefined;
}

/**
 * Retrieve a single source by object ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the source, e.g. `"ZTF20abcdef"`.
 */
export const fetchSource = async (
    client: Http.Client,
    objId: string,
    options: FetchSourceOptions = {}
): Promise<Source> =>
    Http.decode(
        Source,
        await Http.get(client, `/api/sources/${objId}`, {
            includeThumbnails: options.includeThumbnails ?? false,
            includePhotometry: options.includePhotometry ?? false,
            includeColorMagnitude: options.includeColorMagnitude ?? false,
            includePhotometryExists: options.includePhotometryExists ?? false,
            includeSpectrumExists: options.includeSpectrumExists ?? false,
            includeCommentExists: options.includeCommentExists ?? false,
            includeDetectionStats: options.includeDetectionStats ?? false,
            includePeriodExists: options.includePeriodExists ?? false,
            includeLabellers: options.includeLabellers ?? false,
            includeGCNCrossmatches: options.includeGCNCrossmatches ?? false,
            includeGCNNotes: options.includeGCNNotes ?? false,
            includeAnalyses: options.includeAnalyses ?? false,
            includeComments: options.includeComments ?? false,
            includeCandidates: options.includeCandidates ?? false,
            includeTags: options.includeTags ?? true,
            includeAssociatedObjs: options.includeAssociatedObjs ?? true,
            includeSuperObjs: options.includeSuperObjs ?? false,
            includeRequested: options.includeRequested ?? false,
            pendingOnly: options.pendingOnly ?? false,
            deduplicatePhotometry: options.deduplicatePhotometry ?? false,
            TNSname: options.tnsName,
        })
    );

/**
 * Check whether a source with this object ID is accessible.
 *
 * Uses the endpoint's HEAD form, which carries no body.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID to check.
 */
export const sourceExists = (client: Http.Client, objId: string): Promise<boolean> =>
    Http.head(client, `/api/sources/${objId}`);

/**
 * The filters shared by the sources listing and its save-summary form.
 *
 * @since 1.0.0
 * @category Models
 */
export interface SourcesFilterOptions {
    /** Keep sources whose object ID contains this (partial-match) string. */
    readonly sourceId?: string | undefined;
    /** Cone-search filter, all in degrees; provide all three together. */
    readonly ra?: number | undefined;
    readonly dec?: number | undefined;
    readonly radius?: number | undefined;
    /** Restrict to sources saved to these groups. */
    readonly groupIds?: ReadonlyArray<number> | undefined;
    /**
     * Keep sources inside this entry of this spatial catalog; provide both
     * together.
     */
    readonly spatialCatalogName?: string | undefined;
    readonly spatialCatalogEntryName?: string | undefined;
    /**
     * Keep sources inside a GCN localization, identified by its event time and
     * map name.
     */
    readonly localizationDateobs?: string | undefined;
    readonly localizationName?: string | undefined;
    /**
     * Cumulative probability level of the localization region to keep sources
     * within.
     */
    readonly localizationCumprob?: number | undefined;
    /** Drop sources rejected against the localization's GCN event. */
    readonly localizationRejectSources?: boolean | undefined;
    /**
     * Also keep sources already confirmed in the localization's GCN event,
     * even outside the probability region.
     */
    readonly includeSourcesInGcn?: boolean | undefined;
    /**
     * Strip the nested `thumbnails`/`annotations`/`groups` payloads from each
     * source.
     */
    readonly removeNested?: boolean | undefined;
    /**
     * Keep only sources on this list of the token's user, e.g. `"favorites"`.
     */
    readonly listName?: string | undefined;
    /** Keep sources saved in this ISO-format (UTC) time range. */
    readonly savedBefore?: string | undefined;
    readonly savedAfter?: string | undefined;
    /** Keep only sources the token's user saved. */
    readonly savedByCurrentUser?: boolean | undefined;
    /** Also keep sources whose group save is only requested. */
    readonly includeRequested?: boolean | undefined;
    /** Keep only sources whose group save is requested but not active. */
    readonly pendingOnly?: boolean | undefined;
    /** Keep sources created or modified after this ISO-format time. */
    readonly createdOrModifiedAfter?: string | undefined;
    /** Keep sources last detected in this ISO-format time range. */
    readonly startDate?: string | undefined;
    readonly endDate?: string | undefined;
    /** Keep only sources with at least this many detections. */
    readonly numberDetections?: number | undefined;
    /**
     * Evaluate the detection-based filters against non-forced photometry only.
     */
    readonly excludeForcedPhotometry?: boolean | undefined;
    /**
     * Apply the detection-based filters, and require `startDate`, `endDate`
     * and `numberDetections` when querying inside a localization. Defaults to
     * true server-side.
     */
    readonly requireDetections?: boolean | undefined;
    /** Keep only sources with at least one spectrum. */
    readonly hasSpectrum?: boolean | undefined;
    /** Keep only sources without any spectrum. */
    readonly hasNoSpectrum?: boolean | undefined;
    /** Keep sources with a spectrum observed before/after this ISO time. */
    readonly hasSpectrumBefore?: string | undefined;
    readonly hasSpectrumAfter?: string | undefined;
    /** Keep only sources with a TNS name. */
    readonly hasTnsName?: boolean | undefined;
    /** Keep only sources without a TNS name. */
    readonly hasNoTnsName?: boolean | undefined;
    /** Keep only sources with a follow-up request. */
    readonly hasFollowupRequest?: boolean | undefined;
    /**
     * With `hasFollowupRequest`, partial-match filter on the follow-up request
     * status.
     */
    readonly followupRequestStatus?: string | undefined;
    /** Keep only sources that have been labelled. */
    readonly hasBeenLabelled?: boolean | undefined;
    /** Keep only sources that have not been labelled. */
    readonly hasNotBeenLabelled?: boolean | undefined;
    /**
     * With one of the labelling filters, consider only labels by the token's
     * user rather than by anyone.
     */
    readonly currentUserLabeller?: boolean | undefined;
    /** Keep sources with this Simbad class. */
    readonly simbadClass?: string | undefined;
    /** Keep sources whose alias contains this (partial-match) string. */
    readonly alias?: string | undefined;
    /** Keep sources whose origin contains this (partial-match) string. */
    readonly origin?: string | undefined;
    /**
     * Keep sources carrying one of these `"taxonomy: classification"` strings.
     */
    readonly classifications?: ReadonlyArray<string> | undefined;
    /**
     * Require every entry of `classifications` to match (AND rather than OR).
     */
    readonly classificationsSimul?: boolean | undefined;
    /**
     * Keep sources not carrying one of these `"taxonomy: classification"`
     * strings.
     */
    readonly nonclassifications?: ReadonlyArray<string> | undefined;
    /** Keep only sources with at least one classification. */
    readonly classified?: boolean | undefined;
    /** Keep only sources without any classification. */
    readonly unclassified?: boolean | undefined;
    /** Redshift range filter. */
    readonly minRedshift?: number | undefined;
    readonly maxRedshift?: number | undefined;
    /** Peak-magnitude range filter. */
    readonly minPeakMagnitude?: number | undefined;
    readonly maxPeakMagnitude?: number | undefined;
    /** Latest-magnitude range filter. */
    readonly minLatestMagnitude?: number | undefined;
    readonly maxLatestMagnitude?: number | undefined;
    /** Comma-separated `key[:value:operator]` annotation constraints. */
    readonly annotationsFilter?: string | undefined;
    /** Comma-separated origins the annotations must come from. */
    readonly annotationsFilterOrigin?: string | undefined;
    /** Keep sources with an annotation before/after this UTC datetime. */
    readonly annotationsFilterBefore?: string | undefined;
    readonly annotationsFilterAfter?: string | undefined;
    /** Partial-match filter on comment text. */
    readonly commentsFilter?: string | undefined;
    /** User ID the filtered comments must be authored by. */
    readonly commentsFilterAuthor?: number | undefined;
    /** Keep sources with a comment before/after this UTC datetime. */
    readonly commentsFilterBefore?: string | undefined;
    readonly commentsFilterAfter?: string | undefined;
    /** Object IDs to exclude from the results. */
    readonly rejectedSourceIds?: ReadonlyArray<string> | undefined;
    /** Include each source's host galaxy in `host`. */
    readonly includeHosts?: boolean | undefined;
    /** Include whether any spectrum exists, in `spectrum_exists`. */
    readonly includeSpectrumExists?: boolean | undefined;
    /** Include whether any comment exists, in `comment_exists`. */
    readonly includeCommentExists?: boolean | undefined;
    /** Include a GeoJSON representation of the page in `geojson`. */
    readonly includeGeoJSON?: boolean | undefined;
    /**
     * Sort column (a source column, `"saved_at"`, `"altdata.<key>"` or
     * `"annotation.<origin>.<key>"`).
     */
    readonly sortBy?: string | undefined;
    /** Sort direction, `"asc"` or `"desc"`. */
    readonly sortOrder?: string | undefined;
    /**
     * Cache the matching IDs server-side: the first page returns a `queryID`
     * to pass back for later pages.
     */
    readonly useCache?: boolean | undefined;
    /**
     * With `useCache`, replay a cached query when fetching pages after the
     * first.
     */
    readonly queryId?: string | undefined;
}

/** @internal */
const sourcesFilterParams = (options: SourcesFilterOptions): Http.QueryParams => ({
    sourceID: options.sourceId,
    ra: options.ra,
    dec: options.dec,
    radius: options.radius,
    spatialCatalogName: options.spatialCatalogName,
    spatialCatalogEntryName: options.spatialCatalogEntryName,
    localizationDateobs: options.localizationDateobs,
    localizationName: options.localizationName,
    localizationCumprob: options.localizationCumprob,
    localizationRejectSources: options.localizationRejectSources,
    includeSourcesInGcn: options.includeSourcesInGcn,
    removeNested: options.removeNested,
    listName: options.listName,
    savedBefore: options.savedBefore,
    savedAfter: options.savedAfter,
    savedByCurrentUser: options.savedByCurrentUser,
    includeRequested: options.includeRequested,
    pendingOnly: options.pendingOnly,
    createdOrModifiedAfter: options.createdOrModifiedAfter,
    startDate: options.startDate,
    endDate: options.endDate,
    numberDetections: options.numberDetections,
    excludeForcedPhotometry: options.excludeForcedPhotometry,
    requireDetections: options.requireDetections,
    hasSpectrum: options.hasSpectrum,
    hasNoSpectrum: options.hasNoSpectrum,
    hasSpectrumBefore: options.hasSpectrumBefore,
    hasSpectrumAfter: options.hasSpectrumAfter,
    hasTNSname: options.hasTnsName,
    hasNoTNSname: options.hasNoTnsName,
    hasFollowupRequest: options.hasFollowupRequest,
    followupRequestStatus: options.followupRequestStatus,
    hasBeenLabelled: options.hasBeenLabelled,
    hasNotBeenLabelled: options.hasNotBeenLabelled,
    currentUserLabeller: options.currentUserLabeller,
    simbadClass: options.simbadClass,
    alias: options.alias,
    origin: options.origin,
    // The server reads this one in snake_case.
    classifications_simul: options.classificationsSimul,
    classified: options.classified,
    unclassified: options.unclassified,
    minRedshift: options.minRedshift,
    maxRedshift: options.maxRedshift,
    minPeakMagnitude: options.minPeakMagnitude,
    maxPeakMagnitude: options.maxPeakMagnitude,
    minLatestMagnitude: options.minLatestMagnitude,
    maxLatestMagnitude: options.maxLatestMagnitude,
    annotationsFilter: options.annotationsFilter,
    annotationsFilterOrigin: options.annotationsFilterOrigin,
    annotationsFilterBefore: options.annotationsFilterBefore,
    annotationsFilterAfter: options.annotationsFilterAfter,
    commentsFilter: options.commentsFilter,
    commentsFilterAuthor: options.commentsFilterAuthor,
    commentsFilterBefore: options.commentsFilterBefore,
    commentsFilterAfter: options.commentsFilterAfter,
    includeHosts: options.includeHosts,
    includeSpectrumExists: options.includeSpectrumExists,
    includeCommentExists: options.includeCommentExists,
    includeGeoJSON: options.includeGeoJSON,
    sortBy: options.sortBy,
    sortOrder: options.sortOrder,
    useCache: options.useCache,
    queryID: options.queryId,
    group_ids: Http.commaSeparated(options.groupIds),
    classifications: Http.commaSeparated(options.classifications),
    nonclassifications: Http.commaSeparated(options.nonclassifications),
    rejectedSourceIDs: Http.commaSeparated(options.rejectedSourceIds),
});

/**
 * Options for querying saved sources.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchSourcesOptions extends SourcesFilterOptions {
    /** Pagination controls. */
    readonly pageNumber?: number | undefined;
    readonly numPerPage?: number | undefined;
}

/**
 * Query saved sources, one page at a time.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchSources = async (client: Http.Client, options: FetchSourcesOptions = {}): Promise<SourcesPage> =>
    Http.decode(
        SourcesPage,
        await Http.get(client, "/api/sources", {
            pageNumber: options.pageNumber ?? 1,
            numPerPage: options.numPerPage ?? 100,
            ...sourcesFilterParams(options),
        })
    );

/**
 * Options for the save-summary form of the sources query.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchSourcesSaveSummaryOptions {
    /** Pagination controls. */
    readonly pageNumber?: number | undefined;
    readonly numPerPage?: number | undefined;
    /** Restrict to sources saved to these groups. */
    readonly groupIds?: ReadonlyArray<number> | undefined;
    /** Keep sources saved in this ISO-format (UTC) time range. */
    readonly savedBefore?: string | undefined;
    readonly savedAfter?: string | undefined;
    /** Sort column (e.g. `"saved_at"`) and direction (`"asc"`/`"desc"`). */
    readonly sortBy?: string | undefined;
    readonly sortOrder?: string | undefined;
    /**
     * Cache the matching IDs server-side: the first page returns a `queryID`
     * to pass back for later pages.
     */
    readonly useCache?: boolean | undefined;
    /**
     * With `useCache`, replay a cached query when fetching pages after the
     * first.
     */
    readonly queryId?: string | undefined;
}

/**
 * Query when and by whom sources were saved, one page at a time.
 *
 * The `saveSummary` form of the sources query returns the save records (object
 * ID, group, saver, time) instead of the objects themselves.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchSourcesSaveSummary = async (
    client: Http.Client,
    options: FetchSourcesSaveSummaryOptions = {}
): Promise<SourcesSaveSummaryPage> =>
    Http.decode(
        SourcesSaveSummaryPage,
        await Http.get(client, "/api/sources", {
            pageNumber: options.pageNumber ?? 1,
            numPerPage: options.numPerPage ?? 100,
            saveSummary: true,
            ...sourcesFilterParams({
                groupIds: options.groupIds,
                savedBefore: options.savedBefore,
                savedAfter: options.savedAfter,
                sortBy: options.sortBy,
                sortOrder: options.sortOrder,
                useCache: options.useCache,
                queryId: options.queryId,
            }),
        })
    );

/**
 * Save a new source (or update one the token could not previously see).
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The source to save.
 */
export const postSource = async (client: Http.Client, payload: SourcePost): Promise<SourcePostResponse> =>
    Http.decode(SourcePostResponse, await Http.post(client, "/api/sources", Http.body(payload)));

/**
 * Options for updating a source.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpdateSourceOptions {
    /** New coordinates, in degrees. */
    readonly ra?: number | undefined;
    readonly dec?: number | undefined;
    /** New redshift. */
    readonly redshift?: number | undefined;
    /** Whether the source is an astrophysical transient. */
    readonly transient?: boolean | undefined;
    /** Discovery right ascension. */
    readonly ra_dis?: number | undefined;
    /** Misc. metadata stored as JSON. */
    readonly altdata?: Record<string, unknown> | undefined;
    /** New human-readable summary of the source. */
    readonly summary?: string | undefined;
}

/**
 * Update fields of an existing source.
 *
 * Only the provided fields are sent; omitted fields are left unchanged.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the source to update.
 */
export const updateSource = async (
    client: Http.Client,
    objId: string,
    options: UpdateSourceOptions = {}
): Promise<void> => {
    await Http.patch(client, `/api/sources/${objId}`, Http.body(options));
};

/**
 * Unsave a source from one group.
 *
 * The source is deactivated for that group rather than deleted outright; the
 * token must have access to the group.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the source to unsave.
 * @param groupId - Group to unsave the source from. Sent in the request body.
 */
export const deleteSource = async (client: Http.Client, objId: string, groupId: number): Promise<void> => {
    await Http.del(client, `/api/sources/${objId}`, { group_id: groupId });
};

/**
 * Delete all of a source's photometry points.
 *
 * Requires the "Delete bulk photometry" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the source whose photometry is deleted.
 */
export const deleteSourcePhotometry = async (client: Http.Client, objId: string): Promise<string> =>
    Http.decode(v.string(), await Http.del(client, `/api/sources/${objId}/photometry`));

/**
 * Options for retrieving offset stars.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchSourceOffsetsOptions {
    /**
     * Starlist format, one of `"Keck"`, `"Shane"`, `"P200"`, or `"P200-NGPS"`.
     * Defaults to `"Keck"`.
     */
    readonly facility?: string | undefined;
    /**
     * Number of offset stars requested, in [0, 10]. Zero returns a starlist of
     * just the source. Defaults to 3.
     */
    readonly numOffsetStars?: number | undefined;
    /**
     * Observation time in ISO format, e.g. `"2020-12-30T12:34:10"`. Defaults
     * to now.
     */
    readonly obstime?: string | undefined;
    /**
     * Use the ZTFref catalog for offset-star positions instead of Gaia DR3.
     * Defaults to true.
     */
    readonly useZtfref?: boolean | undefined;
    /**
     * Observing run whose assignment priority and comment should be folded
     * into the starlist.
     */
    readonly observingRunId?: number | undefined;
}

/**
 * Retrieve offset stars for a source, to aid in spectroscopy.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the source.
 */
export const fetchSourceOffsets = async (
    client: Http.Client,
    objId: string,
    options: FetchSourceOffsetsOptions = {}
): Promise<SourceOffsets> =>
    Http.decode(
        SourceOffsets,
        await Http.get(client, `/api/sources/${objId}/offsets`, {
            facility: options.facility ?? "Keck",
            num_offset_stars: options.numOffsetStars ?? 3,
            use_ztfref: options.useZtfref ?? true,
            obstime: options.obstime,
            observing_run_id: options.observingRunId,
        })
    );

/**
 * Options for generating a source finding chart.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchSourceFinderOptions {
    /** Square image size in arcmin, in [2, 15]. Defaults to 4.0. */
    readonly imsize?: number | undefined;
    /**
     * Starlist format, one of `"Keck"`, `"Shane"`, `"P200"`, or `"P200-NGPS"`.
     * Defaults to `"Keck"`.
     */
    readonly facility?: string | undefined;
    /**
     * Chart image source, one of `"ps1"`, `"desi"`, `"dss"`, or `"ztfref"`.
     * Defaults to `"ps1"`.
     */
    readonly imageSource?: string | undefined;
    /**
     * Use the ZTFref catalog for offset-star positions instead of Gaia DR3.
     * Defaults to true.
     */
    readonly useZtfref?: boolean | undefined;
    /** Observation time in ISO format. Defaults to now. */
    readonly obstime?: string | undefined;
    /** Output file type, `"pdf"` or `"png"`. Defaults to `"pdf"`. */
    readonly outputType?: string | undefined;
    /** Number of offset stars to show, in [0, 4]. Defaults to 3. */
    readonly numOffsetStars?: number | undefined;
    /**
     * Brightest and faintest offset-star magnitudes to allow. Each defaults to
     * the facility value.
     */
    readonly magMin?: number | undefined;
    readonly magLimit?: number | undefined;
    /** Reuse a cached chart when one is available. Defaults to true. */
    readonly useCache?: boolean | undefined;
}

/** @internal */
const sourceFinderParams = (options: FetchSourceFinderOptions): Http.QueryParams => ({
    imsize: options.imsize ?? 4,
    facility: options.facility ?? "Keck",
    image_source: options.imageSource ?? "ps1",
    use_ztfref: options.useZtfref ?? true,
    type: options.outputType ?? "pdf",
    num_offset_stars: options.numOffsetStars ?? 3,
    use_cache: options.useCache ?? true,
    obstime: options.obstime,
    mag_min: options.magMin,
    mag_limit: options.magLimit,
});

/**
 * Generate a finding chart for a source, as a PDF or PNG file.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the source.
 */
export const fetchSourceFinder = (
    client: Http.Client,
    objId: string,
    options: FetchSourceFinderOptions = {}
): Promise<Uint8Array> => Http.getContent(client, `/api/sources/${objId}/finder`, sourceFinderParams(options));

/**
 * Generate a finding chart and return it as base64 JSON with its starlist.
 *
 * Same endpoint as {@link fetchSourceFinder}, called with `as_json`.
 * `public_url` is only present when the chart was cached.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the source.
 */
export const fetchSourceFinderJson = async (
    client: Http.Client,
    objId: string,
    options: FetchSourceFinderOptions = {}
): Promise<SourceFinderChart> =>
    Http.decode(
        SourceFinderChart,
        await Http.get(client, `/api/sources/${objId}/finder`, {
            ...sourceFinderParams(options),
            as_json: true,
        })
    );

/**
 * Retrieve the per-facility default finding-chart parameters.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchFinderChartFacilities = async (client: Http.Client): Promise<Record<string, FinderChartFacility>> =>
    Http.decode(v.record(v.string(), FinderChartFacility), await Http.get(client, "/api/finder_chart/facilities"));

/**
 * Set a source's host galaxy.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the source.
 * @param galaxyName - Name of an existing galaxy to associate with the object.
 */
export const postSourceHost = async (client: Http.Client, objId: string, galaxyName: string): Promise<void> => {
    await Http.post(client, `/api/sources/${objId}/host`, { galaxyName });
};

/**
 * Clear a source's host galaxy.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the source.
 */
export const deleteSourceHost = async (client: Http.Client, objId: string): Promise<void> => {
    await Http.del(client, `/api/sources/${objId}/host`);
};

/**
 * Retrieve the groups a source is saved to or requested for.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the source.
 */
export const fetchSourceSavedGroups = async (client: Http.Client, objId: string): Promise<Array<SourceSavedGroup>> =>
    Http.decode(v.array(SourceSavedGroup), await Http.get(client, `/api/sources/${objId}/groups`));

/**
 * Record that the calling user has labelled a source for some groups.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the source.
 * @param groupIds - Groups to record labelling for. Labels already present are
 *   left untouched.
 */
export const postSourceLabels = async (
    client: Http.Client,
    objId: string,
    groupIds: ReadonlyArray<number>
): Promise<void> => {
    await Http.post(client, `/api/sources/${objId}/labels`, { groupIds });
};

/**
 * Remove the calling user's labels on a source for some groups.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the source.
 * @param groupIds - Groups to remove labels for. Sent in the request body.
 */
export const deleteSourceLabels = async (
    client: Http.Client,
    objId: string,
    groupIds: ReadonlyArray<number>
): Promise<void> => {
    await Http.del(client, `/api/sources/${objId}/labels`, { groupIds });
};

/**
 * Options for a color/absolute-magnitude lookup.
 *
 * All key options are matched against annotation keys ignoring case and
 * underscores.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchSourceColorMagOptions {
    /** Partial match on the annotation origin. Defaults to `"GAIA"`. */
    readonly catalog?: string | undefined;
    /**
     * Annotation key holding the apparent magnitude. Defaults to `"Mag_G"`.
     */
    readonly apparentMagKey?: string | undefined;
    /**
     * Annotation key holding the parallax, used with the apparent magnitude to
     * derive the absolute magnitude. Defaults to `"Plx"`.
     */
    readonly parallaxKey?: string | undefined;
    /**
     * Annotation key holding the absorption term added to the derived absolute
     * magnitude. Defaults to `"A_G"`.
     */
    readonly absorptionKey?: string | undefined;
    /**
     * Annotation key holding the absolute magnitude directly; overrides
     * `apparentMagKey`, `parallaxKey` and `absorptionKey`.
     */
    readonly absoluteMagKey?: string | undefined;
    /**
     * Annotation keys differenced to form the color. Default to `"Mag_Bp"` and
     * `"Mag_Rp"`.
     */
    readonly blueMagKey?: string | undefined;
    readonly redMagKey?: string | undefined;
    /**
     * Annotation key holding the color directly; overrides `blueMagKey` and
     * `redMagKey`.
     */
    readonly colorKey?: string | undefined;
}

/**
 * Retrieve a source's color and absolute magnitude from cross-match
 * annotations.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the source.
 */
export const fetchSourceColorMag = async (
    client: Http.Client,
    objId: string,
    options: FetchSourceColorMagOptions = {}
): Promise<Array<SourceColorMag>> =>
    Http.decode(
        v.array(SourceColorMag),
        await Http.get(client, `/api/sources/${objId}/color_mag`, {
            catalog: options.catalog,
            apparentMagKey: options.apparentMagKey,
            parallaxKey: options.parallaxKey,
            absorptionKey: options.absorptionKey,
            absoluteMagKey: options.absoluteMagKey,
            blueMagKey: options.blueMagKey,
            redMagKey: options.redMagKey,
            colorKey: options.colorKey,
        })
    );

/**
 * Crossmatch a source against GCN events in a date range.
 *
 * The crossmatch runs in the background; the call returns as soon as it is
 * queued.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the source.
 * @param payload - Date range, probability contour, and GCN/localization
 *   filters.
 */
export const postSourceGcnEventCrossmatch = async (
    client: Http.Client,
    objId: string,
    payload: SourceGcnEventCrossmatchPost
): Promise<void> => {
    await Http.post(client, `/api/sources/${objId}/gcn_event`, Http.body(payload));
};

/**
 * Query the Minor Planet Center for known minor planets at a source's position.
 *
 * The query runs in the background; on a match the object is flagged as a
 * solar system object and its MPC name and alias are stored.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the source.
 * @param payload - Query settings.
 */
export const postSourceMpcQuery = async (
    client: Http.Client,
    objId: string,
    payload: SourceMpcQueryPost = {}
): Promise<void> => {
    await Http.post(client, `/api/sources/${objId}/mpc`, Http.body(payload));
};

/**
 * Options for a TNS lookup.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchSourceTnsOptions {
    /**
     * Cone-search radius in arcseconds; must be non-negative. Defaults to 2.0.
     */
    readonly radius?: number | undefined;
}

/**
 * Look up a source on the Transient Name Server.
 *
 * The lookup runs in the background and stores the result on the object; the
 * call returns as soon as it is queued.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the source.
 */
export const fetchSourceTns = async (
    client: Http.Client,
    objId: string,
    options: FetchSourceTnsOptions = {}
): Promise<void> => {
    await Http.get(client, `/api/sources/${objId}/tns`, { radius: options.radius ?? 2 });
};

/**
 * Options for a source observability plot.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchSourceObservabilityOptions {
    /** Maximum airmass to consider. Defaults to 2.5. */
    readonly maxAirmass?: number | undefined;
    /**
     * Twilight definition, one of `"astronomical"` (-18 degrees),
     * `"nautical"` (-12 degrees), or `"civil"` (-6 degrees). Defaults to
     * `"astronomical"`.
     */
    readonly twilight?: string | undefined;
}

/**
 * Generate an observability plot for a source, as a PDF file.
 *
 * The plot covers the next 24 hours for every fixed-location telescope the
 * token can see.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the source.
 */
export const fetchSourceObservability = (
    client: Http.Client,
    objId: string,
    options: FetchSourceObservabilityOptions = {}
): Promise<Uint8Array> =>
    Http.getContent(client, `/api/sources/${objId}/observability`, {
        maxAirmass: options.maxAirmass ?? 2.5,
        twilight: options.twilight ?? "astronomical",
    });

/**
 * Copy every photometry point from one source onto another.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the target source, which the photometry is copied
 *   to.
 * @param originId - Object ID of the source the photometry is copied from.
 * @param groupIds - Groups to give access to the copied photometry.
 */
export const postSourcePhotometryCopy = async (
    client: Http.Client,
    objId: string,
    originId: string,
    groupIds: ReadonlyArray<number>
): Promise<void> => {
    await Http.post(client, `/api/sources/${objId}/copy_photometry`, {
        origin_id: originId,
        group_ids: groupIds,
    });
};

/**
 * Retrieve the photometry statistics of a source.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the source.
 */
export const fetchSourcePhotStat = async (client: Http.Client, objId: string): Promise<PhotStat> =>
    Http.decode(PhotStat, await Http.get(client, `/api/sources/${objId}/phot_stat`));

/**
 * Calculate and store photometry statistics for a source.
 *
 * Requires system admin permissions, and fails if statistics already exist for
 * the object.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the source.
 */
export const postSourcePhotStat = async (client: Http.Client, objId: string): Promise<void> => {
    await Http.post(client, `/api/sources/${objId}/phot_stat`);
};

/**
 * Recalculate a source's photometry statistics, creating them if absent.
 *
 * Requires system admin permissions.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the source.
 */
export const updateSourcePhotStat = async (client: Http.Client, objId: string): Promise<void> => {
    await Http.put(client, `/api/sources/${objId}/phot_stat`);
};

/**
 * Delete a source's photometry statistics.
 *
 * Requires system admin permissions.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the source.
 */
export const deleteSourcePhotStat = async (client: Http.Client, objId: string): Promise<void> => {
    await Http.del(client, `/api/sources/${objId}/phot_stat`);
};

/**
 * Options bounding a photometry-statistics query by time.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PhotStatsTimeOptions {
    /** Arrow-parseable times bounding object creation. */
    readonly createdAtStartTime?: string | undefined;
    readonly createdAtEndTime?: string | undefined;
    /**
     * Arrow-parseable times bounding the last statistics update of any kind.
     */
    readonly quickUpdateStartTime?: string | undefined;
    readonly quickUpdateEndTime?: string | undefined;
    /**
     * Arrow-parseable times bounding the last full statistics update.
     */
    readonly fullUpdateStartTime?: string | undefined;
    readonly fullUpdateEndTime?: string | undefined;
}

/** @internal */
const photStatsTimeParams = (options: PhotStatsTimeOptions): Http.QueryParams => ({
    createdAtStartTime: options.createdAtStartTime,
    createdAtEndTime: options.createdAtEndTime,
    quickUpdateStartTime: options.quickUpdateStartTime,
    quickUpdateEndTime: options.quickUpdateEndTime,
    fullUpdateStartTime: options.fullUpdateStartTime,
    fullUpdateEndTime: options.fullUpdateEndTime,
});

/**
 * Count the objects with and without photometry statistics.
 *
 * Requires system admin permissions.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchPhotStatsCounts = async (
    client: Http.Client,
    options: PhotStatsTimeOptions = {}
): Promise<PhotStatCounts> =>
    Http.decode(PhotStatCounts, await Http.get(client, "/api/phot_stats", photStatsTimeParams(options)));

/**
 * Options for a photometry-statistics creation batch.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PostPhotStatsOptions {
    /**
     * Pagination controls over the objects without statistics; `numPerPage` is
     * capped server-side at 500.
     */
    readonly pageNumber?: number | undefined;
    readonly numPerPage?: number | undefined;
    /** Arrow-parseable times bounding object creation. */
    readonly createdAtStartTime?: string | undefined;
    readonly createdAtEndTime?: string | undefined;
}

/**
 * Calculate photometry statistics for a page of objects that lack them.
 *
 * Requires system admin permissions.
 *
 * @since 1.0.0
 * @category Requests
 */
export const postPhotStats = async (client: Http.Client, options: PostPhotStatsOptions = {}): Promise<PhotStatsBatch> =>
    Http.decode(
        PhotStatsBatch,
        await Http.post(client, "/api/phot_stats", undefined, {
            pageNumber: options.pageNumber ?? 1,
            numPerPage: options.numPerPage ?? 100,
            createdAtStartTime: options.createdAtStartTime,
            createdAtEndTime: options.createdAtEndTime,
        })
    );

/**
 * Options for a photometry-statistics refresh batch.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpdatePhotStatsOptions extends PhotStatsTimeOptions {
    /** Pagination controls; `numPerPage` is capped server-side at 500. */
    readonly pageNumber?: number | undefined;
    readonly numPerPage?: number | undefined;
}

/**
 * Recalculate photometry statistics for a page of objects that have them.
 *
 * Requires system admin permissions.
 *
 * @since 1.0.0
 * @category Requests
 */
export const updatePhotStats = async (
    client: Http.Client,
    options: UpdatePhotStatsOptions = {}
): Promise<PhotStatsBatch> =>
    Http.decode(
        PhotStatsBatch,
        await Http.patch(client, "/api/phot_stats", undefined, {
            pageNumber: options.pageNumber ?? 1,
            numPerPage: options.numPerPage ?? 100,
            ...photStatsTimeParams(options),
        })
    );

/**
 * Options for the bulk photometry-statistics query.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchPhotStatsAggregateOptions {
    /**
     * Photometry-statistics fields for the x and y axes; both are required to
     * get any points back.
     */
    readonly xField?: string | undefined;
    readonly yField?: string | undefined;
    /** Optional third axis. */
    readonly zField?: string | undefined;
    /** Restrict to sources carrying any of these classification names. */
    readonly classifications?: ReadonlyArray<string> | undefined;
    /** Only count classifications at or above this probability. */
    readonly classificationProbThreshold?: number | undefined;
    /** Restrict to sources saved to this group. */
    readonly groupId?: number | undefined;
    /** Restrict to these objects. */
    readonly objIds?: ReadonlyArray<string> | undefined;
    /**
     * Maximum number of points to return. Defaults to 20000 server-side and is
     * capped at 100000; the response flags truncation.
     */
    readonly maxMatches?: number | undefined;
}

/**
 * Retrieve photometry statistics across many sources, for bulk plotting.
 *
 * Called without `xField` and `yField`, the response holds only the list of
 * plottable fields.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchPhotStatsAggregate = async (
    client: Http.Client,
    options: FetchPhotStatsAggregateOptions = {}
): Promise<PhotStatAggregate> =>
    Http.decode(
        PhotStatAggregate,
        await Http.get(client, "/api/phot_stats/aggregate", {
            xField: options.xField,
            yField: options.yField,
            zField: options.zField,
            classifications: Http.commaSeparated(options.classifications),
            classificationProbThreshold: options.classificationProbThreshold,
            group_id: options.groupId,
            obj_ids: Http.commaSeparated(options.objIds),
            maxMatches: options.maxMatches,
        })
    );

/**
 * Options for an existence check by position.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchSourceExistsOptions {
    /** Object ID to look for. */
    readonly objId?: string | undefined;
    /** Cone search in decimal degrees; provide all three together. */
    readonly ra?: number | undefined;
    readonly dec?: number | undefined;
    readonly radius?: number | undefined;
}

/**
 * Check whether a source already exists by name or by position.
 *
 * Provide `objId`, or all of `ra`, `dec` and `radius`, or both: with both, a
 * name match short-circuits and a position match is tried otherwise.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchSourceExists = async (
    client: Http.Client,
    options: FetchSourceExistsOptions = {}
): Promise<SourceExists> =>
    Http.decode(
        SourceExists,
        await Http.get(
            client,
            options.objId === undefined ? "/api/source_exists" : `/api/source_exists/${options.objId}`,
            { ra: options.ra, dec: options.dec, radius: options.radius }
        )
    );

/**
 * Notify the members of some groups about a source.
 *
 * Requires notifications to be enabled on the deployment, and the token must
 * belong to every group the source is being announced to.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - Source, recipient groups, and notification level.
 */
export const postSourceNotification = async (
    client: Http.Client,
    payload: SourceNotificationPost
): Promise<SourceNotificationPostResponse> =>
    Http.decode(
        SourceNotificationPostResponse,
        await Http.post(client, "/api/source_notifications", Http.body(payload))
    );
