import { AsyncPipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { ViewMode } from '../../../../core/shared/view-mode.model';
import { GenericItemPageFieldComponent } from '../../../../item-page/simple/field-components/specific-field/generic/generic-item-page-field.component';
import { ThemedItemPageTitleFieldComponent } from '../../../../item-page/simple/field-components/specific-field/title/themed-item-page-field.component';
import { ItemComponent } from '../../../../item-page/simple/item-types/shared/item.component';
import { TabbedRelatedEntitiesSearchComponent } from '../../../../item-page/simple/related-entities/tabbed-related-entities-search/tabbed-related-entities-search.component';
import { RelatedItemsComponent } from '../../../../item-page/simple/related-items/related-items-component';
import { DsoEditMenuComponent } from '../../../../shared/dso-page/dso-edit-menu/dso-edit-menu.component';
import { MetadataFieldWrapperComponent } from '../../../../shared/metadata-field-wrapper/metadata-field-wrapper.component';
import { listableObjectComponent } from '../../../../shared/object-collection/shared/listable-object/listable-object.decorator';
import { ThemedResultsBackButtonComponent } from '../../../../shared/results-back-button/themed-results-back-button.component';
import { ThemedThumbnailComponent } from '../../../../thumbnail/themed-thumbnail.component';
import { ThemedMediaViewerComponent } from "../../../../item-page/media-viewer/themed-media-viewer.component";
import { SimpleViewStatisticsComponent } from "../../../../shared/simple-view-statistics/simple-view-statistics.component";
import { CollectionsComponent } from "../../../../item-page/field-components/collections/collections.component";
import { KwareSocialSharingComponent } from "../../../../shared/kware-social-sharing/kware-social-sharing.component";
import { KwareNavigateItemsComponent } from "../../../../shared/kware-navigate-items/kware-navigate-items.component";

@listableObjectComponent('Person', ViewMode.StandalonePage)
@Component({
  selector: 'ds-person',
  styleUrls: ['./person.component.scss'],
  templateUrl: './person.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    DsoEditMenuComponent,
    GenericItemPageFieldComponent,
    MetadataFieldWrapperComponent,
    RelatedItemsComponent,
    RouterLink,
    TabbedRelatedEntitiesSearchComponent,
    ThemedItemPageTitleFieldComponent,
    ThemedResultsBackButtonComponent,
    ThemedThumbnailComponent,
    TranslateModule,
    NgIf,
    ThemedMediaViewerComponent,
    SimpleViewStatisticsComponent,
    CollectionsComponent,
    KwareSocialSharingComponent,
    KwareNavigateItemsComponent
],
})
/**
 * The component for displaying metadata and relations of an item of the type Person
 */
export class PersonComponent extends ItemComponent {
}
