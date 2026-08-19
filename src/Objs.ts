/**
 * Typed endpoint functions for `/api/objs` and related endpoints.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";

/**
 * A photometry-derived position for an object (upstream `Obj`).
 *
 * @since 1.0.0
 * @category Models
 */
export const ObjPosition = Schemas.model(
    v.strictObject({
        ra: Schemas.NullishNumber,
        dec: Schemas.NullishNumber,
        gal_lon: Schemas.NullishNumber,
        gal_lat: Schemas.NullishNumber,
        ebv: Schemas.NullishNumber,
        separation: Schemas.NullishNumber,
        discovery_ra: Schemas.NullishNumber,
        discovery_dec: Schemas.NullishNumber,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type ObjPosition = v.InferOutput<typeof ObjPosition>;

/**
 * An object linked to a super-object, with its position (upstream `Obj`).
 *
 * @since 1.0.0
 * @category Models
 */
export const SuperObjMember = Schemas.model(
    v.strictObject({
        id: v.string(),
        ra: Schemas.NullishNumber,
        dec: Schemas.NullishNumber,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SuperObjMember = v.InferOutput<typeof SuperObjMember>;

/**
 * Several objects that are one astrophysical source (upstream `SuperObj`).
 *
 * The handler builds this dict by hand: `modified` and the full `Obj` rows
 * behind `objs` exist upstream but are not returned.
 *
 * @since 1.0.0
 * @category Models
 */
export const SuperObj = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        name: Schemas.NullishString,
        is_roid: Schemas.NullishBoolean,
        created_at: Schemas.NullishTimestamp,
        objs: Schemas.list(SuperObjMember),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SuperObj = v.InferOutput<typeof SuperObj>;

/**
 * Result of creating a super-object.
 *
 * @since 1.0.0
 * @category Models
 */
export const SuperObjPostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type SuperObjPostResponse = v.InferOutput<typeof SuperObjPostResponse>;

/**
 * Delete an object.
 *
 * The server refuses to delete objects that still have associated
 * annotations, spectra, photometry, photometric series, comments,
 * classifications, or GCN-event links; remove those first.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID to delete, e.g. `"ZTF20abcdef"`.
 */
export const deleteObj = async (client: Http.Client, objId: string): Promise<void> => {
    await Http.del(client, `/api/objs/${objId}`);
};

/**
 * Options for calculating an object's photometric position.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchObjPositionOptions {
    /** Only use photometry from these instruments. */
    readonly instrumentIds?: ReadonlyArray<number> | undefined;
    /** Only use photometry from these streams. */
    readonly streamIds?: ReadonlyArray<number> | undefined;
    /**
     * Only use photometry associated with at least one stream. Ignored if
     * `streamIds` is provided.
     */
    readonly streamOnly?: boolean | undefined;
    /**
     * Only use photometry with a signal-to-noise ratio above this positive
     * value. Defaults to 3.0.
     */
    readonly snrThreshold?: number | undefined;
    /** Position-weighting method, one of `"snr2"` or `"invvar"`. */
    readonly method?: string | undefined;
}

/**
 * Calculate an object's position from its photometry.
 *
 * Forced photometry is always excluded. If no photometry passes the filters,
 * the server falls back to the discovery position.
 *
 * @since 1.0.0
 * @category Requests
 * @param objId - Object ID of the source, e.g. `"ZTF20abcdef"`.
 */
export const fetchObjPosition = async (
    client: Http.Client,
    objId: string,
    options: FetchObjPositionOptions = {}
): Promise<ObjPosition> =>
    Http.decode(
        ObjPosition,
        await Http.get(client, `/api/sources/${objId}/position`, {
            snr_threshold: options.snrThreshold ?? 3,
            method: options.method ?? "snr2",
            instrument_ids: Http.commaSeparated(options.instrumentIds),
            stream_ids: Http.commaSeparated(options.streamIds),
            stream_only: options.streamOnly === true ? "true" : undefined,
        })
    );

/**
 * Options for creating a super-object.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PostSuperObjOptions {
    /** Name of the super-object, e.g. an MPC designation. */
    readonly name?: string | undefined;
    /** Whether the super-object is a moving object. */
    readonly isRoid?: boolean | undefined;
    /** IDs of the objects to link. */
    readonly objIds?: ReadonlyArray<string> | undefined;
}

/**
 * Create a super-object linking multiple objects.
 *
 * @since 1.0.0
 * @category Requests
 */
export const postSuperObj = async (
    client: Http.Client,
    options: PostSuperObjOptions = {}
): Promise<SuperObjPostResponse> =>
    Http.decode(
        SuperObjPostResponse,
        await Http.post(
            client,
            "/api/super_objs",
            Http.body({
                is_roid: options.isRoid ?? false,
                name: options.name,
                obj_ids: options.objIds,
            })
        )
    );

/**
 * Retrieve a single super-object by ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param superObjId - ID of the super-object.
 */
export const fetchSuperObj = async (client: Http.Client, superObjId: number): Promise<SuperObj> =>
    Http.decode(SuperObj, await Http.get(client, `/api/super_objs/${superObjId}`));

/**
 * Options for querying super-objects.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchSuperObjsOptions {
    /** Restrict to super-objects whose name contains this string. */
    readonly name?: string | undefined;
    /** Restrict by moving-object status. */
    readonly isRoid?: boolean | undefined;
    /** Restrict to super-objects linking this object. */
    readonly objId?: string | undefined;
}

/**
 * Query super-objects.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchSuperObjs = async (
    client: Http.Client,
    options: FetchSuperObjsOptions = {}
): Promise<Array<SuperObj>> =>
    Http.decode(
        v.array(SuperObj),
        await Http.get(client, "/api/super_objs", {
            name: options.name,
            isRoid: options.isRoid,
            objID: options.objId,
        })
    );

/**
 * Options for updating a super-object.
 *
 * @since 1.0.0
 * @category Models
 */
export interface UpdateSuperObjOptions {
    /** New name. */
    readonly name?: string | undefined;
    /** New moving-object status. */
    readonly isRoid?: boolean | undefined;
    /** Replacement list of linked object IDs. */
    readonly objIds?: ReadonlyArray<string> | undefined;
    /** Object IDs to add to the membership. */
    readonly addObjIds?: ReadonlyArray<string> | undefined;
    /** Object IDs to remove from the membership. */
    readonly removeObjIds?: ReadonlyArray<string> | undefined;
}

/**
 * Update a super-object's metadata or membership.
 *
 * `objIds` replaces the membership wholesale; `addObjIds` and `removeObjIds`
 * modify it incrementally and may not be combined with `objIds`. Only the
 * provided fields are sent.
 *
 * @since 1.0.0
 * @category Requests
 * @param superObjId - ID of the super-object to update.
 */
export const updateSuperObj = async (
    client: Http.Client,
    superObjId: number,
    options: UpdateSuperObjOptions = {}
): Promise<void> => {
    await Http.patch(
        client,
        `/api/super_objs/${superObjId}`,
        Http.body({
            name: options.name,
            is_roid: options.isRoid,
            obj_ids: options.objIds,
            add_obj_ids: options.addObjIds,
            remove_obj_ids: options.removeObjIds,
        })
    );
};

/**
 * Delete a super-object, leaving its linked objects untouched.
 *
 * Requires the "System admin" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param superObjId - ID of the super-object to delete.
 */
export const deleteSuperObj = async (client: Http.Client, superObjId: number): Promise<void> => {
    await Http.del(client, `/api/super_objs/${superObjId}`);
};

/**
 * Options for an unsourced finding chart.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchUnsourcedFindingChartOptions {
    /**
     * Gaia source ID (digits only); required unless `locationType` is
     * `"pos"`.
     */
    readonly catalogId?: string | undefined;
    /**
     * Position of interest in degrees, at the time of observation (the caller
     * is responsible for proper-motion corrections).
     */
    readonly ra?: number | undefined;
    readonly dec?: number | undefined;
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
    /**
     * Observation time in ISO format, e.g. `"2020-12-30T12:34:10"`. Defaults
     * to now.
     */
    readonly obstime?: string | undefined;
    /** Output file type, `"pdf"` or `"png"`. Defaults to `"pdf"`. */
    readonly outputType?: string | undefined;
    /**
     * Number of offset stars to determine and show, in [0, 4]. Defaults to 3.
     */
    readonly numOffsetStars?: number | undefined;
}

/**
 * Generate a finding chart for an arbitrary position or Gaia ID.
 *
 * @since 1.0.0
 * @category Requests
 * @param locationType - One of `"gaia_dr3"`, `"gaia_dr2"`, or `"pos"`. For
 *   `"pos"`, provide `ra` and `dec`; otherwise provide `catalogId` and the
 *   position is pulled from the Gaia catalog.
 */
export const fetchUnsourcedFindingChart = (
    client: Http.Client,
    locationType: string,
    options: FetchUnsourcedFindingChartOptions = {}
): Promise<Uint8Array> =>
    Http.getContent(client, "/api/unsourced_finder", {
        location_type: locationType,
        imsize: options.imsize ?? 4,
        facility: options.facility ?? "Keck",
        image_source: options.imageSource ?? "ps1",
        use_ztfref: options.useZtfref ?? true,
        type: options.outputType ?? "pdf",
        num_offset_stars: options.numOffsetStars ?? 3,
        catalog_id: options.catalogId,
        ra: options.ra,
        dec: options.dec,
        obstime: options.obstime,
    });
