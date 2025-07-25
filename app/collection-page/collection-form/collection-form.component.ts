import { AsyncPipe } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChange,
  SimpleChanges,
} from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import {
  DynamicFormControlModel,
  DynamicFormOptionConfig,
  DynamicFormService,
  DynamicSelectModel,
} from "@ng-dynamic-forms/core";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { hasNoValue, isNotNull } from "src/app/shared/empty.util";

import { AuthService } from "../../core/auth/auth.service";
import { ObjectCacheService } from "../../core/cache/object-cache.service";
import { CollectionDataService } from "../../core/data/collection-data.service";
import { EntityTypeDataService } from "../../core/data/entity-type-data.service";
import { RequestService } from "../../core/data/request.service";
import { Collection } from "../../core/shared/collection.model";
import { ItemType } from "../../core/shared/item-relationships/item-type.model";
import { NONE_ENTITY_TYPE } from "../../core/shared/item-relationships/item-type.resource-type";
import { MetadataValue } from "../../core/shared/metadata.models";
import { getFirstSucceededRemoteListPayload } from "../../core/shared/operators";
import { ComColFormComponent } from "../../shared/comcol/comcol-forms/comcol-form/comcol-form.component";
import { ComcolPageLogoComponent } from "../../shared/comcol/comcol-page-logo/comcol-page-logo.component";
import { FormComponent } from "../../shared/form/form.component";
import { NotificationsService } from "../../shared/notifications/notifications.service";
import { UploaderComponent } from "../../shared/upload/uploader/uploader.component";
import { VarDirective } from "../../shared/utils/var.directive";
import {
  collectionFormEntityTypeSelectionConfig,
  collectionFormModels,
} from "./collection-form.models";
import { LocaleService } from "src/app/core/locale/locale.service";

/**
 * Form used for creating and editing collections
 */
@Component({
  selector: "ds-collection-form",
  styleUrls: [
    "../../shared/comcol/comcol-forms/comcol-form/comcol-form.component.scss",
  ],
  templateUrl:
    "../../shared/comcol/comcol-forms/comcol-form/comcol-form.component.html",
  standalone: true,
  imports: [
    AsyncPipe,
    ComcolPageLogoComponent,
    FormComponent,
    TranslateModule,
    UploaderComponent,
    VarDirective,
  ],
})
export class CollectionFormComponent
  extends ComColFormComponent<Collection>
  implements OnInit, OnChanges
{
  /**
   * @type {Collection} A new collection when a collection is being created, an existing Input collection when a collection is being edited
   */
  @Input() dso: Collection = new Collection();

  /**
   * @type {Collection.type} This is a collection-type form
   */
  type = Collection.type;

  /**
   * The dynamic form field used for entity type selection
   * @type {DynamicSelectModel<string>}
   */
  entityTypeSelection: DynamicSelectModel<string> = new DynamicSelectModel(
    collectionFormEntityTypeSelectionConfig
  );

  /**
   * The dynamic form fields used for creating/editing a collection
   * @type {DynamicFormControlModel[]}
   */
  formModel: DynamicFormControlModel[];

  public constructor(
    protected formService: DynamicFormService,
    protected translate: TranslateService,
    protected notificationsService: NotificationsService,
    protected authService: AuthService,
    protected dsoService: CollectionDataService,
    protected requestService: RequestService,
    protected objectCache: ObjectCacheService,
    protected entityTypeService: EntityTypeDataService,
    public localeService: LocaleService, //kware-edit
    protected chd: ChangeDetectorRef,
    protected modalService: NgbModal
  ) {
    super(
      formService,
      translate,
      notificationsService,
      authService,
      requestService,
      objectCache,
      modalService
    );
  }

  ngOnInit(): void {
    if (hasNoValue(this.formModel) && isNotNull(this.dso)) {
      this.initializeForm();
    }
  }

  /**
   * Detect changes to the dso and initialize the form,
   * if the dso changes, exists and it is not the first change
   */
  ngOnChanges(changes: SimpleChanges) {
    const dsoChange: SimpleChange = changes.dso;
    if (this.dso && dsoChange && !dsoChange.isFirstChange()) {
      this.initializeForm();
    }
  }

  initializeForm() {
    let currentRelationshipValue: MetadataValue[];
    if (this.dso && this.dso.metadata) {
      currentRelationshipValue = this.dso.metadata["dspace.entity.type"];
    }

    const entities$: Observable<ItemType[]> = this.entityTypeService
      .findAll({ elementsPerPage: 100, currentPage: 1 })
      .pipe(getFirstSucceededRemoteListPayload());

    // retrieve all entity types to populate the dropdowns selection
    entities$.subscribe((entityTypes: ItemType[]) => {
      entityTypes = entityTypes.filter(
        (type: ItemType) => type.label !== NONE_ENTITY_TYPE
      );
      entityTypes.forEach((type: ItemType, index: number) => {
        this.entityTypeSelection.add({
          disabled: false,
          // label: type.label,
          label: this.getEntityType(type.label), //kware-edit
          value: type.label,
        } as DynamicFormOptionConfig<string>);
        if (
          currentRelationshipValue &&
          currentRelationshipValue.length > 0 &&
          currentRelationshipValue[0].value === type.label
        ) {
          this.entityTypeSelection.select(index);
          this.entityTypeSelection.disabled = true;
        }
      });

      this.formModel =
        entityTypes.length === 0
          ? collectionFormModels
          : [...collectionFormModels, this.entityTypeSelection];

      super.ngOnInit();
      this.chd.detectChanges();
    });
  }

  // kware-edit
  getEntityType(label) {
    switch (true) {
      case label === "Person" &&
        this.localeService.getCurrentLanguageCode() === "ar":
        return "شخص";
        break;
      case label === "Person" &&
        this.localeService.getCurrentLanguageCode() === "en":
        return label;
        break;
      case label === "Publication" &&
        this.localeService.getCurrentLanguageCode() === "ar":
        return "منشور";
        break;
      case label === "Publication" &&
        this.localeService.getCurrentLanguageCode() === "en":
        return label;
        break;
      case label === "Project" &&
        this.localeService.getCurrentLanguageCode() === "ar":
        return "مشروع";
        break;
      case label === "Project" &&
        this.localeService.getCurrentLanguageCode() === "en":
        return label;
        break;
      case label === "OrgUnit" &&
        this.localeService.getCurrentLanguageCode() === "ar":
        return "مؤسسة";
        break;
      case label === "OrgUnit" &&
        this.localeService.getCurrentLanguageCode() === "en":
        return label;
        break;
      case label === "Journal" &&
        this.localeService.getCurrentLanguageCode() === "ar":
        return "دورية";
        break;
      case label === "Journal" &&
        this.localeService.getCurrentLanguageCode() === "en":
        return label;
        break;
      case label === "JournalVolume" &&
        this.localeService.getCurrentLanguageCode() === "ar":
        return "مجلد دورية";
        break;
      case label === "JournalVolume" &&
        this.localeService.getCurrentLanguageCode() === "en":
        return label;
        break;
      case label === "JournalIssue" &&
        this.localeService.getCurrentLanguageCode() === "ar":
        return "عدد دورية";
        break;
      case label === "JournalIssue" &&
        this.localeService.getCurrentLanguageCode() === "en":
        return label;
        break;
      case label === "Event" &&
        this.localeService.getCurrentLanguageCode() === "ar":
        return "حدث";
        break;
      case label === "Event" &&
        this.localeService.getCurrentLanguageCode() === "en":
        return label;
        break;
      case label === "Place" &&
        this.localeService.getCurrentLanguageCode() === "ar":
        return "مكان";
        break;
      case label === "Place" &&
        this.localeService.getCurrentLanguageCode() === "en":
        return label;
        break;
      case label === "Series" &&
        this.localeService.getCurrentLanguageCode() === "ar":
        return "سلسة";
        break;
      case label === "Series" &&
        this.localeService.getCurrentLanguageCode() === "en":
        return label;
        break;
      case label === "Era" &&
        this.localeService.getCurrentLanguageCode() === "ar":
        return "حقبة زمنية";
        break;
      case label === "Era" &&
        this.localeService.getCurrentLanguageCode() === "en":
        return label;
        break;
      case label === "Administration" &&
        this.localeService.getCurrentLanguageCode() === "ar":
        return "إدارة";
        break;
      case label === "Administration" &&
        this.localeService.getCurrentLanguageCode() === "en":
        return label;
        break;
      case label === "Location" &&
        this.localeService.getCurrentLanguageCode() === "ar":
        return "موقع جغرافي";
        break;
      case label === "Location" &&
        this.localeService.getCurrentLanguageCode() === "en":
        return label;
        break;
      case label === "Subject" &&
        this.localeService.getCurrentLanguageCode() === "ar":
        return "موضوع";
        break;
      case label === "Subject" &&
        this.localeService.getCurrentLanguageCode() === "en":
        return label;
        break;

      case label === "Activity" &&
        this.localeService.getCurrentLanguageCode() === "ar":
        return "فعالية";
        break;
      case label === "Activity" &&
        this.localeService.getCurrentLanguageCode() === "en":
        return label;
        break;
      default:
        return label;
    }
  }
  // kware-edit end
}
