/**
 * Client construction.
 *
 * @since 1.0.0
 */

import type * as Http from "./Http.ts";

import * as Acls from "./Acls.ts";
import * as Allocations from "./Allocations.ts";
import * as Analysis from "./Analysis.ts";
import * as Annotations from "./Annotations.ts";
import * as Assignments from "./Assignments.ts";
import * as Brokers from "./Brokers.ts";
import * as Candidates from "./Candidates.ts";
import * as CatalogQueries from "./CatalogQueries.ts";
import * as Classifications from "./Classifications.ts";
import * as Comments from "./Comments.ts";
import * as Earthquakes from "./Earthquakes.ts";
import * as Filters from "./Filters.ts";
import * as FollowupRequests from "./FollowupRequests.ts";
import * as Galaxies from "./Galaxies.ts";
import * as GcnEvents from "./GcnEvents.ts";
import * as GroupAdmissionRequests from "./GroupAdmissionRequests.ts";
import * as Groups from "./Groups.ts";
import * as Healpix from "./Healpix.ts";
import * as Instruments from "./Instruments.ts";
import * as Invitations from "./Invitations.ts";
import * as Listings from "./Listings.ts";
import * as Localizations from "./Localizations.ts";
import * as MmaDetectors from "./MmaDetectors.ts";
import * as MovingObjects from "./MovingObjects.ts";
import * as NewsFeed from "./NewsFeed.ts";
import * as Objs from "./Objs.ts";
import * as ObservationPlans from "./ObservationPlans.ts";
import * as Observations from "./Observations.ts";
import * as ObservingRuns from "./ObservingRuns.ts";
import * as PhotometricSeries from "./PhotometricSeries.ts";
import * as Photometry from "./Photometry.ts";
import * as Profile from "./Profile.ts";
import * as PublicPages from "./PublicPages.ts";
import * as RecurringApis from "./RecurringApis.ts";
import * as Reminders from "./Reminders.ts";
import * as Roles from "./Roles.ts";
import * as Sharing from "./Sharing.ts";
import * as SharingServices from "./SharingServices.ts";
import * as Shifts from "./Shifts.ts";
import * as SkymapTriggers from "./SkymapTriggers.ts";
import * as SourceGroups from "./SourceGroups.ts";
import * as Sources from "./Sources.ts";
import * as SpatialCatalogs from "./SpatialCatalogs.ts";
import * as Spectra from "./Spectra.ts";
import * as Streams from "./Streams.ts";
import * as SummaryQuery from "./SummaryQuery.ts";
import * as SurveyEfficiency from "./SurveyEfficiency.ts";
import * as System from "./System.ts";
import * as Tags from "./Tags.ts";
import * as Taxonomies from "./Taxonomies.ts";
import * as Teams from "./Teams.ts";
import * as Telescopes from "./Telescopes.ts";
import * as Thumbnails from "./Thumbnails.ts";
import * as Tokens from "./Tokens.ts";
import * as Users from "./Users.ts";
import * as Weather from "./Weather.ts";

/**
 * Options for {@link createClient}.
 *
 * @since 1.0.0
 * @category Models
 */
export interface CreateClientOptions {
    /**
     * API token from your SkyPortal profile page. Omit for anonymous access to
     * instances that allow it.
     */
    readonly token?: string | undefined;
    /**
     * Timeout in milliseconds applied to every request; `null` disables it.
     * Defaults to 30 seconds.
     */
    readonly timeout?: number | null | undefined;
    /** Extra headers sent with every request. */
    readonly headers?: Record<string, string> | undefined;
    /**
     * The `fetch` implementation to use. Defaults to the global one, so this
     * only needs setting to install a mock or a proxying agent.
     */
    readonly fetch?: typeof globalThis.fetch | undefined;
}

/**
 * Turn the endpoint functions of a module into methods: each takes the client
 * as its first argument, so binding it away leaves the caller's arguments.
 *
 * @since 1.0.0
 * @category Models
 */
export type Bound<TEndpoints> = {
    readonly [K in keyof TEndpoints]: TEndpoints[K] extends (client: Http.Client, ...args: infer TArgs) => infer TResult
        ? (...args: TArgs) => TResult
        : never;
};

/** @internal */
const endpoints = {
    fetchAcls: Acls.fetchAcls,
    postUserAcl: Acls.postUserAcl,
    deleteUserAcl: Acls.deleteUserAcl,
    fetchAllocations: Allocations.fetchAllocations,
    fetchAllocation: Allocations.fetchAllocation,
    postAllocation: Allocations.postAllocation,
    updateAllocation: Allocations.updateAllocation,
    deleteAllocation: Allocations.deleteAllocation,
    fetchAllocationReport: Allocations.fetchAllocationReport,
    fetchAnalysisService: Analysis.fetchAnalysisService,
    fetchAnalysisServices: Analysis.fetchAnalysisServices,
    postAnalysisService: Analysis.postAnalysisService,
    updateAnalysisService: Analysis.updateAnalysisService,
    deleteAnalysisService: Analysis.deleteAnalysisService,
    fetchDefaultAnalysis: Analysis.fetchDefaultAnalysis,
    fetchDefaultAnalyses: Analysis.fetchDefaultAnalyses,
    postDefaultAnalysis: Analysis.postDefaultAnalysis,
    updateDefaultAnalysis: Analysis.updateDefaultAnalysis,
    deleteDefaultAnalysis: Analysis.deleteDefaultAnalysis,
    postAnalysis: Analysis.postAnalysis,
    fetchAnalysis: Analysis.fetchAnalysis,
    fetchAnalyses: Analysis.fetchAnalyses,
    deleteAnalysis: Analysis.deleteAnalysis,
    postAnalysisUpload: Analysis.postAnalysisUpload,
    fetchAnalysisResults: Analysis.fetchAnalysisResults,
    fetchAnalysisResultsFile: Analysis.fetchAnalysisResultsFile,
    fetchAnalysisPlot: Analysis.fetchAnalysisPlot,
    fetchAnnotations: Annotations.fetchAnnotations,
    postAnnotation: Annotations.postAnnotation,
    updateAnnotation: Annotations.updateAnnotation,
    deleteAnnotation: Annotations.deleteAnnotation,
    fetchAnnotation: Annotations.fetchAnnotation,
    postGaiaAnnotation: Annotations.postGaiaAnnotation,
    postIrsaAnnotation: Annotations.postIrsaAnnotation,
    postVizierAnnotation: Annotations.postVizierAnnotation,
    postDatalabAnnotation: Annotations.postDatalabAnnotation,
    postPs1Annotation: Annotations.postPs1Annotation,
    fetchAssignment: Assignments.fetchAssignment,
    fetchAssignments: Assignments.fetchAssignments,
    postAssignment: Assignments.postAssignment,
    updateAssignment: Assignments.updateAssignment,
    deleteAssignment: Assignments.deleteAssignment,
    fetchBrokers: Brokers.fetchBrokers,
    fetchBroker: Brokers.fetchBroker,
    postBroker: Brokers.postBroker,
    updateBroker: Brokers.updateBroker,
    deleteBroker: Brokers.deleteBroker,
    fetchBrokerAlerts: Brokers.fetchBrokerAlerts,
    fetchBrokerAlert: Brokers.fetchBrokerAlert,
    fetchBrokerCutouts: Brokers.fetchBrokerCutouts,
    fetchBrokerPhotometry: Brokers.fetchBrokerPhotometry,
    fetchBrokerSurveyPhotometry: Brokers.fetchBrokerSurveyPhotometry,
    postBrokerAlertSave: Brokers.postBrokerAlertSave,
    fetchBrokerConeSearch: Brokers.fetchBrokerConeSearch,
    fetchBrokerFilters: Brokers.fetchBrokerFilters,
    fetchBrokerFilter: Brokers.fetchBrokerFilter,
    postBrokerFilter: Brokers.postBrokerFilter,
    updateBrokerFilter: Brokers.updateBrokerFilter,
    deleteBrokerFilter: Brokers.deleteBrokerFilter,
    fetchBrokerFilterCatalog: Brokers.fetchBrokerFilterCatalog,
    postBrokerFilterAttach: Brokers.postBrokerFilterAttach,
    postBrokerFilterTest: Brokers.postBrokerFilterTest,
    postBrokerFilterValidation: Brokers.postBrokerFilterValidation,
    fetchBrokerFilterModules: Brokers.fetchBrokerFilterModules,
    fetchBrokerFilterModule: Brokers.fetchBrokerFilterModule,
    postBrokerFilterModule: Brokers.postBrokerFilterModule,
    updateBrokerFilterModule: Brokers.updateBrokerFilterModule,
    fetchCandidate: Candidates.fetchCandidate,
    candidateExists: Candidates.candidateExists,
    fetchCandidates: Candidates.fetchCandidates,
    postCandidate: Candidates.postCandidate,
    deleteCandidate: Candidates.deleteCandidate,
    bulkDeleteCandidates: Candidates.bulkDeleteCandidates,
    fetchCandidatesFilter: Candidates.fetchCandidatesFilter,
    postScanReport: Candidates.postScanReport,
    fetchScanReports: Candidates.fetchScanReports,
    fetchScanReportItems: Candidates.fetchScanReportItems,
    updateScanReportItem: Candidates.updateScanReportItem,
    postCatalogQuery: CatalogQueries.postCatalogQuery,
    postSwiftLsxpsQuery: CatalogQueries.postSwiftLsxpsQuery,
    postGaiaAlertsQuery: CatalogQueries.postGaiaAlertsQuery,
    fetchClassifications: Classifications.fetchClassifications,
    postClassification: Classifications.postClassification,
    postClassifications: Classifications.postClassifications,
    deleteClassification: Classifications.deleteClassification,
    fetchClassification: Classifications.fetchClassification,
    fetchClassificationsQuery: Classifications.fetchClassificationsQuery,
    updateClassification: Classifications.updateClassification,
    deleteSourceClassifications: Classifications.deleteSourceClassifications,
    postClassificationVote: Classifications.postClassificationVote,
    deleteClassificationVote: Classifications.deleteClassificationVote,
    fetchSourcesByClassification: Classifications.fetchSourcesByClassification,
    fetchComments: Comments.fetchComments,
    postComment: Comments.postComment,
    updateComment: Comments.updateComment,
    deleteComment: Comments.deleteComment,
    fetchComment: Comments.fetchComment,
    postCommentWithAttachment: Comments.postCommentWithAttachment,
    fetchCommentAttachment: Comments.fetchCommentAttachment,
    fetchCommentAttachmentPdf: Comments.fetchCommentAttachmentPdf,
    fetchCommentAttachmentText: Comments.fetchCommentAttachmentText,
    fetchCommentAttachmentCounts: Comments.fetchCommentAttachmentCounts,
    postCommentAttachmentBatch: Comments.postCommentAttachmentBatch,
    fetchEarthquake: Earthquakes.fetchEarthquake,
    fetchEarthquakes: Earthquakes.fetchEarthquakes,
    fetchEarthquakeStatuses: Earthquakes.fetchEarthquakeStatuses,
    postEarthquake: Earthquakes.postEarthquake,
    deleteEarthquake: Earthquakes.deleteEarthquake,
    postEarthquakePrediction: Earthquakes.postEarthquakePrediction,
    fetchEarthquakeMeasurement: Earthquakes.fetchEarthquakeMeasurement,
    postEarthquakeMeasurement: Earthquakes.postEarthquakeMeasurement,
    updateEarthquakeMeasurement: Earthquakes.updateEarthquakeMeasurement,
    deleteEarthquakeMeasurement: Earthquakes.deleteEarthquakeMeasurement,
    fetchFilters: Filters.fetchFilters,
    fetchFilter: Filters.fetchFilter,
    postFilter: Filters.postFilter,
    updateFilter: Filters.updateFilter,
    deleteFilter: Filters.deleteFilter,
    fetchFollowupRequest: FollowupRequests.fetchFollowupRequest,
    fetchFollowupRequests: FollowupRequests.fetchFollowupRequests,
    postFollowupRequest: FollowupRequests.postFollowupRequest,
    deleteFollowupRequest: FollowupRequests.deleteFollowupRequest,
    updateFollowupRequest: FollowupRequests.updateFollowupRequest,
    postFollowupRequestComment: FollowupRequests.postFollowupRequestComment,
    postFollowupRequestWatcher: FollowupRequests.postFollowupRequestWatcher,
    deleteFollowupRequestWatcher: FollowupRequests.deleteFollowupRequestWatcher,
    fetchFollowupRequestSchedule: FollowupRequests.fetchFollowupRequestSchedule,
    updateFollowupRequestPrioritization: FollowupRequests.updateFollowupRequestPrioritization,
    fetchDefaultFollowupRequest: FollowupRequests.fetchDefaultFollowupRequest,
    fetchDefaultFollowupRequests: FollowupRequests.fetchDefaultFollowupRequests,
    postDefaultFollowupRequest: FollowupRequests.postDefaultFollowupRequest,
    deleteDefaultFollowupRequest: FollowupRequests.deleteDefaultFollowupRequest,
    requestFollowupPhotometry: FollowupRequests.requestFollowupPhotometry,
    postFacilityMessage: FollowupRequests.postFacilityMessage,
    fetchGalaxies: Galaxies.fetchGalaxies,
    fetchGalaxyCatalogs: Galaxies.fetchGalaxyCatalogs,
    postGalaxyCatalog: Galaxies.postGalaxyCatalog,
    deleteGalaxyCatalog: Galaxies.deleteGalaxyCatalog,
    postGalaxyCatalogAscii: Galaxies.postGalaxyCatalogAscii,
    postGalaxyCatalogRegalade: Galaxies.postGalaxyCatalogRegalade,
    postGalaxyCatalogNed: Galaxies.postGalaxyCatalogNed,
    postGcnEvent: GcnEvents.postGcnEvent,
    fetchGcnEvent: GcnEvents.fetchGcnEvent,
    fetchGcnEvents: GcnEvents.fetchGcnEvents,
    deleteGcnEvent: GcnEvents.deleteGcnEvent,
    postGcnEventAlias: GcnEvents.postGcnEventAlias,
    deleteGcnEventAlias: GcnEvents.deleteGcnEventAlias,
    fetchGcnEventTags: GcnEvents.fetchGcnEventTags,
    postGcnEventTag: GcnEvents.postGcnEventTag,
    deleteGcnEventTag: GcnEvents.deleteGcnEventTag,
    fetchGcnEventProperties: GcnEvents.fetchGcnEventProperties,
    fetchGcnEventSurveyEfficiency: GcnEvents.fetchGcnEventSurveyEfficiency,
    fetchGcnEventObservationPlanRequests: GcnEvents.fetchGcnEventObservationPlanRequests,
    fetchGcnEventCatalogQueries: GcnEvents.fetchGcnEventCatalogQueries,
    postGcnEventUser: GcnEvents.postGcnEventUser,
    deleteGcnEventUser: GcnEvents.deleteGcnEventUser,
    fetchGcnEventNoticeDownload: GcnEvents.fetchGcnEventNoticeDownload,
    postGcnEventGracedb: GcnEvents.postGcnEventGracedb,
    postGcnEventTach: GcnEvents.postGcnEventTach,
    fetchGcnEventTach: GcnEvents.fetchGcnEventTach,
    fetchGcnEventCrossmatch: GcnEvents.fetchGcnEventCrossmatch,
    postGcnEventCrossmatch: GcnEvents.postGcnEventCrossmatch,
    fetchGcnEventInstrumentFields: GcnEvents.fetchGcnEventInstrumentFields,
    fetchGcnEventTriggers: GcnEvents.fetchGcnEventTriggers,
    updateGcnEventTrigger: GcnEvents.updateGcnEventTrigger,
    deleteGcnEventTrigger: GcnEvents.deleteGcnEventTrigger,
    postGcnSummary: GcnEvents.postGcnSummary,
    fetchGcnSummary: GcnEvents.fetchGcnSummary,
    updateGcnSummary: GcnEvents.updateGcnSummary,
    deleteGcnSummary: GcnEvents.deleteGcnSummary,
    postGcnReport: GcnEvents.postGcnReport,
    fetchGcnReports: GcnEvents.fetchGcnReports,
    fetchGcnReport: GcnEvents.fetchGcnReport,
    updateGcnReport: GcnEvents.updateGcnReport,
    deleteGcnReport: GcnEvents.deleteGcnReport,
    postDefaultGcnTag: GcnEvents.postDefaultGcnTag,
    fetchDefaultGcnTag: GcnEvents.fetchDefaultGcnTag,
    fetchDefaultGcnTags: GcnEvents.fetchDefaultGcnTags,
    deleteDefaultGcnTag: GcnEvents.deleteDefaultGcnTag,
    fetchGcnEventSources: GcnEvents.fetchGcnEventSources,
    fetchGcnEventSource: GcnEvents.fetchGcnEventSource,
    postGcnEventSource: GcnEvents.postGcnEventSource,
    updateGcnEventSource: GcnEvents.updateGcnEventSource,
    deleteGcnEventSource: GcnEvents.deleteGcnEventSource,
    fetchGcnEventsAssociatedWithSource: GcnEvents.fetchGcnEventsAssociatedWithSource,
    postGcnEventObjCrossmatch: GcnEvents.postGcnEventObjCrossmatch,
    fetchGroupAdmissionRequest: GroupAdmissionRequests.fetchGroupAdmissionRequest,
    fetchGroupAdmissionRequests: GroupAdmissionRequests.fetchGroupAdmissionRequests,
    postGroupAdmissionRequest: GroupAdmissionRequests.postGroupAdmissionRequest,
    updateGroupAdmissionRequest: GroupAdmissionRequests.updateGroupAdmissionRequest,
    deleteGroupAdmissionRequest: GroupAdmissionRequests.deleteGroupAdmissionRequest,
    fetchGroups: Groups.fetchGroups,
    fetchGroup: Groups.fetchGroup,
    fetchGroupsByName: Groups.fetchGroupsByName,
    postGroup: Groups.postGroup,
    updateGroup: Groups.updateGroup,
    deleteGroup: Groups.deleteGroup,
    fetchPublicGroup: Groups.fetchPublicGroup,
    postGroupStream: Groups.postGroupStream,
    deleteGroupStream: Groups.deleteGroupStream,
    postGroupUser: Groups.postGroupUser,
    updateGroupUser: Groups.updateGroupUser,
    deleteGroupUser: Groups.deleteGroupUser,
    postGroupUsersFromGroups: Groups.postGroupUsersFromGroups,
    fetchHealpixCounts: Healpix.fetchHealpixCounts,
    postHealpixUpdate: Healpix.postHealpixUpdate,
    fetchInstruments: Instruments.fetchInstruments,
    fetchInstrument: Instruments.fetchInstrument,
    postInstrument: Instruments.postInstrument,
    updateInstrument: Instruments.updateInstrument,
    deleteInstrument: Instruments.deleteInstrument,
    deleteInstrumentFields: Instruments.deleteInstrumentFields,
    fetchInstrumentLogs: Instruments.fetchInstrumentLogs,
    postInstrumentLog: Instruments.postInstrumentLog,
    fetchInstrumentLogExternalApi: Instruments.fetchInstrumentLogExternalApi,
    updateInstrumentStatus: Instruments.updateInstrumentStatus,
    fetchInvitations: Invitations.fetchInvitations,
    postInvitation: Invitations.postInvitation,
    updateInvitation: Invitations.updateInvitation,
    deleteInvitation: Invitations.deleteInvitation,
    fetchListings: Listings.fetchListings,
    postListing: Listings.postListing,
    updateListing: Listings.updateListing,
    deleteListing: Listings.deleteListing,
    deleteListingByName: Listings.deleteListingByName,
    fetchLocalization: Localizations.fetchLocalization,
    deleteLocalization: Localizations.deleteLocalization,
    postLocalizationFromNotice: Localizations.postLocalizationFromNotice,
    fetchLocalizationSkymap: Localizations.fetchLocalizationSkymap,
    fetchLocalizationTags: Localizations.fetchLocalizationTags,
    fetchLocalizationProperties: Localizations.fetchLocalizationProperties,
    fetchLocalizationCrossmatch: Localizations.fetchLocalizationCrossmatch,
    fetchLocalizationObservabilityPlot: Localizations.fetchLocalizationObservabilityPlot,
    fetchLocalizationAirmassChart: Localizations.fetchLocalizationAirmassChart,
    fetchLocalizationWorldmapPlot: Localizations.fetchLocalizationWorldmapPlot,
    fetchMmaDetector: MmaDetectors.fetchMmaDetector,
    fetchMmaDetectors: MmaDetectors.fetchMmaDetectors,
    postMmaDetector: MmaDetectors.postMmaDetector,
    updateMmaDetector: MmaDetectors.updateMmaDetector,
    deleteMmaDetector: MmaDetectors.deleteMmaDetector,
    fetchMmaDetectorSpectrum: MmaDetectors.fetchMmaDetectorSpectrum,
    fetchMmaDetectorSpectra: MmaDetectors.fetchMmaDetectorSpectra,
    postMmaDetectorSpectrum: MmaDetectors.postMmaDetectorSpectrum,
    updateMmaDetectorSpectrum: MmaDetectors.updateMmaDetectorSpectrum,
    deleteMmaDetectorSpectrum: MmaDetectors.deleteMmaDetectorSpectrum,
    fetchMmaDetectorTimeInterval: MmaDetectors.fetchMmaDetectorTimeInterval,
    fetchMmaDetectorTimeIntervals: MmaDetectors.fetchMmaDetectorTimeIntervals,
    postMmaDetectorTimeIntervals: MmaDetectors.postMmaDetectorTimeIntervals,
    updateMmaDetectorTimeInterval: MmaDetectors.updateMmaDetectorTimeInterval,
    deleteMmaDetectorTimeInterval: MmaDetectors.deleteMmaDetectorTimeInterval,
    postMovingObjectFollowup: MovingObjects.postMovingObjectFollowup,
    fetchNewsFeed: NewsFeed.fetchNewsFeed,
    deleteObj: Objs.deleteObj,
    fetchObjPosition: Objs.fetchObjPosition,
    postSuperObj: Objs.postSuperObj,
    fetchSuperObj: Objs.fetchSuperObj,
    fetchSuperObjs: Objs.fetchSuperObjs,
    updateSuperObj: Objs.updateSuperObj,
    deleteSuperObj: Objs.deleteSuperObj,
    fetchUnsourcedFindingChart: Objs.fetchUnsourcedFindingChart,
    postObservationPlan: ObservationPlans.postObservationPlan,
    postObservationPlans: ObservationPlans.postObservationPlans,
    fetchObservationPlan: ObservationPlans.fetchObservationPlan,
    fetchObservationPlanRubin: ObservationPlans.fetchObservationPlanRubin,
    fetchObservationPlans: ObservationPlans.fetchObservationPlans,
    deleteObservationPlan: ObservationPlans.deleteObservationPlan,
    postObservationPlanManual: ObservationPlans.postObservationPlanManual,
    fetchObservationPlanNames: ObservationPlans.fetchObservationPlanNames,
    fetchObservationPlanNameExists: ObservationPlans.fetchObservationPlanNameExists,
    postObservationPlanTreasuremap: ObservationPlans.postObservationPlanTreasuremap,
    deleteObservationPlanTreasuremap: ObservationPlans.deleteObservationPlanTreasuremap,
    fetchObservationPlanGcn: ObservationPlans.fetchObservationPlanGcn,
    postObservationPlanQueue: ObservationPlans.postObservationPlanQueue,
    deleteObservationPlanQueue: ObservationPlans.deleteObservationPlanQueue,
    fetchObservationPlanMovie: ObservationPlans.fetchObservationPlanMovie,
    fetchObservationPlanSimSurvey: ObservationPlans.fetchObservationPlanSimSurvey,
    deleteObservationPlanSimSurvey: ObservationPlans.deleteObservationPlanSimSurvey,
    fetchObservationPlanSimSurveyPlot: ObservationPlans.fetchObservationPlanSimSurveyPlot,
    fetchObservationPlanGeoJson: ObservationPlans.fetchObservationPlanGeoJson,
    fetchObservationPlanSurveyEfficiency: ObservationPlans.fetchObservationPlanSurveyEfficiency,
    postObservationPlanObservingRun: ObservationPlans.postObservationPlanObservingRun,
    deleteObservationPlanFields: ObservationPlans.deleteObservationPlanFields,
    postDefaultObservationPlan: ObservationPlans.postDefaultObservationPlan,
    fetchDefaultObservationPlan: ObservationPlans.fetchDefaultObservationPlan,
    fetchDefaultObservationPlans: ObservationPlans.fetchDefaultObservationPlans,
    deleteDefaultObservationPlan: ObservationPlans.deleteDefaultObservationPlan,
    fetchAllocationObservationPlans: ObservationPlans.fetchAllocationObservationPlans,
    fetchObservations: Observations.fetchObservations,
    postObservation: Observations.postObservation,
    deleteObservation: Observations.deleteObservation,
    postObservationAscii: Observations.postObservationAscii,
    fetchObservationSimSurvey: Observations.fetchObservationSimSurvey,
    deleteObservationSimSurvey: Observations.deleteObservationSimSurvey,
    fetchObservationSimSurveyPlot: Observations.fetchObservationSimSurveyPlot,
    postObservationTreasuremap: Observations.postObservationTreasuremap,
    deleteObservationTreasuremap: Observations.deleteObservationTreasuremap,
    postObservationExternalApi: Observations.postObservationExternalApi,
    fetchObservationExternalApi: Observations.fetchObservationExternalApi,
    deleteObservationExternalApi: Observations.deleteObservationExternalApi,
    fetchObservingRuns: ObservingRuns.fetchObservingRuns,
    fetchObservingRun: ObservingRuns.fetchObservingRun,
    postObservingRun: ObservingRuns.postObservingRun,
    deleteObservingRun: ObservingRuns.deleteObservingRun,
    updateObservingRun: ObservingRuns.updateObservingRun,
    updateObservingRunNotObserved: ObservingRuns.updateObservingRunNotObserved,
    fetchPhotometricSeries: PhotometricSeries.fetchPhotometricSeries,
    fetchPhotometricSeriesPage: PhotometricSeries.fetchPhotometricSeriesPage,
    postPhotometricSeries: PhotometricSeries.postPhotometricSeries,
    updatePhotometricSeries: PhotometricSeries.updatePhotometricSeries,
    deletePhotometricSeries: PhotometricSeries.deletePhotometricSeries,
    fetchPhotometry: Photometry.fetchPhotometry,
    postPhotometry: Photometry.postPhotometry,
    upsertPhotometry: Photometry.upsertPhotometry,
    fetchPhotometryPoint: Photometry.fetchPhotometryPoint,
    deletePhotometry: Photometry.deletePhotometry,
    updatePhotometry: Photometry.updatePhotometry,
    fetchPhotometryRange: Photometry.fetchPhotometryRange,
    fetchPhotometryOrigins: Photometry.fetchPhotometryOrigins,
    bulkDeletePhotometry: Photometry.bulkDeletePhotometry,
    postPhotometryValidation: Photometry.postPhotometryValidation,
    updatePhotometryValidation: Photometry.updatePhotometryValidation,
    deletePhotometryValidation: Photometry.deletePhotometryValidation,
    fetchProfile: Profile.fetchProfile,
    updateProfile: Profile.updateProfile,
    fetchPublicSourcePages: PublicPages.fetchPublicSourcePages,
    postPublicSourcePage: PublicPages.postPublicSourcePage,
    deletePublicSourcePage: PublicPages.deletePublicSourcePage,
    fetchPublicReleases: PublicPages.fetchPublicReleases,
    postPublicRelease: PublicPages.postPublicRelease,
    updatePublicRelease: PublicPages.updatePublicRelease,
    deletePublicRelease: PublicPages.deletePublicRelease,
    fetchRecurringApis: RecurringApis.fetchRecurringApis,
    fetchRecurringApi: RecurringApis.fetchRecurringApi,
    postRecurringApi: RecurringApis.postRecurringApi,
    deleteRecurringApi: RecurringApis.deleteRecurringApi,
    fetchReminders: Reminders.fetchReminders,
    fetchReminder: Reminders.fetchReminder,
    postReminder: Reminders.postReminder,
    updateReminder: Reminders.updateReminder,
    deleteReminder: Reminders.deleteReminder,
    fetchRoles: Roles.fetchRoles,
    postUserRole: Roles.postUserRole,
    deleteUserRole: Roles.deleteUserRole,
    postSharing: Sharing.postSharing,
    fetchSharingServices: SharingServices.fetchSharingServices,
    fetchSharingService: SharingServices.fetchSharingService,
    postSharingService: SharingServices.postSharingService,
    updateSharingService: SharingServices.updateSharingService,
    deleteSharingService: SharingServices.deleteSharingService,
    postSharingServiceSubmission: SharingServices.postSharingServiceSubmission,
    fetchSharingServiceSubmission: SharingServices.fetchSharingServiceSubmission,
    fetchSharingServiceSubmissions: SharingServices.fetchSharingServiceSubmissions,
    postSharingServiceCoauthor: SharingServices.postSharingServiceCoauthor,
    deleteSharingServiceCoauthor: SharingServices.deleteSharingServiceCoauthor,
    updateSharingServiceGroup: SharingServices.updateSharingServiceGroup,
    deleteSharingServiceGroup: SharingServices.deleteSharingServiceGroup,
    postSharingServiceAutoPublishers: SharingServices.postSharingServiceAutoPublishers,
    deleteSharingServiceAutoPublishers: SharingServices.deleteSharingServiceAutoPublishers,
    fetchShift: Shifts.fetchShift,
    fetchShifts: Shifts.fetchShifts,
    postShift: Shifts.postShift,
    updateShift: Shifts.updateShift,
    deleteShift: Shifts.deleteShift,
    postShiftUser: Shifts.postShiftUser,
    updateShiftUser: Shifts.updateShiftUser,
    deleteShiftUser: Shifts.deleteShiftUser,
    fetchShiftSummary: Shifts.fetchShiftSummary,
    fetchSkymapTriggers: SkymapTriggers.fetchSkymapTriggers,
    postSkymapTrigger: SkymapTriggers.postSkymapTrigger,
    deleteSkymapTrigger: SkymapTriggers.deleteSkymapTrigger,
    postSourceGroups: SourceGroups.postSourceGroups,
    updateSourceGroup: SourceGroups.updateSourceGroup,
    fetchSource: Sources.fetchSource,
    sourceExists: Sources.sourceExists,
    fetchSources: Sources.fetchSources,
    fetchSourcesSaveSummary: Sources.fetchSourcesSaveSummary,
    postSource: Sources.postSource,
    updateSource: Sources.updateSource,
    deleteSource: Sources.deleteSource,
    deleteSourcePhotometry: Sources.deleteSourcePhotometry,
    fetchSourceOffsets: Sources.fetchSourceOffsets,
    fetchSourceFinder: Sources.fetchSourceFinder,
    fetchSourceFinderJson: Sources.fetchSourceFinderJson,
    fetchFinderChartFacilities: Sources.fetchFinderChartFacilities,
    postSourceHost: Sources.postSourceHost,
    deleteSourceHost: Sources.deleteSourceHost,
    fetchSourceSavedGroups: Sources.fetchSourceSavedGroups,
    postSourceLabels: Sources.postSourceLabels,
    deleteSourceLabels: Sources.deleteSourceLabels,
    fetchSourceColorMag: Sources.fetchSourceColorMag,
    postSourceGcnEventCrossmatch: Sources.postSourceGcnEventCrossmatch,
    postSourceMpcQuery: Sources.postSourceMpcQuery,
    fetchSourceTns: Sources.fetchSourceTns,
    fetchSourceObservability: Sources.fetchSourceObservability,
    postSourcePhotometryCopy: Sources.postSourcePhotometryCopy,
    fetchSourcePhotStat: Sources.fetchSourcePhotStat,
    postSourcePhotStat: Sources.postSourcePhotStat,
    updateSourcePhotStat: Sources.updateSourcePhotStat,
    deleteSourcePhotStat: Sources.deleteSourcePhotStat,
    fetchPhotStatsCounts: Sources.fetchPhotStatsCounts,
    postPhotStats: Sources.postPhotStats,
    updatePhotStats: Sources.updatePhotStats,
    fetchPhotStatsAggregate: Sources.fetchPhotStatsAggregate,
    fetchSourceExists: Sources.fetchSourceExists,
    postSourceNotification: Sources.postSourceNotification,
    fetchSpatialCatalog: SpatialCatalogs.fetchSpatialCatalog,
    fetchSpatialCatalogs: SpatialCatalogs.fetchSpatialCatalogs,
    postSpatialCatalog: SpatialCatalogs.postSpatialCatalog,
    deleteSpatialCatalog: SpatialCatalogs.deleteSpatialCatalog,
    postSpatialCatalogAscii: SpatialCatalogs.postSpatialCatalogAscii,
    fetchSpectrum: Spectra.fetchSpectrum,
    fetchSpectra: Spectra.fetchSpectra,
    postSpectrum: Spectra.postSpectrum,
    deleteSpectrum: Spectra.deleteSpectrum,
    updateSpectrum: Spectra.updateSpectrum,
    fetchSpectraQuery: Spectra.fetchSpectraQuery,
    fetchSpectraRange: Spectra.fetchSpectraRange,
    postSpectraBulk: Spectra.postSpectraBulk,
    parseSpectrumAscii: Spectra.parseSpectrumAscii,
    postSpectrumAscii: Spectra.postSpectrumAscii,
    postSyntheticPhotometry: Spectra.postSyntheticPhotometry,
    fetchStreams: Streams.fetchStreams,
    fetchStream: Streams.fetchStream,
    postStream: Streams.postStream,
    updateStream: Streams.updateStream,
    deleteStream: Streams.deleteStream,
    postStreamUser: Streams.postStreamUser,
    deleteStreamUser: Streams.deleteStreamUser,
    postSummaryQuery: SummaryQuery.postSummaryQuery,
    fetchSurveyEfficiencyForObservations: SurveyEfficiency.fetchSurveyEfficiencyForObservations,
    fetchSurveyEfficienciesForObservations: SurveyEfficiency.fetchSurveyEfficienciesForObservations,
    fetchSurveyEfficiencyForObservationPlan: SurveyEfficiency.fetchSurveyEfficiencyForObservationPlan,
    fetchSurveyEfficienciesForObservationPlan: SurveyEfficiency.fetchSurveyEfficienciesForObservationPlan,
    postDefaultSurveyEfficiency: SurveyEfficiency.postDefaultSurveyEfficiency,
    fetchDefaultSurveyEfficiency: SurveyEfficiency.fetchDefaultSurveyEfficiency,
    fetchDefaultSurveyEfficiencies: SurveyEfficiency.fetchDefaultSurveyEfficiencies,
    deleteDefaultSurveyEfficiency: SurveyEfficiency.deleteDefaultSurveyEfficiency,
    fetchSysinfo: System.fetchSysinfo,
    fetchDbinfo: System.fetchDbinfo,
    fetchAltdataInfo: System.fetchAltdataInfo,
    fetchAnnotationsInfo: System.fetchAnnotationsInfo,
    fetchConfig: System.fetchConfig,
    fetchDbStats: System.fetchDbStats,
    fetchEnumTypes: System.fetchEnumTypes,
    fetchObjTagOptions: Tags.fetchObjTagOptions,
    postObjTagOption: Tags.postObjTagOption,
    updateObjTagOption: Tags.updateObjTagOption,
    deleteObjTagOption: Tags.deleteObjTagOption,
    fetchObjTags: Tags.fetchObjTags,
    postObjTag: Tags.postObjTag,
    deleteObjTag: Tags.deleteObjTag,
    fetchTaxonomies: Taxonomies.fetchTaxonomies,
    fetchTaxonomy: Taxonomies.fetchTaxonomy,
    postTaxonomy: Taxonomies.postTaxonomy,
    updateTaxonomy: Taxonomies.updateTaxonomy,
    deleteTaxonomy: Taxonomies.deleteTaxonomy,
    fetchTeams: Teams.fetchTeams,
    fetchTeam: Teams.fetchTeam,
    postTeam: Teams.postTeam,
    updateTeam: Teams.updateTeam,
    deleteTeam: Teams.deleteTeam,
    fetchTelescopes: Telescopes.fetchTelescopes,
    fetchTelescope: Telescopes.fetchTelescope,
    postTelescope: Telescopes.postTelescope,
    updateTelescope: Telescopes.updateTelescope,
    deleteTelescope: Telescopes.deleteTelescope,
    fetchThumbnail: Thumbnails.fetchThumbnail,
    postThumbnail: Thumbnails.postThumbnail,
    updateThumbnail: Thumbnails.updateThumbnail,
    deleteThumbnail: Thumbnails.deleteThumbnail,
    fetchThumbnailPaths: Thumbnails.fetchThumbnailPaths,
    updateThumbnailPaths: Thumbnails.updateThumbnailPaths,
    deleteThumbnailFolders: Thumbnails.deleteThumbnailFolders,
    fetchTokens: Tokens.fetchTokens,
    fetchToken: Tokens.fetchToken,
    postToken: Tokens.postToken,
    updateToken: Tokens.updateToken,
    deleteToken: Tokens.deleteToken,
    fetchUsers: Users.fetchUsers,
    fetchUser: Users.fetchUser,
    postUser: Users.postUser,
    updateUser: Users.updateUser,
    deleteUser: Users.deleteUser,
    fetchWeather: Weather.fetchWeather,
} as const;

/**
 * A SkyPortal client: the transport plus every endpoint function bound as a
 * method.
 *
 * Both spellings work, exactly as in the Python client:
 * `client.fetchSource("ZTF...")` and `Sources.fetchSource(client, "ZTF...")`.
 *
 * @since 1.0.0
 * @category Models
 */
export type SkyPortal = Http.Client & Bound<typeof endpoints>;

/** @internal */
const buildUrl = (baseUrl: string, path: string, query: Http.QueryParams | undefined): string => {
    const url = new URL(path.replace(/^\//, ""), baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
    for (const [key, value] of Object.entries(query ?? {})) {
        if (value === null || value === undefined) {
            continue;
        }
        if (Array.isArray(value)) {
            for (const item of value) {
                url.searchParams.append(key, String(item));
            }
        } else {
            url.searchParams.append(key, String(value));
        }
    }
    return url.toString();
};

/**
 * Create a client configured for a SkyPortal instance.
 *
 * Reuse one client per instance: `fetch` pools connections, so repeated
 * requests skip the TCP/TLS handshake.
 *
 * @since 1.0.0
 * @category Constructors
 * @param baseUrl - Root URL of the SkyPortal instance, e.g.
 *   `https://fritz.science`.
 * @example
 * ```ts
 * import { createClient } from "skyportal-js/Client"
 *
 * const client = createClient("https://skyportal.example.com", { token: "your-api-token" })
 * const me = await client.fetchProfile()
 * const page = await client.fetchSources({ numPerPage: 10 })
 * ```
 */
export const createClient = (baseUrl: string, options: CreateClientOptions = {}): SkyPortal => {
    const doFetch = options.fetch ?? globalThis.fetch;
    const timeout = options.timeout === undefined ? 30_000 : options.timeout;

    const transport: Http.Client = {
        baseUrl,
        request: (request) => {
            const headers = new Headers(options.headers);
            if (options.token !== undefined) {
                headers.set("Authorization", `token ${options.token}`);
            }
            headers.set("Accept", "application/json");

            let body: BodyInit | undefined;
            if (request.formData !== undefined) {
                body = request.formData;
            } else if (request.body !== undefined) {
                headers.set("Content-Type", "application/json");
                body = JSON.stringify(request.body);
            }

            const signal = request.signal ?? (timeout === null ? undefined : AbortSignal.timeout(timeout));

            return doFetch(buildUrl(baseUrl, request.path, request.query), {
                method: request.method,
                headers,
                ...(body === undefined ? {} : { body }),
                ...(signal === undefined ? {} : { signal }),
            });
        },
    };

    const bound: Record<string, unknown> = { ...transport };
    for (const [name, endpoint] of Object.entries(endpoints)) {
        bound[name] = (...args: Array<never>) =>
            (endpoint as (client: Http.Client, ...rest: Array<never>) => unknown)(transport, ...args);
    }
    // The endpoint table is bound name-by-name at runtime, which the checker
    // cannot follow; `Bound<typeof endpoints>` states the shape it produces.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return bound as unknown as SkyPortal;
};
