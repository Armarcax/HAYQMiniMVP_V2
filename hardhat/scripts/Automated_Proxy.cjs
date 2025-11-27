const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

// Կատարել registry-ից expected implementations import
// Եթե չես պահում registry-ում, կարող ես այս json ֆայլը թարմացնել deploy-ից հետո
const expectedImpls = require("../expectedImpls.json");

async function main() {
  console.log("🔍 Starting automated proxy mismatch check...\n");

  const deployer = (await ethers.getSigners())[0];
  console.log("👤 Using deployer:", deployer.address);

  const registryAddress = "0xe0E4126c92De0C69bc69FEd3BeeE5072528E8661";
  const Registry = await ethers.getContractFactory("RegistryUpgradeable");
  const registry = Registry.attach(registryAddress);

  const keys = Object.keys(expectedImpls); // e.g., { "HAYQ_TOKEN": "0xabc...", ... }

  const results = [];

  for (const key of keys) {
    const expectedImpl = expectedImpls[key];
    const moduleKey = ethers.keccak256(ethers.toUtf8Bytes(key));
    const proxyAddr = await registry.getModule(moduleKey);

    if (proxyAddr === ethers.ZeroAddress) {
      results.push({ key, proxy: "—", expectedImpl, realImpl: "—", status: "❌ Missing" });
      continue;
    }

    const code = await ethers.provider.getCode(proxyAddr);
    if (code === "0x") {
      results.push({ key, proxy: proxyAddr, expectedImpl, realImpl: "—", status: "❌ No contract" });
      continue;
    }

    let realImpl;
    try {
      realImpl = await upgrades.erc1967.getImplementationAddress(proxyAddr);
    } catch {
      realImpl = null;
    }

    let status;
    if (realImpl && realImpl.toLowerCase() !== expectedImpl.toLowerCase()) {
      status = "⚠️ MISMATCH ALERT";
    } else if (realImpl) {
      status = "✅ OK";
    } else {
      status = "🟢 Static / Not Upgradeable";
    }

    results.push({ key, proxy: proxyAddr, expectedImpl, realImpl, status });

    if (status === "⚠️ MISMATCH ALERT") {
      console.log(`⚠️ MISMATCH ALERT: ${key}`);
      console.log(`   ↪ Proxy: ${proxyAddr}`);
      console.log(`   ↪ Expected Impl: ${expectedImpl}`);
      console.log(`   ↪ Real Impl:     ${realImpl}\n`);
    }
  }

  console.log("\n📋 Proxy Mismatch Summary:");
  console.table(results);

  const hasMismatch = results.some(r => r.status.startsWith("⚠️") || r.status.startsWith("❌"));
  console.log(hasMismatch ? "⚠️ Some proxies have mismatches! Check details above." : "✅ All proxies match expected implementations!");
}

main().catch(err => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
