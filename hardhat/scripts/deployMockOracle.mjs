import pkg from "hardhat";
const { ethers } = pkg;
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`💼 Deployer: ${deployer.address}`);

  const MockOracle = await ethers.getContractFactory("MockOracle");
  const mock = await MockOracle.deploy(1000); // Initial price = 1000
  await mock.waitForDeployment();

  const address = await mock.getAddress();
  console.log(`✅ MockOracle deployed at: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
