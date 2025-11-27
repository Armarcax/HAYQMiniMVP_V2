// scripts/create-vesting-test.js
import hre from "hardhat";

async function main() {
  const [signer] = await hre.ethers.getSigners();

  // --- Contract addresses ---
  const HAYQ_PROXY = "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83";

  // Connect to HAYQ contract
  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ_PROXY);

  // --- Check owner ---
  const ownerAddress = await hayq.owner();
  console.log("HAYQ owner:", ownerAddress);
  console.log("Script signer:", signer.address);

  if (signer.address.toLowerCase() !== ownerAddress.toLowerCase()) {
    console.error("❌ Script signer is NOT the HAYQ owner. Cannot create vesting.");
    process.exit(1);
  }

  // --- Vesting parameters ---
  const beneficiary = "0x928677743439e4dA4108c4025694B2F3d3b2745c";
  const vestingAmount = hre.ethers.parseUnits("1000", 18); // 1000 HAYQ
  const start = Math.floor(Date.now() / 1000) + 60; // 1 րոպե հետո
  const duration = 3600; // 1 ժամ

  // --- Check owner balance ---
  const ownerBalance = await hayq.balanceOf(signer.address);
  console.log("Owner balance:", hre.ethers.formatUnits(ownerBalance, 18), "HAYQ");

  if (ownerBalance < vestingAmount) {
    const mintAmount = vestingAmount - ownerBalance;
    console.log(`Owner balance too low. Minting ${hre.ethers.formatUnits(mintAmount, 18)} HAYQ...`);
    const txMint = await hayq.mint(signer.address, mintAmount);
    await txMint.wait();
    console.log("✅ Mint completed!");
  } else {
    console.log("✅ Owner balance sufficient for vesting.");
  }

  // --- Create vesting through HAYQ contract ---
  console.log(`Creating vesting for ${beneficiary} through HAYQ contract...`);
  const tx = await hayq.createTeamVesting(beneficiary, vestingAmount, start, duration);
  await tx.wait();
  console.log("✅ Vesting created successfully!");

  console.log("\n--- Vesting Details ---");
  console.log("Beneficiary:", beneficiary);
  console.log("Amount:", hre.ethers.formatUnits(vestingAmount, 18), "HAYQ");
  console.log("Start:", new Date(start * 1000).toLocaleString());
  console.log("Duration:", duration, "seconds (1 hour)");
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
