// scripts/vesting-utils-safe.js
import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  // Provider + signer
  const provider = new hre.ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const signer = new hre.ethers.Wallet(process.env.OWNER_PRIVATE_KEY, provider);

  // Contract addresses
  const contractAddresses = process.env.HAYQ_CONTRACT_ADDRESS.split(",");
  const recipients = process.env.RECIPIENTS.split(",");
  const amount = hre.ethers.parseUnits(process.env.AMOUNT, process.env.DECIMALS);

  console.log("Owner address:", signer.address);

  for (const addr of contractAddresses) {
    console.log("\n📌 Connecting to contract:", addr);

    const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", addr, signer);

    // 1️⃣ Owner check
    const owner = await hayq.owner();
    console.log("Contract owner():", owner);
    if (owner.toLowerCase() !== signer.address.toLowerCase()) {
      console.log("❌ Signer is NOT owner, skipping contract.");
      continue;
    } else {
      console.log("✅ Signer is owner");
    }

    // 2️⃣ Check owner balance
    const ownerBalance = await hayq.balanceOf(signer.address);
    console.log("Owner balance:", hre.ethers.formatUnits(ownerBalance, 18));

    if (ownerBalance.lt(amount)) {
      console.log(`❌ Insufficient balance for ${hre.ethers.formatUnits(amount, 18)} HAYQ`);
      continue;
    }

    // 3️⃣ Create vesting for each recipient
    for (const r of recipients) {
      try {
        console.log(`Creating vesting for: ${r}`);
        const tx = await hayq.createTeamVesting(r, amount);
        await tx.wait();
        console.log(`✅ Vesting created for ${r}`);
      } catch (err) {
        console.log(`❌ Failed to create vesting for ${r}:`, err.reason || err.message);
      }
    }

    // 4️⃣ Optional: mint/buyback, transfer, stake example
    // Example: transferring HAYQ from owner to contract
    try {
      console.log("Transferring HAYQ to contract...");
      const tx = await hayq.transfer(addr, amount);
      await tx.wait();
      console.log("✅ Transfer complete");
    } catch (err) {
      console.log("❌ Transfer failed:", err.reason || err.message);
    }

    // 5️⃣ Optional: check dividends if EthDividendTracker linked
    // Implement similar to createTeamVesting
  }

  console.log("\n🎉 Script execution completed");
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exitCode = 1;
});
