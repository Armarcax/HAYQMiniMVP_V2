// verify-all-proxy-full.mjs
import hardhat from "hardhat";
const { ethers, upgrades, run } = hardhat;
import fs from "fs";
import path from "path";

const network = process.argv[2] || "sepolia"; // թույլ է տալիս փոխանցել net-ը argument-ով

async function main() {
  // Հիմնական contract info
  const flatPath = path.resolve("./flat/HAYQMiniMVP_flat.sol");
  const constructorArgsPath = path.resolve("./artifacts/constructor_args.json");
  const implementationAddress = "0x56E6Dc2f7a33fEFf3C537aa32cb70D5a0809a136";
  const proxyAddress = "0x45615F3D52262ba7F16d7E0182893492baB";
  const proxyAdminAddress = "0x06880e4f9CE818317E67a1c786c554e7dC55ab2d";

  if (!fs.existsSync(flatPath)) {
    throw new Error(`Flattened contract not found at ${flatPath}`);
  }

  let constructorArgs = [];
  if (fs.existsSync(constructorArgsPath)) {
    const json = JSON.parse(fs.readFileSync(constructorArgsPath, "utf8"));
    constructorArgs = json.encoded ? [json.encoded] : [];
  }

  console.log("🔍 Verifying implementation...");
  try {
    await run("verify:verify", {
      address: implementationAddress,
      constructorArguments: constructorArgs,
      contract: "flat/HAYQMiniMVP_flat.sol:HAYQMiniMVP",
      force: true,
    });
    console.log("✅ Implementation verified!");
  } catch (err) {
    console.warn("⚠️ Implementation verification warning:", err.message);
  }

  console.log("🔗 Verifying proxy...");
  try {
    await run("verify:verify", {
      address: proxyAddress,
      constructorArguments: [
        implementationAddress,
        proxyAdminAddress,
        "0x" // init data (empty)
      ],
      contract: "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy",
      force: true,
    });
    console.log("✅ Proxy verified!");
  } catch (err) {
    console.warn("⚠️ Proxy verification warning:", err.message);
  }

  console.log("👑 Verifying ProxyAdmin...");
  try {
    await run("verify:verify", {
      address: proxyAdminAddress,
      constructorArguments: [],
      contract: "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol:ProxyAdmin",
      force: true,
    });
    console.log("✅ ProxyAdmin verified!");
  } catch (err) {
    console.warn("⚠️ ProxyAdmin verification warning:", err.message);
  }

  console.log("🎉 Verification process finished!");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
