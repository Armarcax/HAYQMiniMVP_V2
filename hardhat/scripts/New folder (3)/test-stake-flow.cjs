// scripts/test-stake-flow.cjs
require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting HAYQ Stake/Unstake Flow Test...\n");

  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const walletA = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const walletB = ethers.Wallet.createRandom().connect(provider);

  const tokenAddress = process.env.HAYQ_CONTRACT_ADDRESS;
  const abi = [
    "function balanceOf(address) view returns (uint256)",
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function transfer(address to, uint256 amount) public returns (bool)",
    "function stake(uint256 amount) public",
    "function unstake(uint256 amount) public",
  ];

  const contract = new ethers.Contract(tokenAddress, abi, walletA);

  // Քայլ 1 — Ստուգում ենք նախնական բալանսները
  const balA1 = await contract.balanceOf(walletA.address);
  console.log(`💰 Initial Balance A: ${ethers.formatEther(balA1)} HAYQ`);
  console.log(`🧾 Wallet A: ${walletA.address}`);
  console.log(`📜 Contract: ${tokenAddress}\n`);

  // Քայլ 2 — Approve կոնտրակտը, որ կարողանա քաշել HAYQ staking-ի համար
  const stakeAmount = ethers.parseEther("10");
  console.log("✅ Approving 10 HAYQ for staking...");
  const approveTx = await contract.approve(tokenAddress, stakeAmount);
  await approveTx.wait();

  const allowance = await contract.allowance(walletA.address, tokenAddress);
  console.log(`🔎 Allowance now: ${ethers.formatEther(allowance)} HAYQ\n`);

  // Քայլ 3 — Stake
  console.log("📥 Staking 10 HAYQ...");
  try {
    const stakeTx = await contract.stake(stakeAmount);
    await stakeTx.wait();
    console.log("🔥 Stake transaction confirmed!");
  } catch (err) {
    console.error("❌ Stake failed:", err.reason || err);
  }

  // Քայլ 4 — Ստուգում ենք նոր բալանսը
  const balA2 = await contract.balanceOf(walletA.address);
  console.log(`💰 Balance after stake: ${ethers.formatEther(balA2)} HAYQ`);

  // Քայլ 5 — Unstake նույն քանակը
  console.log("\n📤 Unstaking 10 HAYQ...");
  try {
    const unstakeTx = await contract.unstake(stakeAmount);
    await unstakeTx.wait();
    console.log("✅ Unstake transaction confirmed!");
  } catch (err) {
    console.error("❌ Unstake failed:", err.reason || err);
  }

  const balA3 = await contract.balanceOf(walletA.address);
  console.log(`💰 Final Balance after unstake: ${ethers.formatEther(balA3)} HAYQ\n`);

  console.log("🏁 Flow test completed successfully!");
}

main().catch((error) => {
  console.error("⚠️ Error:", error);
  process.exitCode = 1;
});
