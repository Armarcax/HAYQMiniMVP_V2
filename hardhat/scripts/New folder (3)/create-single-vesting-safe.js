// scripts/create-single-vesting-safe.js
import hre from "hardhat";

async function main() {
  const VAULT_ADDRESS = process.env.VESTING_VAULT_ADDRESS;
  const BENEFICIARY = process.env.VESTING_BENEFICIARY;
  const AMOUNT = hre.ethers.parseUnits(process.env.VESTING_AMOUNT || "100", 18);
  const START = parseInt(process.env.VESTING_START || "0");
  const DURATION = parseInt(process.env.VESTING_DURATION || "3600");

  console.log("🔗 Connecting to vault:", VAULT_ADDRESS);

  const vault = await hre.ethers.getContractAt("VestingVaultUpgradeable", VAULT_ADDRESS);

  // Ստուգում, եթե արդեն vesting գոյություն ունի
  try {
    const existing = await vault.vestings(BENEFICIARY);

    if (existing.amount.gt(0)) {
      console.log(`⚠️ Already vested for ${BENEFICIARY}: amount = ${existing.amount}`);
      return;
    }
  } catch (err) {
    console.log("ℹ️ Vesting not found, will create new one...");
  }

  // Ստեղծում նոր vesting
  const signer = (await hre.ethers.getSigners())[0];
  console.log("🔑 Signer address:", signer.address);
  console.log("👤 Creating vesting for:", BENEFICIARY);
  console.log("💰 Amount:", AMOUNT.toString());
  console.log("⏱ Start:", START, ", Duration:", DURATION, "seconds");

  const tx = await vault.connect(signer).createVesting(BENEFICIARY, AMOUNT, START, DURATION);
  await tx.wait();

  console.log("✅ Vesting successfully created!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
