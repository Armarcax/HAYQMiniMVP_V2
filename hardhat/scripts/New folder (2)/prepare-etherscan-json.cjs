// scripts/prepare-etherscan-json.cjs
const fs = require("fs");
const path = require("path");

// Ստորև փոխիր անունը՝ ըստ ֆայլի իրական գտնվելու վայրը
const flatFilePath = path.join(__dirname, "../flat/HAYQMiniMVP_flat.sol");
const outputPath = path.join(__dirname, "../artifacts/etherscan_contract_source.json");

// Compiler settings
const compilerVersion = "v0.8.29+commit.ab55807c"; // Օգտագործիր ճիշտ compiler version-ը
const optimizer = { enabled: true, runs: 200 };

// Ստեղծել JSON-ի շաբլոն
async function main() {
  if (!fs.existsSync(flatFilePath)) {
    console.error("❌ Flattened file not found at", flatFilePath);
    process.exit(1);
  }

  const sourceCode = fs.readFileSync(flatFilePath, "utf8");

  // Այստեղ կարող ես ավելացնել constructor arguments եթե պետք լինի
  const constructorArgs = [];

  const etherscanJson = {
    description: "Flattened Solidity source code for Etherscan verification",
    timestamp: new Date().toISOString(),
    contractFile: path.basename(flatFilePath),
    compilerVersion,
    optimizer,
    sourceCode,
    constructorArguments: constructorArgs,
  };

  fs.writeFileSync(outputPath, JSON.stringify(etherscanJson, null, 2));
  console.log("✅ Flattened source exported successfully!");
  console.log("📁 Saved at:", outputPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
