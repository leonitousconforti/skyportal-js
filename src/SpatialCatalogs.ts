/**
 * Typed endpoint functions for `/api/spatial_catalog`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";

/**
 * An entry in a spatial catalog (upstream `SpatialCatalogEntry`).
 *
 * `uniq` and `probdensity` are deferred columns upstream, so they are absent
 * unless a query explicitly undefers them. The `catalog` back-reference is
 * never populated by a load, so it is not declared.
 *
 * @since 1.0.0
 * @category Models
 */
export const SpatialCatalogEntry = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        catalog_id: Schemas.NullishInteger,
        entry_name: Schemas.NullishString,
        /**
         * The cone (`ra`, `dec`, `radius`) or ellipse (`ra`, `dec`, `amaj`,
         * `amin`, `phi`) the entry's skymap was generated from.
         */
        data: Schemas.nullish(Schemas.JsonObject),
        uniq: Schemas.nullish(v.array(Schemas.Integer)),
        probdensity: Schemas.nullish(v.array(v.number())),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SpatialCatalogEntry = v.InferOutput<typeof SpatialCatalogEntry>;

/**
 * A spatial catalog of skymap regions (upstream `SpatialCatalog`).
 *
 * `entries` is only populated by the single-catalog endpoint, and
 * `entries_count` is injected only by the list endpoint.
 *
 * @since 1.0.0
 * @category Models
 */
export const SpatialCatalog = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        catalog_name: Schemas.NullishString,
        entries: Schemas.nullish(v.array(SpatialCatalogEntry)),
        entries_count: Schemas.NullishInteger,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SpatialCatalog = v.InferOutput<typeof SpatialCatalog>;

/**
 * Result of ingesting a spatial catalog.
 *
 * @since 1.0.0
 * @category Models
 */
export const SpatialCatalogPostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type SpatialCatalogPostResponse = v.InferOutput<typeof SpatialCatalogPostResponse>;

/**
 * Retrieve a single spatial catalog, including its entries.
 *
 * @since 1.0.0
 * @category Requests
 * @param catalogId - ID of the spatial catalog.
 */
export const fetchSpatialCatalog = async (client: Http.Client, catalogId: number): Promise<SpatialCatalog> =>
    Http.decode(SpatialCatalog, await Http.get(client, `/api/spatial_catalog/${catalogId}`));

/**
 * Retrieve all spatial catalogs, each with its entry count.
 *
 * The returned catalogs carry `entries_count` but not the entries themselves;
 * use {@link fetchSpatialCatalog} for the entries.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchSpatialCatalogs = async (client: Http.Client): Promise<Array<SpatialCatalog>> =>
    Http.decode(v.array(SpatialCatalog), await Http.get(client, "/api/spatial_catalog"));

/**
 * Ingest a spatial catalog.
 *
 * The entry ingestion runs asynchronously on the server; the returned ID is
 * available immediately but the entries may take a while to appear.
 *
 * @since 1.0.0
 * @category Requests
 * @param catalogName - Name of the spatial catalog. Reused if it already exists.
 * @param catalogData - Maps column names to equal-length lists. `name`, `ra`,
 *   and `dec` are required, with `ra` in `[0, 360)` degrees and `dec` in
 *   `[-90, 90]` degrees. Either `radius` (cone) or `amaj`, `amin`, and `phi`
 *   (ellipse) are also required.
 */
export const postSpatialCatalog = async (
    client: Http.Client,
    catalogName: string,
    catalogData: Record<string, ReadonlyArray<unknown>>
): Promise<SpatialCatalogPostResponse> =>
    Http.decode(
        SpatialCatalogPostResponse,
        await Http.post(client, "/api/spatial_catalog", {
            catalog_name: catalogName,
            catalog_data: catalogData,
        })
    );

/**
 * Delete a spatial catalog.
 *
 * The deletion runs asynchronously on the server; a success response only
 * means the deletion was started.
 *
 * @since 1.0.0
 * @category Requests
 * @param catalogId - ID of the spatial catalog to delete.
 */
export const deleteSpatialCatalog = async (client: Http.Client, catalogId: number): Promise<void> => {
    await Http.del(client, `/api/spatial_catalog/${catalogId}`);
};

/**
 * Upload a spatial catalog from an ASCII file.
 *
 * Requires the Upload data ACL. The entry ingestion runs asynchronously on the
 * server; the returned ID is available immediately but the entries may take a
 * while to appear.
 *
 * @since 1.0.0
 * @category Requests
 * @param catalogName - Name of the spatial catalog. Reused if it already exists.
 * @param catalogData - File content as a comma-separated ASCII table. `name`,
 *   `ra`, and `dec` columns are required, plus either `radius` (cone) or
 *   `amaj`, `amin`, and `phi` (ellipse).
 */
export const postSpatialCatalogAscii = async (
    client: Http.Client,
    catalogName: string,
    catalogData: string
): Promise<SpatialCatalogPostResponse> =>
    Http.decode(
        SpatialCatalogPostResponse,
        await Http.post(client, "/api/spatial_catalog/ascii", {
            catalogName,
            catalogData,
        })
    );
