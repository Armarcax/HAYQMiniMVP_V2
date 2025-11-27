// scripts/transfer-to-multisig.js
import hre from "hardhat";

async function main() {
  // ՓՈԽԱՐԻՆԵՔ ՁԵՐ ՆՈՐ PROXY ՀԱՍՑԵՈՎ
  const NEW_HAYQ_PROXY = "0xc0132DB1835b9C53347ab628185165A81cCb848F"; // ← Ձեր նոր հասցեն այստեղ
  const NEW_MULTISIG = "0xb6455830aD60bB16A4f833D4e83cEe1bB2B9DE75";

  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", NEW_HAYQ_PROXY);
  await hayq.transferOwnership(NEW_MULTISIG);
  console.log("✅ Ownership transferred to new Multisig");
}

main();