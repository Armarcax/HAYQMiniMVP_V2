import { ethers } from "ethers";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// ✅ YOUR SEPOLIA RPC
const RPC_URL = process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const TOKEN_ADDRESS = "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83"; // փոխիր քո կոնտրակտի հասցեով

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log(`💼 Wallet: ${wallet.address}`);

  // 🔍 Load ABI manually
  const artifact = JSON.parse(
    fs.readFileSync("./artifacts/contracts/HAYQMiniMVP.sol/HAYQMiniMVP.json")
  );
  const token = new ethers.Contract(TOKEN_ADDRESS, artifact.abi, wallet);

  // 📤 Recipient + Amount
  const recipient = wallet.address;
  const amount = ethers.parseUnits("1000", 18);

  console.log(`🚀 Minting ${amount} tokens to ${recipient}...`);
  const tx = await token.mint(recipient, amount);
  await tx.wait();

  console.log(`✅ Mint successful! TX hash: ${tx.hash}`);

  const balance = await token.balanceOf(recipient);
  console.log(`💰 New balance: ${ethers.formatUnits(balance, 18)} HAYQ`);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
