import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { DSONameService } from '../../../../core/breadcrumbs/dso-name.service';
import { ItemMetadataRepresentationListElementComponent } from '../../../../shared/object-list/metadata-representation-list-element/item/item-metadata-representation-list-element.component';
import { TruncatableComponent } from '../../../../shared/truncatable/truncatable.component';
import { KwareTranslatePipe } from "../../../../shared/utils/kware-translate.pipe";

@Component({
  selector: 'ds-project-item-metadata-list-element',
  templateUrl: './project-item-metadata-list-element.component.html',
  standalone: true,
  imports: [
    NgbTooltipModule,
    RouterLink,
    TruncatableComponent,
    KwareTranslatePipe
  ],
})
/**
 * The component for displaying an item of the type Project as a metadata field
 */
export class ProjectItemMetadataListElementComponent extends ItemMetadataRepresentationListElementComponent {
  /**
   * Initialize instance variables
   *
   * @param dsoNameService
   */
  constructor(
    public dsoNameService: DSONameService,
  ) {
    super();
  }
}
