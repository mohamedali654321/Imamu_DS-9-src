import { AsyncPipe, NgIf, NgStyle } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";

import { Context } from "../../../../../../../app/core/shared/context.model";
import { ViewMode } from "../../../../../../../app/core/shared/view-mode.model";
import { CollectionsComponent } from "../../../../../../../app/item-page/field-components/collections/collections.component";
import { ThemedMediaViewerComponent } from "../../../../../../../app/item-page/media-viewer/themed-media-viewer.component";
import { MiradorViewerComponent } from "../../../../../../../app/item-page/mirador-viewer/mirador-viewer.component";
import { ThemedFileSectionComponent } from "../../../../../../../app/item-page/simple/field-components/file-section/themed-file-section.component";
import { ItemPageAbstractFieldComponent } from "../../../../../../../app/item-page/simple/field-components/specific-field/abstract/item-page-abstract-field.component";
import { ItemPageDateFieldComponent } from "../../../../../../../app/item-page/simple/field-components/specific-field/date/item-page-date-field.component";
import { GenericItemPageFieldComponent } from "../../../../../../../app/item-page/simple/field-components/specific-field/generic/generic-item-page-field.component";
import { GeospatialItemPageFieldComponent } from "../../../../../../../app/item-page/simple/field-components/specific-field/geospatial/geospatial-item-page-field.component";
import { ThemedItemPageTitleFieldComponent } from "../../../../../../../app/item-page/simple/field-components/specific-field/title/themed-item-page-field.component";
import { ItemPageUriFieldComponent } from "../../../../../../../app/item-page/simple/field-components/specific-field/uri/item-page-uri-field.component";
import { PublicationComponent as BaseComponent } from "../../../../../../../app/item-page/simple/item-types/publication/publication.component";
import { ThemedMetadataRepresentationListComponent } from "../../../../../../../app/item-page/simple/metadata-representation-list/themed-metadata-representation-list.component";
import { RelatedItemsComponent } from "../../../../../../../app/item-page/simple/related-items/related-items-component";
import { DsoEditMenuComponent } from "../../../../../../../app/shared/dso-page/dso-edit-menu/dso-edit-menu.component";
import { MetadataFieldWrapperComponent } from "../../../../../../../app/shared/metadata-field-wrapper/metadata-field-wrapper.component";
import { listableObjectComponent } from "../../../../../../../app/shared/object-collection/shared/listable-object/listable-object.decorator";
import { ThemedResultsBackButtonComponent } from "../../../../../../../app/shared/results-back-button/themed-results-back-button.component";
import { ThemedThumbnailComponent } from "../../../../../../../app/thumbnail/themed-thumbnail.component";
import { TabbedRelatedEntitiesSearchComponent } from "src/app/item-page/simple/related-entities/tabbed-related-entities-search/tabbed-related-entities-search.component";
import { KwareMediaViewerComponent } from "src/app/shared/kware-media-viewer/kware-media-viewer.component";
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { SimpleViewStatisticsComponent } from "src/app/shared/simple-view-statistics/simple-view-statistics.component";
import { KwareTranslatePipe } from "src/app/shared/utils/kware-translate.pipe";
import { KwareSocialSharingComponent } from "src/app/shared/kware-social-sharing/kware-social-sharing.component";
import { KwareNavigateItemsComponent } from "src/app/shared/kware-navigate-items/kware-navigate-items.component";

@listableObjectComponent(
  "Publication",
  ViewMode.StandalonePage,
  Context.Any,
  "custom"
)
@Component({
  selector: "ds-publication",
  // styleUrls: ['./publication.component.scss'],
  styleUrls: [
    "../../../../../../../app/item-page/simple/item-types/publication/publication.component.scss",
  ],
  // templateUrl: './publication.component.html',
  templateUrl:
    "../../../../../../../app/item-page/simple/item-types/publication/publication.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    AsyncPipe,
    CollectionsComponent,
    DsoEditMenuComponent,
    GenericItemPageFieldComponent,
    GeospatialItemPageFieldComponent,
    ItemPageAbstractFieldComponent,
    ItemPageDateFieldComponent,
    ItemPageUriFieldComponent,
    MetadataFieldWrapperComponent,
    MiradorViewerComponent,
    RelatedItemsComponent,
    RouterLink,
    ThemedFileSectionComponent,
    ThemedItemPageTitleFieldComponent,
    ThemedMediaViewerComponent,
    ThemedMetadataRepresentationListComponent,
    ThemedResultsBackButtonComponent,
    ThemedThumbnailComponent,
    TranslateModule,
    NgIf,
    TabbedRelatedEntitiesSearchComponent,
    KwareMediaViewerComponent,
    NgbTooltipModule,
    SimpleViewStatisticsComponent,
    KwareTranslatePipe,
    NgStyle,
    KwareSocialSharingComponent,
    KwareNavigateItemsComponent
  ],
})
export class PublicationComponent extends BaseComponent {}
