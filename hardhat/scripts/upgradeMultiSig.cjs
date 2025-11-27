const { ethers, upgrades } = require("hardhat");

async function main() {
  const proxyAddress = "0xa1Bbf04d7ED7a64eE4E4324259AB31E01bEAf0BA"; // քո հին MultiSig-ի proxy հասցեն
  
  console.log("🚀 Starting upgrade for MultiSigTimelock...");
  
  const MultiSigNew = await ethers.getContractFactory("MultiSigTimelockUpgradeable");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, MultiSigNew);
  
  console.log("✅ Upgrade complete!");
  console.log("🆕 Implementation address:", await upgrades.erc1967.getImplementationAddress(upgraded.target));
  console.log("👑 Proxy admin:", await upgrades.erc1967.getAdminAddress(upgraded.target));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
