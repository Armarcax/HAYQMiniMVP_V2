const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("👑 Sender:", signer.address);

  const tokenAddress = process.env.HAYQ_CONTRACT_ADDRESS;
  const abi = [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)"
  ];
  const token = new ethers.Contract(tokenAddress, abi, signer);

  const recipients = process.env.RECIPIENTS.split(",").map(r => r.trim());
  const decimals = Number(process.env.DECIMALS || 18);
  const amount = ethers.parseUnits(process.env.AMOUNT || "10", decimals);

  for (const r of recipients) {
    console.log(`➡️ Sending ${ethers.formatUnits(amount, decimals)} to ${r} ...`);
    const tx = await token.transfer(r, amount);
    console.log("   tx hash:", tx.hash);
    await tx.wait();
    console.log("   ✅ done");
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
