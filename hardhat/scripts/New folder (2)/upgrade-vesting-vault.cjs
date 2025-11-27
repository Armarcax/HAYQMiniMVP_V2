const { ethers, upgrades } = require("hardhat");

async function main() {
  const newVaultFactory = await ethers.getContractFactory("VestingVaultUpgradeable");

  console.log("🚀 Upgrading VestingVault implementation...");

  const proxyAddress = "0x45615F3D52262ba7F16d7E0182893492F1752baB"; // քո VestingVault proxy-ի հասցեն
  const upgraded = await upgrades.upgradeProxy(proxyAddress, newVaultFactory);

  console.log("✅ VestingVault upgraded successfully!");
  console.log("New implementation at:", await upgrades.erc1967.getImplementationAddress(proxyAddress));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
