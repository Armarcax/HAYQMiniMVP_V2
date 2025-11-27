import fs from "fs";
import path from "path";

const src = path.resolve("./artifacts/contracts/HAYQ.sol/HAYQ.json");
const destDir = path.resolve("../react-dapp/src/abis");
const dest = path.join(destDir, "HAYQ.json");

// Ստուգենք, թե target folder գոյություն ունի
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(src, dest);
console.log(`✅ ABI copied to React at ${dest}`);
