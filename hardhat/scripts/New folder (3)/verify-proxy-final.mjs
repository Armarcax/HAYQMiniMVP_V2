import pkg from "hardhat";
const { run, upgrades } = pkg;

const proxyAddress = "0x45615F3D52262ba7F16d7E0182893492F1752baB";
const implementationAddress = "0xd60CE25b670Dc7CA810497A0Ff7f2C0140aBD5c9";
const proxyAdminAddress = "0x06880e4f9CE818317E67a1c786c554e7dC55ab2d";

async function main() {
  console.log("Verifying implementation...");
  await run("verify:verify", {
    address: implementationAddress,
    constructorArguments: [],
    contract: "flat/HAYQMiniMVP_flat.sol:HAYQMiniMVP",
    force: true,
  });

  console.log("Verifying proxy...");
  await run("verify:verify", {
    address: proxyAddress,
    constructorArguments: [implementationAddress, proxyAdminAddress, "0x"],
    contract: "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy",
    force: true,
  });

  console.log("Verifying ProxyAdmin...");
  await run("verify:verify", {
    address: proxyAdminAddress,
    constructorArguments: [],
    contract: "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol:ProxyAdmin",
    force: true,
  });

  console.log("✅ All verified successfully!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
