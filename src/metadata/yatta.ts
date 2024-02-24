import { UnitCanonicalName, UnitId } from "../Common.js";
import { Dictionary } from "./dictionary.js";

const YATTA_UPGRADE_URI = "https://api.yatta.top/hsr/v2/en/upgrade";

// types hack, these are incomplete types
type __NameWrapper = { name: UnitCanonicalName };
type __YattaResponse = {
    data: {
        avatar: {
            [key: UnitId]: __NameWrapper;
        };
        equipment: {
            [key: UnitId]: __NameWrapper;
        };
    };
};

export async function fetchFromYatta(): Promise<Dictionary> {
    const res = await fetch(YATTA_UPGRADE_URI);
    const json = await (res.json() as Promise<__YattaResponse>);
    return Object.fromEntries(
        Object.entries(json.data.avatar)
            .flatMap(mapToBidirectionalArray)
            .concat(Object.entries(json.data.equipment).flatMap(mapToBidirectionalArray)),
    );
}

function mapToBidirectionalArray(
    single: [string, __NameWrapper],
): [[UnitId, UnitCanonicalName], [UnitCanonicalName, UnitId]] {
    const id = Number.parseInt(single[0]) as UnitId;
    const name = single[1].name;
    const ret: [[UnitId, UnitCanonicalName], [UnitCanonicalName, UnitId]] = [
        [id, name],
        [name, id],
    ];
    if (name.includes("&")) {
        const altName = name.replaceAll("&", "and") as UnitCanonicalName;
        ret.push([altName, id], [id, altName]);
    }
    return ret;
}
