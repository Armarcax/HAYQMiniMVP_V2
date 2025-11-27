// scripts/vesting-utilities-allinone.js
import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

const HAYQ_ADDRESS = process.env.HAYQ_CONTRACT_ADDRESS; // Ավելացրու կոնկրետ proxy address
const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;
const RECIPIENT = process.env.RECIPIENTS?.split(",")[0]; // Առաջին վեսթինգ ստացող
const AMOUNT = process.env.AMOUNT || "1000";
const DECIMALS = process.env.DECIMALS || "18";

async function main() {
  const provider = hre.ethers.provider; // Hardhat-ի JsonRpcProvider
  const wallet = new hre.ethers.Wallet(OWNER_PRIVATE_KEY, provider);
  console.log("Using wallet:", wallet.address);

  // Contract instance
  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ_ADDRESS, wallet);

  // Owner check
  const contractOwner = await hayq.owner();
  console.log("Contract owner():", contractOwner);
  if (contractOwner.toLowerCase() !== wallet.address.toLowerCase()) {
    console.log("❌ You are NOT the owner. Cannot proceed.");
    return;
  }
  console.log("✅ Owner confirmed.");

  // Balance check
  const ownerBalanceBN = await hayq.balanceOf(wallet.address);
  const ownerBalance = hre.ethers.formatUnits(ownerBalanceBN, DECIMALS);
  console.log("Owner balance:", ownerBalance);

  const amountBN = hre.ethers.parseUnits(AMOUNT, DECIMALS);
  if (ownerBalanceBN.lt(amountBN)) {
    console.log("❌ Insufficient HAYQ balance for vesting.");
    return;
  }
  console.log(`✅ Owner has enough balance for vesting: ${AMOUNT} HAYQ`);

  // Vesting creation
  try {
    console.log(`Creating vesting for recipient ${RECIPIENT}...`);
    const tx = await hayq.createTeamVesting(RECIPIENT, amountBN); // Հիմնական ֆունկցիա vesting–ի համար
    await tx.wait();
    console.log("✅ Vesting created successfully!");
  } catch (err) {
    console.error("❌ Failed to create vesting:", err);
  }
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exitCode = 1;
});
