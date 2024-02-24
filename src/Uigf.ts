import { Brand } from "utility-types";
import { GachaType, MihoyoApiId, Rarity } from "./Common.js";

export type UigfItemId = Brand<string, "UigfItemId">;

export type UigfGachaType = `${GachaType}`;

export type UigfRankType = `${Rarity}`;

const enum UigfItemType {
    CHARACTER = "Character",
    LIGHT_CONE = "Light Cone",
}

const enum UigfVersion {
    VERSION_1_0 = "v1.0",
}

export type UigfWarpJson = {
    info: UigfInfo;
    list: UigfGachaItem[];
};

export type UigfInfo = {
    uid: MihoyoApiId;
    lang: string;
    region_time_zone: number;
    export_timestamp: number;
    export_app: string;
    export_app_version: string;
    srgf_version: UigfVersion;
};

export type UigfGachaItem = {
    gacha_id: string;
    gacha_type: UigfGachaType;
    item_id: UigfItemId;
    count: string;
    time: string;
    name: string;
    item_type: UigfItemType;
    rank_type: UigfRankType;
    id: string;
};
