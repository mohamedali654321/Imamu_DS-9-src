import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";

import { DSONameService } from "../../../core/breadcrumbs/dso-name.service";
import { BitstreamDataService } from "../../../core/data/bitstream-data.service";
import { DSpaceObject } from "../../../core/shared/dspace-object.model";
import { Metadata } from "../../../core/shared/metadata.utils";
import { hasValue } from "../../empty.util";
import { AbstractListableElementComponent } from "../../object-collection/shared/object-collection-element/abstract-listable-element.component";
import { SearchResult } from "../../search/models/search-result.model";
import { TruncatableService } from "../../truncatable/truncatable.service";
import { Item } from "src/app/core/shared/item.model";
import { followLink } from "../../utils/follow-link-config.model";
import { LinkService } from "src/app/core/cache/builders/link.service";
import { LocaleService } from "src/app/core/locale/locale.service";

@Component({
  selector: "ds-search-result-grid-element",
  template: ``,
  standalone: true,
})
export class SearchResultGridElementComponent<
    T extends SearchResult<K>,
    K extends DSpaceObject
  >
  extends AbstractListableElementComponent<T>
  implements OnInit
{
  /**
   * The DSpaceObject of the search result
   */
  dso: K;

  /**
   * Whether or not the grid element is currently collapsed
   */
  isCollapsed$: Observable<boolean>;

  public constructor(
    public dsoNameService: DSONameService,
    protected truncatableService: TruncatableService,
    protected bitstreamDataService: BitstreamDataService,
    protected linkService: LinkService, //kware-edit
    public localeService: LocaleService /* kware edit - call service from LocaleService */
  ) {
    super(dsoNameService);
  }

  /**
   * Retrieve the dso from the search result
   */
  ngOnInit(): void {
    if (hasValue(this.object)) {
      this.dso = this.object.indexableObject;
      this.isCollapsed$ = this.isCollapsed();
    }
     this.linkService.resolveLink<Item>(this.dso, followLink("thumbnail")); //kware-edit
    this.linkService.resolveLink<Item>(this.dso, followLink("version")); //kware-edit
  }

  /**
   * Gets all matching metadata string values from hitHighlights or dso metadata, preferring hitHighlights.
   *
   * @param {string|string[]} keyOrKeys The metadata key(s) in scope. Wildcards are supported; see [[Metadata]].
   * @returns {string[]} the matching string values or an empty array.
   */
  allMetadataValues(keyOrKeys: string | string[]): string[] {
    return Metadata.allValues(
      [this.object.hitHighlights, this.dso.metadata],
      keyOrKeys
    );
  }

  /**
   * Gets the first matching metadata string value from hitHighlights or dso metadata, preferring hitHighlights.
   *
   * @param {string|string[]} keyOrKeys The metadata key(s) in scope. Wildcards are supported; see [[Metadata]].
   * @returns {string} the first matching string value, or `undefined`.
   */
  firstMetadataValue(keyOrKeys: string | string[]): string {
    return Metadata.firstValue(
      [this.object.hitHighlights, this.dso.metadata],
      keyOrKeys
    );
  }

  public isCollapsed(): Observable<boolean> {
    return this.truncatableService.isCollapsed(this.dso.id);
  }
}
