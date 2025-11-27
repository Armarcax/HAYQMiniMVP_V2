// scripts/discover-modules.js
import hre from "hardhat";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const NETWORK = hre.network.name;

async function main() {
  console.log(`🔍 Discovering deployed contracts on network: ${NETWORK}\n`);

  const addresses = {};

  // Helper function
  function getEnv(key) {
    const val = process.env[key];
    if (!val || val === "0x..." || val === "0x0000000000000000000000000000000000000000") {
      return null;
    }
    return val;
  }

  // --- 1. Reward Token ---
  const rewardTokenAddress = getEnv("REWARD_TOKEN_ADDRESS");
  if (!rewardTokenAddress) {
    console.log("❌ Reward Token discovery failed: REWARD_TOKEN_ADDRESS not set in .env");
  } else {
    addresses.REWARD_TOKEN_ADDRESS = rewardTokenAddress;
    console.log("✅ Reward Token:", rewardTokenAddress);
  }

  // --- 2. HAYQ ---
  const hayqAddress = getEnv("HAYQ_ADDRESS");
  if (!hayqAddress) {
    console.log("❌ HAYQ / VestingVault discovery failed: HAYQ_ADDRESS not set in .env");
  } else {
    addresses.HAYQ_ADDRESS = hayqAddress;
    console.log("✅ HAYQ:", hayqAddress);
  }

  // --- 3. Vesting Vault ---
  const vestingVaultAddress = getEnv("VESTING_ADDR");
  if (!vestingVaultAddress) {
    console.log("❌ VestingVault discovery failed: VESTING_ADDR not set in .env");
  } else {
    addresses.VESTING_VAULT_ADDRESS = vestingVaultAddress;
    console.log("✅ VestingVault:", vestingVaultAddress);
  }

  // --- 4. ETH Dividend Tracker ---
  const ethDivAddress = getEnv("ETH_DIV_ADDR");
  if (!ethDivAddress) {
    console.log("❌ EthDividendTracker discovery failed: ETH_DIV_ADDR not set in .env");
  } else {
    addresses.ETH_DIV_ADDR = ethDivAddress;
    console.log("✅ EthDividendTracker:", ethDivAddress);
  }

  // --- 5. MultiSig Timelock ---
  const multisigAddress = getEnv("MULTISIG_ADDR");
  if (!multisigAddress) {
    console.log("❌ MultiSigTimelock discovery failed: MULTISIG_ADDR not set in .env");
  } else {
    addresses.MULTISIG_ADDR = multisigAddress;
    console.log("✅ MultiSigTimelock:", multisigAddress);
  }

  // --- 6. Mock Router ---
  const routerAddress = getEnv("MOCK_ROUTER_ADDRESS");
  if (!routerAddress) {
    console.log("❌ MockRouter discovery failed: MOCK_ROUTER_ADDRESS not set in .env");
  } else {
    addresses.MOCK_ROUTER_ADDRESS = routerAddress;
    console.log("✅ MockRouter:", routerAddress);
  }

  // Save JSON
  const jsonPath = `./discovered-${NETWORK}.json`;
  fs.writeFileSync(jsonPath, JSON.stringify(addresses, null, 2));
  console.log(`\n📁 All addresses saved to: ${jsonPath}`);

  // Save .env-ready
  const envContent = Object.entries(addresses)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  fs.writeFileSync(`./discovered-${NETWORK}.env`, envContent);
  console.log("📄 Env-ready addresses saved to: ./discovered-" + NETWORK + ".env");

  console.log("\n✅ Discovery complete");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
