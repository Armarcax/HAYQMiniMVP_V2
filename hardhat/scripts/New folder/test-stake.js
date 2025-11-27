// scripts/test-stake.js
import hre from "hardhat";
async function main() {
  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", "0xc0132DB1835b9C53347ab628185165A81cCb848F");
  await hayq.stake(hre.ethers.parseUnits("100", 18));
  console.log("✅ Staked 100 HAYQ");
}
main();