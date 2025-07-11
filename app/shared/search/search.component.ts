import { AsyncPipe, isPlatformServer, NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
} from "@angular/core";
import { NavigationStart, Router } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import uniqueId from "lodash/uniqueId";
import { BehaviorSubject, combineLatest, Observable, Subscription } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
} from "rxjs/operators";

import { APP_CONFIG, AppConfig } from "../../../config/app-config.interface";
import { environment } from "../../../environments/environment";
import { COLLECTION_MODULE_PATH } from "../../collection-page/collection-page-routing-paths";
import { COMMUNITY_MODULE_PATH } from "../../community-page/community-page-routing-paths";
import { SortOptions } from "../../core/cache/models/sort-options.model";
import { PaginatedList } from "../../core/data/paginated-list.model";
import { RemoteData } from "../../core/data/remote-data";
import { RouteService } from "../../core/services/route.service";
import { Context } from "../../core/shared/context.model";
import { DSpaceObject } from "../../core/shared/dspace-object.model";
import { Item } from "../../core/shared/item.model";
import { getFirstCompletedRemoteData } from "../../core/shared/operators";
import { SearchService } from "../../core/shared/search/search.service";
import { SearchConfigurationService } from "../../core/shared/search/search-configuration.service";
import { SearchConfig } from "../../core/shared/search/search-filters/search-config.model";
import { ViewMode } from "../../core/shared/view-mode.model";
import { SubmissionObject } from "../../core/submission/models/submission-object.model";
import { WorkspaceItem } from "../../core/submission/models/workspaceitem.model";
import { ITEM_MODULE_PATH } from "../../item-page/item-page-routing-paths";
import { SEARCH_CONFIG_SERVICE } from "../../my-dspace-page/my-dspace-configuration.service";
import { pushInOut } from "../animations/push";
import { hasValue, hasValueOperator, isEmpty, isNotEmpty } from "../empty.util";
import { HostWindowService } from "../host-window.service";
import { CollectionElementLinkType } from "../object-collection/collection-element-link.type";
import { ListableObject } from "../object-collection/shared/listable-object.model";
import { ThemedSearchFormComponent } from "../search-form/themed-search-form.component";
import { PageWithSidebarComponent } from "../sidebar/page-with-sidebar.component";
import { SidebarService } from "../sidebar/sidebar.service";
import { followLink } from "../utils/follow-link-config.model";
import { currentPath } from "../utils/route.utils";
import { ViewModeSwitchComponent } from "../view-mode-switch/view-mode-switch.component";
import { PaginatedSearchOptions } from "./models/paginated-search-options.model";
import { SearchFilterConfig } from "./models/search-filter-config.model";
import { SearchObjects } from "./models/search-objects.model";
import { SearchResult } from "./models/search-result.model";
import { SearchLabelsComponent } from "./search-labels/search-labels.component";
import { SelectionConfig } from "./search-results/search-results.component";
import { ThemedSearchResultsComponent } from "./search-results/themed-search-results.component";
import { ThemedSearchSidebarComponent } from "./search-sidebar/themed-search-sidebar.component";
import { SearchConfigurationOption } from "./search-switch-configuration/search-configuration-option.model";
import { NavigationItemsService } from "../kware-navigate-items/service/services/navigation-items.service";
import { PaginationComponentOptions } from "../pagination/pagination-component-options.model";

@Component({
  selector: "ds-base-search",
  styleUrls: ["./search.component.scss"],
  templateUrl: "./search.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [pushInOut],
  standalone: true,
  imports: [
    AsyncPipe,
    NgTemplateOutlet,
    PageWithSidebarComponent,
    SearchLabelsComponent,
    ThemedSearchFormComponent,
    ThemedSearchResultsComponent,
    ThemedSearchSidebarComponent,
    TranslateModule,
    ViewModeSwitchComponent,
  ],
})

/**
 * This component renders a sidebar, a search input bar and the search results.
 */
export class SearchComponent implements OnDestroy, OnInit {
  /**
   * The list of available configuration options
   */
  @Input() configurationList: SearchConfigurationOption[] = [];

  /**
   * The current context
   * If empty, 'search' is used
   */
  @Input() context: Context = Context.Search;

  /**
   * The configuration to use for the search options
   * If empty, 'default' is used
   */
  @Input() configuration;

  /**
   * The actual query for the fixed filter.
   * If empty, the query will be determined by the route parameter called 'filter'
   */
  @Input() fixedFilterQuery: string;

  @Input() filterFields: string;

  /**
   * A hidden query that will be used but not displayed in the url/searchbar
   */
  @Input() hiddenQuery: string;

  /**
   * If this is true, the request will only be sent if there's
   * no valid cached version. Defaults to true
   */
  @Input() useCachedVersionIfAvailable = true;

  /**
   * True when the search component should show results on the current page
   */
  @Input() inPlaceSearch = true;

  /**
   * The link type of the listed search results
   */
  @Input() linkType: CollectionElementLinkType;

  /**
   * The pagination id used in the search
   */
  @Input() paginationId = "spc";

  /**
   * Whether or not the search bar should be visible
   */
  @Input() searchEnabled = true;

  /**
   * The width of the sidebar (bootstrap columns)
   */
  @Input() sideBarWidth = 3;

  /**
   * The placeholder of the search form input
   */
  @Input() searchFormPlaceholder = "search.search-form.placeholder";

  /**
   * A boolean representing if result entries are selectable
   */
  @Input() selectable = false;

  /**
   * The config option used for selection functionality
   */
  @Input() selectionConfig: SelectionConfig;

  /**
   * A boolean representing if show csv export button
   */
  @Input() showCsvExport = false;

  /**
   * A boolean representing if show search sidebar button
   */
  @Input() showSidebar = true;

  /**
   * Whether to show the thumbnail preview
   */
  @Input() showThumbnails;

  /**
   * Whether to show the view mode switch
   */
  @Input() showViewModes = true;

  /**
   * List of available view mode
   */
  @Input() useUniquePageId: boolean;

  /**
   * List of available view mode
   */
  @Input() viewModeList: ViewMode[];

  /**
   * Defines whether or not to show the scope selector
   */
  @Input() showScopeSelector = true;

  /**
   * Whether or not to track search statistics by sending updates to the rest api
   */
  @Input() trackStatistics = false;

  /**
   * The default value for the search query when none is already defined in the {@link SearchConfigurationService}
   */
  @Input() query: string;

  /**
   * The fallback scope when no scope is defined in the url, if this is also undefined no scope will be set
   */
  @Input() scope: string;

  /**
   * Hides the scope in the url, this can be useful when you hardcode the scope in another way
   */
  @Input() hideScopeInUrl: boolean;

  /**
   * Defines whether to fetch search results during SSR execution
   */
  @Input() renderOnServerSide: boolean;

  /**
   * The current configuration used during the search
   */
  currentConfiguration$: BehaviorSubject<string> = new BehaviorSubject<string>(
    ""
  );

  /**
   * The current context used during the search
   */
  currentContext$: BehaviorSubject<Context> = new BehaviorSubject<Context>(
    null
  );

  /**
   * The current sort options used
   */
  currentScope$: Observable<string>;

  /**
   * The current sort options used
   */
  currentSortOptions$: BehaviorSubject<SortOptions> =
    new BehaviorSubject<SortOptions>(null);

  /**
   * An observable containing configuration about which filters are shown and how they are shown
   */
  filtersRD$: BehaviorSubject<RemoteData<SearchFilterConfig[]>> =
    new BehaviorSubject<RemoteData<SearchFilterConfig[]>>(null);

  /**
   * Maintains the last search options, so it can be used in refresh
   */
  lastSearchOptions: PaginatedSearchOptions;

  /**
   * The current search results
   */
  resultsRD$: BehaviorSubject<
    RemoteData<PaginatedList<SearchResult<DSpaceObject>>>
  > = new BehaviorSubject(null);

  /**
   * The current paginated search options
   */
  searchOptions$: BehaviorSubject<PaginatedSearchOptions> =
    new BehaviorSubject<PaginatedSearchOptions>(null);

  /**
   * The available sort options list
   */
  sortOptionsList$: BehaviorSubject<SortOptions[]> = new BehaviorSubject<
    SortOptions[]
  >([]);

  /**
   * TRUE if the search option are initialized
   */
  initialized$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * Observable for whether or not the sidebar is currently collapsed
   */
  isSidebarCollapsed$: Observable<boolean>;

  /**
   * Emits true if were on a small screen
   */
  isXsOrSm$: Observable<boolean>;

  /**
   * Emits when the search filters values may be stale, and so they must be refreshed.
   */
  refreshFilters: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  /**
   * Link to the search page
   */
  searchLink: string;

  /**
   * Regex to match UUIDs
   */
  uuidRegex =
    /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/g;

  /**
   * List of paths that are considered to be the start of a route to an object page (excluding "/", e.g. "items")
   * These are expected to end on an object UUID
   * If they match the route we're navigating to, an object property will be added to the search event sent
   */
  allowedObjectPaths: string[] = [
    "entities",
    ITEM_MODULE_PATH,
    COLLECTION_MODULE_PATH,
    COMMUNITY_MODULE_PATH,
  ];

  /**
   * Subscriptions to unsubscribe from
   */
  subs: Subscription[] = [];

  /**
   * Emits an event with the current search result entries
   */
  @Output() resultFound: EventEmitter<SearchObjects<DSpaceObject>> =
    new EventEmitter<SearchObjects<DSpaceObject>>();

  /**
   * Emits event when the user deselect result entry
   */
  @Output() deselectObject: EventEmitter<ListableObject> =
    new EventEmitter<ListableObject>();

  /**
   * Emits event when the user select result entry
   */
  @Output() selectObject: EventEmitter<ListableObject> =
    new EventEmitter<ListableObject>();

  /**
   * kware-edit start
   * search tabs
   */
  /**
   * The active tab
   */
  activeTab$: Observable<string>;
  browseSearchOptions = new BehaviorSubject({});

  isSearchPage: boolean;
  isCollection: boolean;
  isCommunity: boolean;
  isSearchRoute: boolean;
  items$ = new BehaviorSubject([]);
  /**
   * kware-edit end
   */

  constructor(
    protected service: SearchService,
    protected sidebarService: SidebarService,
    protected windowService: HostWindowService,
    @Inject(SEARCH_CONFIG_SERVICE)
    public searchConfigService: SearchConfigurationService,
    protected routeService: RouteService,
    protected router: Router,
    protected navigationItemsService: NavigationItemsService,
    @Inject(APP_CONFIG) protected appConfig: AppConfig,
    @Inject(PLATFORM_ID) public platformId: any
  ) {
    this.isXsOrSm$ = this.windowService.isXsOrSm();
  }

  /**
   * Listening to changes in the paginated search options
   * If something changes, update the search results
   *
   * Listen to changes in the scope
   * If something changes, update the list of scopes for the dropdown
   */
  ngOnInit(): void {
    this.isSearchPage = window.location.href.includes("/browse/")
      ? true
      : false;
    this.isCollection = window.location.href.includes("/collections/")
      ? true
      : false;
    this.isCommunity = window.location.href.includes("/communities/")
      ? true
      : false;
    this.isSearchRoute = window.location.href.includes("/search")
      ? true
      : false;
    if (
      !this.renderOnServerSide &&
      !environment.ssr.enableSearchComponent &&
      isPlatformServer(this.platformId)
    ) {
      this.subs.push(
        this.getSearchOptions()
          .pipe(distinctUntilChanged())
          .subscribe((options) => {
            this.searchOptions$.next(options);
          })
      );
      this.initialized$.next(true);
      return;
    }

    if (this.useUniquePageId) {
      // Create an unique pagination id related to the instance of the SearchComponent
      this.paginationId = uniqueId(this.paginationId);
    }

    this.searchConfigService.setPaginationId(this.paginationId);

    if (hasValue(this.configuration)) {
      this.routeService.setParameter("configuration", this.configuration);
    }
    if (hasValue(this.fixedFilterQuery)) {
      this.routeService.setParameter("fixedFilterQuery", this.fixedFilterQuery);
    }

    this.currentScope$ = this.routeService
      .getQueryParameterValue("scope")
      .pipe(
        map((routeValue: string) =>
          hasValue(routeValue) ? routeValue : this.scope ?? ""
        )
      );

    this.isSidebarCollapsed$ = this.isSidebarCollapsed();
    this.searchLink = this.getSearchLink();
    this.currentContext$.next(this.context);

    // Determinate PaginatedSearchOptions and listen to any update on it
    const configuration$: Observable<string> = this.searchConfigService
      .getCurrentConfiguration(this.configuration)
      .pipe(distinctUntilChanged());
    const searchSortOptions$: Observable<SortOptions[]> = combineLatest([
      configuration$,
      this.currentScope$,
    ]).pipe(
      switchMap(([configuration, scope]: [string, string]) =>
        this.searchConfigService.getConfigurationSearchConfig(
          configuration,
          scope
        )
      ),
      map((searchConfig: SearchConfig) =>
        this.searchConfigService.getConfigurationSortOptions(searchConfig)
      ),
      distinctUntilChanged()
    );
    const sortOption$: Observable<SortOptions> = searchSortOptions$.pipe(
      switchMap((searchSortOptions: SortOptions[]) => {
        const defaultSort: SortOptions = searchSortOptions[0];
        return this.searchConfigService.getCurrentSort(
          this.paginationId,
          defaultSort
        );
      }),
      distinctUntilChanged()
    );
    const searchOptions$: Observable<PaginatedSearchOptions> =
      this.getSearchOptions().pipe(distinctUntilChanged());

    this.subs.push(
      combineLatest([
        configuration$,
        searchSortOptions$,
        searchOptions$,
        sortOption$,
        this.currentScope$,
      ])
        .pipe(
          filter(
            ([
              configuration,
              searchSortOptions,
              searchOptions,
              sortOption,
              scope,
            ]: [
              string,
              SortOptions[],
              PaginatedSearchOptions,
              SortOptions,
              string
            ]) => {
              // filter for search options related to instanced paginated id
              return searchOptions.pagination.id === this.paginationId;
            }
          ),
          debounceTime(100)
        )
        .subscribe(
          ([
            configuration,
            searchSortOptions,
            searchOptions,
            sortOption,
            scope,
          ]: [
            string,
            SortOptions[],
            PaginatedSearchOptions,
            SortOptions,
            string
          ]) => {
            // Build the PaginatedSearchOptions object
            const combinedOptions = Object.assign({}, searchOptions, {
              configuration: searchOptions.configuration || configuration,
              sort: sortOption || searchOptions.sort,
            });
            if (combinedOptions.query === "") {
              combinedOptions.query = this.query;
            }
            if (isEmpty(combinedOptions.scope)) {
              combinedOptions.scope = scope;
            }
            const newSearchOptions = new PaginatedSearchOptions(
              combinedOptions
            );
            // check if search options are changed
            // if so retrieve new related results otherwise skip it
            if (
              JSON.stringify(newSearchOptions) !==
              JSON.stringify(this.searchOptions$.value)
            ) {
              // Initialize variables
              this.currentConfiguration$.next(configuration);
              if (this.isSearchRoute || this.isSearchPage){
              this.navigationItemsService.setConfiguration(newSearchOptions);

              }
              this.currentSortOptions$.next(newSearchOptions.sort);
              this.sortOptionsList$.next(searchSortOptions);
              this.searchOptions$.next(newSearchOptions);
              this.initialized$.next(true);
              // retrieve results
              this.retrieveSearchResults(newSearchOptions);
              this.retrieveFilters(newSearchOptions);
            }
          }
        )
    );

    this.subscribeToRoutingEvents();
  }

  /**
   * Change the current context
   * @param context
   */
  public changeContext(context: Context) {
    this.currentContext$.next(context);
  }

  /**
   * Set the sidebar to a collapsed state
   */
  public closeSidebar(): void {
    this.sidebarService.collapse();
  }

  /**
   * Reset result list on view mode change
   */
  public changeViewMode() {
    this.resultsRD$.next(null);
  }

  /**
   * Set the sidebar to an expanded state
   */
  public openSidebar(): void {
    this.sidebarService.expand();
  }

  /**
   * Emit event to refresh filter content
   * @param $event
   */
  public onContentChange($event: any) {
    this.retrieveFilters(this.lastSearchOptions);
    this.refreshFilters.next(true);
  }

  /**
   * Unsubscribe from the subscriptions
   */
  ngOnDestroy(): void {
    this.subs
      .filter((sub) => hasValue(sub))
      .forEach((sub) => sub.unsubscribe());
  }

  /**
   * Get the current paginated search options
   * @returns {Observable<PaginatedSearchOptions>}
   */
  protected getSearchOptions(): Observable<PaginatedSearchOptions> {
    return this.searchConfigService.paginatedSearchOptions;
  }

  /**
   * Retrieve search filters by the given search options
   * @param searchOptions
   * @private
   */
  private retrieveFilters(searchOptions: PaginatedSearchOptions) {
    this.searchConfigService
      .getConfig(searchOptions.scope, searchOptions.configuration)
      .pipe(getFirstCompletedRemoteData())
      .subscribe((filtersRD: RemoteData<SearchFilterConfig[]>) => {
        this.filtersRD$.next(filtersRD);
      });
  }

  /**
   * Retrieve search result by the given search options
   * @param searchOptions
   * @private
   */
  private retrieveSearchResults(searchOptions: PaginatedSearchOptions) {
    this.resultsRD$.next(null);
    this.lastSearchOptions = searchOptions;
    const followLinks = [
      followLink<Item>("thumbnail", { isOptional: true }),
      followLink<SubmissionObject>(
        "item",
        { isOptional: true },
        followLink<Item>("thumbnail", { isOptional: true })
      ) as any,
    ];
    if (this.appConfig.item.showAccessStatuses) {
      followLinks.push(followLink<Item>("accessStatus", { isOptional: true }));
    }
    if (this.configuration === "supervision") {
      followLinks.push(
        followLink<WorkspaceItem>("supervisionOrders", {
          isOptional: true,
        }) as any
      );
    }

    const searchOptionsWithHidden = Object.assign(
      new PaginatedSearchOptions({}),
      searchOptions
    );
    if (isNotEmpty(this.hiddenQuery)) {
      if (isNotEmpty(searchOptionsWithHidden.query)) {
        searchOptionsWithHidden.query =
          searchOptionsWithHidden.query + " AND " + this.hiddenQuery;
      } else {
        searchOptionsWithHidden.query = this.hiddenQuery;
      }
    }

    this.service
      .search(
        searchOptionsWithHidden,
        undefined,
        this.useCachedVersionIfAvailable,
        true,
        ...followLinks
      )
      .pipe(getFirstCompletedRemoteData())
      .subscribe((results: RemoteData<SearchObjects<DSpaceObject>>) => {
        if (results.hasSucceeded) {
          if (this.trackStatistics) {
            this.service.trackSearch(searchOptionsWithHidden, results.payload);
          }
          if (results.payload?.page?.length > 0) {
            this.resultFound.emit(results.payload);
          }
        }
        this.resultsRD$.next(results);

//          if(this.isSearchRoute || this.isSearchPage){
//  let pages= results.payload.pageInfo.totalElements >  500 ? 20 : results.payload.pageInfo.totalPages;
//   for (let page = 1; page <= pages; page++) {
         
//     this.service.search(
//        new PaginatedSearchOptions(
//               {
//                 pagination: Object.assign(new PaginationComponentOptions(), {
//                                     id: 'hp',
//                                     pageSize: 100,
//                                     currentPage: page,
//                                     maxSize: 1,
//                                   }),
//                 dsoTypes: searchOptionsWithHidden.dsoTypes,
//                 scope:searchOptionsWithHidden.scope,
//                 sort: searchOptionsWithHidden.sort,
//                 query: searchOptionsWithHidden.query,
//                 filters:searchOptionsWithHidden.filters,
//                 fixedFilter: searchOptionsWithHidden.fixedFilter,
//                 configuration:searchOptionsWithHidden.configuration
//               }
//             ),
//             undefined,
//             undefined,
//             undefined
//     ).subscribe(res=>{
//       this.items$.next(
//         this.items$.getValue().concat(res?.payload?.page)
//       );
      

    
//     })

//   }
  
//   this.items$.subscribe(res=>{
//     this.navigationItemsService.setResultsRDNavigation(res)
//   })
   
//  }

      });
  }

  /**
   * Subscribe to routing events to detect when a user moves away from the search page
   * When the user is routing to an object page, it needs to send out a separate search event containing that object's UUID
   * This method should only be called once and is essentially what SearchTrackingComponent used to do (now removed)
   * @private
   */
  private subscribeToRoutingEvents(): void {
    if (this.trackStatistics) {
      this.subs.push(
        this.router.events
          .pipe(
            filter((event) => event instanceof NavigationStart),
            map((event: NavigationStart) => this.getDsoUUIDFromUrl(event.url)),
            hasValueOperator()
          )
          .subscribe((uuid) => {
            if (this.resultsRD$.value.hasSucceeded) {
              this.service.trackSearch(
                this.searchOptions$.value,
                this.resultsRD$.value.payload as SearchObjects<DSpaceObject>,
                uuid
              );
            }
          })
      );
    }
  }

  /**
   * Get the UUID from a DSO url
   * Return null if the url isn't an object page (allowedObjectPaths) or the UUID couldn't be found
   * @param url
   */
  private getDsoUUIDFromUrl(url: string): string {
    if (isNotEmpty(url)) {
      if (this.allowedObjectPaths.some((path) => url.startsWith(`/${path}`))) {
        const uuid = url.substring(url.lastIndexOf("/") + 1);
        if (uuid.match(this.uuidRegex)) {
          return uuid;
        }
      }
    }
    return null;
  }

  /**
   * Check if the sidebar is collapsed
   * @returns {Observable<boolean>} emits true if the sidebar is currently collapsed, false if it is expanded
   */
  private isSidebarCollapsed(): Observable<boolean> {
    return this.sidebarService.isCollapsed;
  }

  /**
   * @returns {string} The base path to the search page, or the current page when inPlaceSearch is true
   */
  private getSearchLink(): string {
    if (this.inPlaceSearch) {
      return currentPath(this.router);
    }
    return this.service.getSearchLink();
  }
}
