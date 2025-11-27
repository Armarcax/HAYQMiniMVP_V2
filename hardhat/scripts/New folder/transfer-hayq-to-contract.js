// scripts/transfer-hayq-to-contract.js
import hre from "hardhat";

async function main() {
  const HAYQ_PROXY = "0xc0132DB1835b9C53347ab628185165A81cCb848F";
  const CONTRACT_ADDR = HAYQ_PROXY; // Պայմանագրի հասցեն

  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ_PROXY);
  const amount = hre.ethers.parseUnits("1000", 18); // 1000 HAYQ

  console.log("Transferring 1000 HAYQ to contract...");
  const tx = await hayq.transfer(CONTRACT_ADDR, amount);
  await tx.wait();

  console.log("✅ Transferred");
}

main();