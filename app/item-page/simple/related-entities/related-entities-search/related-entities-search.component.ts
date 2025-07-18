import { Component, Input, OnInit } from "@angular/core";

import { Item } from "../../../../core/shared/item.model";
import { ThemedConfigurationSearchPageComponent } from "../../../../search-page/themed-configuration-search-page.component";
import { isNotEmpty } from "../../../../shared/empty.util";
import { getFilterByRelation } from "../../../../shared/utils/relation-query.utils";

@Component({
  selector: "ds-related-entities-search",
  templateUrl: "./related-entities-search.component.html",
  standalone: true,
  imports: [ThemedConfigurationSearchPageComponent],
})
/**
 * A component to show related items as search results.
 * Related items can be faceted, or queried using an
 * optional search box.
 */
export class RelatedEntitiesSearchComponent implements OnInit {
  /**
   * The type of relationship to fetch items for
   * e.g. 'isAuthorOfPublication'
   */
  @Input() relationType: string;
  @Input() relationLabel: string;

  /**
   * An optional configuration to use for the search options
   */
  @Input() configuration: string;

  /**
   * The item to render relationships for
   */
  @Input() item: Item;

  /**
   * Whether or not the search bar and title should be displayed (defaults to true)
   * @type {boolean}
   */
  @Input() searchEnabled = true;

  /**
   * The ratio of the sidebar's width compared to the search results (1-12) (defaults to 4)
   * @type {number}
   */
  @Input() sideBarWidth = 2;

  fixedFilter: string;
  filterFields: string;

  ngOnInit(): void {
    if (this.relationLabel.includes("Of") === true) {
      this.filterFields =
        this.relationLabel.split("is")[1].split("Of")[0] !== "Child" ||
        this.relationLabel.split("is")[1].split("Of")[0] !== "Perent"
          ? this.relationLabel.split("is")[1].split("Of")[0]
          : this.item.firstMetadataValue("dspace.entity.type");
    } else {
      this.filterFields = this.item.firstMetadataValue("dspace.entity.type");
    }
    if (isNotEmpty(this.relationType) && isNotEmpty(this.item)) {
      this.fixedFilter = getFilterByRelation(this.relationType, this.item.id);
    }
  }
}
