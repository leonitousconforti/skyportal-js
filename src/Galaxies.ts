/**
 * Typed endpoint functions for `/api/galaxy_catalog`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";

/**
 * A galaxy from a galaxy catalog (upstream `Galaxy`).
 *
 * `objects` (the objects this galaxy is the host of) stays as raw JSON:
 * {@link skyportal-js/Sources!Source} nests `Galaxy`, so typing it would be a
 * cycle.
 *
 * @since 1.0.0
 * @category Models
 */
export const Galaxy = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        catalog_id: Schemas.NullishInteger,
        name: Schemas.NullishString,
        alt_name: Schemas.NullishString,
        ra: Schemas.NullishNumber,
        dec: Schemas.NullishNumber,
        healpix: Schemas.NullishInteger,
        distmpc: Schemas.NullishNumber,
        distmpc_unc: Schemas.NullishNumber,
        redshift: Schemas.NullishNumber,
        redshift_error: Schemas.NullishNumber,
        sfr_fuv: Schemas.NullishNumber,
        sfr_w4: Schemas.NullishNumber,
        mstar: Schemas.NullishNumber,
        magb: Schemas.NullishNumber,
        magk: Schemas.NullishNumber,
        mag_fuv: Schemas.NullishNumber,
        mag_nuv: Schemas.NullishNumber,
        mag_w1: Schemas.NullishNumber,
        mag_w2: Schemas.NullishNumber,
        mag_w3: Schemas.NullishNumber,
        mag_w4: Schemas.NullishNumber,
        a: Schemas.NullishNumber,
        b2a: Schemas.NullishNumber,
        pa: Schemas.NullishNumber,
        btc: Schemas.NullishNumber,
        objects: Schemas.nullish(v.array(Schemas.JsonObject)),
        /** Injected by the handler when `returnProbability` is requested. */
        probability: Schemas.NullishNumber,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type Galaxy = v.InferOutput<typeof Galaxy>;

/**
 * One page of results from a galaxy catalog query.
 *
 * Hand-built by the handler, which strips keys whose value is `null`, so
 * `sortBy`/`sortOrder` are absent unless they were requested and `geojson` is
 * only present when `includeGeoJSON` was set.
 *
 * @since 1.0.0
 * @category Models
 */
export const GalaxiesPage = Schemas.model(
    v.strictObject({
        galaxies: Schemas.list(Galaxy),
        totalMatches: v.optional(Schemas.Integer, 0),
        sortBy: Schemas.NullishString,
        sortOrder: Schemas.NullishString,
        page: Schemas.NullishInteger,
        numPerPage: Schemas.NullishInteger,
        geojson: Schemas.nullish(Schemas.JsonObject),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type GalaxiesPage = v.InferOutput<typeof GalaxiesPage>;

/**
 * A galaxy catalog name with its galaxy count.
 *
 * Hand-built by the handler from an upstream `GalaxyCatalog` plus a count of
 * its galaxies; the catalog's description and URL are not returned.
 *
 * @since 1.0.0
 * @category Models
 */
export const GalaxyCatalogCount = Schemas.model(
    v.strictObject({
        catalog_name: v.string(),
        catalog_count: Schemas.NullishInteger,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type GalaxyCatalogCount = v.InferOutput<typeof GalaxyCatalogCount>;

/**
 * Payload for ingesting a galaxy catalog.
 *
 * The upstream OpenAPI schema documents `catalog_data` as a list of objects,
 * but the handler indexes it by column name, so it is really a map of
 * equal-length column lists. `ra`, `dec`, and `name` are required columns,
 * with `ra` in `[0, 360)` degrees and `dec` in `[-90, 90]` degrees.
 *
 * @since 1.0.0
 * @category Models
 */
export interface GalaxyCatalogPost {
    readonly catalog_name: string;
    readonly catalog_data: Record<string, ReadonlyArray<unknown>>;
    readonly catalog_description?: string | undefined;
    readonly catalog_url?: string | undefined;
}

/**
 * Payload for uploading a galaxy catalog from an ASCII file.
 *
 * `catalogData` is the file content as a comma-separated ASCII table with
 * `ra`, `dec`, and `name` columns required.
 *
 * @since 1.0.0
 * @category Models
 */
export interface GalaxyCatalogAsciiPost {
    readonly catalogName: string;
    readonly catalogData: string;
    readonly catalogDescription?: string | undefined;
    readonly catalogURL?: string | undefined;
}

/**
 * Options for querying galaxies.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchGalaxiesOptions {
    /** Restrict to this catalog (exact name match). */
    readonly catalogName?: string | undefined;
    /** Restrict to galaxies whose name contains this string. */
    readonly galaxyName?: string | undefined;
    /** Cone-search filter, all in degrees; provide all three together. */
    readonly ra?: number | undefined;
    readonly dec?: number | undefined;
    readonly radius?: number | undefined;
    /** Redshift range filter. */
    readonly minRedshift?: number | undefined;
    readonly maxRedshift?: number | undefined;
    /** Distance range filter, in Mpc. */
    readonly minDistance?: number | undefined;
    readonly maxDistance?: number | undefined;
    /** Stellar-mass range filter. */
    readonly minMstar?: number | undefined;
    readonly maxMstar?: number | undefined;
    /**
     * Restrict to galaxies inside the localization of the GCN event at this
     * time, ISO 8601 format (`YYYY-MM-DDTHH:MM:SS.sss`).
     */
    readonly localizationDateobs?: string | undefined;
    /** Name of the localization / skymap to use. */
    readonly localizationName?: string | undefined;
    /**
     * Cumulative probability up to which to include galaxies. Server default
     * is 0.95.
     */
    readonly localizationCumprob?: number | undefined;
    /** Include an associated GeoJSON feature collection in the response. */
    readonly includeGeoJSON?: boolean | undefined;
    /** Include the localization probability density for each galaxy. */
    readonly returnProbability?: boolean | undefined;
    /**
     * Column to sort by; one of `distmpc`, `redshift`, `name`, `mstar`,
     * `prob`, `mstar_prob_weighted`, `sfr_fuv`, `magb`, `magk`. Sorting by
     * `prob` or `mstar_prob_weighted` requires `localizationDateobs`.
     */
    readonly sortBy?: string | undefined;
    /** `"asc"` or `"desc"`; required when `sortBy` is provided. */
    readonly sortOrder?: string | undefined;
    /** Pagination controls. `numPerPage` can be no larger than 10000. */
    readonly pageNumber?: number | undefined;
    readonly numPerPage?: number | undefined;
}

/**
 * Query galaxies from the galaxy catalogs, one page at a time.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchGalaxies = async (client: Http.Client, options: FetchGalaxiesOptions = {}): Promise<GalaxiesPage> =>
    Http.decode(
        GalaxiesPage,
        await Http.get(client, "/api/galaxy_catalog", {
            pageNumber: options.pageNumber ?? 1,
            numPerPage: options.numPerPage ?? 1000,
            catalog_name: options.catalogName,
            galaxyName: options.galaxyName,
            ra: options.ra,
            dec: options.dec,
            radius: options.radius,
            minRedshift: options.minRedshift,
            maxRedshift: options.maxRedshift,
            minDistance: options.minDistance,
            maxDistance: options.maxDistance,
            minMstar: options.minMstar,
            maxMstar: options.maxMstar,
            localizationDateobs: options.localizationDateobs,
            localizationName: options.localizationName,
            localizationCumprob: options.localizationCumprob,
            includeGeoJSON: options.includeGeoJSON === true ? true : undefined,
            returnProbability: options.returnProbability === true ? true : undefined,
            sortBy: options.sortBy,
            sortOrder: options.sortOrder,
        })
    );

/**
 * Retrieve the galaxy catalog names and their galaxy counts.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchGalaxyCatalogs = async (client: Http.Client): Promise<Array<GalaxyCatalogCount>> =>
    Http.decode(v.array(GalaxyCatalogCount), await Http.get(client, "/api/galaxy_catalog", { catalogNamesOnly: true }));

/**
 * Ingest a galaxy catalog. Requires the System admin ACL.
 *
 * The ingestion runs asynchronously on the server; a success response only
 * means the ingestion was started.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The catalog to ingest.
 */
export const postGalaxyCatalog = async (client: Http.Client, payload: GalaxyCatalogPost): Promise<void> => {
    await Http.post(client, "/api/galaxy_catalog", Http.body(payload));
};

/**
 * Delete a galaxy catalog. Requires the System admin ACL.
 *
 * The deletion runs asynchronously on the server; a success response only
 * means the deletion was started.
 *
 * @since 1.0.0
 * @category Requests
 * @param catalogName - Name of the galaxy catalog to delete.
 */
export const deleteGalaxyCatalog = async (client: Http.Client, catalogName: string): Promise<void> => {
    await Http.del(client, `/api/galaxy_catalog/${catalogName}`);
};

/**
 * Upload galaxies from an ASCII file. Requires the Upload data ACL.
 *
 * The ingestion runs asynchronously on the server; a success response only
 * means the ingestion was started.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The catalog to upload.
 */
export const postGalaxyCatalogAscii = async (client: Http.Client, payload: GalaxyCatalogAsciiPost): Promise<void> => {
    await Http.post(client, "/api/galaxy_catalog/ascii", Http.body(payload));
};

/**
 * Options for ingesting a packaged galaxy catalog from a FITS file.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PostGalaxyCatalogFileOptions {
    /**
     * Name of the `.fits` file in the server's data directory. If neither
     * `fileName` nor `fileUrl` is provided, the server looks for its own
     * default file.
     */
    readonly fileName?: string | undefined;
    /** URL of the `.fits` file containing the galaxies. */
    readonly fileUrl?: string | undefined;
}

/**
 * Ingest the REGALADE galaxy catalog. Requires the System Admin ACL.
 *
 * The ingestion runs asynchronously on the server; a success response only
 * means the ingestion was started. The server's default file is
 * `regalade_v2.fits`.
 *
 * @since 1.0.0
 * @category Requests
 */
export const postGalaxyCatalogRegalade = async (
    client: Http.Client,
    options: PostGalaxyCatalogFileOptions = {}
): Promise<void> => {
    await Http.post(
        client,
        "/api/galaxy_catalog/regalade",
        Http.body({ file_name: options.fileName, file_url: options.fileUrl })
    );
};

/**
 * Ingest the NEDLVS galaxy catalog. Requires the System Admin ACL.
 *
 * The ingestion runs asynchronously on the server; a success response only
 * means the ingestion was started. The server's default file is
 * `NEDLVS_20260424.fits`.
 *
 * @since 1.0.0
 * @category Requests
 */
export const postGalaxyCatalogNed = async (
    client: Http.Client,
    options: PostGalaxyCatalogFileOptions = {}
): Promise<void> => {
    await Http.post(
        client,
        "/api/galaxy_catalog/ned",
        Http.body({ file_name: options.fileName, file_url: options.fileUrl })
    );
};
