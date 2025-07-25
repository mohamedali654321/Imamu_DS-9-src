import {
  AsyncPipe,
  NgTemplateOutlet,
} from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormsModule,
  UntypedFormGroup,
} from '@angular/forms';
import {
  NgbModal,
  NgbModalRef,
  NgbTypeahead,
  NgbTypeaheadModule,
  NgbTypeaheadSelectItemEvent,
} from '@ng-bootstrap/ng-bootstrap';
import {
  DynamicFormLayoutService,
  DynamicFormValidationService,
} from '@ng-dynamic-forms/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  Observable,
  of,
  Subject,
  Subscription,
} from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  merge,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';

import {
  buildPaginatedList,
  PaginatedList,
} from '../../../../../../core/data/paginated-list.model';
import { ConfidenceType } from '../../../../../../core/shared/confidence-type';
import { getFirstSucceededRemoteDataPayload } from '../../../../../../core/shared/operators';
import { PageInfo } from '../../../../../../core/shared/page-info.model';
import { Vocabulary } from '../../../../../../core/submission/vocabularies/models/vocabulary.model';
import { VocabularyEntry } from '../../../../../../core/submission/vocabularies/models/vocabulary-entry.model';
import { VocabularyEntryDetail } from '../../../../../../core/submission/vocabularies/models/vocabulary-entry-detail.model';
import { VocabularyService } from '../../../../../../core/submission/vocabularies/vocabulary.service';
import { BtnDisabledDirective } from '../../../../../btn-disabled.directive';
import {
  hasValue,
  isEmpty,
  isNotEmpty,
  isNotNull,
} from '../../../../../empty.util';
import { ObjNgFor } from '../../../../../utils/object-ngfor.pipe';
import { AuthorityConfidenceStateDirective } from '../../../../directives/authority-confidence-state.directive';
import { VocabularyTreeviewModalComponent } from '../../../../vocabulary-treeview-modal/vocabulary-treeview-modal.component';
import { FormFieldMetadataValueObject } from '../../../models/form-field-metadata-value.model';
import { DsDynamicVocabularyComponent } from '../dynamic-vocabulary.component';
import { DynamicOneboxModel } from './dynamic-onebox.model';
import { KwareTranslatePipe } from "../../../../../utils/kware-translate.pipe";

/**
 * Component representing a onebox input field.
 * If field has a Hierarchical Vocabulary configured, it's rendered with vocabulary tree
 */
@Component({
  selector: 'ds-dynamic-onebox',
  styleUrls: ['./dynamic-onebox.component.scss'],
  templateUrl: './dynamic-onebox.component.html',
  imports: [
    AsyncPipe,
    AuthorityConfidenceStateDirective,
    BtnDisabledDirective,
    FormsModule,
    NgbTypeaheadModule,
    NgTemplateOutlet,
    ObjNgFor,
    TranslateModule,
    KwareTranslatePipe
],
  standalone: true,
})
export class DsDynamicOneboxComponent extends DsDynamicVocabularyComponent implements OnDestroy, OnInit {

  @Input() group: UntypedFormGroup;
  @Input() model: DynamicOneboxModel;

  @Output() blur: EventEmitter<any> = new EventEmitter<any>();
  @Output() change: EventEmitter<any> = new EventEmitter<any>();
  @Output() focus: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('instance') instance: NgbTypeahead;

  pageInfo: PageInfo = new PageInfo();
  searching = false;
  loadingInitialValue = false;
  searchFailed = false;
  hideSearchingWhenUnsubscribed$ = new Observable(() => () => this.changeSearchingStatus(false));
  click$ = new Subject<string>();
  currentValue: any;
  inputValue: any;
  preloadLevel: number;

  private vocabulary$: Observable<Vocabulary>;
  private isHierarchicalVocabulary$: Observable<boolean>;
  private subs: Subscription[] = [];

  constructor(protected vocabularyService: VocabularyService,
              protected cdr: ChangeDetectorRef,
              protected layoutService: DynamicFormLayoutService,
              protected modalService: NgbModal,
              protected validationService: DynamicFormValidationService,
  ) {
    super(vocabularyService, layoutService, validationService);
  }

  /**
   * Converts an item from the result list to a `string` to display in the `<input>` field.
   */
  formatter = (x: { display: string }) => {
    return (typeof x === 'object') ? x.display : x;
  };

  /**
   * Converts a stream of text values from the `<input>` element to the stream of the array of items
   * to display in the onebox popup.
   */
  search = (text$: Observable<string>) => {
    return text$.pipe(
      merge(this.click$),
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.changeSearchingStatus(true)),
      switchMap((term) => {
        if (term === '' || term.length < this.model.minChars) {
          return of({ list: [] });
        } else {
          return this.vocabularyService.getVocabularyEntriesByValue(
            term,
            false,
            this.model.vocabularyOptions,
            this.pageInfo).pipe(
            getFirstSucceededRemoteDataPayload(),
            tap(() => this.searchFailed = false),
            catchError(() => {
              this.searchFailed = true;
              return of(buildPaginatedList(
                new PageInfo(),
                [],
              ));
            }));
        }
      }),
      map((list: PaginatedList<VocabularyEntry>) => list.page),
      tap(() => this.changeSearchingStatus(false)),
      merge(this.hideSearchingWhenUnsubscribed$),
    );
  };

  /**
   * Initialize the component, setting up the init form value
   */
  ngOnInit() {
    if (this.model.value) {
      this.setCurrentValue(this.model.value, true);
    }

    this.vocabulary$ = this.vocabularyService.findVocabularyById(this.model.vocabularyOptions?.name).pipe(
      getFirstSucceededRemoteDataPayload(),
      distinctUntilChanged(),
    );

    this.isHierarchicalVocabulary$ = this.vocabulary$.pipe(
      map((result: Vocabulary) => result.hierarchical),
    );

    this.subs.push(this.group.get(this.model.id).valueChanges.pipe(
      filter((value) => this.currentValue !== value))
      .subscribe((value) => {
        this.setCurrentValue(this.model.value);
      }));
  }

  /**
   * Changes the searching status
   * @param status
   */
  changeSearchingStatus(status: boolean) {
    this.searching = status;
    this.cdr.detectChanges();
  }

  /**
   * Changes the loadingInitialValue status
   * @param status
   */
  changeLoadingInitialValueStatus(status: boolean) {
    this.loadingInitialValue = status;
    this.cdr.detectChanges();
  }

  /**
   * Checks if configured vocabulary is Hierarchical or not
   */
  isHierarchicalVocabulary(): Observable<boolean> {
    return this.isHierarchicalVocabulary$;
  }

  /**
   * Update the input value with a FormFieldMetadataValueObject
   * @param event
   */
  onInput(event) {
    if (!this.model.vocabularyOptions.closed && isNotEmpty(event.target.value)) {
      this.inputValue = new FormFieldMetadataValueObject(event.target.value);
    }
  }

  /**
   * Emits a blur event containing a given value.
   * @param event The value to emit.
   */
  onBlur(event: Event) {
    if (!this.instance.isPopupOpen()) {
      if (!this.model.vocabularyOptions.closed && isNotEmpty(this.inputValue)) {
        if (isNotNull(this.inputValue) && this.model.value !== this.inputValue) {
          this.dispatchUpdate(this.inputValue);
        }
        this.inputValue = null;
      }
      this.blur.emit(event);
    } else {
      // prevent on blur propagation if typeahed suggestions are showed
      event.preventDefault();
      event.stopImmediatePropagation();
      // update the value with the searched text if the user hasn't selected any suggestion
      if (!this.model.vocabularyOptions.closed && isNotEmpty(this.inputValue)) {
        if (isNotNull(this.inputValue) && this.model.value !== this.inputValue) {
          this.dispatchUpdate(this.inputValue);
        }
        this.inputValue = null;
      }
    }
  }

  /**
   * Updates model value with the current value
   * @param event The change event.
   */
  onChange(event: Event) {
    event.stopPropagation();
    if (isEmpty(this.currentValue)) {
      this.dispatchUpdate(null);
    }
  }

  /**
   * Updates current value and model value with the selected value.
   * @param event The value to set.
   */
  onSelectItem(event: NgbTypeaheadSelectItemEvent) {
    this.inputValue = null;
    this.setCurrentValue(event.item);
    this.dispatchUpdate(event.item);
  }

  /**
   * Open modal to show tree for hierarchical vocabulary
   * @param event The click event fired
   */
  openTree(event) {
    if (this.model.readOnly) {
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    this.subs.push(this.vocabulary$.pipe(
      map((vocabulary: Vocabulary) => vocabulary.preloadLevel),
      take(1),
    ).subscribe((preloadLevel) => {
      const modalRef: NgbModalRef = this.modalService.open(VocabularyTreeviewModalComponent, { size: 'lg', windowClass: 'treeview' });
      modalRef.componentInstance.vocabularyOptions = this.model.vocabularyOptions;
      modalRef.componentInstance.preloadLevel = preloadLevel;
      modalRef.componentInstance.selectedItems = this.currentValue ? [this.currentValue] : [];
      modalRef.result.then((result: VocabularyEntryDetail) => {
        if (result) {
          this.currentValue = result;
          this.dispatchUpdate(result);
        }
      }, () => {
        return;
      });
    }));
  }

  /**
   * Callback functions for whenClickOnConfidenceNotAccepted event
   */
  public whenClickOnConfidenceNotAccepted(confidence: ConfidenceType) {
    if (!this.model.readOnly) {
      this.click$.next(this.formatter(this.currentValue));
    }
  }

  /**
   * Sets the current value with the given value.
   * @param value The value to set.
   * @param init Representing if is init value or not.
   */
  setCurrentValue(value: any, init = false): void {
    let result: string;
    if (init) {
      this.changeLoadingInitialValueStatus(true);
      this.getInitValueFromModel(true)
        .subscribe((formValue: FormFieldMetadataValueObject) => {
          this.changeLoadingInitialValueStatus(false);
          this.currentValue = formValue;
          this.cdr.detectChanges();
        });
    } else {
      if (isEmpty(value)) {
        result = '';
      } else {
        result = value.value;
      }

      this.currentValue = result;
      this.cdr.detectChanges();
    }

  }

  ngOnDestroy(): void {
    this.subs
      .filter((sub) => hasValue(sub))
      .forEach((sub) => sub.unsubscribe());
  }

}
