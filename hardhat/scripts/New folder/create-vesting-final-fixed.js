// scripts/create-vesting-final-fixed.js
import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  const [signer] = await hre.ethers.getSigners();

  const HAYQ_PROXY = "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83";
  const VESTING_VAULT = "0x742FDc94fD2B690415eD33E4f23222E85e775b35";
  const BENEFICIARY = "0x928677743439e4dA4108c4025694B2F3d3b2745c";

  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ_PROXY);

  // Amount in smallest unit (wei)
  const vestingAmount = ethers.parseUnits("1000", 18); // 1000 HAYQ
  const start = Math.floor(Date.now() / 1000) + 60; // 1 րոպե հետո
  const duration = 3600; // 1 ժամ

  // Owner balance check
  const ownerBalance = await hayq.balanceOf(signer.address);
  console.log("HAYQ owner:", signer.address);
  console.log("Owner balance:", ethers.formatUnits(ownerBalance, 18), "HAYQ");

  if (ownerBalance < vestingAmount) { // ✅ այստեղ string-ի փոխարեն օգտագործում ենք BigNumber comparison
    throw new Error("Owner does not have enough HAYQ for vesting");
  }

  // VestingVault balance check
  let vaultBalance = await hayq.balanceOf(VESTING_VAULT);
  console.log("VestingVault balance:", ethers.formatUnits(vaultBalance, 18), "HAYQ");

  if (vaultBalance < vestingAmount) {
    const transferAmount = vestingAmount - vaultBalance;
    console.log(`Vault balance too low. Transferring ${ethers.formatUnits(transferAmount, 18)} HAYQ from owner...`);
    const tx = await hayq.transfer(VESTING_VAULT, transferAmount);
    await tx.wait();
    console.log("✅ Transfer to vault completed!");
  }

  console.log(`Creating vesting for ${BENEFICIARY}...`);
  const txVesting = await hayq.createTeamVesting(BENEFICIARY, vestingAmount, start, duration);
  await txVesting.wait();
  console.log("✅ Vesting created successfully!");
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
