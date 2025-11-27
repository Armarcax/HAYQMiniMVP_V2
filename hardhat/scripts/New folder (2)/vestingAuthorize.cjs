// scripts/vestingAuthorize.cjs
require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const proxyAddress = process.env.VESTING_VAULT;
  const beneficiary = process.env.VESTING_BENEFICIARY;
  const vestingAmountRaw = process.env.VESTING_AMOUNT;
  const decimals = parseInt(process.env.DECIMALS || "18");

  if (!proxyAddress || !beneficiary || !vestingAmountRaw) {
    console.error("❌ Please check your .env variables for VESTING_VAULT, VESTING_BENEFICIARY, VESTING_AMOUNT");
    return;
  }

  // Պահում ենք vesting amount-ը BigNumber
  const vestingAmount = ethers.parseUnits(vestingAmountRaw, decimals);

  console.log(`🚀 Proxy Address: ${proxyAddress}`);
  console.log(`💰 Vesting Amount: ${vestingAmount.toString()}`);
  console.log(`👤 Beneficiary: ${beneficiary}`);

  // Signer
  const [signer] = await ethers.getSigners();
  console.log("🔑 Using signer:", await signer.getAddress());

  // Ստանալ vesting contract instance
  const vesting = await ethers.getContractAt("VestingVaultUpgradeable", proxyAddress, signer);

  // Authorize կամ set vesting amount
  const tx = await vesting.setAuthorized(beneficiary, true);
  await tx.wait();
  console.log("✅ Address authorized!");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
