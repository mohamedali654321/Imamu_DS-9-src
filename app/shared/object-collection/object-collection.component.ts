import {
  AsyncPipe,
  isPlatformBrowser,
  NgClass,
} from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  PLATFORM_ID,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import {
  distinctUntilChanged,
  map,
} from 'rxjs/operators';

import {
  SortDirection,
  SortOptions,
} from '../../core/cache/models/sort-options.model';
import { PaginatedList } from '../../core/data/paginated-list.model';
import { RemoteData } from '../../core/data/remote-data';
import { Context } from '../../core/shared/context.model';
import { PageInfo } from '../../core/shared/page-info.model';
import { ViewMode } from '../../core/shared/view-mode.model';
import { isEmpty } from '../empty.util';
import { ObjectDetailComponent } from '../object-detail/object-detail.component';
import { ObjectGeospatialMapComponent } from '../object-geospatial-map/object-geospatial-map.component';
import { ObjectGridComponent } from '../object-grid/object-grid.component';
import { ThemedObjectListComponent } from '../object-list/themed-object-list.component';
import { ObjectTableComponent } from '../object-table/object-table.component';
import { PaginationComponentOptions } from '../pagination/pagination-component-options.model';
import { setPlaceHolderAttributes } from '../utils/object-list-utils';
import { CollectionElementLinkType } from './collection-element-link.type';
import { ListableObject } from './shared/listable-object.model';
import { NavigationItemsService } from '../kware-navigate-items/service/services/navigation-items.service';

/**
 * Component that can render a list of listable objects in different view modes
 */
@Component({
  selector: 'ds-viewable-collection',
  styleUrls: ['./object-collection.component.scss'],
  templateUrl: './object-collection.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    NgClass,
    ObjectDetailComponent,
    ObjectGeospatialMapComponent,
    ObjectGridComponent,
    ObjectTableComponent,
    ThemedObjectListComponent,
  ],
})
export class ObjectCollectionComponent implements OnInit {
  /**
   * The list of listable objects to render in this component
   */
  @Input() objects: RemoteData<PaginatedList<ListableObject>>;

  /**
   * The current pagination configuration
   */
  @Input() config?: PaginationComponentOptions;

  /**
   * The current sorting configuration
   */
  @Input() sortConfig: SortOptions;

  /**
   * Whether the list elements have a border or not
   */
  @Input() hasBorder = false;

  /**
   * Whether to hide the gear to change the sort and pagination configuration
   */
  @Input() hideGear = false;
  @Input() selectable = false;
  @Input() selectionConfig: {repeatable: boolean, listId: string};

  /**
   * Whether to show an RSS syndication button for the current search options
   */
  @Input() showRSS: SortOptions | boolean = false;

  /**
   * Emit custom event for listable object custom actions.
   */
  @Output() customEvent = new EventEmitter<any>();
  @Output() deselectObject: EventEmitter<ListableObject> = new EventEmitter<ListableObject>();
  @Output() selectObject: EventEmitter<ListableObject> = new EventEmitter<ListableObject>();

  /**
   * Emit when one of the collection's object has changed.
   */
  @Output() contentChange = new EventEmitter<any>();

  /**
   * Whether or not to add an import button to the object elements
   */
  @Input() importable = false;

  /**
   * The config to use for the import button
   */
  @Input() importConfig: { buttonLabel: string };

  /**
   * Send an import event to the parent component
   */
  @Output() importObject: EventEmitter<ListableObject> = new EventEmitter<ListableObject>();

  /**
   * The link type of the rendered list elements
   */
  @Input() linkType: CollectionElementLinkType;

  /**
   * The context of the rendered list elements
   */
  @Input() context: Context;

  /**
   * Option for hiding the pagination detail
   */
  @Input() hidePaginationDetail = false;

  /**
   * Whether or not the pagination should be rendered as simple previous and next buttons instead of the normal pagination
   */
  @Input() showPaginator = true;

  /**
   * Whether to show the thumbnail preview
   */
  @Input() showThumbnails;

  /**
   * the page info of the list
   */
  pageInfo: Observable<PageInfo>;

  /**
   * An event fired when the page is changed.
   * Event's payload equals to the newly selected page.
   */
  @Output() pageChange: EventEmitter<number> = new EventEmitter<number>();

  /**
   * An event fired when the page wsize is changed.
   * Event's payload equals to the newly selected page size.
   */
  @Output() pageSizeChange: EventEmitter<number> = new EventEmitter<number>();

  /**
   * An event fired when the sort direction is changed.
   * Event's payload equals to the newly selected sort direction.
   */
  @Output() sortDirectionChange: EventEmitter<SortDirection> = new EventEmitter<SortDirection>();

  /**
   * An event fired one of the pagination parameters is changed
   */
  @Output() paginationChange: EventEmitter<SortDirection> = new EventEmitter<any>();

  /**
   * An event fired when the sort field is changed.
   * Event's payload equals to the newly selected sort field.
   */
  @Output() sortFieldChange: EventEmitter<string> = new EventEmitter<string>();

  /**
   * If showPaginator is set to true, emit when the previous button is clicked
   */
  @Output() prev = new EventEmitter<boolean>();

  /**
   * If showPaginator is set to true, emit when the next button is clicked
   */
  @Output() next = new EventEmitter<boolean>();

  /**
   * Emits the current view mode
   */
  currentMode$: Observable<ViewMode>;

  /**
   * The available view modes
   */
  viewModeEnum = ViewMode;

  /**
   * Placeholder class (defined in global-styles)
   */
  placeholderFontClass: string;




  /**
   * @param cdRef
   *    ChangeDetectorRef service provided by Angular.
   * @param route
   *    Route is a singleton service provided by Angular.
   * @param router
   *    Router is a singleton service provided by Angular.
   * @param elementRef
   *    Used only to read DOM for the element width
   */
  constructor(
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private elementRef: ElementRef,
    protected navigationItemsService: NavigationItemsService,
    @Inject(PLATFORM_ID) private platformId: any) {
  }

  ngOnInit(): void {
        if(this.route['_routerState']?.snapshot?.url.includes('/search') || this.route['_routerState']?.snapshot?.url.includes('/browse') ){

      this.navigationItemsService.setResultRoute((this.route['_routerState']?.snapshot?.url))
   }
    this.currentMode$ = this.route
      .queryParams
      .pipe(
        // map((params) => isEmpty(params?.view) ? ViewMode.ListElement : params.view),
      map((params) => isEmpty(params?.view) ? (this.route?.parent?.snapshot?.routeConfig?.path ==='home'? ViewMode.GridElement: ViewMode.ListElement) : params.view),

        distinctUntilChanged(),
      );
    if (isPlatformBrowser(this.platformId)) {
      const width = this.elementRef.nativeElement.offsetWidth;
      this.placeholderFontClass = setPlaceHolderAttributes(width);
    } else {
      this.placeholderFontClass = 'hide-placeholder-text';
    }
  }

  /**
   * Updates the page
   * @param event The new page number
   */
  onPageChange(event) {
    this.pageChange.emit(event);
  }
  /**
   * Updates the page size
   * @param event The new page size
   */
  onPageSizeChange(event) {
    this.pageSizeChange.emit(event);
  }
  /**
   * Updates the sort direction
   * @param event The new sort direction
   */
  onSortDirectionChange(event) {
    this.sortDirectionChange.emit(event);
  }
  /**
   * Updates the sort field
   * @param event The new sort field
   */
  onSortFieldChange(event) {
    this.sortFieldChange.emit(event);
  }

  /**
   * Updates the pagination
   * @param event The new pagination
   */
  onPaginationChange(event) {
    this.paginationChange.emit(event);
  }

  /**
   * Go to the previous page
   */
  goPrev() {
    this.prev.emit(true);
  }

  /**
  * Go to the next page
  */
  goNext() {
    this.next.emit(true);
  }

}
