This is a workaround to convert UIGF/SRGF format to something Star Rail Station understands. This is just a minimal version, not a consumer-friendly application. Expect something easier to use from SRS, not me.

Reverse: Not implemented, but it is possible.

A fair amount of warp tracking solution for Genshin/HSR adopts UIGF/SRGF format. If you are here to import from **[biuuu/star-rail-warp-export](https://github.com/biuuu/star-rail-warp-export)** to Star Rail Station, you are good to go. But other SRGF-compliant application works too.

# Instruction

1. Requirements: Node 18+ (prefer 21).
1. Clone this repository (you can download the whole as zip).
1. Create a file named `uigf.json` contains the JSON export of star-rail-warp-export (or any other SRGF compliant tool) in this directory (same folder with this file).
1. Open a command line
1. Run `npm i`
1. Run `npx tsx src/main.ts`
    - You can instead run `npx tsx src/main.ts -X` (with `-X` flag) to get the uncompressed SRS compatible JSON
1. Copy the whole content from `compressed` (crtl A, crtl C) into Star Rail Station localStorage:
    - Open `starrailstation.com` on your browser.
    - F12
    - Go to tab `Application` (if you don't find it, try to find it from the `+` button)
    - Under `Storage` category, find `Local Storage`
    - Open `https://starrailstation.com`, which should be the only key in that directory. 
    - Find the key `db_v2` (you can filter it), left click and edit (you probably should backup the value, in the case this fucks up).
    - Delete the value (you can double click/crtl A then delete) and replace it with the copied value from `compressed` 
    
