// scripts/release-vesting.js
import hre from "hardhat";

async function main() {
  const VESTING_ADDR = "0xd17d1423DFd6c49932fFB8B5ebb61035BdCC48c6";
  const vesting = await hre.ethers.getContractAt("VestingVaultUpgradeable", VESTING_ADDR);

  console.log("Releasing vested tokens...");
  const tx = await vesting.release();
  await tx.wait();

  console.log("✅ Tokens released!");
}

main();