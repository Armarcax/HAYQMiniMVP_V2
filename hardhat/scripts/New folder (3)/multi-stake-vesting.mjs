import 'dotenv/config';
import { ethers } from 'ethers';

const HAYQ_CONTRACT_ADDRESS = process.env.HAYQ_CONTRACT_ADDRESS;
const VESTING_VAULT_ADDRESS = process.env.VESTING_VAULT_ADDRESS;
const RECIPIENTS = process.env.RECIPIENTS.split(',');
const STAKE_AMOUNT = 1000n * 10n ** 18n; // 1000 HAYQ (adjust as needed)

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

console.log("🔗 Connecting to Sepolia...");
console.log(`✅ Wallet: ${wallet.address}`);

const hayqAbi = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

const vestingAbi = [
  "function totalVested(address) view returns (uint256)",
  "function released(address) view returns (uint256)"
];

const hayq = new ethers.Contract(HAYQ_CONTRACT_ADDRESS, hayqAbi, wallet);
const vesting = new ethers.Contract(VESTING_VAULT_ADDRESS, vestingAbi, provider);

function format(amount) {
  try {
    return Number(amount) / 1e18;
  } catch {
    return 0;
  }
}

async function safeGet(fn, fallback = 0n) {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

async function hasActiveVesting(address) {
  const total = await safeGet(() => vesting.totalVested(address));
  const released = await safeGet(() => vesting.released(address));
  const remaining = total - released;
  return { active: total > 0n && remaining > 0n, remaining };
}

async function main() {
  const balance = await hayq.balanceOf(wallet.address);
  console.log(`💰 Balance: ${format(balance)} HAYQ`);

  for (const to of RECIPIENTS) {
    const vestingInfo = await hasActiveVesting(to);

    if (vestingInfo.active) {
      console.log(`⚠️ Skipping ${to} (vesting active: ${format(vestingInfo.remaining)} HAYQ)`);
      continue;
    }

    const freshBal = await hayq.balanceOf(wallet.address);
    if (freshBal < STAKE_AMOUNT) {
      console.log(`❌ Insufficient balance (${format(freshBal)} HAYQ left).`);
      break;
    }

    console.log(`➡️ Sending ${format(STAKE_AMOUNT)} HAYQ to ${to}...`);
    try {
      const tx = await hayq.transfer(to, STAKE_AMOUNT);
      await tx.wait();
      console.log(`✅ Sent to ${to} | TX: ${tx.hash}`);
    } catch (err) {
      console.error(`❌ Failed for ${to}: ${err.message}`);
    }
  }

  const finalBal = await hayq.balanceOf(wallet.address);
  console.log(`💰 Final Balance: ${format(finalBal)} HAYQ`);
}

main().catch(err => console.error("❌ Script error:", err));
