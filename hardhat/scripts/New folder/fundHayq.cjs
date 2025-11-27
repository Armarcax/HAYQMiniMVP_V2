// scripts/fundHayq.cjs
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const hayqAddress = process.env.HAYQ_CONTRACT_ADDRESS;
  const recipientsRaw = process.env.RECIPIENTS;
  const amountRaw = process.env.AMOUNT || "1000";
  const decimals = Number(process.env.DECIMALS || 18);

  // Ստուգել HAYQ հասցեն
  if (!hayqAddress || !ethers.isAddress(hayqAddress)) {
    throw new Error("❌ Invalid or missing HAYQ_CONTRACT_ADDRESS in .env");
  }

  // Ստացողների ցուցակ
  if (!recipientsRaw) {
    throw new Error("❌ Missing RECIPIENTS in .env");
  }

  const recipients = recipientsRaw.split(",").map(addr => addr.trim()).filter(addr => addr.length > 0);
  recipients.forEach(addr => {
    if (!ethers.isAddress(addr)) {
      throw new Error(`❌ Invalid recipient address: ${addr}`);
    }
  });

  const [sender] = await ethers.getSigners();
  console.log("📤 Sender:", sender.address);
  console.log("📥 Recipients:", recipients);
  console.log("💰 Amount per recipient:", amountRaw, "HAYQ");

  // Կապվել HAYQ պայմանագրին
  const hayq = await ethers.getContractAt("HAYQ", hayqAddress, sender);

  // Ստուգել հաշվեհամարը
  const senderBalance = await hayq.balanceOf(sender.address);
  const amount = ethers.parseUnits(amountRaw, decimals);
  const totalNeeded = amount * BigInt(recipients.length);

  if (senderBalance < totalNeeded) {
    throw new Error(
      `❌ Not enough HAYQ. Need ${ethers.formatUnits(totalNeeded, decimals)}, have ${ethers.formatUnits(senderBalance, decimals)}`
    );
  }

  // Ուղարկել յուրաքանչյուր ստացողին
  for (const recipient of recipients) {
    console.log(`\n➡️ Sending ${amountRaw} HAYQ to ${recipient}...`);
    const tx = await hayq.transfer(recipient, amount);
    await tx.wait();
    console.log(`✅ Sent to ${recipient}`);
  }

  console.log("\n🎉 All transfers completed successfully!");
}

main().catch((err) => {
  console.error("\n💥 Script failed:", err.message);
  process.exit(1);
});