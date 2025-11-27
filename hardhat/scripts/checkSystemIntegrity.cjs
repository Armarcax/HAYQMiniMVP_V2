// scripts/checkSystemIntegrity.cjs
const { ethers, upgrades } = require("hardhat");
const dotenv = require("dotenv");
dotenv.config();

async function main() {
  console.log("🔍 Starting full system integrity check...\n");

  const deployer = (await ethers.getSigners())[0];
  console.log("👤 Using deployer:", deployer.address);

  const registryAddress = "0xe0E4126c92De0C69bc69FEd3BeeE5072528E8661"; // Registry proxy address
  const Registry = await ethers.getContractFactory("RegistryUpgradeable");
  const registry = Registry.attach(registryAddress);

  const keys = [
    "HAYQ_TOKEN",
    "VESTING_VAULT",
    "STAKING",
    "DIVIDEND_TRACKER",
    "MOCK_ORACLE",
    "MULTISIG",
    "MOCK_ROUTER",
    "MOCK_ERC20"
  ];

  const results = [];

  for (const key of keys) {
    const moduleKey = ethers.keccak256(ethers.toUtf8Bytes(key));
    const addr = await registry.getModule(moduleKey);

    if (addr === ethers.ZeroAddress) {
      console.log(`⚠️  ${key} → Not registered`);
      results.push({ key, address: "—", status: "❌ Missing" });
      continue;
    }

    const code = await ethers.provider.getCode(addr);
    if (code === "0x") {
      console.log(`⚠️  ${key} → No contract deployed at ${addr}`);
      results.push({ key, address: addr, status: "❌ No contract" });
      continue;
    }

    let impl;
    let isUpgradeable = false;
    try {
      impl = await upgrades.erc1967.getImplementationAddress(addr);
      if (impl && impl !== ethers.ZeroAddress) isUpgradeable = true;
    } catch {
      impl = null;
    }

    if (isUpgradeable) {
      console.log(`✅ ${key} (Upgradeable)\n   ↪ Proxy: ${addr}\n   ↪ Impl:  ${impl}`);
      results.push({ key, address: addr, impl, status: "✅ Upgradeable" });
    } else {
      console.log(`🟢 ${key} (Static)\n   ↪ Address: ${addr}`);
      results.push({ key, address: addr, status: "🟢 Static" });
    }
  }

  console.log("\n📋 Registry Integrity Summary:");
  console.table(results);

  const hasMismatch = results.some(r => r.status.startsWith("❌"));
  if (!hasMismatch) {
    console.log("✅ All modules verified and linked successfully!");
  } else {
    console.log("⚠️ Mismatches found! Check details above.");
  }

  console.log("✨ System scan complete!");
}

main().catch((err) => {
  console.error("❌ Integrity check failed:", err);
  process.exit(1);
});
