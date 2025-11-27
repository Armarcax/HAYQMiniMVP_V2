// scripts/verifyProxyAndImplementation.mjs
import pkg from "hardhat";
const { ethers, upgrades, run } = pkg;
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const proxyAddress =
    process.env.PROXY_ADDRESS || "0x2136D92B222650821676eA17078D420dcCe00a3C";

  console.log(`🏦 Proxy contract: ${proxyAddress}`);

  // Ստանում ենք Proxy-ի implementation address
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log(`💡 Implementation contract address: ${implementationAddress}`);

  try {
    console.log("🔹 Verifying implementation contract...");
    await run("verify:verify", {
      address: implementationAddress,
      constructorArguments: [],
    });
    console.log("✅ Implementation verified!");
  } catch (err) {
    console.log("⚠️ Implementation verification error:", err.message);
  }

  try {
    console.log("🔹 Verifying proxy contract...");
    await run("verify:verify", {
      address: proxyAddress,
      constructorArguments: [],
    });
    console.log("✅ Proxy verified!");
  } catch (err) {
    console.log("⚠️ Proxy verification error:", err.message);
  }

  try {
    const proxyAdminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);
    console.log(`🔧 ProxyAdmin contract: ${proxyAdminAddress}`);

    console.log("🔹 Verifying ProxyAdmin contract...");
    await run("verify:verify", {
      address: proxyAdminAddress,
      constructorArguments: [],
    });
    console.log("✅ ProxyAdmin verified!");
  } catch (err) {
    console.log("⚠️ ProxyAdmin verification error:", err.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
