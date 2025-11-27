// scripts/confirm-tx.js
import hre from "hardhat";

async function main() {
  const MULTISIG_ADDR = "0x3B1Aaf6410899Eeb4305074aBaE86F290582428e";
  const multisig = await hre.ethers.getContractAt("MultiSigTimelock", MULTISIG_ADDR);
  
  // txId = 0 (առաջին գործողությունը)
  await multisig.confirm(0);
  console.log("✅ Transaction confirmed.");
}

main();