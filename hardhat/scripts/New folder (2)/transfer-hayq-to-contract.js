// scripts/transfer-hayq-to-contract.js
import hre from "hardhat";

async function main() {
  const HAYQ_PROXY = "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83";
  const CONTRACT_ADDR = HAYQ_PROXY; // Պայմանագրի հասցեն

  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ_PROXY);
  const amount = hre.ethers.parseUnits("3000", 18); // 1000 HAYQ

  console.log("Transferring 4000 HAYQ to contract...");
  const tx = await hayq.transfer(CONTRACT_ADDR, amount);
  await tx.wait();

  console.log("✅ Transferred");
}

main();