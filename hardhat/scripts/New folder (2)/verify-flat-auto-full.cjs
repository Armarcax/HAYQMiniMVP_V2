// scripts/verify-flat-auto-full.cjs
const fs = require("fs");
const path = require("path");
const { run } = require("hardhat");

const flatFilePath = path.join(__dirname, "../flat/HAYQMiniMVP_flat.sol");
const constructorArgsPath = path.join(__dirname, "../artifacts/constructor_args.json");

const implementationAddress = "0x56E6Dc2f7a33fEFf3C537aa32cb70D5a0809a136"; // Փոխիր իրական implementation
const proxyAddress = "0x45615F3D52262ba7F16d7E0182893492F1752baB"; // Փոխիր իրական proxy
const proxyAdminAddress = "0x06880e4f9CE818317E67a1c786c554e7dC55ab2d"; // Փոխիր իրական proxy admin

async function main() {
  // --- 1. Flattened source check ---
  if (!fs.existsSync(flatFilePath)) {
    console.error("❌ Flattened file not found at", flatFilePath);
    process.exit(1);
  }

  const sourceCode = fs.readFileSync(flatFilePath, "utf8");

  // --- 2. Constructor arguments ---
  let constructorArgs = [];
  if (fs.existsSync(constructorArgsPath)) {
    const json = JSON.parse(fs.readFileSync(constructorArgsPath, "utf8"));
    constructorArgs = json.constructorArguments || [];
  }

  console.log("🔍 Verifying implementation on Etherscan...");
  try {
    await run("verify:verify", {
      address: implementationAddress,
      contract: "flat/HAYQMiniMVP_flat.sol:HAYQMiniMVP",
      constructorArguments: constructorArgs,
    });
    console.log("✅ Implementation verified!");
  } catch (e) {
    console.warn("⚠️ Implementation verification warning:", e.message);
  }

  // --- 3. Link proxy to implementation ---
  console.log("🔗 Verifying and linking proxy...");
  try {
    await run("verify:verify", {
      address: proxyAddress,
      contract: "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy",
      constructorArguments: constructorArgs,
    });
    console.log("✅ Proxy verified and linked!");
  } catch (e) {
    console.warn("⚠️ Proxy verification warning:", e.message);
  }

  // --- 4. Verify ProxyAdmin ---
  console.log("👑 Verifying ProxyAdmin...");
  try {
    await run("verify:verify", {
      address: proxyAdminAddress,
      contract: "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol:ProxyAdmin",
    });
    console.log("✅ ProxyAdmin verified!");
  } catch (e) {
    console.warn("⚠️ ProxyAdmin verification warning:", e.message);
  }

  console.log("🎉 Verification process finished!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
