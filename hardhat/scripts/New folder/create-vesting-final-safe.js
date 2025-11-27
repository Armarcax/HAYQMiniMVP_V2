// scripts/create-vesting-final-safe-fixed.js
import hre from "hardhat";

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const HAYQ_PROXY = "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83";
  const BENEFICIARY = "0x928677743439e4dA4108c4025694B2F3d3b2745c";
  const VESTING_AMOUNT = hre.ethers.parseUnits("1000", 18); // 1000 HAYQ
  const VESTING_START = Math.floor(Date.now() / 1000) + 60;
  const VESTING_DURATION = 3600; // 1 ժամ

  console.log("Contract owner:", signer.address);

  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ_PROXY);

  // Owner balance
  let ownerBalance = await hayq.balanceOf(signer.address);
  ownerBalance = hre.ethers.BigNumber.from(ownerBalance); // այստեղ ստանդարտ BigNumber դարձնում
  console.log("Owner balance:", hre.ethers.formatUnits(ownerBalance, 18));

  if (ownerBalance.lt(VESTING_AMOUNT)) {
    throw new Error("Owner does not have enough HAYQ for vesting");
  }

  // VestingVault
  const vestingVault = await hayq.vestingVault();
  if (!vestingVault || vestingVault === hre.ethers.ZeroAddress || vestingVault === "0x0000000000000000000000000000000000000000") {
    throw new Error("VestingVault not set in HAYQ contract");
  }

  // Vault balance
  let vaultBalance = await hayq.balanceOf(vestingVault);
  vaultBalance = hre.ethers.BigNumber.from(vaultBalance); // BigNumber դարձնում
  console.log("VestingVault balance:", hre.ethers.formatUnits(vaultBalance, 18));

  if (vaultBalance.lt(VESTING_AMOUNT)) {
    console.log("Vault balance too low. Transferring from owner...");
    const tx = await hayq.transfer(vestingVault, VESTING_AMOUNT);
    await tx.wait();
    console.log("✅ Transferred to Vault");
  }

  // Create vesting
  console.log("Creating vesting for", BENEFICIARY, "...");
  const txVesting = await hayq.createTeamVesting(BENEFICIARY, VESTING_AMOUNT, VESTING_START, VESTING_DURATION);
  await txVesting.wait();
  console.log("✅ Vesting successfully created!");
}

main().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});
