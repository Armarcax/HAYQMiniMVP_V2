// scripts/deploy-all-modules.js
import hre from "hardhat";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const HAYQ_PROXY = process.env.HAYQ_PROXY || "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83";
  const NETWORK = hre.network.name;

  console.log(`Deploying modules to network: ${NETWORK}`);
  console.log("Deployer:", deployer.address, "\n");

  const addresses = {};

  // --- 1. Deploy VestingVaultUpgradeable ---
  console.log("Deploying VestingVault...");
  const Vesting = await hre.ethers.getContractFactory("VestingVaultUpgradeable");
  const vesting = await hre.upgrades.deployProxy(Vesting, [HAYQ_PROXY, HAYQ_PROXY], { initializer: "initialize" });
  await vesting.waitForDeployment();
  const vestingAddr = await vesting.getAddress();
  console.log("✅ VestingVault:", vestingAddr);
  addresses.VESTING_ADDR = vestingAddr;

  // --- 2. Deploy EthDividendTrackerUpgradeable ---
  console.log("Deploying EthDividendTracker...");
  const EthDiv = await hre.ethers.getContractFactory("EthDividendTrackerUpgradeable");
  const ethDiv = await hre.upgrades.deployProxy(EthDiv, [HAYQ_PROXY], { initializer: "initialize" });
  await ethDiv.waitForDeployment();
  const ethDivAddr = await ethDiv.getAddress();
  console.log("✅ EthDividendTracker:", ethDivAddr);
  addresses.ETH_DIV_ADDR = ethDivAddr;

  // --- 3. Deploy MultiSigTimelock ---
  console.log("Deploying MultiSigTimelock...");
  const Multisig = await hre.ethers.getContractFactory("MultiSigTimelock");
  const multisig = await Multisig.deploy([deployer.address], 1);
  await multisig.waitForDeployment();
  const multisigAddr = await multisig.getAddress();
  console.log("✅ MultiSigTimelock:", multisigAddr);
  addresses.MULTISIG_ADDR = multisigAddr;

  // --- 4. Պահպանել հասցեներն JSON-ում ---
  const jsonPath = `./deployed-modules-${NETWORK}.json`;
  fs.writeFileSync(jsonPath, JSON.stringify(addresses, null, 2));
  console.log(`\nAll addresses saved to: ${jsonPath}`);

  // --- 5. Օգտակար copy/paste .env output ---
  console.log("\n--- COPY these into your .env ---");
  console.log(`VESTING_ADDR=${vestingAddr}`);
  console.log(`ETH_DIV_ADDR=${ethDivAddr}`);
  console.log(`MULTISIG_ADDR=${multisigAddr}`);

  console.log("\nModule deployment complete ✅");
}

main().catch(err => {
  console.error("Deployment error:", err);
  process.exitCode = 1;
});
