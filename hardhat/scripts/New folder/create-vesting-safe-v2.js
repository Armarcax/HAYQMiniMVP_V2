// scripts/create-vesting-safe-v2.js
import hre from "hardhat";

async function main() {
  const [owner] = await hre.ethers.getSigners();

  // --- Contract addresses ---
  const HAYQ_PROXY = "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83";
  const VESTING_ADDR = "0x742FDc94fD2B690415eD33E4f23222E85e775b35";

  // Connect to HAYQ contract
  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ_PROXY);
  const vestingVault = await hre.ethers.getContractAt("VestingVaultUpgradeable", VESTING_ADDR);

  // --- Ensure vestingVault is linked ---
  const currentVault = await hayq.vestingVault();
  if (currentVault.toLowerCase() !== VESTING_ADDR.toLowerCase()) {
    console.log("Linking VestingVault...");
    const txVault = await hayq.setVestingVault(VESTING_ADDR);
    await txVault.wait();
    console.log("✅ VestingVault linked!");
  } else {
    console.log("VestingVault already linked.");
  }

  // --- Vesting parameters ---
  const beneficiary = "0x928677743439e4dA4108c4025694B2F3d3b2745c";
  const vestingAmount = hre.ethers.parseUnits("1000", 18); // bigint
  const start = Math.floor(Date.now() / 1000) + 60; // 1 րոպե հետո
  const duration = 3600; // 1 ժամ

  // --- Mint directly to VestingVault ---
  const vaultBalance = await hayq.balanceOf(VESTING_ADDR);
  if (vaultBalance < vestingAmount) {
    const mintAmount = vestingAmount - vaultBalance;
    console.log(`VestingVault balance too low. Minting ${hre.ethers.formatUnits(mintAmount, 18)} HAYQ to vault...`);
    const txMint = await hayq.mint(VESTING_ADDR, mintAmount);
    await txMint.wait();
    console.log("✅ Mint to vault completed!");
  } else {
    console.log("VestingVault balance sufficient:", hre.ethers.formatUnits(vaultBalance, 18), "HAYQ");
  }

  // --- Create vesting directly from vault ---
  console.log(`Creating vesting for ${beneficiary}...`);
  const tx = await vestingVault.createVesting(beneficiary, vestingAmount, start, duration);
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
