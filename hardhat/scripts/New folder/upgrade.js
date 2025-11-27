// scripts/upgrade.js
import hre from "hardhat";

async function main() {
  const proxyAddress = "0xD116d9eFc270Ac44eb63b2eEb0fDCFC450d6Ee1a";
  const HAYQ = await hre.ethers.getContractFactory("HAYQMiniMVP");
  
  // MockRouter հասցեն (դուք արդեն ունեք)
  const routerAddress = "0xa9667e39B160139E9878Da599819452594938734";

  console.log("Upgrading HAYQ with staking and buyback...");
  await hre.upgrades.upgradeProxy(proxyAddress, HAYQ, [1000000, routerAddress]);

  console.log("✅ HAYQ upgraded successfully!");
  console.log("Proxy address:", proxyAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});