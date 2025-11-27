// scripts/deploy-vesting.js
import hre from "hardhat";

async function main() {
  const HAYQ_PROXY = "0xD116d9eFc270Ac44eb63b2eEb0fDCFC450d6Ee1a";
  const Vesting = await hre.ethers.getContractFactory("VestingVaultUpgradeable");
  const vesting = await hre.upgrades.deployProxy(Vesting, [HAYQ_PROXY, HAYQ_PROXY], { initializer: 'initialize' });
  await vesting.waitForDeployment();
  console.log("VestingVault deployed to:", await vesting.getAddress());
}

main();