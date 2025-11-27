// scripts/export-flat-to-json.cjs
const fs = require("fs");
const path = require("path");

const flatPath = path.resolve("flat/HAYQMiniMVP_flat.sol");
const outputPath = path.resolve("artifacts/etherscan_contract_source.json");

async function main() {
  if (!fs.existsSync(flatPath)) {
    console.error(`❌ Flat file not found at: ${flatPath}`);
    process.exit(1);
  }

  console.log(`📄 Reading flat file: ${flatPath}`);
  const source = fs.readFileSync(flatPath, "utf8");

  const outputData = {
    description: "Flattened Solidity source code for Etherscan verification",
    timestamp: new Date().toISOString(),
    contractFile: "HAYQMiniMVP_flat.sol",
    compilerVersion: "v0.8.29+commit.tbd", // թարմացրու ըստ քո compile-ի
    optimizer: { enabled: true, runs: 200 },
    sourceCode: source,
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

  console.log(`✅ Flattened source exported successfully!`);
  console.log(`📁 Saved at: ${outputPath}`);
}

main().catch((err) => {
  console.error("🔥 Error exporting flat source:", err);
  process.exit(1);
});
