require("dotenv").config();
const { ethers, upgrades, run } = require("hardhat");

async function main() {
  // Քո Proxy-ի հասցեն
  const proxyAddress = "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83";

  console.log("🔍 Proxy address:", proxyAddress);

  // Քաշում ենք Implementation Address-ը
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("✅ Found implementation:", implementationAddress);

  // Optional – նաև բերում ենք admin-ի հասցեն
  const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);
  console.log("👑 Proxy Admin:", adminAddress);

  console.log("\n⚙️ Starting Etherscan verification...");

  try {
    await run("verify:verify", {
      address: implementationAddress,
      contract: "contracts/VestingVaultUpgradeable.sol:VestingVaultUpgradeable", // փոխիր, եթե այլ ֆայլ է
      constructorArguments: [], // եթե upgradeable contract է՝ թող դատարկ լինի
    });

    console.log("\n✅ Verification completed successfully!");
  } catch (err) {
    console.error("\n❌ Verification failed:");
    console.error(err.message || err);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
