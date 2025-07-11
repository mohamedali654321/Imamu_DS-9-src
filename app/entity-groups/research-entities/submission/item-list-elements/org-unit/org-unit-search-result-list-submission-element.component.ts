
import {
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';

import {
  APP_CONFIG,
  AppConfig,
} from '../../../../../../config/app-config.interface';
import { DSONameService } from '../../../../../core/breadcrumbs/dso-name.service';
import { BitstreamDataService } from '../../../../../core/data/bitstream-data.service';
import { ItemDataService } from '../../../../../core/data/item-data.service';
import { RelationshipDataService } from '../../../../../core/data/relationship-data.service';
import { Context } from '../../../../../core/shared/context.model';
import { Item } from '../../../../../core/shared/item.model';
import { MetadataValue } from '../../../../../core/shared/metadata.models';
import { ViewMode } from '../../../../../core/shared/view-mode.model';
import { NotificationsService } from '../../../../../shared/notifications/notifications.service';
import { ItemSearchResult } from '../../../../../shared/object-collection/shared/item-search-result.model';
import { listableObjectComponent } from '../../../../../shared/object-collection/shared/listable-object/listable-object.decorator';
import { SearchResultListElementComponent } from '../../../../../shared/object-list/search-result-list-element/search-result-list-element.component';
import { SelectableListService } from '../../../../../shared/object-list/selectable-list/selectable-list.service';
import { TruncatableService } from '../../../../../shared/truncatable/truncatable.service';
import { NameVariantModalComponent } from '../../name-variant-modal/name-variant-modal.component';
import { OrgUnitInputSuggestionsComponent } from './org-unit-suggestions/org-unit-input-suggestions.component';
import { LinkService } from 'src/app/core/cache/builders/link.service';

@listableObjectComponent('OrgUnitSearchResult', ViewMode.ListElement, Context.EntitySearchModal)
@listableObjectComponent('OrgUnitSearchResult', ViewMode.ListElement, Context.EntitySearchModalWithNameVariants)
@Component({
  selector: 'ds-org-unit-search-result-list-submission-element',
  styleUrls: ['./org-unit-search-result-list-submission-element.component.scss'],
  templateUrl: './org-unit-search-result-list-submission-element.component.html',
  standalone: true,
  imports: [
    FormsModule,
    OrgUnitInputSuggestionsComponent,
  ],
})

/**
 * The component for displaying a list element for an item search result of the type OrgUnit
 */
export class OrgUnitSearchResultListSubmissionElementComponent extends SearchResultListElementComponent<ItemSearchResult, Item> implements OnInit {
  allSuggestions: string[];
  selectedName: string;
  alternativeField = 'dc.title.alternative';
  useNameVariants = false;

  /**
   * Display thumbnail if required by configuration
   */
  showThumbnails: boolean;

  constructor(protected truncatableService: TruncatableService,
              private relationshipService: RelationshipDataService,
              private notificationsService: NotificationsService,
              private translateService: TranslateService,
              private modalService: NgbModal,
              private itemDataService: ItemDataService,
              private bitstreamDataService: BitstreamDataService,
              private selectableListService: SelectableListService,
              public dsoNameService: DSONameService,
              protected linkService: LinkService,
              @Inject(APP_CONFIG) protected appConfig: AppConfig,
  ) {
    super(truncatableService, dsoNameService,linkService, appConfig);
  }

  ngOnInit() {
    super.ngOnInit();

    this.useNameVariants = this.context === Context.EntitySearchModalWithNameVariants;

    if (this.useNameVariants) {
      const defaultValue = this.dso ? this.dsoNameService.getName(this.dso) : undefined;
      const alternatives = this.allMetadataValues(this.alternativeField);
      this.allSuggestions = [defaultValue, ...alternatives];

      this.relationshipService.getNameVariant(this.listID, this.dso.uuid)
        .pipe(take(1))
        .subscribe((nameVariant: string) => {
          this.selectedName = nameVariant || defaultValue;
        },
        );
    }
    this.showThumbnails = this.appConfig.browseBy.showThumbnails;
  }

  select(value) {
    this.selectableListService.isObjectSelected(this.listID, this.object)
      .pipe(take(1))
      .subscribe((selected) => {
        if (!selected) {
          this.selectableListService.selectSingle(this.listID, this.object);
        }
      });
    this.relationshipService.setNameVariant(this.listID, this.dso.uuid, value);
  }

  selectCustom(value) {
    if (!this.allSuggestions.includes(value)) {
      this.openModal(value)
        .then(() => {
          // user clicked ok: store the name variant in the item
          const newName: MetadataValue = new MetadataValue();
          newName.value = value;

          const existingNames: MetadataValue[] = this.dso.metadata[this.alternativeField] || [];
          const alternativeNames = { [this.alternativeField]: [...existingNames, newName] };
          const updatedItem =
            Object.assign({}, this.dso, {
              metadata: {
                ...this.dso.metadata,
                ...alternativeNames,
              },
            });
          this.itemDataService.update(updatedItem).pipe(take(1)).subscribe();
        }).catch(() => {
        // user clicked cancel: use the name variant only for this relation, no further action required
        }).finally(() => {
          this.select(value);
        });
    }
  }

  openModal(value): Promise<any> {
    const modalRef = this.modalService.open(NameVariantModalComponent, { centered: true });
    const modalComp = modalRef.componentInstance;
    modalComp.value = value;
    return modalRef.result;
  }
}
