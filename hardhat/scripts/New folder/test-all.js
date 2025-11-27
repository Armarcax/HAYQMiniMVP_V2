// scripts/test-all.js
import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const HAYQ_PROXY = "0xD116d9eFc270Ac44eb63b2eEb0fDCFC450d6Ee1a";
  const VESTING_ADDR = "0x43867856F8f684a0d04a32e73Af446809C5fb28B"; // Ձեր Vesting հասցեն

  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ_PROXY);
  const vesting = await hre.ethers.getContractAt("VestingVaultUpgradeable", VESTING_ADDR);

  // 1. Stake
  console.log("1. Staking 100 HAYQ...");
  await hayq.stake(hre.ethers.parseUnits("100", 18));
  console.log("✅ Staked");

  // 2. Create Vesting
  console.log("2. Creating vesting for 1000 HAYQ...");
  await hayq.createTeamVesting(deployer.address, hre.ethers.parseUnits("1000", 18), Math.floor(Date.now()/1000)+60, 3600);
  console.log("✅ Vesting created");

  // 3. Buyback (այրում)
  console.log("3. Buyback (burning 10 HAYQ)...");
  await hayq.transfer(HAYQ_PROXY, hre.ethers.parseUnits("10", 18));
  await hayq.buyback(hre.ethers.parseUnits("10", 18), 0);
  console.log("✅ Buyback completed");

  console.log("\n🎉 Բոլոր փորձարկումները հաջողվեցին!");
}

main();