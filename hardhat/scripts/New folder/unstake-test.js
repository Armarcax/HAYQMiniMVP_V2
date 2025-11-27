// scripts/unstake-test.js
import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83");

  console.log("Unstaking 50 HAYQ...");
  const tx = await hayq.unstake(hre.ethers.parseUnits("50", 18));
  await tx.wait();

  const staked = await hayq.staked(deployer.address);
  const balance = await hayq.balanceOf(deployer.address);

  console.log("Remaining staked amount:", hre.ethers.formatUnits(staked, 18), "HAYQ");
  console.log("HAYQ balance after unstake:", hre.ethers.formatUnits(balance, 18), "HAYQ");
}

main();