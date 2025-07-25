import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { ThemedComponent } from '../theme-support/themed.component';
import { SearchFormComponent } from './search-form.component';

/**
 * Themed wrapper for {@link SearchFormComponent}
 */
@Component({
  selector: 'ds-search-form',
  styleUrls: [],
  templateUrl: '../../shared/theme-support/themed.component.html',
  standalone: true,
  imports: [
    SearchFormComponent,
  ],
})
export class ThemedSearchFormComponent extends ThemedComponent<SearchFormComponent> {

  @Input() query: string;

  @Input() inPlaceSearch: boolean;

  @Input() scope: string;

  @Input() hideScopeInUrl: boolean;

  @Input() currentUrl: string;

  @Input() large: boolean;

  @Input() brandColor: string;

  @Input() searchPlaceholder: string;

  @Input() showScopeSelector: boolean;

  @Input() filterFields?: string;

  @Output() submitSearch: EventEmitter<any> = new EventEmitter();

  protected inAndOutputNames: (keyof SearchFormComponent & keyof this)[] = [
    'query',
    'inPlaceSearch',
    'scope',
    'hideScopeInUrl',
    'currentUrl',
    'large',
    'brandColor',
    'searchPlaceholder',
    'showScopeSelector',
    'filterFields',
    'submitSearch',
  ];

  protected getComponentName(): string {
    return 'SearchFormComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../themes/${themeName}/app/shared/search-form/search-form.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import('./search-form.component');
  }

}
