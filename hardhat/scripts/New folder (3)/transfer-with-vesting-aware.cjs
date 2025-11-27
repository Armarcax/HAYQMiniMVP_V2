// scripts/transfer-with-vesting-aware-fixed.cjs
require("dotenv").config();
const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  console.log("👑 Sender:", signer.address);

  const tokenAddr = process.env.HAYQ_CONTRACT_ADDRESS;
  const vestingAddr = process.env.VESTING_VAULT;
  const recipients = process.env.RECIPIENTS.split(",").map(r => r.trim()).filter(Boolean);
  const amount = ethers.parseUnits(process.env.AMOUNT || "1000", Number(process.env.DECIMALS || 18));

  const tokenAbi = [
    "function decimals() view returns (uint8)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)"
  ];
  const vestingAbi = [
    "function getVestingInfo(address beneficiary) view returns (uint256 totalAmount,uint256 released,uint256 start,uint256 duration,uint256 vested)"
  ];

  const token = new ethers.Contract(tokenAddr, tokenAbi, signer);
  const vesting = new ethers.Contract(vestingAddr, vestingAbi, provider); // read-only provider

  const senderBalance = await token.balanceOf(signer.address);
  console.log(`💰 Sender balance: ${ethers.formatUnits(senderBalance)}`);

  for (const r of recipients) {
    let hasVesting = false;
    try {
      const info = await vesting.getVestingInfo(r);
      const total = ethers.BigInt(info.totalAmount ?? info[0] ?? 0);
      hasVesting = total > 0n;
    } catch (err) {
      hasVesting = false;
    }

    if (hasVesting) {
      console.log(`🔒 Skipping ${r} (has vesting)`);
      continue;
    }

    console.log(`➡️ Transferring ${ethers.formatUnits(amount)} to ${r} ...`);
    const tx = await token.transfer(r, amount);
    console.log("   tx hash:", tx.hash);
    await tx.wait();
    console.log("   ✅ Done");
  }

  const finalBalance = await token.balanceOf(signer.address);
  console.log(`💰 Final sender balance: ${ethers.formatUnits(finalBalance)}`);
}

main().catch(err => {
  console.error("❌ Script failed:", err.message ?? err);
  process.exit(1);
});
