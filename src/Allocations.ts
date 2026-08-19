/**
 * Typed endpoint functions for `/api/allocation`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Http from "./Http.ts";
import * as Instruments from "./Instruments.ts";
import * as Schemas from "./Schemas.ts";
import * as Telescopes from "./Telescopes.ts";
import * as Users from "./Users.ts";

/**
 * A join row mapping a user to an allocation (upstream `AllocationUser`).
 *
 * `allocation` stays untyped to avoid a recursive model.
 *
 * @since 1.0.0
 * @category Models
 */
export const AllocationUser = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        allocation_id: Schemas.NullishInteger,
        user_id: Schemas.NullishInteger,
        user: Schemas.nullish(Users.User),
        allocation: Schemas.nullish(Schemas.JsonObject),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type AllocationUser = v.InferOutput<typeof AllocationUser>;

/**
 * What an allocation may be used for.
 *
 * @since 1.0.0
 * @category Models
 */
export const AllocationType = v.picklist(["triggered", "forced_photometry", "observation_plan"]);

/**
 * @since 1.0.0
 * @category Models
 */
export type AllocationType = v.InferOutput<typeof AllocationType>;

/**
 * An observing-time allocation on an instrument (upstream `Allocation`).
 *
 * `allocation_users` is a list of plain users on the allocation endpoints (the
 * handlers substitute `allocation_user.user`) but a list of join rows when it
 * arrives nested inside a telescope payload, so both are accepted. `requests`,
 * `default_requests`, `default_observation_plans`, `catalog_queries`,
 * `observation_plans`, `gcn_triggers` and `group` stay untyped: those upstream
 * models point back at `Allocation`, so typing them would risk an import
 * cycle. `requests`, `ephemeris` and `telescope` are injected by the
 * single-allocation endpoint. The encrypted `_altdata` column is never
 * serialized.
 *
 * @since 1.0.0
 * @category Models
 */
export const Allocation = Schemas.model(
    v.strictObject({
        id: Schemas.Integer,
        created_at: Schemas.NullishTimestamp,
        modified: Schemas.NullishTimestamp,
        pi: Schemas.NullishString,
        proposal_id: Schemas.NullishString,
        hours_allocated: Schemas.NullishNumber,
        validity_ranges: Schemas.nullish(v.array(Schemas.JsonObject)),
        default_share_group_ids: Schemas.nullish(v.array(Schemas.Integer)),
        types: Schemas.nullish(v.array(AllocationType)),
        group_id: Schemas.NullishInteger,
        instrument_id: Schemas.NullishInteger,
        instrument: Schemas.nullish(Instruments.Instrument),
        allocation_users: Schemas.nullish(v.array(v.union([Users.User, AllocationUser]))),
        group: Schemas.nullish(Schemas.JsonObject),
        requests: Schemas.nullish(v.array(Schemas.JsonObject)),
        default_requests: Schemas.nullish(v.array(Schemas.JsonObject)),
        default_observation_plans: Schemas.nullish(v.array(Schemas.JsonObject)),
        catalog_queries: Schemas.nullish(v.array(Schemas.JsonObject)),
        observation_plans: Schemas.nullish(v.array(Schemas.JsonObject)),
        gcn_triggers: Schemas.nullish(v.array(Schemas.JsonObject)),
        ephemeris: Schemas.nullish(Telescopes.Ephemeris),
        telescope: Schemas.nullish(Telescopes.Telescope),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type Allocation = v.InferOutput<typeof Allocation>;

/**
 * Payload for creating an allocation.
 *
 * `_altdata` holds the instrument API credentials and is validated by the
 * instrument's API class when it implements `validate_altdata`.
 * `allocation_admin_ids` lists the users allowed to administer the allocation.
 *
 * @since 1.0.0
 * @category Models
 */
export interface AllocationPost {
    readonly instrument_id: number;
    readonly group_id: number;
    readonly hours_allocated: number;
    readonly pi?: string | undefined;
    readonly proposal_id?: string | undefined;
    readonly types?: ReadonlyArray<string> | undefined;
    readonly validity_ranges?: ReadonlyArray<Record<string, unknown>> | undefined;
    readonly default_share_group_ids?: ReadonlyArray<number> | undefined;
    readonly allocation_admin_ids?: ReadonlyArray<number> | undefined;
    readonly _altdata?: Record<string, unknown> | undefined;
}

/**
 * Payload for updating an allocation; every field is optional.
 *
 * `_altdata` is merged into the stored value rather than replacing it.
 * `allocation_admin_ids` is authoritative: any admin not listed is removed, so
 * omitting it clears them all.
 *
 * @since 1.0.0
 * @category Models
 */
export interface AllocationUpdate {
    readonly instrument_id?: number | undefined;
    readonly group_id?: number | undefined;
    readonly hours_allocated?: number | undefined;
    readonly pi?: string | undefined;
    readonly proposal_id?: string | undefined;
    readonly types?: ReadonlyArray<string> | undefined;
    readonly validity_ranges?: ReadonlyArray<Record<string, unknown>> | undefined;
    readonly default_share_group_ids?: ReadonlyArray<number> | undefined;
    readonly allocation_admin_ids?: ReadonlyArray<number> | undefined;
    readonly _altdata?: Record<string, unknown> | undefined;
    readonly replace_altdata?: boolean | undefined;
}

/**
 * Result of creating an allocation.
 *
 * @since 1.0.0
 * @category Models
 */
export const AllocationPostResponse = Schemas.model(v.strictObject({ id: Schemas.Integer }));

/**
 * @since 1.0.0
 * @category Models
 */
export type AllocationPostResponse = v.InferOutput<typeof AllocationPostResponse>;

/**
 * Options for listing allocations.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchAllocationsOptions {
    /** Restrict to allocations on this instrument. */
    readonly instrumentId?: number | undefined;
    /**
     * Restrict to allocations whose instrument has the given API type set:
     * `"api_classname"` or `"api_classname_obsplan"`.
     */
    readonly apiType?: string | undefined;
    /**
     * Restrict to allocations whose instrument API implements this method,
     * e.g. `"submit"` or `"retrieve"`. Requires `apiType`.
     */
    readonly apiImplements?: string | undefined;
}

/**
 * Retrieve the allocations visible to the token.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchAllocations = async (
    client: Http.Client,
    options: FetchAllocationsOptions = {}
): Promise<Array<Allocation>> =>
    Http.decode(
        v.array(Allocation),
        await Http.get(client, "/api/allocation", {
            instrument_id: options.instrumentId,
            apiType: options.apiType,
            apiImplements: options.apiImplements,
        })
    );

/**
 * Options for retrieving a single allocation.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchAllocationOptions {
    /** Pagination controls over `requests`; the server caps the page size. */
    readonly pageNumber?: number | undefined;
    readonly numPerPage?: number | undefined;
    /**
     * Field to sort `requests` by; one of `"created_at"`, `"modified"`,
     * `"status"` or `"obj"`.
     */
    readonly sortBy?: string | undefined;
    /** `"asc"` or `"desc"`. */
    readonly sortOrder?: string | undefined;
}

/** @internal */
const AllocationEnvelope = v.object({ allocation: Allocation });

/**
 * Retrieve a single allocation by ID.
 *
 * The response embeds the allocation's follow-up requests in `requests`; the
 * pagination and sort parameters apply to that list. (The wire response also
 * carries the total request count in a `totalMatches` sibling key, which this
 * function drops.)
 *
 * @since 1.0.0
 * @category Requests
 * @param allocationId - ID of the allocation.
 */
export const fetchAllocation = async (
    client: Http.Client,
    allocationId: number,
    options: FetchAllocationOptions = {}
): Promise<Allocation> =>
    Http.decode(
        AllocationEnvelope,
        await Http.get(client, `/api/allocation/${allocationId}`, {
            pageNumber: options.pageNumber ?? 1,
            numPerPage: options.numPerPage ?? 50,
            sortBy: options.sortBy ?? "created_at",
            sortOrder: options.sortOrder ?? "asc",
        })
    ).allocation;

/**
 * Create an allocation on a robotic instrument.
 *
 * Requires the "Manage allocations" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The allocation to create.
 */
export const postAllocation = async (client: Http.Client, payload: AllocationPost): Promise<AllocationPostResponse> =>
    Http.decode(AllocationPostResponse, await Http.post(client, "/api/allocation", Http.body(payload)));

/**
 * Update an allocation.
 *
 * Requires the "Manage allocations" permission.
 *
 * @since 1.0.0
 * @category Requests
 * @param allocationId - ID of the allocation to update.
 * @param payload - Fields to change.
 */
export const updateAllocation = async (
    client: Http.Client,
    allocationId: number,
    payload: AllocationUpdate
): Promise<void> => {
    await Http.put(client, `/api/allocation/${allocationId}`, Http.body(payload));
};

/**
 * Delete an allocation.
 *
 * @since 1.0.0
 * @category Requests
 * @param allocationId - ID of the allocation to delete. Requires the "Manage
 *   allocations" permission.
 */
export const deleteAllocation = async (client: Http.Client, allocationId: number): Promise<void> => {
    await Http.del(client, `/api/allocation/${allocationId}`);
};

/**
 * Options for an allocation report.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchAllocationReportOptions {
    /** `"pdf"` (the server default) or `"png"`. */
    readonly outputFormat?: string | undefined;
}

/**
 * Retrieve a plotted report on an instrument's allocations.
 *
 * The report charts allocated hours, requests made, requests completed and the
 * moon-phase distribution of completed requests, per allocation.
 *
 * @since 1.0.0
 * @category Requests
 * @param instrumentId - ID of the instrument to report on. The server errors
 *   unless it has at least one accessible allocation.
 */
export const fetchAllocationReport = (
    client: Http.Client,
    instrumentId: number,
    options: FetchAllocationReportOptions = {}
): Promise<Uint8Array> =>
    Http.getContent(client, `/api/allocation/report/${instrumentId}`, {
        output_format: options.outputFormat,
    });
