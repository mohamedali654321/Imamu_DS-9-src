/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
import { AsyncPipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { getGroupEditRoute } from '../../../access-control/access-control-routing-paths';
import { DSONameService } from '../../../core/breadcrumbs/dso-name.service';
import { RemoteData } from '../../../core/data/remote-data';
import { GroupDataService } from '../../../core/eperson/group-data.service';
import { Group } from '../../../core/eperson/models/group.model';
import { ResourcePolicy } from '../../../core/resource-policy/models/resource-policy.model';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import {
  getAllSucceededRemoteData,
  getFirstSucceededRemoteDataPayload,
} from '../../../core/shared/operators';
import {
  dateToString,
  stringToNgbDateStruct,
} from '../../date.util';
import {
  hasValue,
  isNotEmpty,
} from '../../empty.util';
import { HasValuePipe } from '../../utils/has-value.pipe';
import { KwareTranslatePipe } from "../../utils/kware-translate.pipe";

export interface ResourcePolicyCheckboxEntry {
  id: string;
  policy: ResourcePolicy;
  checked: boolean;
}

@Component({
  /* eslint-disable @angular-eslint/component-selector */
  selector: 'tr[ds-resource-policy-entry]',
  templateUrl: './resource-policy-entry.component.html',
  imports: [
    AsyncPipe,
    FormsModule,
    HasValuePipe,
    TranslateModule,
    KwareTranslatePipe
],
  standalone: true,
})
export class ResourcePolicyEntryComponent implements OnInit {
  @Input()
  entry: ResourcePolicyCheckboxEntry;

  @Output()
  public toggleCheckbox: EventEmitter<boolean> = new EventEmitter();

  epersonName$: Observable<string>;
  groupName$: Observable<string>;

  constructor(
    protected dsoNameService: DSONameService,
    protected groupService: GroupDataService,
    protected route: ActivatedRoute,
    protected router: Router,
  ) {
  }

  public ngOnInit(): void {
    this.epersonName$ = this.getName$(this.entry.policy.eperson);
    this.groupName$ = this.getName$(this.entry.policy.group);
  }

  private getName$(dso$: Observable<RemoteData<DSpaceObject>>): Observable<string> {
    return dso$.pipe(
      getAllSucceededRemoteData(),
      map((rd: RemoteData<DSpaceObject>) => {
        if (hasValue(rd?.payload)) {
          return this.dsoNameService.getName(rd.payload);
        }
        return undefined;
      }),
    );
  }

  /**
   * Returns a date in simplified format (YYYY-MM-DD).
   *
   * @param date
   * @return a string with formatted date
   */
  formatDate(date: string): string {
    return isNotEmpty(date) ? dateToString(stringToNgbDateStruct(date)) : '';
  }

  /**
   * Redirect to resource policy editing page
   */
  redirectToResourcePolicyEditPage(): void {
    this.router.navigate([`./edit`], {
      relativeTo: this.route,
      queryParams: {
        policyId: this.entry.policy.id,
      },
    });
  }

  /**
   * Redirect to group edit page
   */
  redirectToGroupEditPage(): void {
    this.groupService.findByHref(this.entry.policy._links.group.href, false).pipe(
      getFirstSucceededRemoteDataPayload(),
      map((group: Group) => group.id),
    ).subscribe((groupUUID) => {
      void this.router.navigate([getGroupEditRoute(groupUUID)]);
    });
  }
}
