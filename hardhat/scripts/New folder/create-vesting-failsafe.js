// scripts/create-vesting-failsafe.js
import hre from "hardhat";

async function main() {
  const [owner] = await hre.ethers.getSigners();

  // --- Contract addresses ---
  const HAYQ_PROXY = "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83";

  // Connect to HAYQ contract
  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ_PROXY);

  // --- Vesting parameters ---
  const beneficiary = "0x928677743439e4dA4108c4025694B2F3d3b2745c";
  const vestingAmount = hre.ethers.parseUnits("1000", 18); // 1000 HAYQ
  const start = Math.floor(Date.now() / 1000) + 60; // 1 րոպե հետո
  const duration = 3600; // 1 ժամ

  // --- Ensure owner has enough balance ---
  const ownerBalance = await hayq.balanceOf(owner.address);
  if (ownerBalance < vestingAmount) {
    const mintAmount = vestingAmount - ownerBalance;
    console.log(`Owner balance too low. Minting ${hre.ethers.formatUnits(mintAmount, 18)} HAYQ...`);
    const txMint = await hayq.mint(owner.address, mintAmount);
    await txMint.wait();
    console.log("✅ Mint completed!");
  } else {
    console.log("Owner balance sufficient:", hre.ethers.formatUnits(ownerBalance, 18), "HAYQ");
  }

  // --- Create vesting through HAYQ contract ---
  console.log(`Creating vesting for ${beneficiary} through HAYQ contract...`);
  const tx = await hayq.createTeamVesting(beneficiary, vestingAmount, start, duration);
  await tx.wait();

  console.log("✅ Vesting created successfully!");
  console.log(`Beneficiary: ${beneficiary}`);
  console.log(`Amount: 1000 HAYQ`);
  console.log(`Start: ${new Date(start * 1000).toLocaleString()}`);
  console.log(`Duration: 1 hour`);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
