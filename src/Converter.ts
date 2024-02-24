import { SrsWarpJson } from "./StarRailStation.js";
import { UigfGachaItem } from "./Uigf.js";
import { SrsGachaItemBuilder } from "./aggregator/srs/GachaItem.js";
import { SrsAggregator } from "./aggregator/srs/SrsAggregator.js";

export function toSrs(uigfItems: UigfGachaItem[]): SrsWarpJson {
    const gatherer = new SrsAggregator();
    const srsItems = uigfItems.map(mapFromUigfToSrs).sort((a, b) => a.timestamp - b.timestamp);
    gatherer.aggregateAll(srsItems);
    return gatherer.build();
}

function mapFromUigfToSrs(uigf: UigfGachaItem): SrsGachaItemBuilder {
    return new SrsGachaItemBuilder(uigf);
}
