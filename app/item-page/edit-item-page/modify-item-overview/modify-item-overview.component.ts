import { KeyValuePipe } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { Item } from '../../../core/shared/item.model';
import { MetadataMap } from '../../../core/shared/metadata.models';
import { KwareTranslatePipe } from "../../../shared/utils/kware-translate.pipe";

@Component({
  selector: 'ds-modify-item-overview',
  templateUrl: './modify-item-overview.component.html',
  standalone: true,
  imports: [
    KeyValuePipe,
    TranslateModule,
    KwareTranslatePipe
],
})
/**
 * Component responsible for rendering a table containing the metadatavalues from the to be edited item
 */
export class ModifyItemOverviewComponent implements OnChanges  {

  @Input() item: Item;
  metadata: MetadataMap;

  ngOnChanges(): void {
    this.metadata = this.item?.metadata;
  }
}
