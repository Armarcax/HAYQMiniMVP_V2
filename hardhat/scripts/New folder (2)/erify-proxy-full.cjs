// verify-proxy-full.cjs (CommonJS)
const { ethers, upgrades, run } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const proxyAddress = "0x45615F3D52262ba7F16d7E0182893492F1752baB";
  const implAddress = "0xd60CE25b670Dc7CA810497A0Ff7f2C0140aBD5c9";

  const flatFilePath = path.join(__dirname, "../flat/HAYQMiniMVP_flat.sol");
  if (!fs.existsSync(flatFilePath)) {
    console.error("Flattened file not found:", flatFilePath);
    return;
  }

  const sourceCode = fs.readFileSync(flatFilePath, "utf8");

  // Implementation verification
  console.log("🔍 Verifying implementation...");
  await run("verify:verify", {
    address: implAddress,
    contract: "flat/HAYQMiniMVP_flat.sol:HAYQMiniMVP",
    constructorArguments: [],
  });

  // Proxy verification
  console.log("🔗 Verifying proxy...");
  await run("verify:verify", {
    address: proxyAddress,
    constructorArguments: [implAddress, "0x0000000000000000000000000000000000000000"],
  });

  console.log("🎉 Verification finished!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
