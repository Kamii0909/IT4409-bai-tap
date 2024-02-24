import { GachaId, GachaType, MihoyoApiId, Rarity } from "./Common.js";

export type SrsGachaTypeItems = `items_${GachaType}`;

export enum SrsGachaItemResult {
    DEFAULT = 0,
    WON_5050 = 2,
    GUARANTEE = 3,
    LOST_5050 = 4,
}

export type SrsGachaTypesOverview = {
    [K in GachaType]: SrsGachaTypeOverviewJson;
};

export type SrsBannersJson = {
    [key: GachaId]: SrsGachaIdOverviewJson;
};

export type SrsWarpJson = {
    "2_warp-v2": {
        types: SrsGachaTypesOverview;
        banners: SrsBannersJson;
        identities: object;
    } & {
        [K in SrsGachaTypeItems]: SrsGachaItem[];
    };
};

export type SrsGachaItem = {
    uid: string;
    itemId: number;
    timestamp: number;
    gachaType: GachaType;
    gachaId: number;
    rarity: Rarity;
    manual: boolean;
    pity4: number;
    pity5: number;
    pullNo: number;
    result: SrsGachaItemResult;
    anchorItemId: string;
    sort: number;
};

export type SrsOverviewJson = {
    type: GachaType;
    pullCount3: number;
    pullCount4: number;
    pullCount5: number;
    avgPity4Char: number;
    avgPity4LC: number;
    avgPity4: number;
    avgPity5: number;
    pity4: number;
    pity5: number;
    rateupChallenges: number;
    rateupWins: number;
    advanceInfo: object;
};

export type SrsGachaIdOverviewJson = SrsOverviewJson & {
    id: GachaId;
};

export type SrsGachaTypeOverviewJson = SrsOverviewJson & {
    lastItemId: MihoyoApiId;
    guarantee5: boolean;
    guarantee4: boolean;
};
