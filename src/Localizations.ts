/**
 * Typed endpoint functions for `/api/localization`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";
import * as Users from "./Users.ts";

/**
 * Properties parsed from a localization (upstream `LocalizationProperty`).
 *
 * `localization` stays free-form: typing it would make the model recursive
 * through {@link Localization}, which owns this one.
 *
 * @since 1.0.0
 * @category Models
 */
export const LocalizationProperty = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        sent_by_id: Schemas.NullishInteger,
        localization_id: Schemas.NullishInteger,
        data: Schemas.nullish(Schemas.JsonObject),
        sent_by: Schemas.nullish(Users.User),
        localization: Schemas.nullish(Schemas.JsonObject),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type LocalizationProperty = v.InferOutput<typeof LocalizationProperty>;

/**
 * A qualitative tag on a localization (upstream `LocalizationTag`).
 *
 * `localization` stays free-form: typing it would make the model recursive
 * through {@link Localization}, which owns this one.
 *
 * @since 1.0.0
 * @category Models
 */
export const LocalizationTag = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        sent_by_id: Schemas.NullishInteger,
        localization_id: Schemas.NullishInteger,
        text: Schemas.NullishString,
        sent_by: Schemas.nullish(Users.User),
        localization: Schemas.nullish(Schemas.JsonObject),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type LocalizationTag = v.InferOutput<typeof LocalizationTag>;

/**
 * The center of a localization (upstream `Localization.center`).
 *
 * `ebv` is the Schlegel-Finkbeiner-Davis reddening at that position and is
 * null when the dust map lookup fails.
 *
 * @since 1.0.0
 * @category Models
 */
export const LocalizationCenter = Schemas.model(
    v.strictObject({
        ra: Schemas.NullishNumber,
        dec: Schemas.NullishNumber,
        gal_lat: Schemas.NullishNumber,
        gal_lon: Schemas.NullishNumber,
        ebv: Schemas.NullishNumber,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type LocalizationCenter = v.InferOutput<typeof LocalizationCenter>;

/**
 * The fields of a {@link Localization}.
 *
 * @since 1.0.0
 * @category Models
 */
export const LocalizationEntries = {
    id: Schemas.Integer,
    created_at: Schemas.NullishTimestamp,
    modified: Schemas.NullishTimestamp,
    sent_by_id: Schemas.NullishInteger,
    dateobs: Schemas.NullishTimestamp,
    localization_name: Schemas.NullishString,
    uniq: Schemas.nullish(v.array(Schemas.Integer)),
    probdensity: Schemas.nullish(v.array(v.number())),
    distmu: Schemas.nullish(v.array(v.nullable(v.number()))),
    distsigma: Schemas.nullish(v.array(v.nullable(v.number()))),
    distnorm: Schemas.nullish(v.array(v.nullable(v.number()))),
    contour: Schemas.nullish(Schemas.JsonObject),
    notice_id: Schemas.NullishInteger,
    flat_2d: Schemas.nullish(v.array(v.number())),
    sent_by: Schemas.nullish(Users.User),
    gcnevent: Schemas.nullish(Schemas.JsonObject),
    properties: Schemas.nullish(v.array(LocalizationProperty)),
    tags: Schemas.nullish(v.array(LocalizationTag)),
    observationplan_requests: Schemas.nullish(v.array(Schemas.JsonObject)),
    survey_efficiency_analyses: Schemas.nullish(v.array(Schemas.JsonObject)),
};

/**
 * A GCN event localization (upstream `Localization`).
 *
 * `uniq`, `probdensity`, `distmu`, `distsigma`, `distnorm` and `contour` are
 * deferred server-side, so each is only present when the handler undefers it;
 * the distance arrays are undeferred only by the single-localization endpoint.
 * `flat_2d` is the rasterized 2D skymap that endpoint injects when
 * `include2DMap` is set. `gcnevent`, `observationplan_requests` and
 * `survey_efficiency_analyses` stay free-form: those upstream models point
 * back at `Localization`, so typing them would create an import cycle. The
 * `_localization_path` column is never serialized.
 *
 * @since 1.0.0
 * @category Models
 */
export const Localization = Schemas.model(v.strictObject(LocalizationEntries));

/**
 * @since 1.0.0
 * @category Models
 */
export type Localization = v.InferOutput<typeof Localization>;

/**
 * Options for retrieving a localization.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchLocalizationOptions {
    /**
     * Include the flattened 2D skymap (`flat_2d`) in the response. Defaults to
     * false server-side.
     */
    readonly include2DMap?: boolean | undefined;
}

/**
 * Retrieve a GCN localization by event time and name.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the GCN event, e.g.
 *   `"2023-05-23T12:00:00"`.
 * @param localizationName - Name of the localization, e.g.
 *   `"bayestar.fits.gz"`.
 */
export const fetchLocalization = async (
    client: Http.Client,
    dateobs: string,
    localizationName: string,
    options: FetchLocalizationOptions = {}
): Promise<Localization> =>
    Http.decode(
        Localization,
        await Http.get(client, `/api/localization/${dateobs}/name/${localizationName}`, {
            include2DMap: options.include2DMap ?? false,
        })
    );

/**
 * Delete a GCN localization.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the GCN event.
 * @param localizationName - Name of the localization to delete.
 */
export const deleteLocalization = async (
    client: Http.Client,
    dateobs: string,
    localizationName: string
): Promise<void> => {
    await Http.del(client, `/api/localization/${dateobs}/name/${localizationName}`);
};

/**
 * Ingest the skymap referenced by an existing GCN notice.
 *
 * The server reads the stored notice content and posts the skymap it
 * references as a new localization. Fails with a conflict if that localization
 * already exists, or 404 if the notice has no available skymap (e.g. a
 * retraction).
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the GCN event the notice belongs to.
 * @param noticeId - ID of the GCN notice to ingest the skymap from.
 */
export const postLocalizationFromNotice = async (
    client: Http.Client,
    dateobs: string,
    noticeId: number
): Promise<void> => {
    await Http.post(client, `/api/localization/${dateobs}/notice/${noticeId}`);
};

/**
 * Download a localization's skymap as a FITS file.
 *
 * @since 1.0.0
 * @category Requests
 * @param dateobs - UTC event timestamp of the GCN event.
 * @param localizationName - Name of the localization to download.
 */
export const fetchLocalizationSkymap = (
    client: Http.Client,
    dateobs: string,
    localizationName: string
): Promise<Uint8Array> => Http.getContent(client, `/api/localization/${dateobs}/name/${localizationName}/download`);

/**
 * Retrieve all distinct localization tags.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchLocalizationTags = async (client: Http.Client): Promise<Array<string>> =>
    Http.decode(v.array(v.string()), await Http.get(client, "/api/localization/tags"));

/**
 * Retrieve all distinct localization property names, sorted.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchLocalizationProperties = async (client: Http.Client): Promise<Array<string>> =>
    Http.decode(v.array(v.string()), await Http.get(client, "/api/localization/properties"));

/**
 * Crossmatch two localizations, returning the intersection as FITS.
 *
 * The server multiplies the two flattened skymaps, renormalizes, and returns
 * the product as a multi-order FITS skymap.
 *
 * @since 1.0.0
 * @category Requests
 * @param id1 - ID of the first localization to crossmatch.
 * @param id2 - ID of the second localization to crossmatch.
 */
export const fetchLocalizationCrossmatch = (client: Http.Client, id1: number, id2: number): Promise<Uint8Array> =>
    Http.getContent(client, "/api/localizationcrossmatch", { id1, id2 });

/**
 * Options for the observability and world map plots.
 *
 * @since 1.0.0
 * @category Models
 */
export interface LocalizationPlotOptions {
    /** Maximum airmass to consider. Server default is 2.5. */
    readonly maxAirmass?: number | undefined;
    /**
     * Twilight definition: `"astronomical"` (-18 deg, server default),
     * `"nautical"` (-12 deg), or `"civil"` (-6 deg).
     */
    readonly twilight?: string | undefined;
}

/**
 * Download an observability summary plot (PDF) for a localization.
 *
 * Charts when each fixed-location telescope can observe the localization's
 * contour center over the day after the event.
 *
 * @since 1.0.0
 * @category Requests
 * @param localizationId - ID of the localization to plot observability for.
 */
export const fetchLocalizationObservabilityPlot = (
    client: Http.Client,
    localizationId: number,
    options: LocalizationPlotOptions = {}
): Promise<Uint8Array> =>
    Http.getContent(client, `/api/localization/${localizationId}/observability`, {
        maxAirmass: options.maxAirmass,
        twilight: options.twilight,
    });

/**
 * Download an airmass chart (PDF) for a localization at a telescope.
 *
 * @since 1.0.0
 * @category Requests
 * @param localizationId - ID of the localization to chart.
 * @param telescopeId - ID of the telescope to compute the airmass for.
 */
export const fetchLocalizationAirmassChart = (
    client: Http.Client,
    localizationId: number,
    telescopeId: number
): Promise<Uint8Array> => Http.getContent(client, `/api/localization/${localizationId}/airmass/${telescopeId}`);

/**
 * Download a world map plot (PDF) of telescope observability.
 *
 * Shows every fixed-location telescope on a world map, colored by the
 * probability of the localization region it can observe at event time.
 *
 * @since 1.0.0
 * @category Requests
 * @param localizationId - ID of the localization to generate the map for.
 */
export const fetchLocalizationWorldmapPlot = (
    client: Http.Client,
    localizationId: number,
    options: LocalizationPlotOptions = {}
): Promise<Uint8Array> =>
    Http.getContent(client, `/api/localization/${localizationId}/worldmap`, {
        maxAirmass: options.maxAirmass,
        twilight: options.twilight,
    });
