import "dotenv/config";
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

const vaultAddress = process.env.VAULT_ADDRESS;
const vaultAbi = [
  "function vestings(address) view returns (uint256 start, uint256 amount, uint256 duration, uint256 released)",
  "function createVesting(address beneficiary, uint256 amount) public",
];

const vault = new ethers.Contract(vaultAddress, vaultAbi, wallet);

// 🧩 սա կարևոր է — բաժանում ենք string-ը array-ի
const addresses = process.env.ADDRESSES.split(",").map(a => a.trim());

console.log(`\n🔗 Network wallet: ${wallet.address}\n`);

for (const addr of addresses) {
  console.log(`👁️ Checking vesting for ${addr}...`);
  try {
    const vest = await vault.vestings(addr);

    if (vest.amount > 0n) {
      console.log(`${addr} | ✅ Vesting exists: ${ethers.formatUnits(vest.amount)} tokens`);
    } else {
      console.log(`${addr} | ⏳ Creating new vesting...`);
      const tx = await vault.createVesting(addr, ethers.parseUnits("1000", 18));
      await tx.wait();
      console.log(`${addr} | ✅ Vesting created! TX: ${tx.hash}`);
    }
  } catch (err) {
    console.log(`${addr} | ❌ Error: ${err.message}`);
  }
}
