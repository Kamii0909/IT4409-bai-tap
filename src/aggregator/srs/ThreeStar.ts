import { SrsGachaItem, SrsOverviewJson } from "../../StarRailStation.js";
import { Aggregate } from "../aggregator.js";
import { Matchers } from "../Matcher.js";
import { SrsGachaItemBuilder } from "./GachaItem.js";

type ThreeStarStats = Pick<SrsOverviewJson, "pullCount3">;
export class ThreeStartAggregator extends Aggregate.BasedOnPredicate<ThreeStarStats, SrsGachaItemBuilder> {
    constructor(private pullCount3: number = 0) {
        super(Matchers.byRarity(3));
    }
    protected override onMatched(item: SrsGachaItemBuilder): void {
        this.pullCount3++;
    }
    override build(): ThreeStarStats {
        return {
            pullCount3: this.pullCount3,
        };
    }
}
