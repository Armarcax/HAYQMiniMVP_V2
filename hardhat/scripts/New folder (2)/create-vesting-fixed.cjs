require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const HAYQ_ADDR = process.env.HAYQ_ADDR;
  const VESTING_ADDR = process.env.VESTING_ADDR;

  console.log("💼 Using wallet:", deployer.address);
  console.log("🎯 HAYQ contract:", HAYQ_CONTRACT_ADDRESS);
  console.log("🎯 VestingVault:", VESTING_ADDR);

  const HAYQ = await ethers.getContractAt("HAYQMiniMVP", HAYQ_CONTRACT_ADDRESS);

  // beneficiary-ի հասցեները
  const beneficiaries = [
    "0x928677743439e4dA4108c4025694B2F3d3b2745c",
    "0xBF3cfF21BD17854334112d28853fe716Eb423536"
  ];

  const amount = "100"; // յուրաքանչյուրին՝ 100 HAYQ
  const duration = 30 * 24 * 60 * 60; // 30 օր
  const start = Math.floor(Date.now() / 1000) + 60; // սկսի 1 րոպե հետո

  for (const addr of beneficiaries) {
    console.log(`⏳ Creating vesting for ${addr} of ${amount} HAYQ...`);
    try {
      const tx = await HAYQ.createTeamVesting(addr, amount, start, duration);
      await tx.wait();
      console.log(`✅ Success for ${addr}`);
    } catch (err) {
      console.error(`⚠️ Failed for ${addr}:`, err.message);
    }
  }

  console.log("🎯 All vestings processed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
