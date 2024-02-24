import { Rarity } from "../Common.js";
import { SrsGachaItemBuilder } from "./srs/GachaItem.js";

export type Matcher<K> = {
    match(item: K): boolean;
};

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Matchers {
    class RarityMatcher implements Matcher<SrsGachaItemBuilder> {
        constructor(private rarity: Rarity) {}
        match(item: SrsGachaItemBuilder): boolean {
            return item.rarity === this.rarity;
        }
    }

    const rarityMatchers = [new RarityMatcher(3), new RarityMatcher(4), new RarityMatcher(5)];

    export function byRarity(rarity: Rarity): Matcher<SrsGachaItemBuilder> {
        return rarityMatchers[rarity - 3];
    }
}
