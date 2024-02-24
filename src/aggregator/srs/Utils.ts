import { GachaId, GachaType, Rarity } from "../../Common.js";
import { SrsGachaItemResult } from "../../StarRailStation.js";
import { gachaTypeOf, isCharacter, isRateUp, has5050s, getGachaIdsFor } from "../../metadata/banners.js";

export { gachaTypeOf, isCharacter, isRateUp, has5050s, getGachaIdsFor };
export function getSrsResult(gachaType: GachaType, isRateUp: boolean, isGuarantee: boolean): SrsGachaItemResult {
    if (!has5050s(gachaType)) {
        return SrsGachaItemResult.DEFAULT;
    }
    if (isGuarantee) {
        return SrsGachaItemResult.GUARANTEE;
    }
    return isRateUp ? SrsGachaItemResult.WON_5050 : SrsGachaItemResult.LOST_5050;
}
