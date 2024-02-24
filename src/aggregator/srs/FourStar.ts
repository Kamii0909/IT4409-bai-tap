import { GachaId, UnitId } from "../../Common.js";
import { SrsOverviewJson } from "../../StarRailStation.js";
import { Aggregate } from "../aggregator.js";
import { Matchers } from "../Matcher.js";
import { SrsGachaItemBuilder } from "./GachaItem.js";
import { gachaTypeOf, isCharacter, isRateUp } from "./Utils.js";

type FourStarStats = Pick<SrsOverviewJson, "pity4" | "pullCount4" | "avgPity4" | "avgPity4Char" | "avgPity4LC">;

export class FourStarAggregator extends Aggregate.BasedOnPredicate<FourStarStats, SrsGachaItemBuilder> {
    private last!: SrsGachaItemBuilder;
    constructor(
        private pity4: number,
        private shouldUpdate: boolean,
        private chars: number = 0,
        private lcs: number = 0,
        private pityChars: number = 0,
        private pityLcs: number = 0,
    ) {
        super(Matchers.byRarity(4));
    }
    protected override beforeMatching(item: SrsGachaItemBuilder): void {
        this.pity4++;
        if (this.shouldUpdate) {
            item.pity4 = this.pity4;
        }
    }
    protected override onMatched(item: SrsGachaItemBuilder): void {
        if (isCharacter(item.itemId as UnitId)) {
            this.chars++;
            this.pityChars += this.pity4;
        } else {
            this.lcs++;
            this.pityLcs += this.pity4;
        }
        this.pity4 = 0;
        this.last = item;
    }
    isGuarantee4(): boolean {
        if (this.last === undefined) {
            return false;
        }
        return isRateUp(this.last.gachaId as GachaId, this.last.itemId, this.last.rarity);
    }
    override build(): FourStarStats {
        const total4 = this.chars + this.lcs;
        const totalPities = this.pityChars + this.pityLcs;
        return {
            pity4: this.pity4,
            pullCount4: total4,
            avgPity4Char: this.pityChars / this.chars,
            avgPity4LC: this.pityLcs / this.lcs,
            avgPity4: totalPities / total4,
        };
    }
}
