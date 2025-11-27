// scripts/create-vesting.js
import hre from "hardhat";

async function main() {
  const HAYQ_PROXY = "0xD116d9eFc270Ac44eb63b2eEb0fDCFC450d6Ee1a";
  const VESTING_ADDR = "0x...";

  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ_PROXY);
  const beneficiary = "0x928677743439e4dA4108c4025694B2F3d3b2745c";
  const amount = hre.ethers.parseUnits("10000", 18);
  const start = Math.floor(Date.now() / 1000) + 60; // 1 րոպե հետո
  const duration = 3600; // 1 ժամ

  await hayq.createTeamVesting(beneficiary, amount, start, duration);
  console.log("✅ Vesting created");
}

main();