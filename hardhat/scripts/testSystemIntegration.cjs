// scripts/testSystemIntegration.cjs
const { ethers } = require("hardhat");
const dotenv = require("dotenv");
dotenv.config();

async function main() {
  console.log("🔍 Starting full system sync check...");
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Using deployer: ${deployer.address}`);

  const addresses = {
    registry: process.env.REGISTRY_ADDRESS,
    vestingVault: process.env.VESTING_VAULT_ADDRESS,
    oracle: process.env.ORACLE_ADDRESS,
    hayqToken: process.env.HAYQ_TOKEN_ADDRESS,
  };

  console.log("📘 Loaded system modules:", addresses);

  const registry = await ethers.getContractAt("RegistryUpgradeable", addresses.registry);
  const vesting = await ethers.getContractAt("VestingVaultUpgradeable", addresses.vestingVault);
  const oracle = await ethers.getContractAt("OracleUpgradeable", addresses.oracle);
  const token = await ethers.getContractAt("HAYQTokenUpgradeable", addresses.hayqToken);

  console.log("\n🔗 Checking registry sync...");

  const vestingFromRegistry = await registry.getContract("VESTING_VAULT");
  const oracleFromRegistry = await registry.getContract("ORACLE");
  const tokenFromRegistry = await registry.getContract("HAYQ_TOKEN");

  console.log(`✅ Registry VESTING_VAULT -> ${vestingFromRegistry}`);
  console.log(`✅ Registry ORACLE -> ${oracleFromRegistry}`);
  console.log(`✅ Registry TOKEN -> ${tokenFromRegistry}`);

  if (
    vestingFromRegistry.toLowerCase() !== addresses.vestingVault.toLowerCase() ||
    oracleFromRegistry.toLowerCase() !== addresses.oracle.toLowerCase() ||
    tokenFromRegistry.toLowerCase() !== addresses.hayqToken.toLowerCase()
  ) {
    throw new Error("❌ Registry mismatch detected!");
  }

  console.log("\n🧩 Checking module interaction logic...");

  const price = await oracle.getPrice("HAYQ/USD");
  console.log(`💰 Oracle price: ${price.toString()}`);

  const vestingBalance = await token.balanceOf(addresses.vestingVault);
  console.log(`💼 Vesting Vault Token Balance: ${vestingBalance.toString()}`);

  const oracleInVesting = await vesting.oracle();
  if (oracleInVesting.toLowerCase() !== addresses.oracle.toLowerCase()) {
    throw new Error("❌ Vesting vault has incorrect oracle reference!");
  }

  console.log("\n🌐 Sync check passed — all modules are interconnected & aligned.\n");
  console.log("🚀 System integrity confirmed.");
}

main().catch((err) => {
  console.error("❌ Integration test failed:", err);
  process.exit(1);
});
