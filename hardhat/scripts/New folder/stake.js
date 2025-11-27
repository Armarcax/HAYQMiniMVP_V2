// scripts/stake.js
import { ethers } from "ethers";
import dotenv from "dotenv";
import hre from "hardhat";

dotenv.config();

const HAYQ_ADDRESS = process.env.HAYQ_CONTRACT_ADDRESS;
const STAKER_PRIVATE_KEY = process.env.STAKER_PRIVATE_KEY || process.env.PRIVATE_KEY;
const AMOUNT = process.env.STAKE_AMOUNT || "100";
const DECIMALS = process.env.DECIMALS || "18";
const RPC_URL = process.env.SEPOLIA_RPC_URL;

async function main() {
  if (!STAKER_PRIVATE_KEY || !RPC_URL) {
    throw new Error("❌ Missing STAKER_PRIVATE_KEY or SEPOLIA_RPC_URL in .env file");
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(STAKER_PRIVATE_KEY, provider);
  console.log("🔑 Using wallet:", wallet.address);

  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ_ADDRESS, wallet);

  const balanceBN = await hayq.balanceOf(wallet.address);
  const balance = ethers.formatUnits(balanceBN, DECIMALS);
  console.log("💰 Wallet balance:", balance, "HAYQ");

  const amountBN = ethers.parseUnits(AMOUNT, DECIMALS);

  if (balanceBN < amountBN) {
    console.log("❌ Not enough balance to stake");
    return;
  }

  console.log(`🚀 Staking ${AMOUNT} HAYQ...`);
  const tx = await hayq.stake(amountBN);
  await tx.wait();

  console.log("✅ Successfully staked!");
}

main().catch((err) => {
  console.error("🔥 Script error:", err);
  process.exitCode = 1;
});
