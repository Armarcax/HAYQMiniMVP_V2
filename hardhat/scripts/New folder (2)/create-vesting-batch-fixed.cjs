const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("💼 Using wallet:", deployer.address);

  const HAYQAddress = process.env.HAYQ_ADDRESS;
  const vaultAddress = process.env.VAULT_ADDRESS;

  const HAYQ = await ethers.getContractAt("HAYQMiniMVP", HAYQAddress);

  const vestingList = [
    { beneficiary: "0x928677743439e4dA4108c4025694B2F3d3b2745c", amount: 100 },
    { beneficiary: "0xBF3cfF21BD17854334112d28853fe716Eb423536", amount: 100 },
    { beneficiary: "0x95ae6b6237fe2c014bc09A5a0d52bF9999acDE30", amount: 100 },
    { beneficiary: "0xaF7c71E0105A6a28887598ae1D94Ddf3Cd03E0eb", amount: 100 },
  ];

  console.log("🎯 HAYQ contract:", HAYQAddress);
  console.log("🎯 VestingVault:", vaultAddress);

  for (const v of vestingList) {
    const amountWithDecimals = ethers.parseUnits(v.amount.toString(), 18);
    try {
      const tx = await HAYQ.createTeamVesting(
        v.beneficiary,
        amountWithDecimals,
        Math.floor(Date.now() / 1000),
        60 * 60 * 24 * 30
      );
      await tx.wait();
      console.log(`✅ Vesting created for ${v.beneficiary} of ${v.amount} HAYQ`);
    } catch (err) {
      console.log(`⚠️ Failed for ${v.beneficiary}:`, err.reason || err.message);
    }
  }

  console.log("🎯 All vestings processed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
