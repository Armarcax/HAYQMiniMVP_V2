// scripts/checkAndReleaseProxy.cjs
require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const signer = (await ethers.getSigners())[0];
  console.log("Signer:", signer.address);

  const proxyAddress = "0x45615F3D52262ba7F16d7E0182893492baB";
  const beneficiaries = [
    "0x928677743439e4dA4108c4025694B2F3d3b2745c",
    "0xBF3cfF21BD17854334112d28853fe716Eb423536"
  ];

  // 👉 Storage slot for implementation address (EIP-1967)
  const implSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

  // Կարդում ենք storage-ը
  const implRaw = await ethers.provider.getStorageAt(proxyAddress, implSlot);
  const implAddress = ethers.utils.getAddress("0x" + implRaw.slice(26));
  console.log("Implementation Address:", implAddress);

  // Ստեղծում ենք contract instance
  const vestingImpl = await ethers.getContractAt("VestingVaultUpgradeable", implAddress);

  for (const beneficiary of beneficiaries) {
    try {
      const isAuth = await vestingImpl.authorized(beneficiary);
      console.log(`✅ ${beneficiary} Authorized?`, isAuth);

      const vested = await vestingImpl.vestedAmount(beneficiary);
      console.log(`💰 Vested for ${beneficiary}:`, vested.toString());

    } catch (err) {
      console.log(`❌ Error with ${beneficiary}:`, err.message);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
