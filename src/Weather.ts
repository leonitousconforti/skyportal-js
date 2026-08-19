/**
 * Typed endpoint functions for `/api/weather`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";

/**
 * Cached OpenWeather data for a telescope site (upstream `Weather`).
 *
 * The handler builds this dict by hand rather than serializing the model:
 * `weather` is the raw OpenWeather `weather_info` JSON blob,
 * `weather_retrieved_at` is the model's `retrieved_at`, and the remaining keys
 * are copied off the associated `Telescope`.
 *
 * @since 1.0.0
 * @category Models
 */
export const Weather = Schemas.model(
    v.strictObject({
        weather: Schemas.nullish(Schemas.JsonObject),
        weather_retrieved_at: Schemas.NullishTimestamp,
        weather_fetch_at: Schemas.NullishTimestamp,
        weather_link: Schemas.NullishString,
        telescope_name: Schemas.NullishString,
        telescope_nickname: Schemas.NullishString,
        telescope_id: Schemas.NullishInteger,
        message: Schemas.NullishString,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type Weather = v.InferOutput<typeof Weather>;

/**
 * Options for a weather lookup.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchWeatherOptions {
    /**
     * Telescope to report on. If omitted the server falls back to the user's
     * weather preference, then to the first telescope the token can access.
     */
    readonly telescopeId?: number | undefined;
}

/**
 * Retrieve the weather at a telescope site.
 *
 * The server refreshes the cached OpenWeather data only once the configured
 * refresh interval has elapsed, and reports upstream failures in `message`
 * rather than as an error. When no telescope can be resolved at all, every
 * field except `weather` is absent.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchWeather = async (client: Http.Client, options: FetchWeatherOptions = {}): Promise<Weather> =>
    Http.decode(Weather, await Http.get(client, "/api/weather", { telescope_id: options.telescopeId }));
