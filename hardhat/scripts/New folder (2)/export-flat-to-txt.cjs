// scripts/export-flat-to-txt.cjs
const fs = require("fs");
const path = require("path");

const flatPath = path.join(process.cwd(), "flat", "HAYQMiniMVP_flat.sol");
const outPath = path.join(process.cwd(), "artifacts", "contract_for_etherscan.txt");

const content = fs.readFileSync(flatPath, "utf8");
fs.writeFileSync(outPath, content, "utf8");

console.log(`✅ Exported successfully to: ${outPath}`);
