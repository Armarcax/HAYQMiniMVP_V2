// check-vesting-and-stake.mjs
import "dotenv/config";
import { ethers } from "ethers";
import HAYQ_ABI from "../artifacts/contracts/HAYQMiniMVP.sol/HAYQMiniMVP.json" assert { type: "json" };
import VESTING_ABI from "../artifacts/contracts/VestingVaultUpgradeable.sol/VestingVaultUpgradeable.json" assert { type: "json" };

const RPC_URL = process.env.SEPOLIA_RPC_URL; // կամ POLYGON/MATIC RPC
const WALLET_KEY = process.env.PRIVATE_KEY;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(WALLET_KEY, provider);

// Address-ներ
const TOKEN_ADDRESS = "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83";
const VAULT_ADDRESS = "0x45615F3D52262ba7F16d7E0182893492F1752baB";

// Contracts
const token = new ethers.Contract(TOKEN_ADDRESS, HAYQ_ABI.abi, wallet);
const vault = new ethers.Contract(VAULT_ADDRESS, VESTING_ABI.abi, wallet);

// Վերսթինգ + stake function
async function applyVestingAndStake(address, amount) {
  try {
    // Ստուգում vesting-ը
    // Անունը փոխիր ըստ կոնտրակտի իրական ֆունկցիայի
    const vestingInfo = await vault.vestingSchedules(address).catch(() => null);

    if (vestingInfo && vestingInfo.amount && vestingInfo.amount > 0n) {
      console.log(`${address} | Already has vesting. Skipping.`);
      return;
    }

    // Եթե vesting չկա, ստեղծում ենք vesting + ուղարկում stake
    const tx = await token.transfer(address, ethers.parseUnits(amount.toString(), 18));
    await tx.wait();
    console.log(`${address} | Sent ${amount} HAYQ | TX: ${tx.hash}`);

  } catch (err) {
    console.log(`${address} | ERROR:`, err.message);
  }
}

async function main() {
  console.log("🔗 Connecting to network...");
  console.log("✅ Wallet:", wallet.address);
  const balance = await token.balanceOf(wallet.address);
  console.log("💰 Balance:", balance.toString());

  const addresses = [
    "0x928677743439e4dA4108c4025694B2F3d3b2745c",
    "0xBF3cfF21BD17854334112d28853fe716Eb423536",
    "0x95ae6b6237fe2c014bc09A5a0d52bF9999acDE30",
    "0xaF7c71E0105A6a28887598ae1D94Ddf3Cd03E0eb"
  ];

  for (const addr of addresses) {
    await applyVestingAndStake(addr, 1000);
  }

  const finalBalance = await token.balanceOf(wallet.address);
  console.log("💰 Final Balance:", finalBalance.toString());
}

main();
