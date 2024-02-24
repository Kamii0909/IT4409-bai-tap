import * as cheerio from "cheerio";
import { translate } from "./dictionary.js";
import { GachaId, UnitCanonicalName, UnitId } from "../Common.js";
import moment from "moment";
import { Banner, Warps } from "./banners.js";

const WIKI_BASE_URI = "https://honkai-star-rail.fandom.com";
const WIKI_CHAR_WARP_LIST = "https://honkai-star-rail.fandom.com/wiki/Character_Event_Warp";
const WIKI_LC_WARP_LIST = "https://honkai-star-rail.fandom.com/wiki/Light_Cone_Event_Warp";

type WikiWarpInfo = {
    href: string;
    index: number;
    start: number; // unix time
};
type Type = "char" | "lc";
async function doFetch(type: Type) {
    const uri = type === "char" ? WIKI_CHAR_WARP_LIST : WIKI_LC_WARP_LIST;
    const $ = cheerio.load(await fetch(uri).then((res) => res.text()));
    let banner = $(".article-table.sortable").children("tbody").children("tr").first();
    const wikis: WikiWarpInfo[] = [];
    while (banner.length > 0) {
        banner = banner.next();
        const startString = banner.children("td").eq(2).text();
        if (startString.trim().length === 0) {
            continue;
        }
        wikis.push({
            href: banner.find("a").attr("href") as string,
            index: wikis.length,
            start: moment(startString, "YYYY-MM-DD hh:mm:ss").unix(),
        });
    }
    if (type === "char") {
        wikis.sort((a, b) => -(a.start - b.start === 0 ? b.index - a.index : b.start - a.start));
    } else {
        wikis.sort((a, b) => -(a.start - b.start === 0 ? a.index - b.index : b.start - a.start));
    }
    return buildWarps(wikis, type);
}

export async function buildWarps(wikiInfo: WikiWarpInfo[], type: Type): Promise<Banner[]> {
    return wikiInfo.reduce<Promise<Banner[]>>(async (prevP, curr, idx) => {
        (await prevP).push({
            id: ((type === "char" ? 2003 : 3003) + idx) as GachaId,
            name: curr.href.substring(6),
            rateup: await getRateup(curr.href),
        });
        return prevP;
    }, Promise.resolve([]));
}

export async function getRateup(href: string): Promise<{ 5: UnitId; 4: UnitId[] }> {
    const $ = cheerio.load(await fetch(WIKI_BASE_URI + href).then((res) => res.text()));
    const uls = $(".mw-parser-output").children("ul");
    const rateup5Name = uls
        .first()
        .find("a")
        .filter((_, ele) => $(ele).text().length > 0)
        .first()
        .text();
    let rateup4 = uls.eq(1).children("li").first();
    const rateup4Names: string[] = [];
    while (rateup4.length > 0) {
        rateup4Names.push(
            rateup4
                .find("a")
                .filter((_, ele) => $(ele).text().trim().length > 0)
                .first()
                .text(),
        );
        rateup4 = rateup4.next();
    }
    return {
        5: translate(rateup5Name as UnitCanonicalName) as UnitId,
        4: rateup4Names.map((name) => translate(name as UnitCanonicalName) as UnitId),
    };
}
export async function fetchFromHsrWiki(): Promise<Warps> {
    return {
        1: [
            {
                id: 1001 as GachaId,
                name: "Stellar Warp",
                rateup: {
                    4: [],
                    5: 0 as UnitId,
                },
            },
        ],
        2: [
            {
                id: 4001 as GachaId,
                name: "Departure Warp",
                rateup: {
                    4: [],
                    5: 0 as UnitId,
                },
            },
        ],
        11: await doFetch("char"),
        12: await doFetch("lc"),
    };
}
