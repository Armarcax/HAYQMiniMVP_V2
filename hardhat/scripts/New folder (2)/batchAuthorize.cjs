require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  // Proxy contract address
  const proxyAddress = process.env.VESTING_VAULT;
  
  // Recipients
  const recipients = process.env.RECIPIENTS.split(",");

  // Amount per recipient
  const amount = ethers.parseUnits(process.env.VESTING_AMOUNT, parseInt(process.env.DECIMALS || "18"));

  // Owner signer
  const ownerPrivateKey = process.env.PRIVATE_KEY;
  if (!ownerPrivateKey) throw new Error("PRIVATE_KEY not set in .env!");
  const ownerWallet = new ethers.Wallet(ownerPrivateKey, ethers.provider);

  console.log("🔑 Using signer:", ownerWallet.address);
  console.log("🚀 Proxy Address:", proxyAddress);
  console.log("👤 Recipients:", recipients);
  console.log("💰 Vesting Amount per recipient:", amount.toString());

  // Vesting contract instance
  const vesting = await ethers.getContractAt("VestingVaultUpgradeable", proxyAddress, ownerWallet);

  // Authorize each recipient
  for (const r of recipients) {
    console.log(`⏳ Authorizing ${r}...`);
    const tx = await vesting.setAuthorized(r, true);
    await tx.wait();
    console.log(`✅ Authorized ${r}`);
  }

  console.log("🎉 All recipients authorized!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
