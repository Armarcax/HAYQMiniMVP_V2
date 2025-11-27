const { ethers } = require("hardhat");

async function main() {
  const args = process.argv.slice(2);
  const hayqAddress = args[0];
  const miniMVPAddress = args[1];

  if (!hayqAddress || !miniMVPAddress)
    throw new Error("❌ Usage: node setMiniMVP.js <HAYQ> <MiniMVP>");

  const HAYQ = await ethers.getContractAt("HAYQ", hayqAddress);
  const tx = await HAYQ.setMiniMVP(miniMVPAddress);
  await tx.wait();

  console.log(`✅ Linked MiniMVP (${miniMVPAddress}) to HAYQ (${hayqAddress})`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
