/**
 * Typed endpoint functions for `/api/skymap_trigger`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";

/**
 * The skymap-based triggers currently queued on a remote facility.
 *
 * There is no upstream SQLAlchemy model: the names come straight back from the
 * instrument's remote observation plan API.
 *
 * @since 1.0.0
 * @category Models
 */
export const SkymapTriggerQueue = Schemas.model(
    v.strictObject({
        trigger_names: Schemas.list(v.string()),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type SkymapTriggerQueue = v.InferOutput<typeof SkymapTriggerQueue>;

/**
 * Retrieve the skymap-based triggers queued on an allocation's facility.
 *
 * The allocation's instrument must have a remote observation plan API that
 * implements `queued_skymap`.
 *
 * @since 1.0.0
 * @category Requests
 * @param allocationId - ID of the allocation whose queue is retrieved.
 */
export const fetchSkymapTriggers = async (client: Http.Client, allocationId: number): Promise<SkymapTriggerQueue> =>
    Http.decode(SkymapTriggerQueue, await Http.get(client, `/api/skymap_trigger/${allocationId}`));

/**
 * Options for sending a skymap-based trigger.
 *
 * @since 1.0.0
 * @category Models
 */
export interface PostSkymapTriggerOptions {
    /** Cumulative probability of the skymap to cover. Defaults to 0.95. */
    readonly integratedProbability?: number | undefined;
}

/**
 * Send a skymap-based trigger to an allocation's facility.
 *
 * The server converts the localization into the instrument's field tiles down
 * to the requested credible level and submits them through the instrument's
 * remote observation plan API, which must implement `send_skymap`.
 *
 * @since 1.0.0
 * @category Requests
 * @param allocationId - ID of the allocation to trigger.
 * @param localizationId - ID of the localization (skymap) to send.
 */
export const postSkymapTrigger = async (
    client: Http.Client,
    allocationId: number,
    localizationId: number,
    options: PostSkymapTriggerOptions = {}
): Promise<void> => {
    await Http.post(client, "/api/skymap_trigger", {
        allocation_id: allocationId,
        localization_id: localizationId,
        integrated_probability: options.integratedProbability ?? 0.95,
    });
};

/**
 * Remove a queued skymap-based trigger from an allocation's facility.
 *
 * The allocation's instrument must have a remote observation plan API that
 * implements `remove_skymap`.
 *
 * @since 1.0.0
 * @category Requests
 * @param allocationId - ID of the allocation whose queue is modified.
 * @param triggerName - Name of the queued trigger to remove.
 */
export const deleteSkymapTrigger = async (
    client: Http.Client,
    allocationId: number,
    triggerName: string
): Promise<void> => {
    await Http.del(client, `/api/skymap_trigger/${allocationId}`, {
        trigger_name: triggerName,
    });
};
