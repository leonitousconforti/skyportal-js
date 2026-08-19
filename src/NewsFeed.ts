/**
 * Typed endpoint functions for `/api/newsfeed`.
 *
 * @since 1.0.0
 */

import * as v from "valibot";

import * as Http from "./Http.ts";
import * as Schemas from "./Schemas.ts";

/**
 * Display information about the user behind a news feed item.
 *
 * Exactly the fields upstream's `basic_user_display_info` (and
 * `Comment.construct_author_info_dict`) copies off the `User`.
 *
 * @since 1.0.0
 * @category Models
 */
export const NewsFeedAuthorInfo = Schemas.model(
    v.strictObject({
        username: Schemas.NullishString,
        first_name: Schemas.NullishString,
        last_name: Schemas.NullishString,
        gravatar_url: Schemas.NullishString,
        is_bot: Schemas.NullishBoolean,
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type NewsFeedAuthorInfo = v.InferOutput<typeof NewsFeedAuthorInfo>;

/**
 * One entry in the news feed (no upstream model; built by the handler).
 *
 * `author` is only set on comment items; `author_info` is absent on source
 * items.
 *
 * @since 1.0.0
 * @category Models
 */
export const NewsFeedItem = Schemas.model(
    v.strictObject({
        type: v.picklist(["source", "comment", "classification", "spectrum", "photometry"]),
        time: Schemas.NullishTimestamp,
        message: Schemas.NullishString,
        source_id: Schemas.NullishString,
        classification: Schemas.NullishString,
        author: Schemas.NullishString,
        author_info: Schemas.nullish(NewsFeedAuthorInfo),
    })
);

/**
 * @since 1.0.0
 * @category Models
 */
export type NewsFeedItem = v.InferOutput<typeof NewsFeedItem>;

/**
 * Options for a news feed request.
 *
 * @since 1.0.0
 * @category Models
 */
export interface FetchNewsFeedOptions {
    /**
     * Number of items to return. The server takes the larger of this and the
     * user's preference, defaults to `50` when neither is set, and rejects
     * values above `1000`.
     */
    readonly numItems?: number | undefined;
    /**
     * Restrict the feed to sources saved to this team's groups; a view filter
     * only, always intersected with the token's accessible groups.
     */
    readonly teamId?: number | undefined;
}

/**
 * Retrieve a summary of recent activity, newest first.
 *
 * Items cover new sources, comments, classifications, spectra and follow-up
 * photometry; which categories appear, and whether bot comments and ML
 * classifications are included, follow the user's news feed preferences.
 *
 * @since 1.0.0
 * @category Requests
 */
export const fetchNewsFeed = async (
    client: Http.Client,
    options: FetchNewsFeedOptions = {}
): Promise<Array<NewsFeedItem>> =>
    Http.decode(
        v.array(NewsFeedItem),
        await Http.get(client, "/api/newsfeed", {
            numItems: options.numItems,
            teamID: options.teamId,
        })
    );
