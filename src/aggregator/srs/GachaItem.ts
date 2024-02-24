import moment from "moment";
import { GachaType, Rarity } from "../../Common.js";
import { SrsGachaItem } from "../../StarRailStation.js";
import { UigfGachaItem } from "../../Uigf.js";

export class SrsGachaItemBuilder {
    constructor(
        uigf: UigfGachaItem,
        public readonly uid: string = uigf.id,
        public readonly itemId: number = Number.parseInt(uigf.item_id),
        public readonly timestamp: number = moment(uigf.time).unix(),
        public readonly gachaType: GachaType = Number.parseInt(uigf.gacha_type),
        public readonly gachaId: number = Number.parseInt(uigf.gacha_id),
        public readonly rarity: Rarity = Number.parseInt(uigf.rank_type),
        public pity4: number = -1,
        public pity5: number = -1,
        public pullNo: number = -1,
        public result: number = -1,
    ) {}

    build(): SrsGachaItem {
        return {
            uid: this.uid,
            itemId: this.itemId,
            timestamp: this.timestamp,
            gachaType: this.gachaType,
            gachaId: this.gachaId,
            rarity: this.rarity,
            manual: false,
            pity4: this.pity4,
            pity5: this.pity5,
            pullNo: this.pullNo,
            result: this.result,
            anchorItemId: "0",
            sort: 100_000_000 - this.pullNo,
        };
    }
}
