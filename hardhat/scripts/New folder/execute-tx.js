// scripts/execute-tx.js
import hre from "hardhat";

async function main() {
  const MULTISIG_ADDR = "0x3B1Aaf6410899Eeb4305074aBaE86F290582428e";
  const multisig = await hre.ethers.getContractAt("MultiSigTimelock", MULTISIG_ADDR);
  
  // Սպասեք 2 օր, ապա կատարեք
  await multisig.execute(0);
  console.log("✅ setVestingVault executed!");
}

main();