// scripts/execute-vesting-only.js
import hre from "hardhat";

async function main() {
  const MULTISIG = "0xb6455830aD60bB16A4f833D4e83cEe1bB2B9DE75";
  const multisig = await hre.ethers.getContractAt("MultiSigTimelock", MULTISIG);

  // txId = 0 (առաջին գործողությունը)
  await new Promise(r => setTimeout(r, 5000));
  await multisig.execute(0);
  console.log("✅ Vesting created!");
}

main();