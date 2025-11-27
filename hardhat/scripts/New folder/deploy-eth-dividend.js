// scripts/deploy-eth-dividend.js
import hre from "hardhat";

async function main() {
  const HAYQ_PROXY = "0xD116d9eFc270Ac44eb63b2eEb0fDCFC450d6Ee1a";
  const Dividend = await hre.ethers.getContractFactory("EthDividendTrackerUpgradeable");
  const dividend = await hre.upgrades.deployProxy(Dividend, [HAYQ_PROXY], { initializer: 'initialize' });
  await dividend.waitForDeployment();
  console.log("EthDividendTracker deployed to:", await dividend.getAddress());
}

main();