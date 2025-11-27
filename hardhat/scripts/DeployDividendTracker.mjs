import pkg from "hardhat";
const { ethers, upgrades } = pkg;
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`💼 Deployer wallet: ${deployer.address}`);

  // ⚠️ Փոխիր այս հասցեները ըստ քո մթնոլորտի
  const rewardToken = "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83"; // HAYQ կամ այլ ERC20 reward
  const hayqToken = "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83"; // HAYQ token address

  console.log("🚀 Deploying Erc20DividendTrackerUpgradeable...");
  const DividendTracker = await ethers.getContractFactory("Erc20DividendTrackerUpgradeable");

  const tracker = await upgrades.deployProxy(
    DividendTracker,
    [rewardToken, hayqToken],
    {
      initializer: "initialize",
      kind: "transparent",
    }
  );

  await tracker.waitForDeployment();
  const trackerAddress = await tracker.getAddress();

  console.log(`✅ DividendTracker Proxy deployed at: ${trackerAddress}`);

  const implementationAddress = await upgrades.erc1967.getImplementationAddress(trackerAddress);
  console.log(`🧱 Implementation address: ${implementationAddress}`);

  const adminAddress = await upgrades.erc1967.getAdminAddress(trackerAddress);
  console.log(`🔧 ProxyAdmin: ${adminAddress}`);

  console.log("\n📜 Verification commands:");
  console.log(`npx hardhat verify --network sepolia ${implementationAddress}`);
  console.log(`npx hardhat verify --network sepolia --contract "contracts/Erc20DividendTrackerUpgradeable.sol:Erc20DividendTrackerUpgradeable" ${implementationAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
