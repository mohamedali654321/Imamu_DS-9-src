import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { BrowseByTitleComponent as BaseComponent } from '../../../../../app/browse-by/browse-by-title/browse-by-title.component';
import { ThemedBrowseByComponent } from '../../../../../app/shared/browse-by/themed-browse-by.component';
import { ThemedLoadingComponent } from '../../../../../app/shared/loading/themed-loading.component';
import { KwareTranslatePipe } from 'src/app/shared/utils/kware-translate.pipe';
import { ThemedConfigurationSearchPageComponent } from 'src/app/search-page/themed-configuration-search-page.component';

@Component({
  selector: 'ds-browse-by-title',
  // styleUrls: ['./browse-by-title.component.scss'],
  styleUrls: ['../../../../../app/browse-by/browse-by-metadata/browse-by-metadata.component.scss'],
  // templateUrl: './browse-by-title.component.html',
  templateUrl: '../../../../../app/browse-by/browse-by-metadata/browse-by-metadata.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    ThemedBrowseByComponent,
    ThemedLoadingComponent,
    TranslateModule,
    KwareTranslatePipe,
    ThemedConfigurationSearchPageComponent
  ],
})
export class BrowseByTitleComponent extends BaseComponent {
}
