// scripts/check-vesting.js
import hre from "hardhat";

async function main() {
  const VESTING_PROXY = "0xd17d1423DFd6c49932fFB8B5ebb61035BdCC48c6";
  const ACCOUNT = "0x928677743439e4dA4108c4025694B2F3d3b2745c";

  const vesting = await hre.ethers.getContractAt("VestingVaultUpgradeable", VESTING_PROXY);
  const schedule = await vesting.vestings(ACCOUNT);

  console.log("=== Vesting Schedule ===");
  console.log("Total Amount:", hre.ethers.formatUnits(schedule.totalAmount, 18), "HAYQ");
  console.log("Released:", hre.ethers.formatUnits(schedule.released, 18), "HAYQ");
  console.log("Start:", new Date(Number(schedule.start) * 1000).toLocaleString());
  console.log("Duration:", schedule.duration, "seconds");
}

main();