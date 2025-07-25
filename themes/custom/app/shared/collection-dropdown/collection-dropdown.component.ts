import { AsyncPipe, NgClass, NgIf } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { InfiniteScrollModule } from "ngx-infinite-scroll";

import { CollectionDropdownComponent as BaseComponent } from "../../../../../app/shared/collection-dropdown/collection-dropdown.component";
import { ThemedLoadingComponent } from "../../../../../app/shared/loading/themed-loading.component";
import { KwareTranslatePipe } from "src/app/shared/utils/kware-translate.pipe";

@Component({
  selector: "ds-themed-collection-dropdown",
  templateUrl:
    "../../../../../app/shared/collection-dropdown/collection-dropdown.component.html",
  // templateUrl: './collection-dropdown.component.html',
  styleUrls: [
    "../../../../../app/shared/collection-dropdown/collection-dropdown.component.scss",
  ],
  // styleUrls: ['./collection-dropdown.component.scss']
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    InfiniteScrollModule,
    ReactiveFormsModule,
    ThemedLoadingComponent,
    TranslateModule,
    KwareTranslatePipe,
    NgIf,
    NgClass,
  ],
})
export class CollectionDropdownComponent extends BaseComponent {}
