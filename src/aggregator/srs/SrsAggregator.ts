import { GachaId, GachaType } from "../../Common.js";
import {
    SrsBannersJson,
    SrsGachaIdOverviewJson,
    SrsGachaItem,
    SrsGachaTypeItems,
    SrsGachaTypesOverview,
    SrsWarpJson,
} from "../../StarRailStation.js";
import { Aggregate, Aggregator } from "../aggregator.js";
import { SrsGachaItemBuilder } from "./GachaItem.js";
import { SrsBannerTypeAggregator, SrsGachaTypeAggregator } from "./SrsOverview.js";
import { getGachaIdsFor } from "./Utils.js";

export class SrsAggregator extends Aggregate.InGroup<SrsWarpJson, SrsGachaItemBuilder> {
    constructor(
        private banners = new BannersAggregator(),
        private types = new TypesAggregator(),
        private items = new ItemsAggregator(),
    ) {
        super([types, banners, items]);
    }
    override build(): SrsWarpJson {
        return {
            "2_warp-v2": {
                types: this.types.build(),
                banners: this.banners.build(),
                identities: {},
                ...this.items.build(),
            },
        };
    }
}

class TypesAggregator extends Aggregate.Dynamically<SrsGachaTypesOverview, SrsGachaItemBuilder> {
    constructor(
        private beginner = new SrsGachaTypeAggregator(GachaType.BEGINNER_BANNER),
        private perma = new SrsGachaTypeAggregator(GachaType.PERMANENT_BANNER),
        private char = new SrsGachaTypeAggregator(GachaType.CHARACTER_BANNER),
        private lc = new SrsGachaTypeAggregator(GachaType.LIGHT_CONE_BANNER),
    ) {
        super(beginner);
    }

    protected override getNextAggregator(
        newItem: SrsGachaItemBuilder,
        currAggregator: Aggregator<object, SrsGachaItemBuilder>,
    ): Aggregator<object, SrsGachaItemBuilder> {
        switch (newItem.gachaType) {
            case GachaType.BEGINNER_BANNER:
                return this.beginner;
            case GachaType.PERMANENT_BANNER:
                return this.perma;
            case GachaType.CHARACTER_BANNER:
                return this.char;
            case GachaType.LIGHT_CONE_BANNER:
                return this.lc;

            default:
                throw new Error("Unknown gacha type");
        }
    }
    override build(): SrsGachaTypesOverview {
        return {
            1: this.perma.build(),
            2: this.beginner.build(),
            11: this.char.build(),
            12: this.lc.build(),
        };
    }
}

class GachaIdsWithSameGachaTypeAggregator extends Aggregate.Dynamically<SrsBannersJson, SrsGachaItemBuilder> {
    constructor(
        private gachaType: GachaType,
        firstId: GachaId,
        private curr: SrsBannerTypeAggregator = new SrsBannerTypeAggregator(gachaType, firstId, false, 0, 0),
        private aggMaps: Map<GachaId, SrsBannerTypeAggregator> = new Map(),
        private jsonMaps: [GachaId, SrsGachaIdOverviewJson][] = [],
    ) {
        super(curr);
        aggMaps.set(firstId, curr);
    }
    protected override getNextAggregator(
        newItem: SrsGachaItemBuilder,
        currAggregator: Aggregator<object, SrsGachaItemBuilder>,
    ): Aggregator<object, SrsGachaItemBuilder> {
        if ((newItem.gachaId as GachaId) === this.curr.gachaId) {
            return this.curr;
        }
        const agg = this.aggMaps.get(newItem.gachaId as GachaId);
        if (agg !== undefined) {
            // Duo banner
            return agg;
        }
        // Okay, we completed old banner data, time to move on
        const json = this.curr.build();
        this.jsonMaps.push([this.curr.gachaId, json]);
        this.curr = new SrsBannerTypeAggregator(
            this.gachaType,
            newItem.gachaId as GachaId,
            this.curr.isGuaranteed5(),
            json.pity4,
            json.pity5,
        );
        this.aggMaps.set(newItem.gachaId as GachaId, this.curr);
        return this.curr;
    }
    override build(): SrsBannersJson {
        this.jsonMaps.push([this.curr.gachaId, this.curr.build()]);
        return Object.fromEntries(this.jsonMaps);
    }
}

class BannersAggregator extends Aggregate.Dynamically<SrsBannersJson, SrsGachaItemBuilder> {
    constructor(
        private perma = new GachaIdsWithSameGachaTypeAggregator(
            GachaType.PERMANENT_BANNER,
            getGachaIdsFor(GachaType.PERMANENT_BANNER)[0],
        ),
        private beginner = new GachaIdsWithSameGachaTypeAggregator(
            GachaType.BEGINNER_BANNER,
            getGachaIdsFor(GachaType.BEGINNER_BANNER)[0],
        ),
        private char = new GachaIdsWithSameGachaTypeAggregator(
            GachaType.CHARACTER_BANNER,
            getGachaIdsFor(GachaType.CHARACTER_BANNER)[0],
        ),
        private lc = new GachaIdsWithSameGachaTypeAggregator(
            GachaType.LIGHT_CONE_BANNER,
            getGachaIdsFor(GachaType.LIGHT_CONE_BANNER)[0],
        ),
    ) {
        super(perma);
    }

    protected override getNextAggregator(
        newItem: SrsGachaItemBuilder,
        currAggregator: Aggregator<object, SrsGachaItemBuilder>,
    ): Aggregator<object, SrsGachaItemBuilder> {
        switch (newItem.gachaType) {
            case GachaType.PERMANENT_BANNER:
                return this.perma;
            case GachaType.BEGINNER_BANNER:
                return this.beginner;
            case GachaType.CHARACTER_BANNER:
                return this.char;
            case GachaType.LIGHT_CONE_BANNER:
                return this.lc;
            default:
                throw new Error();
        }
    }

    override build(): SrsBannersJson {
        return {
            ...this.beginner.build(),
            ...this.perma.build(),
            ...this.char.build(),
            ...this.lc.build(),
        };
    }
}

class ItemsAggregator extends Aggregate.Dynamically<{ [K in SrsGachaTypeItems]: SrsGachaItem[] }, SrsGachaItemBuilder> {
    constructor(
        private perma = new Aggregate.ToSimpleArray<SrsGachaItemBuilder>(),
        private beginner = new Aggregate.ToSimpleArray<SrsGachaItemBuilder>(),
        private char = new Aggregate.ToSimpleArray<SrsGachaItemBuilder>(),
        private lc = new Aggregate.ToSimpleArray<SrsGachaItemBuilder>(),
    ) {
        super(perma);
    }
    protected override getNextAggregator(
        newItem: SrsGachaItemBuilder,
        currAggregator: Aggregator<object, SrsGachaItemBuilder>,
    ): Aggregator<object, SrsGachaItemBuilder> {
        switch (newItem.gachaType) {
            case GachaType.PERMANENT_BANNER:
                return this.perma;
            case GachaType.BEGINNER_BANNER:
                return this.beginner;
            case GachaType.CHARACTER_BANNER:
                return this.char;
            case GachaType.LIGHT_CONE_BANNER:
                return this.lc;
            default:
                throw new Error();
        }
    }
    override build(): {
        items_1: SrsGachaItem[];
        items_2: SrsGachaItem[];
        items_11: SrsGachaItem[];
        items_12: SrsGachaItem[];
    } {
        return {
            items_1: this.buildArr(this.perma),
            items_2: this.buildArr(this.beginner),
            items_11: this.buildArr(this.char),
            items_12: this.buildArr(this.lc),
        };
    }
    private buildArr(agg: Aggregate.ToSimpleArray<SrsGachaItemBuilder>): SrsGachaItem[] {
        return agg
            .build()
            .map((item, index) => {
                item.pullNo = index + 1;
                return item.build();
            })
            .sort((a, b) => a.timestamp - b.timestamp);
    }
}
