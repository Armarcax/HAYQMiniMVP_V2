// ✅ Հին ձևաչափով import, առանց ESM
const ethers = require("ethers");
require("dotenv").config();

// 🧩 Քո տվյալները
const RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const STAKE_WALLETS = [
  "0x928677743439e4dA4108c4025694B2F3d3b2745c",
  "0xBF3cfF21BD17854334112d28853fe716Eb423536",
];

const TOKEN_ADDRESS = "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83";
const STAKE_AMOUNT = "1000";

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

async function main() {
  console.log("🔗 Connecting to Sepolia...");

  // ⚙️ Provider & Wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("✅ Connected wallet:", wallet.address);

  // 📦 Token contract
  const token = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, wallet);

  const balance = await token.balanceOf(wallet.address);
  console.log(`💰 Balance: ${ethers.formatUnits(balance, 18)} HAYQ`);

  // 📤 Send to each staking wallet
  for (const target of STAKE_WALLETS) {
    console.log(`➡️ Sending ${STAKE_AMOUNT} HAYQ to ${target}...`);
    const tx = await token.transfer(target, ethers.parseUnits(STAKE_AMOUNT, 18));
    await tx.wait();
    console.log(`✅ Sent to ${target} | TX: ${tx.hash}`);
  }

  console.log("🏁 All staking transfers completed successfully!");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
