// scripts/deploy-all-modules.js
import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const HAYQ_PROXY = "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83";

  console.log("Deploying VestingVault...");
  const Vesting = await hre.ethers.getContractFactory("VestingVaultUpgradeable");
  const vesting = await hre.upgrades.deployProxy(Vesting, [HAYQ_PROXY, HAYQ_PROXY], { initializer: 'initialize' });
  await vesting.waitForDeployment();
  const vestingAddr = await vesting.getAddress();
  console.log("✅ VestingVault:", vestingAddr);

  console.log("Deploying EthDividendTracker...");
  const EthDiv = await hre.ethers.getContractFactory("EthDividendTrackerUpgradeable");
  const ethDiv = await hre.upgrades.deployProxy(EthDiv, [HAYQ_PROXY], { initializer: 'initialize' });
  await ethDiv.waitForDeployment();
  const ethDivAddr = await ethDiv.getAddress();
  console.log("✅ EthDividendTracker:", ethDivAddr);

  console.log("Deploying MultiSigTimelock...");
  const Multisig = await hre.ethers.getContractFactory("MultiSigTimelock");
  const multisig = await Multisig.deploy([deployer.address], 1);
  await multisig.waitForDeployment();
  const multisigAddr = await multisig.getAddress();
  console.log("✅ MultiSigTimelock:", multisigAddr);

  // Պահպանել հասցեները .env ֆայլում (ընտրովի)
  console.log("\n--- Պատճենեք այս հասցեները ---");
  console.log(`VESTING_ADDR=${vestingAddr}`);
  console.log(`ETH_DIV_ADDR=${ethDivAddr}`);
  console.log(`MULTISIG_ADDR=${multisigAddr}`);
}

main();