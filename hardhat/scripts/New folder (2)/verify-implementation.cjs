const { ethers, upgrades, run } = require("hardhat");

async function main() {
  const PROXY_ADDRESS = "0x45615F3D52262ba7F16d7E0182893492F1752baB";

  // Վերցնել implementation address-ը
  const implAddress = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
  console.log(`🔍 Proxy address: ${PROXY_ADDRESS}`);
  console.log(`✅ Implementation address: ${implAddress}`);

  try {
    console.log("⚙️ Starting verification on Etherscan...");

    await run("verify:verify", {
      address: implAddress,
      constructorArguments: [],
      contract: "contracts/VestingVaultUpgradeable.sol:VestingVaultUpgradeable",
    });

    console.log("✅ Implementation verified successfully!");
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
  }
}

main();
