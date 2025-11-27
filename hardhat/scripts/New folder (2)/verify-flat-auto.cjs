// scripts/verify-flat-auto.cjs
require("dotenv").config();
const { run } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  try {
    const proxyAddress = "0x45615F3D52262ba7F16d7E0182893492F1752baB"; // Քո proxy
    const implAddress = "0x56E6Dc2f7a33fEFf3C537aa32cb70D5a0809a136"; // Քո implementation
    const adminAddress = "0x06880e4f9CE818317E67a1c786c554e7dC55ab2d"; // ProxyAdmin

    const flatPath = path.join(__dirname, "../flat/HAYQMiniMVP_flat.sol");
    if (!fs.existsSync(flatPath)) throw new Error("Flattened file not found!");

    console.log("📄 Flat file found:", flatPath);

    // Վերիֆիկացնում ենք implementation-ը
    console.log("🔍 Verifying implementation on Etherscan...");
    await run("verify:verify", {
      address: implAddress,
      constructorArguments: [],
      contract: "flat/HAYQMiniMVP_flat.sol:HAYQMiniMVP",
    });

    console.log("✅ Implementation verified!");

    // Վերիֆիկացնում ենք proxy
    console.log("🔗 Verifying proxy...");
    await run("verify:verify", {
      address: proxyAddress,
      constructorArguments: [implAddress, adminAddress, "0x"], // Proxy constructor
      contract: "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy",
    });

    console.log("✅ Proxy verified and linked!");
    
    // Վերիֆիկացնում ենք ProxyAdmin
    console.log("👑 Verifying ProxyAdmin...");
    await run("verify:verify", {
      address: adminAddress,
      contract: "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol:ProxyAdmin",
      constructorArguments: [],
    });

    console.log("✅ ProxyAdmin verified!");
  } catch (err) {
    console.error("💥 Verification failed:", err.message || err);
  }
}

main();
