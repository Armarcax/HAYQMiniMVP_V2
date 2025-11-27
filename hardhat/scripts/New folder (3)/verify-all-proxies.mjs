import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

// Proxy addresses
const MAIN_PROXY = "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83";
const VESTING_PROXY = "0x45615F3D52262ba7F16d7E0182893492F1752baB";

// Contract names
const MAIN_IMPL_FQN = "flat/HAYQMiniMVP_flat.sol:HAYQMiniMVP";
const VESTING_IMPL_FQN = "flat/VestingVaultUpgradeable_flat.sol:VestingVaultUpgradeable";

// Proxy contract used
const PROXY_CONTRACT = "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy";

// empty constructor args (Transparent proxies usually take 3)
const ARGS_MAIN = [
  "0x06880e4f9CE818317E67a1c786c554e7dC55ab2d", // implementation
  "0xYourProxyAdminAddressHere", // proxy admin (you can fill it from etherscan)
  "0x" // initialization calldata
];
const ARGS_VESTING = [
  "0xAnotherImplementationAddressIfDifferent", 
  "0xYourProxyAdminAddressHere", 
  "0x"
];

async function verifyContract(address, fqn, args) {
  console.log(`\n🔍 Verifying ${fqn} at ${address} ...`);
  try {
    await hre.run("verify:verify", {
      address,
      constructorArguments: args,
      contract: fqn,
    });
    console.log(`✅ Successfully verified: ${address}`);
  } catch (err) {
    const msg = err?.message || String(err);
    if (msg.includes("Already Verified")) {
      console.log(`ℹ️ Already verified: ${address}`);
    } else {
      console.error(`❌ Error verifying ${address}:`, msg);
    }
  }
}

async function main() {
  console.log("🚀 Starting full verification process...\n");

  // 1️⃣ Verify main proxy (as TransparentUpgradeableProxy)
  await verifyContract(MAIN_PROXY, PROXY_CONTRACT, ARGS_MAIN);

  // 2️⃣ Verify vesting proxy (as TransparentUpgradeableProxy)
  await verifyContract(VESTING_PROXY, PROXY_CONTRACT, ARGS_VESTING);

  console.log("\n🎯 All proxy verifications completed!");
}

main().catch((err) => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});
