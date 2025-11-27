import "dotenv/config";
import { ethers } from "ethers";
import fs from "fs";

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const vaultAddress = process.env.VAULT_ADDRESS;
const vaultAbi = JSON.parse(fs.readFileSync("./artifacts/contracts/VestingVaultUpgradeable.sol/VestingVaultUpgradeable.json")).abi;
const vault = new ethers.Contract(vaultAddress, vaultAbi, wallet);

const addresses = [
  "0x928677743439e4dA4108c4025694B2F3d3b2745c",
  "0xBF3cfF21BD17854334112d28853fe716Eb423536",
  "0x95ae6b6237fe2c014bc09A5a0d52bF9999acDE30",
  "0xaF7c71E0105A6a28887598ae1D94Ddf3Cd03E0eb"
];

async function main() {
  console.log("🔗 Network wallet:", wallet.address);

  for (const addr of addresses) {
    try {
      console.log(`\n👁️ Checking vesting for ${addr}...`);

      // Սա փոխիր ըստ կոնտրակտի քո mapping-ի անունի, օրինակ՝ vestings(addr)
      const vest = await vault.vestings(addr);
      if (vest && vest.amount > 0n) {
        console.log(`${addr} | ✅ Already vested (${ethers.formatUnits(vest.amount, 18)} HAYQ)`);
        continue;
      }

      // եթե վեսթինգ չկար՝ ստեղծենք
      console.log(`${addr} | ⏳ Creating new vesting...`);

      const amount = ethers.parseUnits("1000", 18);
      const start = Math.floor(Date.now() / 1000);
      const duration = 60 * 60 * 24 * 30; // 30 օր

      const tx = await vault.createVesting(addr, amount, start, duration);
      await tx.wait();

      console.log(`${addr} | ✅ Vesting created | TX: ${tx.hash}`);

    } catch (err) {
      console.log(`${addr} | ❌ Error: ${err.message}`);
    }
  }
}

main().catch(console.error);
