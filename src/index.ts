/**
 * @since 1.0.0
 */

/**
 * Typed endpoint functions for `/api/acls`.
 *
 * @since 1.0.0
 */
export * as Acls from "./Acls.ts"

/**
 * Typed endpoint functions for `/api/allocation`.
 *
 * @since 1.0.0
 */
export * as Allocations from "./Allocations.ts"

/**
 * Typed endpoint functions for `/api/analysis_service` and
 * `/api/obj/analysis`.
 *
 * @since 1.0.0
 */
export * as Analysis from "./Analysis.ts"

/**
 * Typed endpoint functions for source annotations.
 *
 * @since 1.0.0
 */
export * as Annotations from "./Annotations.ts"

/**
 * Typed endpoint functions for `/api/assignment`.
 *
 * @since 1.0.0
 */
export * as Assignments from "./Assignments.ts"

/**
 * Typed endpoint functions for `/api/brokers`.
 *
 * @since 1.0.0
 */
export * as Brokers from "./Brokers.ts"

/**
 * Typed endpoint functions for `/api/candidates`.
 *
 * @since 1.0.0
 */
export * as Candidates from "./Candidates.ts"

/**
 * Typed endpoint functions for `/api/catalog_queries` and `/api/catalogs`.
 *
 * @since 1.0.0
 */
export * as CatalogQueries from "./CatalogQueries.ts"

/**
 * Typed endpoint functions for classifications.
 *
 * @since 1.0.0
 */
export * as Classifications from "./Classifications.ts"

/**
 * Client construction.
 *
 * @since 1.0.0
 */
export * as Client from "./Client.ts"

/**
 * Typed endpoint functions for source comments.
 *
 * @since 1.0.0
 */
export * as Comments from "./Comments.ts"

/**
 * Typed endpoint functions for `/api/earthquake`.
 *
 * @since 1.0.0
 */
export * as Earthquakes from "./Earthquakes.ts"

/**
 * Typed endpoint functions for `/api/filters`.
 *
 * @since 1.0.0
 */
export * as Filters from "./Filters.ts"

/**
 * Typed endpoint functions for `/api/followup_request`.
 *
 * @since 1.0.0
 */
export * as FollowupRequests from "./FollowupRequests.ts"

/**
 * Typed endpoint functions for `/api/galaxy_catalog`.
 *
 * @since 1.0.0
 */
export * as Galaxies from "./Galaxies.ts"

/**
 * Typed endpoint functions for `/api/gcn_event`.
 *
 * Every model below whose upstream row hangs off a `GcnEvent` keeps its
 * `gcnevent` back-reference free-form: {@link GcnEvent} already types the
 * forward direction, so typing the reverse one too would make the models
 * mutually recursive.
 *
 * @since 1.0.0
 */
export * as GcnEvents from "./GcnEvents.ts"

/**
 * Typed endpoint functions for `/api/group_admission_requests`.
 *
 * @since 1.0.0
 */
export * as GroupAdmissionRequests from "./GroupAdmissionRequests.ts"

/**
 * Typed endpoint functions for `/api/groups`.
 *
 * @since 1.0.0
 */
export * as Groups from "./Groups.ts"

/**
 * Typed endpoint functions for `/api/healpix`.
 *
 * @since 1.0.0
 */
export * as Healpix from "./Healpix.ts"

/**
 * Envelope unwrapping, error handling, and the low-level request surface every
 * endpoint function is built on.
 *
 * @since 1.0.0
 */
export * as Http from "./Http.ts"

/**
 * Typed endpoint functions for `/api/instrument`.
 *
 * @since 1.0.0
 */
export * as Instruments from "./Instruments.ts"

/**
 * Typed endpoint functions for `/api/invitations`.
 *
 * @since 1.0.0
 */
export * as Invitations from "./Invitations.ts"

/**
 * Typed endpoint functions for `/api/listing`.
 *
 * @since 1.0.0
 */
export * as Listings from "./Listings.ts"

/**
 * Typed endpoint functions for `/api/localization`.
 *
 * @since 1.0.0
 */
export * as Localizations from "./Localizations.ts"

/**
 * Typed endpoint functions for `/api/mmadetector`.
 *
 * @since 1.0.0
 */
export * as MmaDetectors from "./MmaDetectors.ts"

/**
 * Typed endpoint functions for `/api/moving_object`.
 *
 * @since 1.0.0
 */
export * as MovingObjects from "./MovingObjects.ts"

/**
 * Typed endpoint functions for `/api/newsfeed`.
 *
 * @since 1.0.0
 */
export * as NewsFeed from "./NewsFeed.ts"

/**
 * Typed endpoint functions for `/api/objs` and related endpoints.
 *
 * @since 1.0.0
 */
export * as Objs from "./Objs.ts"

/**
 * Typed endpoint functions for `/api/observation_plan`.
 *
 * @since 1.0.0
 */
export * as ObservationPlans from "./ObservationPlans.ts"

/**
 * Typed endpoint functions for `/api/observation`.
 *
 * @since 1.0.0
 */
export * as Observations from "./Observations.ts"

/**
 * Typed endpoint functions for `/api/observing_run`.
 *
 * @since 1.0.0
 */
export * as ObservingRuns from "./ObservingRuns.ts"

/**
 * Typed endpoint functions for `/api/photometric_series`.
 *
 * @since 1.0.0
 */
export * as PhotometricSeries from "./PhotometricSeries.ts"

/**
 * Typed endpoint functions for photometry.
 *
 * @since 1.0.0
 */
export * as Photometry from "./Photometry.ts"

/**
 * Typed endpoint functions for `/api/internal/profile`.
 *
 * @since 1.0.0
 */
export * as Profile from "./Profile.ts"

/**
 * Typed endpoint functions for `/api/public_pages`.
 *
 * @since 1.0.0
 */
export * as PublicPages from "./PublicPages.ts"

/**
 * Typed endpoint functions for `/api/recurring_api`.
 *
 * @since 1.0.0
 */
export * as RecurringApis from "./RecurringApis.ts"

/**
 * Typed endpoint functions for `/api/{resourceType}/{id}/reminders`.
 *
 * @since 1.0.0
 */
export * as Reminders from "./Reminders.ts"

/**
 * Typed endpoint functions for `/api/roles`.
 *
 * @since 1.0.0
 */
export * as Roles from "./Roles.ts"

/**
 * Building blocks shared by the models of every resource module.
 *
 * @since 1.0.0
 */
export * as Schemas from "./Schemas.ts"

/**
 * Typed endpoint functions for `/api/sharing`.
 *
 * @since 1.0.0
 */
export * as Sharing from "./Sharing.ts"

/**
 * Typed endpoint functions for `/api/sharing_service`.
 *
 * @since 1.0.0
 */
export * as SharingServices from "./SharingServices.ts"

/**
 * Typed endpoint functions for `/api/shifts`.
 *
 * @since 1.0.0
 */
export * as Shifts from "./Shifts.ts"

/**
 * Typed endpoint functions for `/api/skymap_trigger`.
 *
 * @since 1.0.0
 */
export * as SkymapTriggers from "./SkymapTriggers.ts"

/**
 * Typed endpoint functions for `/api/source_groups`.
 *
 * @since 1.0.0
 */
export * as SourceGroups from "./SourceGroups.ts"

/**
 * Typed endpoint functions for `/api/sources`.
 *
 * @since 1.0.0
 */
export * as Sources from "./Sources.ts"

/**
 * Typed endpoint functions for `/api/spatial_catalog`.
 *
 * @since 1.0.0
 */
export * as SpatialCatalogs from "./SpatialCatalogs.ts"

/**
 * Typed endpoint functions for spectra.
 *
 * @since 1.0.0
 */
export * as Spectra from "./Spectra.ts"

/**
 * Typed endpoint functions for `/api/streams`.
 *
 * @since 1.0.0
 */
export * as Streams from "./Streams.ts"

/**
 * Typed endpoint functions for `/api/summary_query`.
 *
 * @since 1.0.0
 */
export * as SummaryQuery from "./SummaryQuery.ts"

/**
 * Typed endpoint functions for `/api/survey_efficiency`.
 *
 * @since 1.0.0
 */
export * as SurveyEfficiency from "./SurveyEfficiency.ts"

/**
 * Typed endpoint functions for the instance introspection endpoints.
 *
 * @since 1.0.0
 */
export * as System from "./System.ts"

/**
 * Typed endpoint functions for `/api/objtagoption` and `/api/objtag`.
 *
 * @since 1.0.0
 */
export * as Tags from "./Tags.ts"

/**
 * Typed endpoint functions for `/api/taxonomy`.
 *
 * @since 1.0.0
 */
export * as Taxonomies from "./Taxonomies.ts"

/**
 * Typed endpoint functions for `/api/teams`.
 *
 * @since 1.0.0
 */
export * as Teams from "./Teams.ts"

/**
 * Typed endpoint functions for `/api/telescope`.
 *
 * @since 1.0.0
 */
export * as Telescopes from "./Telescopes.ts"

/**
 * Typed endpoint functions for `/api/thumbnail`.
 *
 * @since 1.0.0
 */
export * as Thumbnails from "./Thumbnails.ts"

/**
 * Typed endpoint functions for `/api/internal/tokens`.
 *
 * @since 1.0.0
 */
export * as Tokens from "./Tokens.ts"

/**
 * Typed endpoint functions for `/api/user`.
 *
 * @since 1.0.0
 */
export * as Users from "./Users.ts"

/**
 * Typed endpoint functions for `/api/weather`.
 *
 * @since 1.0.0
 */
export * as Weather from "./Weather.ts"
