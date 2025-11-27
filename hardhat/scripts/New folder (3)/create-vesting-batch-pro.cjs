// scripts/create-vesting-missing.cjs
require('dotenv').config();
const { ethers } = require("hardhat");

const CONCURRENCY_LIMIT = 3; // միաժամանակ tx–երի թիվը
const WAIT_BETWEEN_TX_MS = 2000; // 2 վայրկյան ընդմիջում tx–երի միջև

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("💼 Wallet:", deployer.address);

  const HAYQAddress = process.env.HAYQ_ADDRESS;
  const vaultAddress = process.env.VESTING_VAULT;

  if (!HAYQAddress || !vaultAddress) throw new Error("HAYQ_ADDRESS or VESTING_VAULT missing");

  const HAYQ = await ethers.getContractAt("HAYQMiniMVP", HAYQAddress);
  const Vault = await ethers.getContractAt("VestingVaultUpgradeable", vaultAddress);

  console.log("🎯 HAYQ contract:", HAYQAddress);
  console.log("🎯 Vault contract:", vaultAddress);

  const vestings = [
    { beneficiary: "0x928677743439e4dA4108c4025694B2F3d3b2745c", amount: 100, duration: 30 * 24 * 3600 },
    { beneficiary: "0xBF3cfF21BD17854334112d28853fe716Eb423536", amount: 100, duration: 60 * 24 * 3600 },
    { beneficiary: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", amount: 50, duration: 45 * 24 * 3600 },
    { beneficiary: "0x95ae6b6237fe2c014bc09A5a0d52bF9999acDE30", amount: 100, duration: 30 * 24 * 3600 },
    { beneficiary: "0xaF7c71E0105A6a28887598ae1D94Ddf3Cd03E0eb", amount: 100, duration: 30 * 24 * 3600 },
  ];

  const start = Math.floor(Date.now() / 1000);
  const vaultBalance = await HAYQ.balanceOf(vaultAddress);
  console.log("Vault HAYQ balance:", ethers.formatUnits(vaultBalance, 18));

  const queue = [];
  for (const v of vestings) {
    queue.push(async () => {
      try {
        const existing = await Vault.vestings(v.beneficiary);
        if (existing.totalAmount > 0n) {
          console.log(`⏭️ Skipping ${v.beneficiary}: already vested`);
          return;
        }

        const amount = ethers.parseUnits(v.amount.toString(), 18);
        const tx = await Vault.createVesting(v.beneficiary, amount, start, v.duration);
        console.log(`🚀 Sent tx for ${v.beneficiary}: ${tx.hash}`);
        await tx.wait();
        console.log(`✅ Confirmed ${v.beneficiary}`);
      } catch (err) {
        console.log(`⚠️ Error for ${v.beneficiary}:`, err.reason || err.message);
      }
    });
  }

  for (let i = 0; i < queue.length; i += CONCURRENCY_LIMIT) {
    const chunk = queue.slice(i, i + CONCURRENCY_LIMIT);
    await Promise.all(chunk.map(fn => fn()));
    console.log(`🧩 Batch ${Math.floor(i / CONCURRENCY_LIMIT) + 1} done`);
    await new Promise(r => setTimeout(r, WAIT_BETWEEN_TX_MS));
  }

  console.log("🎯 All missing vestings processed successfully!");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
