// scripts/test-vesting.js
import hre from "hardhat";

async function main() {
  const HAYQ_PROXY = "0xD116d9eFc270Ac44eb63b2eEb0fDCFC450d6Ee1a";
  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ_PROXY);

  await hayq.createTeamVesting(
    "0x928677743439e4dA4108c4025694B2F3d3b2745c",
    hre.ethers.parseUnits("1000", 18),
    Math.floor(Date.now() / 1000) + 60,
    3600
  );
  console.log("✅ Vesting created!");
}

main();