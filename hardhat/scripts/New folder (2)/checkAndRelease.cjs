require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();

  // Proxy address-ը
  const proxyAddress = "0x45615F3D52262ba7F16d7E0182893492F1752baB";
  // Implementation contract address-ը
  const implAddress = "0x7B7B1bb59224FE394680cbB1435db1f3A14a6F3F";

  // Ստեղծում ենք instance proxy address + implementation ABI
  const vesting = await ethers.getContractAt(
    "VestingVaultUpgradeable",
    proxyAddress
  );

  // Վեսթինգի օգտատերերը
  const beneficiaries = [
    "0x928677743439e4dA4108c4025694B2F3d3b2745c",
    "0xBF3cfF21BD17854334112d28853fe716Eb423536"
  ];

  console.log("Signer:", signer.address);

  for (const b of beneficiaries) {
    try {
      // Ստուգել authorize վիճակը
      const authorized = await vesting.authorized(b);
      console.log(`✅ ${b} Authorized?`, authorized);

      // Ստուգել vested amount-ը
      const vested = await vesting.vestedAmount(b);
      console.log(`💰 ${b} Vested:`, vested.toString());

      // Եթե signer-ը owner է, release անել
      const owner = await vesting.owner();
      if (signer.address.toLowerCase() === owner.toLowerCase()) {
        if (vested.gt(0)) {
          const tx = await vesting.release(b);
          await tx.wait();
          console.log(`🎉 ${b} Released!`);
        } else {
          console.log(`ℹ️ ${b} Nothing to release yet.`);
        }
      } else {
        console.log(`⚠️ Not owner, cannot release for ${b}`);
      }
    } catch (err) {
      console.error(`❌ Error with ${b}:`, err.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
