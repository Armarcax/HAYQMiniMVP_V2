// scripts/upgrade-hayq-staked.js
import hre from "hardhat";

async function main() {
  const proxyAddress = process.env.HAYQ_CONTRACT_ADDRESS;
  if (!proxyAddress) {
    throw new Error("HAYQ_CONTRACT_ADDRESS not set in .env");
  }

  console.log(`🔄 Upgrading HAYQMiniMVP on network: ${hre.network.name}`);
  console.log(`🔧 Upgrading proxy at: ${proxyAddress} ...`);

  // Ստեղծում ենք նոր contract factory
  const HAYQMiniMVP = await hre.ethers.getContractFactory("HAYQMiniMVP");

  // Upgrade proxy
  const upgraded = await hre.upgrades.upgradeProxy(proxyAddress, HAYQMiniMVP);

  console.log("✅ Upgrade complete!");

  // Վերջում ցուցադրում ենք proxy-ի և իրական implementation-ի հասցեները
  console.log("\n🔹 Proxy address (remains the same):", proxyAddress);

  const implAddress = await hre.upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("🔹 New implementation address:", implAddress);

  console.log("\n✅ You can now interact with the upgraded HAYQMiniMVP via proxy.");
}

main().catch((err) => {
  console.error("Upgrade error:", err);
  process.exitCode = 1;
});
