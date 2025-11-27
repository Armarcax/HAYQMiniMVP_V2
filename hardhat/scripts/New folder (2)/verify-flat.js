const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const proxyAddress = process.env.VESTING_VAULT; // Proxy
  const implAddress = process.env.IMPLEMENTATION || ""; // Implementation

  const flatPath = path.join(__dirname, "../flat/HAYQMiniMVP_flat.sol");
  if (!fs.existsSync(flatPath)) {
    throw new Error("Flat file not found: " + flatPath);
  }

  const flatCode = fs.readFileSync(flatPath, "utf8");

  // Implementation verification
  try {
    console.log("🔍 Verifying implementation on Etherscan...");
    await hre.run("verify:verify", {
      address: implAddress,
      constructorArguments: [],
      contract: "flat/HAYQMiniMVP_flat.sol:HAYQMiniMVP",
      libraries: {},
    });
    console.log("✅ Implementation verified!");
  } catch (err) {
    console.error("❌ Implementation verification failed:", err.message);
  }

  // Proxy verification
  try {
    console.log("🔗 Verifying proxy...");
    await hre.run("verify:verify", {
      address: proxyAddress,
      constructorArguments: [],
      contract: "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy",
    });
    console.log("✅ Proxy verified!");
  } catch (err) {
    console.error("❌ Proxy verification skipped or failed:", err.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
