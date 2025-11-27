import { ethers, run } from "hardhat";

// Փոխարինիր այս հասցեն քո Proxy-ի հասցեով
const PROXY_ADDRESS = "0x45615F3D52262ba7F16d7E0182893492F1752baB";

async function main() {
  // ERC1967 implementation slot
  const IMPLEMENTATION_SLOT = "0x360894A13BA1A3210667C828492DB98DCA3E2076CC3735A920A3CA505D382BBC";

  // Ստանում ենք implementation հասցեն
  const implStorage = await ethers.provider.getStorageAt(PROXY_ADDRESS, IMPLEMENTATION_SLOT);

  // Implementation address-ը ստանում ենք last 20 bytes
  const implAddress = "0x" + implStorage.slice(-40);
  console.log("Detected Implementation address:", implAddress);

  // Վերիֆիկացիա Hardhat plugin-ով
  console.log("Running verification...");
  await run("verify:verify", {
    address: implAddress,
    constructorArguments: [], // Upgradeable contracts-ի համար սովորաբար դատարկ է
  });
  console.log("Verification completed!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
