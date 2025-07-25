import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormControl,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import {
  BehaviorSubject,
  from as observableFrom,
  Observable,
  of,
  Subscription,
} from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  mergeMap,
  reduce,
  startWith,
  switchMap,
  take,
} from 'rxjs/operators';

import { DSONameService } from '../../core/breadcrumbs/dso-name.service';
import { CollectionDataService } from '../../core/data/collection-data.service';
import { FindListOptions } from '../../core/data/find-list-options.model';
import { PaginatedList } from '../../core/data/paginated-list.model';
import { RemoteData } from '../../core/data/remote-data';
import { Collection } from '../../core/shared/collection.model';
import { Community } from '../../core/shared/community.model';
import {
  getFirstCompletedRemoteData,
  getFirstSucceededRemoteDataPayload,
} from '../../core/shared/operators';
import { hasValue } from '../empty.util';
import { ThemedLoadingComponent } from '../loading/themed-loading.component';
import { followLink } from '../utils/follow-link-config.model';
import { KwareTranslatePipe } from "../utils/kware-translate.pipe";
import { ActivatedRoute } from '@angular/router';

/**
 * An interface to represent a collection entry
 */
interface CollectionListEntryItem {
  id: string;
  uuid: string;
  name: string;
}

/**
 * An interface to represent an entry in the collection list
 */
export interface CollectionListEntry {
  communities: CollectionListEntryItem[];
  collection: CollectionListEntryItem;
}

@Component({
  selector: 'ds-base-collection-dropdown',
  templateUrl: './collection-dropdown.component.html',
  styleUrls: ['./collection-dropdown.component.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    InfiniteScrollModule,
    ReactiveFormsModule,
    ThemedLoadingComponent,
    TranslateModule,
    KwareTranslatePipe,
    NgIf,
    NgClass
],
})
export class CollectionDropdownComponent implements OnInit, OnDestroy {

  /**
   * The search form control
   * @type {FormControl}
   */
  public searchField: UntypedFormControl = new UntypedFormControl();

  /**
   * The collection list obtained from a search
   * @type {Observable<CollectionListEntry[]>}
   */
  public searchListCollection$: Observable<CollectionListEntry[]>;

  /**
   * A boolean representing if dropdown list is scrollable to the bottom
   * @type {boolean}
   */
  private scrollableBottom = false;

  /**
   * A boolean representing if dropdown list is scrollable to the top
   * @type {boolean}
   */
  private scrollableTop = false;

  /**
   * Array to track all subscriptions and unsubscribe them onDestroy
   * @type {Array}
   */
  public subs: Subscription[] = [];

  /**
   * The list of collection to render
   */
  searchListCollection: CollectionListEntry[] = [];

  @Output() selectionChange = new EventEmitter<CollectionListEntry>();
  /**
   * A boolean representing if the loader is visible or not
   */
  isLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * A numeric representing current page
   */
  currentPage: number;

  /**
   * A boolean representing if exist another page to render
   */
  hasNextPage: boolean;

  /**
   * Current search query used to filter collection list
   */
  currentQuery: string;

  /**
   * If present this value is used to filter collection list by entity type
   */
  @Input() entityType: string;

  /**
   * Emit to notify whether search is complete
   */
  @Output() searchComplete = new EventEmitter<any>();

  /**
   * Emit to notify the only selectable collection.
   */
  @Output() theOnlySelectable = new EventEmitter<CollectionListEntry>();


      /*
 kware start edit
 - length of search list collection
 **/
 @Output() searchListCollectionLength = new EventEmitter<number>();



 @Input() selectedCollection: string;
 /** kware end edit*/
  
       /*
 kware start edit
 - check route if from fast add bt
 */
currentEntityType ='';

isFastAdd:boolean;

  /* kware end edit*/ 


  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private collectionDataService: CollectionDataService,
    private el: ElementRef,
    public dsoNameService: DSONameService,
    private route: ActivatedRoute,
  ) { }

  /**
   * Method called on mousewheel event, it prevent the page scroll
   * when arriving at the top/bottom of dropdown menu
   *
   * @param event
   *     mousewheel event
   */
  @HostListener('mousewheel', ['$event']) onMousewheel(event) {
    if (event.wheelDelta > 0 && this.scrollableTop) {
      event.preventDefault();
    }
    if (event.wheelDelta < 0 && this.scrollableBottom) {
      event.preventDefault();
    }
  }

  /**
   * Initialize collection list
   */
  ngOnInit() {
                   /*
   kware start edit
   - check route if from fast add bt
   */
   this.route?.queryParams?.subscribe((params=>{this.currentEntityType= params.entityType}));
   this.route?.queryParams?.subscribe((params=>{this.isFastAdd = params.action ? true :false}));
 /* kware end edit*/ 
    this.isLoading.next(false);
    this.subs.push(this.searchField.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      startWith(''),
    ).subscribe(
      (next) => {
        if (hasValue(next) && next !== this.currentQuery) {
          this.resetPagination();
          this.currentQuery = next;
          this.populateCollectionList(this.currentQuery, this.currentPage);
        }
      },
    ));
    // Workaround for prevent the scroll of main page when this component is placed in a dialog
    setTimeout(() => this.el.nativeElement.querySelector('input').focus(), 0);
  }

  /**
   * Check if dropdown scrollbar is at the top or bottom of the dropdown list
   *
   * @param event
   */
  onScroll(event) {
    this.scrollableBottom = (event.target.scrollTop + event.target.clientHeight === event.target.scrollHeight);
    this.scrollableTop = (event.target.scrollTop === 0);
  }

  /**
   * Method used from infinity scroll for retrieve more data on scroll down
   */
  onScrollDown() {
    if ( this.hasNextPage ) {
      this.populateCollectionList(this.currentQuery, ++this.currentPage);
    }
  }

  /**
   * Emit a [selectionChange] event when a new collection is selected from list
   *
   * @param event
   *    the selected [CollectionListEntry]
   */
  onSelect(event: CollectionListEntry) {
    this.isLoading.next(true);
    this.selectionChange.emit(event);
  }

  /**
   * Method called for populate the collection list
   * @param query text for filter the collection list
   * @param page page number
   */
  populateCollectionList(query: string, page: number) {
    this.isLoading.next(true);
    // Set the pagination info
    const findOptions: FindListOptions = {
      elementsPerPage: 10,
      currentPage: page,
    };
    let searchListService$: Observable<RemoteData<PaginatedList<Collection>>>;
    if (this.entityType) {
      searchListService$ = this.collectionDataService
        .getAuthorizedCollectionByEntityType(
          query,
          this.entityType,
          findOptions,
          true,
          followLink('parentCommunity'));
    } else {
      searchListService$ = this.collectionDataService
      .getAuthorizedCollection(this.currentEntityType ? (this.currentEntityType ==='journal'? this.currentEntityType+'~0' : this.currentEntityType ) : query, findOptions, true, true, followLink('parentCommunity'));

    }
    this.searchListCollection$ = searchListService$.pipe(
      getFirstCompletedRemoteData(),
      switchMap((collectionsRD: RemoteData<PaginatedList<Collection>>) => {
        this.searchComplete.emit();
        if (collectionsRD.hasSucceeded && collectionsRD.payload.totalElements > 0) {
          if (this.searchListCollection.length >= collectionsRD.payload.totalElements) {
            this.hasNextPage = false;
          }
          this.emitSelectionEvents(collectionsRD);
          return observableFrom(collectionsRD.payload.page).pipe(
            mergeMap((collection: Collection) => collection.parentCommunity.pipe(
              getFirstSucceededRemoteDataPayload(),
              map((community: Community) => ({
                communities: [{ id: community.id, name: this.dsoNameService.getName(community) }],
                collection: { id: collection.id, uuid: collection.id, name: this.dsoNameService.getName(collection) },
              }),
              ))),
            reduce((acc: any, value: any) => [...acc, value], []),
          );
        } else {
          this.hasNextPage = false;
          return of([]);
        }
      }),
    );
    this.subs.push(
      this.searchListCollection$.subscribe((list: CollectionListEntry[]) => {
        this.searchListCollection.push(...list);
        this.hideShowLoader(false);
        this.changeDetectorRef.detectChanges();
      }),
    );
  }

  /**
   * Unsubscribe from all subscriptions
   */
  ngOnDestroy(): void {
    this.subs.filter((sub) => hasValue(sub)).forEach((sub) => sub.unsubscribe());
  }

  /**
   * Reset search form control
   */
  reset() {
    this.searchField.setValue('');
  }

  /**
   * Reset pagination values
   */
  resetPagination() {
    this.currentPage = 1;
    this.currentQuery = '';
    this.hasNextPage = true;
    this.searchListCollection = [];
  }

  /**
   * Hide/Show the collection list loader
   * @param hideShow true for show, false otherwise
   */
  hideShowLoader(hideShow: boolean) {
    this.isLoading.next(hideShow);
  }

  /**
   * Emit events related to the number of selectable collections.
   * hasChoice containing whether there are more then one selectable collections.
   * theOnlySelectable containing the only collection available.
   * @param collections
   * @private
   */
  private emitSelectionEvents(collections: RemoteData<PaginatedList<Collection>>) {
    if (collections.payload.totalElements === 1) {
      const collection = collections.payload.page[0];
      collections.payload.page[0].parentCommunity.pipe(
        getFirstSucceededRemoteDataPayload(),
        take(1),
      ).subscribe((community: Community) => {
        this.theOnlySelectable.emit({
          communities: [{ id: community.id, name: this.dsoNameService.getName(community), uuid: community.id }],
          collection: { id: collection.id, uuid: collection.id, name: this.dsoNameService.getName(collection) },
        });
      });
    }
  }

}
