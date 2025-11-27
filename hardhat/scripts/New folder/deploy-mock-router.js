// scripts/deploy-mock-router.js
import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying MockRouter from:", deployer.address);

  const MockRouter = await hre.ethers.getContractFactory("MockRouter");
  const router = await MockRouter.deploy();

  // Նոր Ethers v6 / Hardhat
  await router.waitForDeployment(); // <-- սա փոխարինում է .deployed()

  console.log("✅ MockRouter deployed at:", router.target ? router.target : router.address);
  console.log("Add to .env: MOCK_ROUTER_ADDRESS=" + (router.target ? router.target : router.address));
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
