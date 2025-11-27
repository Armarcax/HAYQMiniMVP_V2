// scripts/deploy-multisig.js
import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const owners = [deployer.address];
  const required = 1;

  const Multisig = await hre.ethers.getContractFactory("MultiSigTimelock");
  const multisig = await Multisig.deploy(owners, required);
  await multisig.waitForDeployment();

  console.log("✅ New MultiSigTimelock (MIN_DELAY=0):", await multisig.getAddress());
}

main();