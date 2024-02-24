import { ok } from "assert";
import { GachaId, GachaType } from "../../Common.js";
import { SrsOverviewJson } from "../../StarRailStation.js";
import { Aggregate } from "../aggregator.js";
import { Matchers } from "../Matcher.js";
import { SrsGachaItemBuilder } from "./GachaItem.js";
import { getSrsResult, has5050s, isRateUp } from "./Utils.js";

type FiveStarStats = Pick<SrsOverviewJson, "pullCount5" | "pity5" | "avgPity5" | "rateupChallenges" | "rateupWins">;
export class FiveStarAggregator extends Aggregate.BasedOnPredicate<FiveStarStats, SrsGachaItemBuilder> {
    private last!: SrsGachaItemBuilder;

    constructor(
        private gachaType: GachaType,
        private updatePity: boolean,
        private isGuaranteed: boolean,
        private pity5: number,
        private pullCount5: number = 0,
        private pityAll: number = 0,
        private num5050s: number = 0,
        private won5050s: number = 0,
    ) {
        super(Matchers.byRarity(5));
    }
    protected override beforeMatching(item: SrsGachaItemBuilder): void {
        this.pity5++;
        if (this.updatePity) {
            item.pity5 = this.pity5;
        }
    }
    protected override onMatched(item: SrsGachaItemBuilder): void {
        this.pullCount5++;
        this.pityAll += this.pity5;
        this.pity5 = 0;
        if (!has5050s(this.gachaType)) {
            return;
        }
        const rateUp = isRateUp(item.gachaId as GachaId, item.itemId, item.rarity);
        if (this.isGuaranteed) {
            ok(rateUp, `We are guaranteed but found a lost 5050: ${item}`);
            this.isGuaranteed = false;
        } else {
            this.num5050s++;
            this.won5050s += rateUp ? 1 : ((this.isGuaranteed = true), 0);
        }
        this.last = item;
        item.result = getSrsResult(this.gachaType, rateUp, this.isGuaranteed);
    }
    isGuarantee5(): boolean {
        if (!has5050s(this.gachaType)) {
            return false;
        }
        if (this.last === undefined) {
            return this.isGuaranteed;
        }
        return !isRateUp( this.last.gachaId as GachaId, this.last.itemId, this.last.rarity);
    }
    override build(): FiveStarStats {
        return {
            pullCount5: this.pullCount5,
            avgPity5: this.pullCount5 === 0 ? 0 : this.pityAll / this.pullCount5,
            pity5: this.pity5,
            rateupChallenges: this.num5050s,
            rateupWins: this.won5050s,
        };
    }
}
