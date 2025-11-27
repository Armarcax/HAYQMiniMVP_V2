// scripts/checkBatchVesting.cjs
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const vaultAddress = process.env.VESTING_VAULT; // Proxy address
  const vault = await ethers.getContractAt("VestingVaultUpgradeable", vaultAddress);

  const beneficiaries = [
    "0x928677743439e4dA4108c4025694B2F3d3b2745c",
    "0xBF3cfF21BD17854334112d28853fe716Eb423536",
    // ավելացրու էլ հասցեները, որ պետք է ստուգել
  ];

  console.log("===== BATCH VESTING STATUS =====\n");

  for (const addr of beneficiaries) {
    try {
      const info = await vault.getVestingInfo(addr);
      console.log(`Address: ${addr}`);
      console.log(`  Total Amount: ${ethers.utils.formatUnits(info.totalAmount, 18)}`);
      console.log(`  Released: ${ethers.utils.formatUnits(info.released, 18)}`);
      console.log(`  Currently Vested: ${ethers.utils.formatUnits(info.vested, 18)}\n`);
    } catch (err) {
      console.log(`Address: ${addr} -> ERROR reading vesting: ${err.message}\n`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
