import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { ThemedComponent } from '../theme-support/themed.component';
import {
  CollectionDropdownComponent,
  CollectionListEntry,
} from './collection-dropdown.component';

@Component({
  selector: 'ds-collection-dropdown',
  styleUrls: [],
  templateUrl: '../../shared/theme-support/themed.component.html',
  standalone: true,
  imports: [
    CollectionDropdownComponent,
  ],
})
export class ThemedCollectionDropdownComponent extends ThemedComponent<CollectionDropdownComponent> {

  @Input() entityType: string;

  @Output() searchComplete: EventEmitter<any> = new EventEmitter();

  @Output() theOnlySelectable: EventEmitter<CollectionListEntry> = new EventEmitter();

  @Output() selectionChange = new EventEmitter();

            /*kware start edit
   - get selected collection from SubmissionFormCollectionComponent
   - send  searchListCollectionLength to SubmissionFormCollectionComponent to check if length > 1
   **/
   @Input() selectedCollection: string;

   @Output() searchListCollectionLength = new EventEmitter<number>();
 
 /*kware end edit**/

  protected inAndOutputNames: (keyof CollectionDropdownComponent & keyof this)[] = ['entityType', 'selectedCollection','searchListCollectionLength','searchComplete', 'theOnlySelectable', 'selectionChange'];

  protected getComponentName(): string {
    return 'CollectionDropdownComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../themes/${themeName}/app/shared/collection-dropdown/collection-dropdown.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./collection-dropdown.component`);
  }
}
