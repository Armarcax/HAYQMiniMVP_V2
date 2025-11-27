// scripts/upgrade-hayq-transparent.cjs
require('dotenv').config();
const { ethers, upgrades } = require("hardhat");

async function main() {
  const proxyAddress = process.env.HAYQ_PROXY_ADDRESS;
  if (!proxyAddress) throw new Error("Please set HAYQ_PROXY_ADDRESS in .env");

  console.log("🚀 Upgrading Transparent Proxy at:", proxyAddress);

  const HAYQMiniMVP = await ethers.getContractFactory("HAYQMiniMVP");

  // Transparent proxy upgrade (default kind for upgradeProxy is transparent)
  const upgraded = await upgrades.upgradeProxy(proxyAddress, HAYQMiniMVP);

  console.log("✅ Upgrade complete!");
  console.log("🔗 Proxy address (unchanged):", upgraded.address);
  const implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("🆕 New implementation:", implAddress);
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
