import { Brand } from "utility-types";

export enum Rarity {
    THREE_STAR = 3,
    FOUR_STAR = 4,
    FIVE_STAR = 5,
}

export enum GachaType {
    PERMANENT_BANNER = 1,
    BEGINNER_BANNER = 2,
    CHARACTER_BANNER = 11,
    LIGHT_CONE_BANNER = 12,
}

export type MihoyoApiId = Brand<string, "MihoyoApiId">;
export type GachaId = Brand<number, "GachaId">;
export type UnitId = Brand<number, "UnitId">;
export type UnitCanonicalName = Brand<string, "UnitCanonicalName">;
