/**
 * Building blocks shared by the models of every resource module.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

/**
 * An ISO 8601 timestamp, kept as the string SkyPortal sends.
 *
 * SkyPortal is inconsistent about trailing `Z` and sub-second precision, and
 * timestamps travel back out unchanged on update payloads, so this client does
 * not parse them into `Date`.
 *
 * @since 1.0.0
 * @category Schemas
 */
export const Timestamp = v.string();

/**
 * Any JSON value, for the free-form `altdata` and `payload` blobs SkyPortal
 * stores verbatim.
 *
 * @since 1.0.0
 * @category Schemas
 */
export const Json = v.unknown();

/**
 * A free-form JSON object.
 *
 * @since 1.0.0
 * @category Schemas
 */
export const JsonObject = v.record(v.string(), v.unknown());

/**
 * A nullable, optional field: the shape pydantic's `T | None = None` takes on
 * the wire.
 *
 * @since 1.0.0
 * @category Schemas
 */
export const nullish = <const TSchema extends v.GenericSchema>(schema: TSchema) => v.nullish(schema);

/**
 * A list-valued field that falls back to empty when the server omits it.
 *
 * @since 1.0.0
 * @category Schemas
 */
export const list = <const TSchema extends v.GenericSchema>(schema: TSchema) =>
    v.optional(v.array(schema), () => [] as Array<v.InferOutput<TSchema>>);

/**
 * A nullable, optional ISO 8601 timestamp.
 *
 * @since 1.0.0
 * @category Schemas
 */
export const NullishTimestamp = nullish(Timestamp);

/**
 * A nullable, optional string.
 *
 * @since 1.0.0
 * @category Schemas
 */
export const NullishString = nullish(v.string());

/**
 * A nullable, optional number.
 *
 * @since 1.0.0
 * @category Schemas
 */
export const NullishNumber = nullish(v.number());

/**
 * A nullable, optional integer.
 *
 * @since 1.0.0
 * @category Schemas
 */
export const NullishInteger = nullish(v.pipe(v.number(), v.integer()));

/**
 * A nullable, optional boolean.
 *
 * @since 1.0.0
 * @category Schemas
 */
export const NullishBoolean = nullish(v.boolean());

/**
 * An integer.
 *
 * @since 1.0.0
 * @category Schemas
 */
export const Integer = v.pipe(v.number(), v.integer());

/**
 * Freeze a model's inferred output type into the schema's own type.
 *
 * SkyPortal's payloads nest deeply -- a source carries follow-up requests,
 * which carry allocations, which carry instruments, which carry telescopes --
 * and inferring that in one go exceeds TypeScript's instantiation depth. Boxing
 * each model as it is defined means a model that embeds it reads one resolved
 * type argument instead of walking its whole entry map again.
 *
 * @since 1.0.0
 * @category Schemas
 */
export const model = <const TSchema extends v.GenericSchema>(
    schema: TSchema
): v.GenericSchema<unknown, v.InferOutput<TSchema>> => schema;
