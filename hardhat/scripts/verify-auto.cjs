// scripts/verify-auto.cjs
require("dotenv").config();
const hre = require("hardhat");

async function main() {
  console.log("🔍 Starting smart verify automation...\n");

  const contractAddress = process.env.MULTISIG_ADDR;
  const constructorArgs = JSON.parse(process.env.CONSTRUCTOR_ARGS || "[]");

  if (!contractAddress) {
    throw new Error("❌ CONTRACT_ADDRESS env variable missing!");
  }

  console.log("📦 Using network:", hre.network.name);
  console.log("📍 Contract address:", contractAddress);
  console.log("🧩 Constructor args:", constructorArgs);

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArgs,
    });
    console.log("✅ Verification successful!");
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
  }
}

main().catch((err) => {
  console.error("🚨 Fatal error:", err);
  process.exit(1);
});
