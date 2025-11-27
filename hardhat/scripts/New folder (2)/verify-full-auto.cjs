// scripts/verify-full-auto.cjs
const fs = require("fs");
const { run } = require("hardhat");

async function main() {
  // Պատճենեք ձեր flat ֆայլի հասցեն
  const flatPath = "./flat/HAYQMiniMVP_flat.sol";
  if (!fs.existsSync(flatPath)) {
    throw new Error(`Flat file not found at ${flatPath}`);
  }
  console.log(`📄 Flat file found: ${flatPath}`);

  // Implementation contract address
  const implementationAddress = "0x56E6Dc2f7a33fEFf3C537aa32cb70D5a0809a136";

  // Proxy contract address
  const proxyAddress = "0x45615F3D52262ba7F16d7E0182893492F1752baB";

  // ProxyAdmin address
  const proxyAdminAddress = "0x06880e4f9CE818317E67a1c786c554e7dC55ab2d";

  // Constructor args (եթե չկան՝ դարձրեք [])
  const constructorArgsPath = "./artifacts/constructor_args.json";
  const constructorArgs = fs.existsSync(constructorArgsPath)
    ? JSON.parse(fs.readFileSync(constructorArgsPath))
    : [];

  // 🔍 Implementation verification
  try {
    console.log("🔍 Verifying implementation on Etherscan...");
    await run("verify:verify", {
      address: implementationAddress,
      constructorArguments: constructorArgs,
      contract: "flat/HAYQMiniMVP_flat.sol:HAYQMiniMVP"
    });
    console.log("✅ Implementation verified!");
  } catch (e) {
    console.log("⚠️ Implementation verification warning:", e.message);
  }

  // 🔗 Proxy verification & linking
  try {
    console.log("🔗 Verifying and linking proxy...");
    await run("verify:verify", { address: proxyAddress });
    console.log("✅ Proxy verified & linked!");
  } catch (e) {
    console.log("⚠️ Proxy verification warning:", e.message);
  }

  // 👑 ProxyAdmin verification
  try {
    console.log("👑 Verifying ProxyAdmin...");
    await run("verify:verify", { address: proxyAdminAddress });
    console.log("✅ ProxyAdmin verified!");
  } catch (e) {
    console.log("⚠️ ProxyAdmin verification warning:", e.message);
  }

  console.log("🎉 Verification process finished!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
