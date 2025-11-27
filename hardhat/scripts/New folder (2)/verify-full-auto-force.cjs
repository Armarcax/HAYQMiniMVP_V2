// scripts/verify-full-auto-force.cjs
const fs = require("fs");
const path = require("path");
const { run } = require("hardhat");

async function main() {
  const flatFilePath = path.join(__dirname, "../flat/HAYQMiniMVP_flat.sol");
  const constructorArgsPath = path.join(__dirname, "../artifacts/constructor_args.json");

  if (!fs.existsSync(flatFilePath)) {
    throw new Error(`Flattened file not found: ${flatFilePath}`);
  }

  const implementationAddress = process.env.IMPLEMENTATION_ADDRESS;
  const proxyAddress = process.env.PROXY_ADDRESS;
  const proxyAdminAddress = process.env.PROXY_ADMIN_ADDRESS;

  if (!implementationAddress || !proxyAddress || !proxyAdminAddress) {
    throw new Error("Please set IMPLEMENTATION_ADDRESS, PROXY_ADDRESS and PROXY_ADMIN_ADDRESS in your .env file");
  }

  console.log("📄 Flattened file found:", flatFilePath);

  // 1️⃣ Implementation Verification
  console.log("🔍 Verifying Implementation on Etherscan...");
  try {
    await run("verify:verify", {
      address: implementationAddress,
      contract: "flat/HAYQMiniMVP_flat.sol:HAYQMiniMVP",
      constructorArguments: fs.existsSync(constructorArgsPath)
        ? require(constructorArgsPath)
        : [],
      force: true
    });
    console.log("✅ Implementation verified!");
  } catch (err) {
    console.warn("⚠️ Implementation verification warning:", err.message);
  }

  // 2️⃣ Proxy Verification / Linking
  console.log("🔗 Verifying Proxy and Linking...");
  try {
    await run("verify:verify", {
      address: proxyAddress,
      contract: "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy",
      constructorArguments: [implementationAddress, proxyAdminAddress, "0x"],
      force: true
    });
    console.log("✅ Proxy verified and linked!");
  } catch (err) {
    console.warn("⚠️ Proxy verification warning:", err.message);
  }

  // 3️⃣ ProxyAdmin Verification
  console.log("👑 Verifying ProxyAdmin...");
  try {
    await run("verify:verify", {
      address: proxyAdminAddress,
      contract: "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol:ProxyAdmin",
      force: true
    });
    console.log("✅ ProxyAdmin verified!");
  } catch (err) {
    console.warn("⚠️ ProxyAdmin verification warning:", err.message);
  }

  console.log("🎉 Verification process finished!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
