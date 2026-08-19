/**
 * Typed endpoint functions for `/api/summary_query`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";

/**
 * Payload for a source summary similarity search.
 *
 * Exactly one of `q` (a free-text query) and `objID` (find sources similar to
 * that source's summary) must be given. `k` is the maximum number of sources
 * to return and must satisfy `1 <= k <= 100`; server default 5. `z_min` and
 * `z_max` bound the redshift of the returned sources and `classificationTypes`
 * restricts them to those classifications; omitting them applies no
 * restriction.
 *
 * @since 1.0.0
 * @category Models
 */
export interface SummaryQueryPost {
    readonly q?: string | undefined;
    readonly objID?: string | undefined;
    readonly k?: number | undefined;
    readonly z_min?: number | undefined;
    readonly z_max?: number | undefined;
    readonly classificationTypes?: ReadonlyArray<string> | undefined;
}

/**
 * One vector-store hit for a summary query (not a SkyPortal model).
 *
 * The shape is defined by the Pinecone client, not by SkyPortal: when `q` is
 * used the handler rebuilds each hit as exactly `id`, `score` and `metadata`,
 * but when `objID` is used it passes the raw `matches` of the Pinecone query
 * response straight through, so the remaining fields are Pinecone's
 * `ScoredVector` attributes (`values`, `sparseValues`) and may change with the
 * Pinecone SDK version rather than with SkyPortal. `metadata` holds whatever
 * SkyPortal indexed alongside the summary (`redshift`, `class`, ...), so it
 * stays free-form.
 *
 * @since 1.0.0
 * @category Models
 */
export const SummaryQueryMatch = Schemas.model(
    v.strictObject({
        id: v.string(),
        score: Schemas.NullishNumber,
        values: Schemas.nullish(v.array(v.number())),
        sparseValues: Schemas.nullish(Schemas.JsonObject),
        metadata: Schemas.nullish(Schemas.JsonObject),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SummaryQueryMatch = v.InferOutput<typeof SummaryQueryMatch>;

/**
 * Results of a source summary similarity search.
 *
 * @since 1.0.0
 * @category Models
 */
export const SummaryQueryResults = Schemas.model(
    v.strictObject({
        query_results: Schemas.list(SummaryQueryMatch),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SummaryQueryResults = v.InferOutput<typeof SummaryQueryResults>;

/**
 * Search for sources whose summaries match a query.
 *
 * The search runs against the vector store of source summaries, so it requires
 * the server to be configured with an embeddings store and an OpenAI key
 * (globally or in the requesting user's preferences).
 *
 * @since 1.0.0
 * @category Requests
 * @param payload - The query.
 */
export const postSummaryQuery = async (client: Http.Client, payload: SummaryQueryPost): Promise<SummaryQueryResults> =>
    Http.decode(SummaryQueryResults, await Http.post(client, "/api/summary_query", Http.body(payload)));
