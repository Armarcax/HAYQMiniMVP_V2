// scripts/create-batch-vesting.js
import hre from "hardhat";

async function main() {
  const VAULT_ADDRESS = process.env.VESTING_VAULT_ADDRESS;
  const RECIPIENTS = (process.env.RECIPIENTS || "").split(",");
  const AMOUNT = hre.ethers.parseUnits(process.env.VESTING_AMOUNT || "100", 18);
  const START = parseInt(process.env.VESTING_START || "0");
  const DURATION = parseInt(process.env.VESTING_DURATION || "3600");

  console.log("🔗 Connecting to vault:", VAULT_ADDRESS);

  const vault = await hre.ethers.getContractAt("VestingVaultUpgradeable", VAULT_ADDRESS);
  const signer = (await hre.ethers.getSigners())[0];
  console.log("🔑 Signer address:", signer.address);

  for (const beneficiary of RECIPIENTS) {
    try {
      // Ստուգում կա արդյոք արդեն vesting
      const existing = await vault.vestings(beneficiary);
      if (existing.amount.gt(0)) {
        console.log(`⚠️ ${beneficiary} already has vesting, skipping...`);
        continue;
      }

      // Նոր vesting ստեղծում
      const tx = await vault.connect(signer).createVesting(beneficiary, AMOUNT, START, DURATION);
      await tx.wait();
      console.log("✅ Vesting created for", beneficiary);
    } catch (err) {
      console.error("❌ Error for", beneficiary, err);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
