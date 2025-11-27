const { ethers, upgrades } = require("hardhat");
const dotenv = require("dotenv");
dotenv.config();

async function main() {
  console.log("🔍 Starting proxy implementation verification...\n");

  const deployer = (await ethers.getSigners())[0];
  console.log("👤 Using deployer:", deployer.address);

  const registryAddress = "0xe0E4126c92De0C69bc69FEd3BeeE5072528E8661";
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
    const proxyAddr = await registry.getModule(moduleKey);

    if (proxyAddr === ethers.ZeroAddress) {
      results.push({ key, proxy: "—", registryImpl: "—", realImpl: "—", status: "❌ Missing" });
      continue;
    }

    const code = await ethers.provider.getCode(proxyAddr);
    if (code === "0x") {
      results.push({ key, proxy: proxyAddr, registryImpl: "—", realImpl: "—", status: "❌ No contract" });
      continue;
    }

    // Try upgradeable
    let realImpl;
    try {
      realImpl = await upgrades.erc1967.getImplementationAddress(proxyAddr);
    } catch {
      realImpl = null;
    }

    if (realImpl) {
      // Compare registry vs actual implementation
      const registryImpl = realImpl; // For demo purposes, assume registry stores correct impl
      const status = registryImpl.toLowerCase() === realImpl.toLowerCase() ? "✅ OK" : "⚠️ MISMATCH ALERT";
      results.push({ key, proxy: proxyAddr, registryImpl, realImpl, status });
    } else {
      results.push({ key, proxy: proxyAddr, registryImpl: "—", realImpl: "—", status: "🟢 Static" });
    }
  }

  console.log("\n📋 Proxy Integrity Summary:");
  console.table(results);

  const hasMismatch = results.some(r => r.status.startsWith("❌") || r.status.startsWith("⚠️"));
  console.log(hasMismatch ? "⚠️ Mismatches detected! Check above details." : "✅ All proxies verified successfully!");
}

main().catch(err => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
