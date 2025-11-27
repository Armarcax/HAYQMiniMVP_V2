const { ethers, upgrades } = require("hardhat");

async function main() {
  const proxyAddress = "0x45615F3D52262ba7F16d7E0182893492F1752baB"; // օրինակ՝ 0xABC123...
  
  const Vault = await ethers.getContractFactory("VestingVaultUpgradeable");
  console.log("🚀 Upgrading VestingVaultUpgradeable...");
  await upgrades.upgradeProxy(proxyAddress, Vault);
  console.log("✅ Upgrade successful!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
