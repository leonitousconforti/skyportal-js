/**
 * Typed endpoint functions for the instance introspection endpoints.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";

/**
 * One parsed commit from the deployed SkyPortal git log.
 *
 * @since 1.0.0
 * @category Models
 */
export const GitLogEntry = Schemas.model(
    v.strictObject({
        time: Schemas.NullishString,
        sha: Schemas.NullishString,
        email: Schemas.NullishString,
        description: Schemas.NullishString,
        pr_nr: Schemas.NullishString,
        pr_url: Schemas.NullishString,
        commit_url: Schemas.NullishString,
        name: Schemas.NullishString,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type GitLogEntry = v.InferOutput<typeof GitLogEntry>;

/**
 * System and deployment information for the SkyPortal instance.
 *
 * @since 1.0.0
 * @category Models
 */
export const SysInfo = Schemas.model(v.strictObject({ gitlog: Schemas.list(GitLogEntry) }));

/**
 * @since 1.0.0
 * @category Models
 */
export type SysInfo = v.InferOutput<typeof SysInfo>;

/**
 * Basic health information about the instance's database.
 *
 * @since 1.0.0
 * @category Models
 */
export const DbInfo = Schemas.model(
    v.strictObject({
        source_table_empty: Schemas.NullishBoolean,
        postgres_version: Schemas.NullishString,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type DbInfo = v.InferOutput<typeof DbInfo>;

/**
 * Retrieve system and deployment information.
 *
 * The git log is capped at the 100 most recent non-merge commits, with "bump"
 * and "pin" commits filtered out.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchSysinfo = async (client: Http.Client): Promise<SysInfo> =>
    Http.decode(SysInfo, await Http.get(client, "/api/sysinfo"));

/**
 * Retrieve the system information together with the SkyPortal version the
 * instance is running.
 *
 * `version` accompanies `data` on every response envelope rather than sitting
 * inside it, so it is only available through this variant.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchSysinfoWithVersion = async (
    client: Http.Client
): Promise<{ readonly sysinfo: SysInfo; readonly version: string | undefined }> => {
    const envelope = await Http.getEnvelope(client, "/api/sysinfo");
    return { sysinfo: Http.decode(SysInfo, envelope.data), version: envelope.version };
};

/**
 * Retrieve whether the sources table is empty and the Postgres version.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchDbinfo = async (client: Http.Client): Promise<DbInfo> =>
    Http.decode(DbInfo, await Http.get(client, "/api/internal/dbinfo"));

/**
 * Retrieve the catalog of altdata keys carried by accessible sources.
 *
 * The response shape varies with the endpoint's query arguments, so it is
 * returned unmodelled.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchAltdataInfo = (client: Http.Client): Promise<unknown> =>
    Http.get(client, "/api/internal/altdata_info");

/**
 * Retrieve the catalog of annotation origins and keys.
 *
 * The response shape varies with the endpoint's query arguments, so it is
 * returned unmodelled.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchAnnotationsInfo = (client: Http.Client): Promise<unknown> =>
    Http.get(client, "/api/internal/annotations_info");

/**
 * Retrieve the parts of the instance config exposed to clients.
 *
 * The response is an open-ended camelCase mapping whose keys vary with the
 * deployed SkyPortal version, so it is returned unmodelled. Typical keys
 * include `"invitationsEnabled"`, `"cosmology"`, `"allowedSpectrumTypes"`,
 * `"defaultSpectrumType"`, `"gcnNoticeTypes"`, `"colorPalette"` and
 * `"publicGroupName"`.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchConfig = async (client: Http.Client): Promise<Record<string, unknown>> =>
    Http.decode(Schemas.JsonObject, await Http.get(client, "/api/config"));

/**
 * Retrieve the client-facing config together with the SkyPortal version the
 * instance is running.
 *
 * `version` accompanies `data` on every response envelope rather than sitting
 * inside it, so it is only available through this variant.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchConfigWithVersion = async (
    client: Http.Client
): Promise<{ readonly config: Record<string, unknown>; readonly version: string | undefined }> => {
    const envelope = await Http.getEnvelope(client, "/api/config");
    return { config: Http.decode(Schemas.JsonObject, envelope.data), version: envelope.version };
};

/**
 * Retrieve basic database statistics (requires "System admin").
 *
 * The response is an open-ended mapping keyed by human-readable phrases such
 * as `"Number of candidates"` and `"Latest cron job run times & statuses"`, so
 * it is returned unmodelled. The photometry count is approximate, coming from
 * `pg_class.reltuples`.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchDbStats = async (client: Http.Client): Promise<Record<string, unknown>> =>
    Http.decode(Schemas.JsonObject, await Http.get(client, "/api/db_stats"));

/**
 * Retrieve the enumerated value lists the instance accepts.
 *
 * The response is an open-ended mapping of upper-case names to lists of
 * allowed values, and the set of names varies with the deployed SkyPortal
 * version, so it is returned unmodelled. Typical keys include
 * `"ALLOWED_SPECTRUM_TYPES"`, `"ALLOWED_MAGSYSTEMS"`, `"ALLOWED_BANDPASSES"`,
 * `"THUMBNAIL_TYPES"`, `"FOLLOWUP_PRIORITIES"`, `"ALLOWED_API_CLASSNAMES"`,
 * `"ANALYSIS_TYPES"`, `"ANALYSIS_INPUT_TYPES"` and `"AUTHENTICATION_TYPES"`.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchEnumTypes = async (client: Http.Client): Promise<Record<string, unknown>> =>
    Http.decode(Schemas.JsonObject, await Http.get(client, "/api/enum_types"));
