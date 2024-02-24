import { GachaId, GachaType, Rarity, UnitId } from "../Common.js";
import { WARP_FILE } from "./path.js";
import { CacheableJsonResource } from "./resources.js";
import { fetchFromHsrWiki } from "./wiki.js";

export type Warps = {
    [key in GachaType]: Banner[];
};

export type Banner = {
    id: GachaId;
    name: string;
    rateup: {
        5: UnitId;
        4: UnitId[];
    };
};
export class WarpData extends CacheableJsonResource<Warps> {
    private gachaIdMap!: { [K in GachaType]: GachaId[] };
    private constructor(path: string) {
        super(path);
    }
    override fromNetwork(): Promise<Warps> {
        return fetchFromHsrWiki();
    }

    static async create(path: string = WARP_FILE) {
        const ret = new WarpData(path);
        await ret.load();
        ret.gachaIdMap = {
            1: [1001] as GachaId[],
            2: [4001] as GachaId[],
            11: Array.from({ length: ret.resource[11].length }, (_, i) => (i + 2003) as GachaId),
            12: Array.from({ length: ret.resource[11].length }, (_, i) => (i + 3003) as GachaId),
        };
        return ret;
    }

    gachaTypeOf(gachaId: GachaId) {
        if (gachaId == 1001) {
            return GachaType.PERMANENT_BANNER;
        } else if (gachaId > 2000 && gachaId < 3000) {
            return GachaType.CHARACTER_BANNER;
        } else if (gachaId > 3000 && gachaId < 4000) {
            return GachaType.LIGHT_CONE_BANNER;
        } else if (gachaId === 4001) {
            return GachaType.BEGINNER_BANNER;
        }
        throw new Error("Unknown gachaType with id " + gachaId);
    }

    isCharacter(itemId: UnitId): boolean {
        return itemId < 10000;
    }
    isRateUp(gachaId: GachaId, itemId: number, rarity: Rarity): boolean {
        if (rarity === Rarity.THREE_STAR) {
            throw new Error("How can a 3 star be a rate up???");
        }
        const gachaType = this.gachaTypeOf(gachaId);
        if (!this.has5050s(gachaType)) {
            return false;
        }
        const banner = this.resource[gachaType].find((banner) => banner.id === gachaId);
        if (banner === undefined) {
            throw new Error(`Shouldnt happen ${gachaType} ${gachaId} ${itemId}`);
        }

        if (rarity === Rarity.FIVE_STAR) {
            return itemId === banner.rateup[5];
        }

        return itemId in banner.rateup[4];
    }

    has5050s(gachaType: GachaType) {
        return gachaType !== GachaType.BEGINNER_BANNER && gachaType !== GachaType.PERMANENT_BANNER;
    }

    getGachaIdsFor(gachaType: GachaType) {
        return this.gachaIdMap[gachaType];
    }
}

const singleton = await WarpData.create(WARP_FILE);

export function gachaTypeOf(gachaId: GachaId) {
    return singleton.gachaTypeOf(gachaId);
}

export function isCharacter(itemId: UnitId): boolean {
    return singleton.isCharacter(itemId);
}

export function has5050s(gachaType: GachaType) {
    return singleton.has5050s(gachaType);
}

export function isRateUp(gachaId: GachaId, itemId: number, rarity: Rarity): boolean {
    return singleton.isRateUp(gachaId, itemId, rarity);
}

export function getGachaIdsFor(gachaType: GachaType) {
    return singleton.getGachaIdsFor(gachaType);
}
