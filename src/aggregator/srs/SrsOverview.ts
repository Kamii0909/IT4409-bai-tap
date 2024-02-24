import { GachaId, GachaType, MihoyoApiId } from "../../Common.js";
import {
    SrsGachaIdOverviewJson,
    SrsBannersJson,
    SrsGachaTypeOverviewJson,
    SrsOverviewJson,
} from "../../StarRailStation.js";
import { Aggregate, Aggregator } from "../aggregator.js";
import { FiveStarAggregator } from "./FiveStar.js";
import { FourStarAggregator } from "./FourStar.js";
import { SrsGachaItemBuilder } from "./GachaItem.js";
import { ThreeStartAggregator } from "./ThreeStar.js";

class SrsOverviewAggregator extends Aggregate.InGroup<SrsOverviewJson, SrsGachaItemBuilder> {
    constructor(
        isGuaranteed: boolean,
        private gachaType: GachaType,
        shouldUpdate: boolean,
        pity4 = 0,
        pity5 = 0,
        private three = new ThreeStartAggregator(),
        private four = new FourStarAggregator(pity4, shouldUpdate),
        private five = new FiveStarAggregator(gachaType, shouldUpdate, isGuaranteed, pity5),
    ) {
        super([three, four, five]);
    }
    guarantees() {
        return {
            guarantee4: this.four.isGuarantee4(),
            guarantee5: this.five.isGuarantee5(),
        };
    }
    override build(): SrsOverviewJson {
        return {
            type: this.gachaType,
            ...this.three.build(),
            ...this.four.build(),
            ...this.five.build(),
            advanceInfo: {},
        };
    }
}

class LastItemIdAggregator extends Aggregator<{ lastItemId: MihoyoApiId }, SrsGachaItemBuilder> {
    constructor(private lastItemId: string = "0") {
        super();
    }
    override build() {
        return { lastItemId: this.lastItemId as MihoyoApiId };
    }
    override aggregate(item: SrsGachaItemBuilder): void {
        this.lastItemId = item.uid;
    }
}
export class SrsGachaTypeAggregator extends Aggregate.InGroup<SrsGachaTypeOverviewJson, SrsGachaItemBuilder> {
    constructor(
        gachaType: GachaType,
        private lastItemId: LastItemIdAggregator = new LastItemIdAggregator(),
        private overview: SrsOverviewAggregator = new SrsOverviewAggregator(false, gachaType, true),
    ) {
        super([lastItemId, overview]);
    }
    override build(): SrsGachaTypeOverviewJson {
        return {
            ...this.lastItemId.build(),
            ...this.overview.build(),
            ...this.overview.guarantees(),
        };
    }
}

export class SrsBannerTypeAggregator extends Aggregate.Forwarding<SrsGachaIdOverviewJson, SrsGachaItemBuilder> {
    constructor(
        gachaType: GachaType,
        public readonly gachaId: GachaId,
        isGuaranteed: boolean,
        pity4: number,
        pity5: number,
        private overview = new SrsOverviewAggregator(isGuaranteed, gachaType, false, pity4, pity5),
    ) {
        super(overview);
    }
    isGuaranteed5() {
        return this.overview.guarantees().guarantee5;
    }
    override build(): SrsGachaIdOverviewJson {
        return {
            id: this.gachaId as GachaId,
            ...this.overview.build(),
        };
    }
}

export class SrsBannersJsonAggregator extends Aggregate.Dynamically<SrsBannersJson, SrsGachaItemBuilder> {
    protected override getNextAggregator(
        newItem: SrsGachaItemBuilder,
        currAggregator: Aggregator<object, SrsGachaItemBuilder>,
    ): Aggregator<object, SrsGachaItemBuilder> {
        throw new Error("Method not implemented.");
    }
    override build(): SrsBannersJson {
        throw new Error("Method not implemented.");
    }
}
