// scripts/verify-proxy.mjs
import pkg from "hardhat";
const { run } = pkg;

const proxyAddress = "0x45615F3D52262ba7F16d7E0182893492F1752baB"; // 🟢 քո Proxy
const implementationAddress = "0xd60CE25b670Dc7CA810497A0Ff7f2C0140aBD5c9"; // 🟢 verified impl
const proxyAdminAddress = "0x06880e4f9CE818317E67a1c786c554e7dC55ab2d"; // 🟢 admin
const initData = "0x"; // եթե initializer կանչել ես առանձին՝ թող դատարկ

async function main() {
  console.log("Verifying TransparentUpgradeableProxy...");

  await run("verify:verify", {
    address: proxyAddress,
    constructorArguments: [
      implementationAddress,
      proxyAdminAddress,
      initData,
    ],
    contract:
      "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy",
    force: true,
  });

  console.log("✅ Proxy verified successfully!");
  console.log(`🔗 https://sepolia.etherscan.io/address/${proxyAddress}#code`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
