import { existsSync, readFileSync, writeFileSync } from "fs";
import { UnitCanonicalName, UnitId } from "../Common.js";
import { DICTIONARY_FILE as DICTIONARY_FILE } from "./path.js";
import { CacheableJsonResource, UpdateOptions } from "./resources.js";
import { fetchFromYatta } from "./yatta.js";

export type Dictionary = {
    [key: UnitCanonicalName]: UnitId;
    [key: UnitId]: UnitCanonicalName;
};
export class Translator extends CacheableJsonResource<Dictionary> {
    override fromNetwork(): Promise<Dictionary> {
        return fetchFromYatta();
    }
    private constructor(path: string) {
        super(path);
    }

    static async create(path: string = DICTIONARY_FILE) {
        const ret = new Translator(path);
        await ret.load();
        return ret;
    }
    translate(arg: UnitId | UnitCanonicalName) {
        const val = this.resource[arg];
        if (val === undefined) {
            throw new Error(`Unknown value ${arg}`);
        }
        return val;
    }
}

const singleton: Translator = await Translator.create();

export function translate(arg: UnitId | UnitCanonicalName): UnitId | UnitCanonicalName {
    return singleton.translate(arg);
}
