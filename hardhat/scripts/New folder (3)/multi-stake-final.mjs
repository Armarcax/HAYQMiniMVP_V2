import 'dotenv/config';
import { ethers } from "ethers";
import fs from "fs";

// 🟢 Environment variables
const HAYQ_CONTRACT_ADDRESS = process.env.HAYQ_CONTRACT_ADDRESS;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// 🔗 Connect to Sepolia
const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// 📄 ERC20 ABI (հասցեն HAYQ-ի ERC20)
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)"
];

const hayqContract = new ethers.Contract(HAYQ_CONTRACT_ADDRESS, ERC20_ABI, wallet);

// 🗂 Load recipients from JSON
const recipients = JSON.parse(fs.readFileSync("./addresses.json", "utf8"));

async function main() {
  console.log("🔗 Connecting to Sepolia...");
  console.log(`✅ Connected wallet: ${wallet.address}`);

  const balance = await hayqContract.balanceOf(wallet.address);
  console.log(`💰 Balance: ${ethers.formatUnits(balance, 18)} HAYQ`);

  for (const recipient of recipients) {
    const amount = ethers.parseUnits(recipient.amount, 18);
    console.log(`➡️ Sending ${recipient.amount} HAYQ to ${recipient.address}...`);
    const tx = await hayqContract.transfer(recipient.address, amount);
    await tx.wait();
    console.log(`✅ Sent to ${recipient.address} | TX: ${tx.hash}`);
  }

  const finalBalance = await hayqContract.balanceOf(wallet.address);
  console.log(`💰 Final Balance: ${ethers.formatUnits(finalBalance, 18)} HAYQ`);
}

main().catch(console.error);
