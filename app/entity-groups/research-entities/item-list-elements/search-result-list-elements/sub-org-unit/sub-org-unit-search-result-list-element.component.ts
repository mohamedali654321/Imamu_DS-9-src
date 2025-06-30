import { Component,Inject } from '@angular/core';
import { ViewMode } from '../../../../../core/shared/view-mode.model';
import { listableObjectComponent } from '../../../../../shared/object-collection/shared/listable-object/listable-object.decorator';
import { ItemSearchResultListElementComponent } from '../../../../../shared/object-list/search-result-list-element/item-search-result/item-types/item/item-search-result-list-element.component';
import { ItemMetadataRepresentation } from 'src/app/core/shared/metadata-representation/item/item-metadata-representation.model';
import { Observable } from 'rxjs';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { MetadataRepresentation, MetadataRepresentationType } from 'src/app/core/shared/metadata-representation/metadata-representation.model';
import { RelationshipDataService } from 'src/app/core/data/relationship-data.service';
import { DSONameService } from 'src/app/core/breadcrumbs/dso-name.service';
import { map } from 'rxjs/operators';
import { getItemPageRoute } from 'src/app/item-page/item-page-routing-paths';
import { APP_CONFIG, AppConfig } from 'src/config/app-config.interface';
import { TruncatableService } from 'src/app/shared/truncatable/truncatable.service';
import { LinkService } from 'src/app/core/cache/builders/link.service';
import { NgIf, AsyncPipe, DatePipe, NgClass,NgFor, NgStyle } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ThemedMetadataRepresentationListComponent } from 'src/app/item-page/simple/metadata-representation-list/themed-metadata-representation-list.component';
import { ThemedBadgesComponent } from 'src/app/shared/object-collection/shared/badges/themed-badges.component';
import { ThemedTypeBadgeComponent } from 'src/app/shared/object-collection/shared/badges/type-badge/themed-type-badge.component';
import { PublictaionCountComponent } from 'src/app/shared/publictaion-count/publictaion-count.component';
import { TruncatablePartComponent } from 'src/app/shared/truncatable/truncatable-part/truncatable-part.component';
import { TruncatableComponent } from 'src/app/shared/truncatable/truncatable.component';
import { KwareTranslatePipe } from 'src/app/shared/utils/kware-translate.pipe';
import { ViewStatisticsComponent } from 'src/app/shared/view-statistics/view-statistics.component';
import { ThemedThumbnailComponent } from 'src/app/thumbnail/themed-thumbnail.component';
@listableObjectComponent('AdministrationSearchResult', ViewMode.ListElement)
@Component({
  selector: 'ds-sub-org-unit-search-result-list-element',
  styleUrls: ['./sub-org-unit-search-result-list-element.component.scss'],
  templateUrl: './sub-org-unit-search-result-list-element.component.html',
  standalone: true,
  imports: [TruncatableComponent, NgIf,NgFor, RouterLink, ThemedThumbnailComponent, ThemedBadgesComponent, TruncatablePartComponent, AsyncPipe, DatePipe, TranslateModule,NgClass,KwareTranslatePipe,NgStyle,ViewStatisticsComponent,PublictaionCountComponent,ThemedMetadataRepresentationListComponent,ThemedTypeBadgeComponent],
})
/**
 * The component for displaying a list element for an item search result of the type Organisation Unit
 */
export class SubOrgUnitSearchResultListElementComponent extends ItemSearchResultListElementComponent {

  /**
   * Display thumbnail if required by configuration
   */
  showThumbnails: boolean;



 constructor(
  protected truncatableService: TruncatableService,
                     public dsoNameService: DSONameService,
                     protected linkService: LinkService, //kware-edit
                     @Inject(APP_CONFIG) protected appConfig?: AppConfig
) {
   super(truncatableService,dsoNameService,linkService);
 }


 
}
