// Upgrade script for MockOracle proxy contract
const { ethers, upgrades } = require("hardhat");

async function main() {
  const proxyAddress = "0x37774e305b298aaA32f5bE84052C5B36F21f5a68";

  console.log(`💼 Upgrading MockOracle at proxy: ${proxyAddress}`);

  // Load the new version of the contract (V2)
  const MockOracleV2 = await ethers.getContractFactory("MockOracleV2");

  // Perform the upgrade
  const upgraded = await upgrades.upgradeProxy(proxyAddress, MockOracleV2);

  console.log(`✅ Upgrade successful!`);
  console.log(`🔗 New implementation deployed at: ${await upgrades.erc1967.getImplementationAddress(proxyAddress)}`);
  console.log(`👑 Admin (proxy owner): ${await upgrades.erc1967.getAdminAddress(proxyAddress)}`);

  // Optional: Check version
  const version = await upgraded.version();
  console.log(`📘 Contract version: ${version}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Upgrade failed:", error);
    process.exit(1);
  });
