// scripts/stake-test.js
import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83");

  console.log("Staking 100 HAYQ...");
  const tx = await hayq.stake(hre.ethers.parseUnits("100", 18));
  await tx.wait();

  const staked = await hayq.staked(deployer.address);
  console.log("Staked amount:", hre.ethers.formatUnits(staked, 18), "HAYQ");
}

main();