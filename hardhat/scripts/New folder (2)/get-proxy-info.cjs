require("dotenv").config();
const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🔍 Fetching proxy & implementation addresses...\n");

  // Քո Proxy contract-ի հասցեն — սա փոխիր քո դիպլոյ արած հասցեով
  const proxyAddress = "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83";

  try {
    // Տանում ենք Ethers provider-ի միջոցով
    const implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);

    console.log("✅ Proxy Contract Address: ", proxyAddress);
    console.log("✅ Implementation Address: ", implAddress);
    console.log("✅ Proxy Admin Address: ", adminAddress);
  } catch (error) {
    console.error("❌ Error fetching proxy info:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
