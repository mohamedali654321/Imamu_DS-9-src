import {
  AsyncPipe,
  NgTemplateOutlet,
} from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { VarDirective } from '../shared/utils/var.directive';
import { Breadcrumb } from './breadcrumb/breadcrumb.model';
import { BreadcrumbsService } from './breadcrumbs.service';
import { KwareTranslatePipe } from "../shared/utils/kware-translate.pipe";

/**
 * Component representing the breadcrumbs of a page
 */
@Component({
  selector: 'ds-base-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    NgbTooltipModule,
    NgTemplateOutlet,
    RouterLink,
    TranslateModule,
    VarDirective,
    KwareTranslatePipe
],
})
export class BreadcrumbsComponent {

  /**
   * Observable of the list of breadcrumbs for this page
   */
  breadcrumbs$: Observable<Breadcrumb[]>;

  /**
   * Whether or not to show breadcrumbs on this page
   */
  showBreadcrumbs$: Observable<boolean>;

  constructor(
    private breadcrumbsService: BreadcrumbsService,
  ) {
    this.breadcrumbs$ = breadcrumbsService.breadcrumbs$;
    this.showBreadcrumbs$ = breadcrumbsService.showBreadcrumbs$;
  }

}
