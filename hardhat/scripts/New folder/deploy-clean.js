// scripts/deploy-clean.js
import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  const HAYQ = await hre.ethers.getContractFactory("HAYQMiniMVP");
  const hayq = await hre.upgrades.deployProxy(HAYQ, [1000000, "0xa9667e39B160139E9878Da599819452594938734"], {
    initializer: "initialize",
  });
  await hayq.waitForDeployment();

  console.log("✅ NEW HAYQ Proxy deployed to:", await hayq.getAddress());
}

main();