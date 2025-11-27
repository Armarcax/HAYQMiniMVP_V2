require("dotenv").config();
const { ethers, upgrades } = require("hardhat");

async function main() {
  const proxyAddress = process.env.VESTING_VAULT;
  if (!proxyAddress) {
    console.error("⚠️ VESTING_VAULT not set in .env");
    return;
  }

  console.log("🔧 Preparing upgrade for proxy:", proxyAddress);

  // Ստեղծում ենք contract factory-ն
  const VestingVault = await ethers.getContractFactory("VestingVaultUpgradeable");

  // Upgrade Proxy
  const upgraded = await upgrades.upgradeProxy(proxyAddress, VestingVault);

  console.log("🚀 Proxy upgrade completed!");

  // Ստանում ենք նոր implementation address
  const implementation = await upgrades.erc1967.getImplementationAddress(upgraded.address);
  console.log("🏗️ New Implementation Address:", implementation);

  // Ստանում ենք Proxy Admin address
  const proxyAdmin = await upgrades.erc1967.getAdminAddress(upgraded.address);
  console.log("👑 Proxy Admin Address:", proxyAdmin);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });
