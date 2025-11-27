import pkg from "hardhat";
const { ethers, upgrades } = pkg;
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`💼 Deployer: ${deployer.address}`);

  const HAYQ_TOKEN = process.env.HAYQ_TOKEN_ADDRESS;
  const rewardRate = ethers.parseUnits("1", 18); // օրինակ՝ 1 HAYQ reward per block

  console.log("🚀 Deploying Staking contract...");
  const Staking = await ethers.getContractFactory("HAYQStakingUpgradeable");
  const staking = await upgrades.deployProxy(Staking, [HAYQ_TOKEN, rewardRate], { initializer: "initialize" });
  await staking.waitForDeployment();

  console.log(`✅ Staking deployed at: ${await staking.getAddress()}`);
}

main().catch((error) => {
  console.error("❌ Error deploying staking:", error);
  process.exit(1);
});
