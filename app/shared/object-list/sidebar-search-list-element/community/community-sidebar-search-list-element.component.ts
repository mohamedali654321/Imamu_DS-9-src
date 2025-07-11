import {
  AsyncPipe,
  NgClass,
} from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { Community } from '../../../../core/shared/community.model';
import { Context } from '../../../../core/shared/context.model';
import { ViewMode } from '../../../../core/shared/view-mode.model';
import { CommunitySearchResult } from '../../../object-collection/shared/community-search-result.model';
import { listableObjectComponent } from '../../../object-collection/shared/listable-object/listable-object.decorator';
import { TruncatablePartComponent } from '../../../truncatable/truncatable-part/truncatable-part.component';
import { SidebarSearchListElementComponent } from '../sidebar-search-list-element.component';
import { KwareTranslatePipe } from 'src/app/shared/utils/kware-translate.pipe';

@listableObjectComponent(CommunitySearchResult, ViewMode.ListElement, Context.SideBarSearchModal)
@listableObjectComponent(CommunitySearchResult, ViewMode.ListElement, Context.SideBarSearchModalCurrent)
@listableObjectComponent(CommunitySearchResult, ViewMode.ListElement, Context.ScopeSelectorModal)
@listableObjectComponent(CommunitySearchResult, ViewMode.ListElement, Context.ScopeSelectorModalCurrent)
@Component({
  selector: 'ds-community-sidebar-search-list-element',
  templateUrl: '../sidebar-search-list-element.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    NgClass,
    TranslateModule,
    TruncatablePartComponent,
    KwareTranslatePipe
  ],
})
/**
 * Component displaying a list element for a {@link CommunitySearchResult} within the context of a sidebar search modal
 */
export class CommunitySidebarSearchListElementComponent extends SidebarSearchListElementComponent<CommunitySearchResult, Community> {
  /**
   * Get the description of the Community by returning its abstract
   */
  getDescription(): string {
    return this.firstMetadataValue('dc.description.abstract');
  }
}
