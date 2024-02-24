import fs from "fs/promises";
import lzstring from "lz-string";
import { toSrs } from "./Converter.js";
import { UigfWarpJson } from "./Uigf.js";

async function main() {
    const fh = await fs.open("./uigf.json");
    const srs = await fh
        .readFile()
        .then((buf) => JSON.parse(buf.toString()))
        .then((uigf) => toSrs((uigf as UigfWarpJson).list));
    fh.close();
    const json = JSON.stringify(srs);
    fs.writeFile("./compressed.txt", lzstring.compressToUTF16(json)).then((_) =>
        console.log(`Copy from generated file "compressed" to the "db_v2" key in your StarRailStation localStorage`),
    );
    const args = process.argv.slice(2);
    if (args.find((val) => val === "-X") !== undefined) {
        fs.writeFile("./new_srs.json", json)
            .then((_) => console.log("Written precompressed to srs.json!"))
            .catch((err) => console.error(err));
    }
}

main();
